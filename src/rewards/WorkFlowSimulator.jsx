import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import WorkFlowExecution from "./WorkFlowExecution";
import PayloadDisplay from "./PayloadDisplay";
import workflowConfig from "./workflow-config.json";
import payloadsConfig from "./payloads-config.json";
import { buildFlowMapFromConnections } from "./flowMapConverter";
import { calculateAutoBoundaries } from "./auto-boundary-calculator";

export default function WorkFlowSimulator() {
  const [targetIndex, setTargetIndex] = useState(0);
  const [showDecision, setShowDecision] = useState(false);
  const [traversedNodes, setTraversedNodes] = useState([0]);
  const [config, setConfig] = useState(null);
  const [flowMap, setFlowMap] = useState({});
  const [activeRequests, setActiveRequests] = useState([{ id: "init", position: 0 }]);
  const [nodePathIndex, setNodePathIndex] = useState({});

  const [navigationHistory, setNavigationHistory] = useState([
    { nodeId: 0, activeRequests: [{ id: "init", position: 0, fromPosition: 0 }] }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [nodePayloads, setNodePayloads] = useState({});

  useEffect(() => {
    try {
      const loadedConfig = workflowConfig.workflow;
      
      if (!loadedConfig.settings.boundaries || loadedConfig.settings.boundaries.length === 0) {
        const autoBoundaries = calculateAutoBoundaries(loadedConfig.nodes, loadedConfig.connections);
        loadedConfig.settings.boundaries = autoBoundaries;
        console.log("Auto-calculated boundaries:", autoBoundaries);
      }
      
      setConfig(loadedConfig);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (config?.connections) {
      const builtFlowMap = buildFlowMapFromConnections(config.connections);
      setFlowMap(builtFlowMap);
      console.log("FlowMap built:", builtFlowMap);
    }
  }, [config]);

  useEffect(() => {
    const currentNode = flowMap[targetIndex];
    const isDecisionNode =
      currentNode?.type === "decision" && currentNode.next.length > 1;
    setShowDecision(isDecisionNode);
    
    generatePayloadForNode(targetIndex);
    
    if (activeRequests.length > 1) {
      activeRequests.forEach(req => {
        if (req.position !== targetIndex) {
          generatePayloadForNode(req.position);
        }
      });
    }
  }, [targetIndex, flowMap, activeRequests]);

  const generatePayloadForNode = (nodeId) => {
    const node = config?.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const requestKey = node.request;
    const responseKey = node.response;

    const requestPayload = requestKey ? payloadsConfig.requests[requestKey] : null;
    const responsePayload = responseKey ? payloadsConfig.responses[responseKey] : null;

    if (requestPayload || responsePayload) {
      setNodePayloads(prev => ({
        ...prev,
        [nodeId]: {
          request: requestPayload,
          response: responsePayload
        }
      }));
    }
  };

  // FIXED: Better detection for end node
  const isAtEnd = () => {
    const currentNode = flowMap[targetIndex];
    console.log("🔍 Checking if at end - Node:", targetIndex, "FlowMap entry:", currentNode);
    
    if (!currentNode) {
      // Node not in flowMap means it has no outgoing connections
      console.log("✅ Node not in flowMap - AT END");
      return true;
    }
    
    const hasNoNext = !currentNode.next || currentNode.next.length === 0;
    console.log("🔍 Has next?", currentNode.next, "Is at end?", hasNoNext);
    return hasNoNext;
  };

  const handleReset = () => {
    console.log("🔄 RESET clicked");
    setTargetIndex(0);
    setShowDecision(false);
    setTraversedNodes([0]);
    setActiveRequests([{ id: "init", position: 0, fromPosition: 0 }]);
    setNodePathIndex({});
    setNavigationHistory([
      { nodeId: 0, activeRequests: [{ id: "init", position: 0, fromPosition: 0 }] }
    ]);
    setHistoryIndex(0);
    setNodePayloads({});
  };

  const getNextNodeForPosition = (position) => {
    const currentNode = flowMap[position];
    if (!currentNode || !currentNode.next || currentNode.next.length === 0) return null;

    if (currentNode.next.length > 1 && currentNode.type !== "parallel" && currentNode.type !== "decision") {
      const currentIndex = nodePathIndex[position] ?? 0;
      const nextNode = currentNode.next[currentIndex];

      setNodePathIndex((prev) => ({
        ...prev,
        [position]: (currentIndex + 1) % currentNode.next.length,
      }));
      return nextNode;
    }
    return currentNode.next[0];
  };

  const handleDecision = (choiceIndex) => {
    const currentNode = flowMap[targetIndex];
    if (!currentNode || currentNode.type !== "decision") return;

    const nextNode = currentNode.next[choiceIndex];
    if (nextNode !== undefined) {
      const fromNode = targetIndex;
      
      setTargetIndex(nextNode);
      const newRequests = [{
        id: `decision-${Date.now()}`,
        position: nextNode,
        fromPosition: fromNode,
      }];
      setActiveRequests(newRequests);
      setTraversedNodes((prev) => [...prev, nextNode]);

      const newHistory = navigationHistory.slice(0, historyIndex + 1);
      newHistory.push({ nodeId: nextNode, activeRequests: newRequests });
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setShowDecision(false);
    }
  };

  const handleNextStep = () => {
    if (showDecision) return;

    const currentNode = flowMap[targetIndex];
    if (!currentNode || !currentNode.next || currentNode.next.length === 0) return;

    const fromNode = targetIndex;

    // PARALLEL SPLIT - Create multiple balls
    if (currentNode.type === "parallel" && currentNode.next.length > 1) {
      console.log("🔀 PARALLEL SPLIT from", targetIndex, "to", currentNode.next);
      const nextPositions = currentNode.next;
      setTargetIndex(nextPositions[0]);
      
      const newRequests = nextPositions.map((pos, idx) => ({
        id: `parallel-${idx}-${Date.now()}`,
        position: pos,
        fromPosition: fromNode,
      }));
      setActiveRequests(newRequests);
      setTraversedNodes((prev) => [...prev, ...nextPositions]);

      const newHistory = navigationHistory.slice(0, historyIndex + 1);
      newHistory.push({ nodeId: nextPositions[0], activeRequests: newRequests });
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return;
    }

    // MULTIPLE ACTIVE REQUESTS - Handle parallel execution or convergence
    if (activeRequests.length > 1) {
      console.log("⚡ Multiple requests active:", activeRequests.length);
      
      // Move all balls to their next positions
      const nextRequests = activeRequests.map((req, idx) => {
        const reqNode = flowMap[req.position];
        const nextPos = reqNode?.next?.[0];
        console.log(`  Ball ${idx}: position ${req.position} → next: ${nextPos}`);
        
        return nextPos !== undefined && nextPos !== null ? {
          id: `parallel-move-${idx}-${Date.now()}`,
          position: nextPos,
          fromPosition: req.position
        } : null;
      }).filter(Boolean);

      console.log("📦 Next requests:", nextRequests);

      if (nextRequests.length > 0) {
        // Check if all balls are converging to the same position
        const allPositions = nextRequests.map(r => r.position);
        const uniquePositions = [...new Set(allPositions)];
        
        if (uniquePositions.length === 1) {
          console.log("🔗 CONVERGENCE: All balls moving to", uniquePositions[0]);
        }

        setTargetIndex(nextRequests[0].position);
        setActiveRequests(nextRequests);
        
        const newNodes = nextRequests.map(r => r.position).filter(n => !traversedNodes.includes(n));
        setTraversedNodes((prev) => [...prev, ...newNodes]);

        const newHistory = navigationHistory.slice(0, historyIndex + 1);
        newHistory.push({ nodeId: nextRequests[0].position, activeRequests: nextRequests });
        setNavigationHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
      return;
    }

    // SINGLE REQUEST - Normal sequential flow
    const nextNode = getNextNodeForPosition(targetIndex);
    if (nextNode !== null) {
      console.log("➡️ Sequential move:", targetIndex, "→", nextNode);
      setTargetIndex(nextNode);
      const newRequests = [{
        id: `move-${fromNode}-${nextNode}-${Date.now()}`,
        position: nextNode,
        fromPosition: fromNode,
      }];
      setActiveRequests(newRequests);
      
      if (!traversedNodes.includes(nextNode)) {
        setTraversedNodes((prev) => [...prev, nextNode]);
      }

      const newHistory = navigationHistory.slice(0, historyIndex + 1);
      newHistory.push({ nodeId: nextNode, activeRequests: newRequests });
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handlePreviousStep = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = navigationHistory[newIndex];
      const currentRequests = activeRequests;

      console.log("⬅️ PREVIOUS - Current requests:", currentRequests);
      console.log("⬅️ PREVIOUS - Going to index:", newIndex, "Previous state:", previousState);

      // Create reverse animation requests (all balls move to previous node)
      const reverseRequests = currentRequests.map((req, idx) => ({
        id: `reverse-${idx}-${Date.now()}`,
        position: previousState.nodeId,
        fromPosition: req.position
      }));

      console.log("🔄 Reverse animation requests:", reverseRequests);

      setTargetIndex(previousState.nodeId);
      setActiveRequests(reverseRequests);
      setHistoryIndex(newIndex);
      setShowDecision(false);

      // After animation completes, restore the exact state from history
      setTimeout(() => {
        console.log("✅ Restoring state from history:", previousState.activeRequests);
        
        // Create fresh static requests matching the positions in history
        const restoredRequests = previousState.activeRequests.map((req, idx) => ({
          id: `restored-${idx}-${Date.now()}`,
          position: req.position,
          fromPosition: req.position  // Static - no animation
        }));
        
        console.log("📦 Restored requests:", restoredRequests);
        setActiveRequests(restoredRequests);
      }, 1000);
    }
  };

  if (!config) return null;
  const currentDecision = config.decisionConfig?.[targetIndex];
  const currentNode = flowMap[targetIndex];
  const currentPaths = currentNode?.next || [];
  const nodeData = config.nodes.find((n) => n.id === targetIndex);
  const atEnd = isAtEnd();
  const currentPayload = nodePayloads[targetIndex];

  console.log("🎯 Render - Target:", targetIndex, "AtEnd:", atEnd, "ShowDecision:", showDecision);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      {/* Left Panel */}
      <div style={{ position: "absolute", top: "20px", left: "20px", zIndex: 10, display: "flex", flexDirection: "column", gap: "15px", width: "320px", maxHeight: "calc(100vh - 40px)", overflowY: "auto" }}>
        
        {/* Navigation */}
        <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: "10px", padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
          <div style={{ marginBottom: "15px", fontWeight: "600" }}>Workflow Navigation</div>
          
          {atEnd ? (
            <div>
              <button 
                onClick={handleReset} 
                style={{ 
                  width: "100%",
                  padding: "14px", 
                  borderRadius: "8px", 
                  border: "none", 
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
                  color: "#fff", 
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "15px",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                }}
              >
                🔄 Restart Workflow
              </button>
              <div style={{ marginTop: "8px", fontSize: "11px", color: "#059669", textAlign: "center" }}>
                Node {targetIndex} - Workflow Complete
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={handlePreviousStep} 
                disabled={historyIndex === 0} 
                style={{ 
                  flex: 1, 
                  padding: "12px", 
                  borderRadius: "8px", 
                  border: "1px solid #ccc", 
                  background: historyIndex === 0 ? "#e5e7eb" : "#fff",
                  color: historyIndex === 0 ? "#9ca3af" : "#374151",
                  cursor: historyIndex === 0 ? "not-allowed" : "pointer",
                  fontWeight: "600"
                }}
              >
                ← Previous
              </button>
              <button 
                onClick={handleNextStep} 
                disabled={showDecision}
                style={{ 
                  flex: 1, 
                  padding: "12px", 
                  borderRadius: "8px", 
                  border: "none", 
                  background: showDecision ? "#e5e7eb" : "#667eea",
                  color: showDecision ? "#9ca3af" : "#fff",
                  cursor: showDecision ? "not-allowed" : "pointer",
                  fontWeight: "600"
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Completion Message */}
        {atEnd && (
          <div style={{ 
            background: "rgba(16, 185, 129, 0.15)", 
            borderRadius: "10px", 
            padding: "20px", 
            border: "2px solid #10b981",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>✅</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#059669", marginBottom: "6px" }}>
              Workflow Complete!
            </div>
            <div style={{ fontSize: "14px", color: "#065f46", marginBottom: "4px" }}>
              You've reached the final node
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>
              Node ID: {targetIndex}
            </div>
          </div>
        )}

        {/* Decision Panel */}
        {showDecision && !atEnd && (
          <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: "10px", padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
            <div style={{ marginBottom: "10px", fontWeight: "600", color: "#e53e3e" }}>⚠️ Decision Required</div>
            {currentDecision ? currentDecision.choices.map((choice, index) => (
              <button key={choice.key} onClick={() => handleDecision(index)} style={{ width: "100%", padding: "12px", marginBottom: "8px", borderRadius: "6px", border: `2px solid ${choice.color}`, color: choice.color, background: "#fff", cursor: "pointer", fontWeight: "600" }}>{choice.label}</button>
            )) : currentPaths.map((pathNode, index) => {
              const targetNodeData = config.nodes.find((n) => n.id === pathNode);
              return <button key={index} onClick={() => handleDecision(index)} style={{ width: "100%", padding: "12px", marginBottom: "8px", borderRadius: "6px", border: "2px solid #4299e1", color: "#4299e1", background: "#fff", cursor: "pointer", fontWeight: "600" }}>{targetNodeData?.label?.replace(/\\n/g, "\n") || `Node ${pathNode}`}</button>
            })}
          </div>
        )}

        {/* Payload Display - Show payloads for unique positions only */}
        {(() => {
          // Get unique positions from active requests
          const uniquePositions = [...new Set(activeRequests.map(req => req.position))];
          
          // If multiple balls at DIFFERENT positions (true parallel execution)
          if (activeRequests.length > 1 && uniquePositions.length > 1) {
            return (
              <>
                {uniquePositions.map((position) => {
                  const nodeData = config.nodes.find(n => n.id === position);
                  const payload = nodePayloads[position];
                  
                  return (
                    <div key={`payload-${position}`}>
                      {payload?.request && (
                        <PayloadDisplay 
                          nodeId={position}
                          nodeName={nodeData?.label?.replace(/\\n/g, " ") || nodeData?.name}
                          payload={payload.request}
                          type="request"
                        />
                      )}
                      {payload?.response && (
                        <PayloadDisplay 
                          nodeId={position}
                          nodeName={nodeData?.label?.replace(/\\n/g, " ") || nodeData?.name}
                          payload={payload.response}
                          type="response"
                        />
                      )}
                    </div>
                  );
                })}
              </>
            );
          }
          
          // If single ball OR multiple balls at SAME position (convergence)
          // Show payload only once for the target node
          return (
            <>
              {currentPayload?.request && (
                <PayloadDisplay 
                  nodeId={targetIndex}
                  nodeName={nodeData?.label?.replace(/\\n/g, " ") || nodeData?.name}
                  payload={currentPayload.request}
                  type="request"
                />
              )}
              
              {currentPayload?.response && (
                <PayloadDisplay 
                  nodeId={targetIndex}
                  nodeName={nodeData?.label?.replace(/\\n/g, " ") || nodeData?.name}
                  payload={currentPayload.response}
                  type="response"
                />
              )}
            </>
          );
        })()}
      </div>

      <Canvas shadows camera={{ position: config.settings.camera.position, fov: config.settings.camera.fov }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={0.7} castShadow />
        <WorkFlowExecution targetIndex={targetIndex} flowMap={flowMap} activeRequests={activeRequests} traversedNodes={traversedNodes} config={config} />
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}