import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import WorkFlowExecution from "./WorkFlowExecution";

export default function ServiceWorkFlowSimulator() {
  const [targetIndex, setTargetIndex] = useState(0);
  const [showDecision, setShowDecision] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Track which nodes have been visited
  const [traversedNodes, setTraversedNodes] = useState([0]);

  // Configuration: Define decision nodes with labels and colors
  const decisionConfig = {
    1: {
      choices: [
        { label: "📡 EPSILON Call", color: "#ff0000", key: "epsilon" },
        { label: "✅ Eligibility Check", color: "#cdcd17", key: "eligibility" }
      ]
    },
  };

  // INITIAL FLOW MAP - can be any structure
  const initialFlowMap = () => ({
    0: { next: [1], type: "sequential" },
    1: { next: [2, 3], type: "decision" },
    2: { next: [4, 5], type: "parallel" },
    3: { next: [6], type: "convergence" },
    4: { next: [6], type: "convergence" },
    5: { next: [6], type: "convergence" },
    6: { next: [], type: "end" }
  });

  const [flowMap, setFlowMap] = useState(() => initialFlowMap());

  // Track active parallel requests
  const [activeRequests, setActiveRequests] = useState([{ id: 0, position: 0 }]);

  // Detect if current node is a decision node
  useEffect(() => {
    const currentNode = flowMap[targetIndex];
    const isDecisionNode = currentNode?.type === "decision" && currentNode.next.length > 1;
    setShowDecision(isDecisionNode);
  }, [targetIndex, flowMap]);

  // Generic decision handler
  const handleDecision = (choiceIndex) => {
    const currentNode = flowMap[targetIndex];

    if (!currentNode || currentNode.type !== "decision") return;

    const nextNode = currentNode.next[choiceIndex];

    if (nextNode !== undefined) {
      setFlowMap(prev => ({
        ...prev,
        [targetIndex]: { next: [nextNode], type: "sequential" }
      }));

      setSelectedBranch(choiceIndex);
      setTargetIndex(nextNode);
      setTraversedNodes(prev => [...prev, nextNode]);
      setActiveRequests([{ id: Date.now(), position: nextNode, fromPosition: targetIndex }]);
      setShowDecision(false);
    }
  };

  const handleNextStep = () => {
    if (showDecision) return;

    const currentNode = flowMap[targetIndex];

    // Check if we've reached the end
    if (!currentNode || !currentNode.next || currentNode.next.length === 0) {
      // Reset to initial state
      setTargetIndex(0);
      setSelectedBranch(null);
      setTraversedNodes([0]);
      setActiveRequests([{ id: 0, position: 0 }]);
      setFlowMap(initialFlowMap());
      return;
    }

    // Handle different node types
    if (currentNode.type === "parallel" && currentNode.next.length > 1) {
      // PARALLEL SPLIT: Create multiple requests
      const newRequests = currentNode.next.map((nextPos, idx) => ({
        id: Date.now() + idx,
        position: nextPos,
        fromPosition: targetIndex
      }));
      setActiveRequests(newRequests);
      setTraversedNodes(prev => [...prev, ...currentNode.next]);
      setTargetIndex(currentNode.next[0]);

    } else if (activeRequests.length > 1) {
      // MULTIPLE ACTIVE REQUESTS: Continue parallel execution

      // Check if all requests are at the same position (convergence complete)
      const allAtSamePosition = activeRequests.every(req => req.position === activeRequests[0].position);

      if (allAtSamePosition) {
        // All requests have converged - merge and continue
        const convergedPosition = activeRequests[0].position;
        const currentNodeAtConvergence = flowMap[convergedPosition];
        const nextNode = currentNodeAtConvergence?.next[0];

        if (nextNode !== undefined) {
          setTargetIndex(nextNode);
          setTraversedNodes(prev => {
            if (!prev.includes(nextNode)) {
              return [...prev, nextNode];
            }
            return prev;
          });
          // Merge back to single request
          setActiveRequests([{
            id: Date.now(),
            position: nextNode,
            fromPosition: convergedPosition
          }]);
        }
      } else {
        // Still in parallel - move each request to its next node
        const nextRequests = activeRequests.map((req, idx) => {
          const nodeAtReq = flowMap[req.position];
          const nextNode = nodeAtReq?.next[0];

          return nextNode !== undefined ? {
            id: Date.now() + idx,
            position: nextNode,
            fromPosition: req.position
          } : null;
        }).filter(r => r !== null);

        if (nextRequests.length > 0) {
          setActiveRequests(nextRequests);

          // Update target to show one of the destinations
          const firstTarget = nextRequests[0].position;
          setTargetIndex(firstTarget);

          // Add new nodes to traversed (avoid duplicates)
          const newNodes = nextRequests.map(r => r.position).filter(n => !traversedNodes.includes(n));
          if (newNodes.length > 0) {
            setTraversedNodes(prev => [...prev, ...newNodes]);
          }
        }
      }

    } else {
      // SEQUENTIAL: Normal single path
      const nextNode = currentNode.next[0];
      setTargetIndex(nextNode);
      setTraversedNodes(prev => {
        if (!prev.includes(nextNode)) {
          return [...prev, nextNode];
        }
        return prev;
      });
      setActiveRequests([{ id: Date.now(), position: nextNode, fromPosition: targetIndex }]);
    }
  };

  const nodeNames = [
    "Microservice Node",      // 0
    "Condition Check",        // 1 - Decision point
    "EPSILON Call",           // 2 - Triggers parallel
    "Eligibility Call",       // 3
    "Database Query",         // 4
    "API Call",               // 5
    "Final Response"          // 6
  ];

  const currentDecision = decisionConfig[targetIndex];
  const currentNode = flowMap[targetIndex];
  const currentPaths = currentNode?.next || [];

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(to bottom, #9f8df0, #a4a4a8)",
      position: "relative"
    }}>
      {/* Control Buttons */}
      <div style={{
        position: "absolute",
        top: 30,
        left: 30,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: "15px"
      }}>
        {!showDecision ? (
          // Normal Next Step Button
          <button
            onClick={handleNextStep}
            style={{
              padding: "15px 30px",
              cursor: "pointer",
              background: "rgba(0, 255, 255, 0.2)",
              border: "2px solid #00ffff",
              borderRadius: "8px",
              color: "#00ffff",
              fontSize: "16px",
              fontWeight: "600",
              boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
              transition: "all 0.3s ease",
              fontFamily: "'Courier New', monospace",
              textTransform: "uppercase",
              letterSpacing: "1px",
              backdropFilter: "blur(10px)"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(0, 255, 255, 0.3)";
              e.target.style.boxShadow = "0 0 30px rgba(0, 255, 255, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(0, 255, 255, 0.2)";
              e.target.style.boxShadow = "0 0 20px rgba(0, 255, 255, 0.3)";
            }}
          >
            ⚡ Next Step
          </button>
        ) : (
          // Dynamic Decision Buttons
          <>
            {currentDecision ? (
              currentDecision.choices.map((choice, index) => (
                <button
                  key={choice.key}
                  onClick={() => handleDecision(index)}
                  style={{
                    padding: "15px 30px",
                    cursor: "pointer",
                    background: `${choice.color}33`,
                    border: `2px solid ${choice.color}`,
                    borderRadius: "8px",
                    color: choice.color,
                    fontSize: "16px",
                    fontWeight: "700",
                    boxShadow: `0 0 20px ${choice.color}4D`,
                    transition: "all 0.3s ease",
                    fontFamily: "'Courier New', monospace",
                    backdropFilter: "blur(10px)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = `${choice.color}66`;
                    e.target.style.boxShadow = `0 0 30px ${choice.color}99`;
                    e.target.style.transform = "translateX(5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = `${choice.color}33`;
                    e.target.style.boxShadow = `0 0 20px ${choice.color}4D`;
                    e.target.style.transform = "translateX(0)";
                  }}
                >
                  {choice.label}
                </button>
              ))
            ) : (
              // Fallback: Generic buttons
              currentPaths?.map((pathNode, index) => (
                <button
                  key={index}
                  onClick={() => handleDecision(index)}
                  style={{
                    padding: "15px 30px",
                    cursor: "pointer",
                    background: "rgba(100, 100, 255, 0.2)",
                    border: "2px solid #6464ff",
                    borderRadius: "8px",
                    color: "#6464ff",
                    fontSize: "16px",
                    fontWeight: "700",
                    boxShadow: "0 0 20px rgba(100, 100, 255, 0.3)",
                    transition: "all 0.3s ease",
                    fontFamily: "'Courier New', monospace",
                    backdropFilter: "blur(10px)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(100, 100, 255, 0.4)";
                    e.target.style.boxShadow = "0 0 30px rgba(100, 100, 255, 0.6)";
                    e.target.style.transform = "translateX(5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "rgba(100, 100, 255, 0.2)";
                    e.target.style.boxShadow = "0 0 20px rgba(100, 100, 255, 0.3)";
                    e.target.style.transform = "translateX(0)";
                  }}
                >
                  🔀 Option {index + 1} → Node {pathNode}
                </button>
              ))
            )}
          </>
        )}

        {/* Status Display */}
        <div style={{
          padding: "20px",
          background: "rgba(10, 10, 26, 0.8)",
          backdropFilter: "blur(10px)",
          borderRadius: "8px",
          border: "1px solid rgba(0, 255, 255, 0.3)",
          color: "#00ffff",
          fontFamily: "'Courier New', monospace",
          boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "8px" }}>CURRENT NODE</div>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>
            {nodeNames[targetIndex] || `Node ${targetIndex}`}
          </div>
          <div style={{
            marginTop: "10px",
            fontSize: "24px",
            fontWeight: "700",
            color: "#00ffff",
            textShadow: "0 0 10px #00ffff"
          }}>
            {targetIndex + 1} / {nodeNames.length}
          </div>
          {showDecision && (
            <div style={{
              marginTop: "10px",
              fontSize: "14px",
              color: "#ff00ff",
              fontWeight: "600"
            }}>
              ⚠️ DECISION REQUIRED
            </div>
          )}
          {currentNode?.type === "parallel" && (
            <div style={{
              marginTop: "10px",
              fontSize: "14px",
              color: "#ffaa00",
              fontWeight: "600"
            }}>
              ⏭️ NEXT: PARALLEL EXECUTION
            </div>
          )}
          {currentNode?.type === "convergence" && activeRequests.length > 1 && (
            <div style={{
              marginTop: "10px",
              fontSize: "14px",
              color: "#00ffaa",
              fontWeight: "600"
            }}>
              🔀 CONVERGING IN PARALLEL
            </div>
          )}
          {activeRequests.length > 1 && (
            <div style={{
              marginTop: "10px",
              fontSize: "14px",
              color: "#00ff00",
              fontWeight: "600"
            }}>
              🔀 EXECUTING IN PARALLEL ({activeRequests.length})
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: "absolute",
        top: 30,
        right: 30,
        zIndex: 10,
        padding: "20px",
        background: "rgba(159, 159, 239, 0.8)",
        backdropFilter: "blur(10px)",
        borderRadius: "8px",
        border: "1px solid rgba(255, 0, 255, 0.3)",
        color: "#fff",
        fontFamily: "'Courier New', monospace",
        fontSize: "12px",
        boxShadow: "0 0 20px rgba(255, 0, 255, 0.2)"
      }}>
        <div style={{ fontWeight: "700", marginBottom: "10px", color: "#ff00ff" }}>LEGEND</div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
          <div style={{ width: "15px", height: "15px", background: "#00ff00", borderRadius: "3px" }} />
          <span>Active Path</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
          <div style={{ width: "15px", height: "15px", background: "#ffa500", borderRadius: "3px" }} />
          <span>Traversed Path</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
          <div style={{ width: "15px", height: "15px", background: "#555555", borderRadius: "3px" }} />
          <span>Future Path</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "15px", height: "15px", background: "#ffaa00", borderRadius: "50%" }} />
          <span>Parallel Request</span>
        </div>
      </div>

      <Canvas shadows camera={{ position: [0, 25, 30], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={0.7}
          castShadow
        />
        <WorkFlowExecution
          targetIndex={targetIndex}
          flowMap={flowMap}
          activeRequests={activeRequests}
          traversedNodes={traversedNodes}
        />
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}