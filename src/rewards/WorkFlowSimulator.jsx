import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import WorkFlowExecution from "./WorkFlowExecution";
import workflowConfig from "./workflow-config.json";
import { buildFlowMapFromConnections } from "./flowMapConverter";

export default function WorkFlowSimulator() {
  const [targetIndex, setTargetIndex] = useState(0);
  const [showDecision, setShowDecision] = useState(false);
  const [traversedNodes, setTraversedNodes] = useState([0]);
  const [config, setConfig] = useState(null);
  const [flowMap, setFlowMap] = useState({});
  const [activeRequests, setActiveRequests] = useState([{ id: "init", position: 0 }]);
  const [nodePathIndex, setNodePathIndex] = useState({});

  // Navigation history
  const [navigationHistory, setNavigationHistory] = useState([0]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    try {
      setConfig(workflowConfig.workflow);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (config?.connections) {
      const builtFlowMap = buildFlowMapFromConnections(config.connections);
      setFlowMap(builtFlowMap);
    }
  }, [config]);

  useEffect(() => {
    const currentNode = flowMap[targetIndex];
    const isDecisionNode =
      currentNode?.type === "decision" && currentNode.next.length > 1;
    setShowDecision(isDecisionNode);
  }, [targetIndex, flowMap]);

  // Helper to trigger a smooth move
  const triggerMove = (from, to) => {
    setTargetIndex(to);
    setActiveRequests([
      {
        id: `move-${from}-${to}-${Date.now()}`, // Unique ID forces animation restart
        position: to,
        fromPosition: from,
      },
    ]);
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
      
      triggerMove(fromNode, nextNode);
      setTraversedNodes((prev) => [...prev, nextNode]);

      const newHistory = navigationHistory.slice(0, historyIndex + 1);
      newHistory.push(nextNode);
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

    if (currentNode.type === "parallel" && currentNode.next.length > 1) {
      const nextPositions = currentNode.next;
      setTargetIndex(nextPositions[0]);
      setActiveRequests(nextPositions.map((pos, idx) => ({
        id: `parallel-${idx}-${Date.now()}`,
        position: pos,
        fromPosition: fromNode,
      })));
      setTraversedNodes((prev) => [...prev, ...nextPositions]);

      const newHistory = navigationHistory.slice(0, historyIndex + 1);
      newHistory.push(nextPositions[0]);
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return;
    }

    const nextNode = getNextNodeForPosition(targetIndex);
    if (nextNode !== null) {
      triggerMove(fromNode, nextNode);
      if (!traversedNodes.includes(nextNode)) {
        setTraversedNodes((prev) => [...prev, nextNode]);
      }

      const newHistory = navigationHistory.slice(0, historyIndex + 1);
      newHistory.push(nextNode);
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handlePreviousStep = () => {
    if (historyIndex > 0) {
      const fromNode = targetIndex; // Start animation from where ball is now
      const newIndex = historyIndex - 1;
      const destinationNode = navigationHistory[newIndex];

      setHistoryIndex(newIndex);
      triggerMove(fromNode, destinationNode); // Smooth move backward
      setShowDecision(false);
    }
  };

  // Rendering logic remains identical to your CSS requirements...
  if (!config) return null;
  const currentDecision = config.decisionConfig?.[targetIndex];
  const currentNode = flowMap[targetIndex];
  const currentPaths = currentNode?.next || [];
  const nodeData = config.nodes.find((n) => n.id === targetIndex);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <div style={{ position: "absolute", top: "20px", left: "20px", zIndex: 10, display: "flex", flexDirection: "column", gap: "15px", width: "280px" }}>
        <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: "10px", padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
          <div style={{ marginBottom: "15px", fontWeight: "600" }}>Workflow Navigation</div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handlePreviousStep} disabled={historyIndex === 0} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ccc", cursor: historyIndex === 0 ? "not-allowed" : "pointer" }}>← Previous</button>
            <button onClick={handleNextStep} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", background: "#667eea", color: "#fff", cursor: "pointer" }}>Next →</button>
          </div>
        </div>

        {showDecision && (
          <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: "10px", padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
            <div style={{ marginBottom: "10px", fontWeight: "600" }}>Decision Required</div>
            {currentDecision ? currentDecision.choices.map((choice, index) => (
              <button key={choice.key} onClick={() => handleDecision(index)} style={{ width: "100%", padding: "12px", marginBottom: "8px", borderRadius: "6px", border: `2px solid ${choice.color}`, color: choice.color, background: "#fff", cursor: "pointer" }}>{choice.label}</button>
            )) : currentPaths.map((pathNode, index) => {
              const targetNodeData = config.nodes.find((n) => n.id === pathNode);
              return <button key={index} onClick={() => handleDecision(index)} style={{ width: "100%", padding: "12px", marginBottom: "8px", borderRadius: "6px", border: "2px solid #4299e1", color: "#4299e1", background: "#fff", cursor: "pointer" }}>{targetNodeData?.label || `Node ${pathNode}`}</button>
            })}
          </div>
        )}

        <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: "10px", padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
          <div style={{ fontSize: "12px", color: "#777", marginBottom: "8px" }}>CURRENT NODE</div>
          <div style={{ fontSize: "18px", fontWeight: "600" }}>{nodeData?.label?.replace(/\\n/g, "\n") || nodeData?.name || `Node ${targetIndex}`}</div>
        </div>
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