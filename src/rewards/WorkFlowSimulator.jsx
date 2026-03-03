import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import WorkFlowExecution from "./WorkFlowExecution";
import workflowConfig from "./workflow-config.json";
import { buildFlowMapFromConnections } from "./flowMapConverter";

export default function WorkFlowSimulator() {
  const [targetIndex, setTargetIndex] = useState(0);
  const [showDecision, setShowDecision] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [traversedNodes, setTraversedNodes] = useState([0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [config, setConfig] = useState(null);
  const [flowMap, setFlowMap] = useState({});
  const [activeRequests, setActiveRequests] = useState([{ id: 0, position: 0 }]);

  // 🔥 NEW: Round-robin state
  const [nodePathIndex, setNodePathIndex] = useState({});

  // Load config
  useEffect(() => {
    try {
      setConfig(workflowConfig.workflow);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  // Build flowMap
  useEffect(() => {
    if (config?.connections) {
      const builtFlowMap = buildFlowMapFromConnections(config.connections);
      setFlowMap(builtFlowMap);
    }
  }, [config]);

  // Detect decision node
  useEffect(() => {
    const currentNode = flowMap[targetIndex];
    const isDecisionNode =
      currentNode?.type === "decision" &&
      currentNode.next.length > 1;

    setShowDecision(isDecisionNode);
  }, [targetIndex, flowMap]);

  // 🔥 Round-robin path selector
  const getNextNodeForPosition = (position) => {
    const currentNode = flowMap[position];

    if (!currentNode || !currentNode.next || currentNode.next.length === 0) {
      return null;
    }

    if (
      currentNode.next.length > 1 &&
      currentNode.type !== "parallel" &&
      currentNode.type !== "decision"
    ) {
      const currentIndex = nodePathIndex[position] ?? 0;
      const nextNode = currentNode.next[currentIndex];

      setNodePathIndex(prev => ({
        ...prev,
        [position]: (currentIndex + 1) % currentNode.next.length
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
      setFlowMap(prev => ({
        ...prev,
        [targetIndex]: { next: [nextNode], type: "sequential" }
      }));

      setSelectedBranch(choiceIndex);
      setTargetIndex(nextNode);
      setTraversedNodes(prev => [...prev, nextNode]);
      setActiveRequests([{ id: Date.now(), position: nextNode }]);
      setShowDecision(false);
    }
  };

  const handleNextStep = () => {
    if (showDecision) return;

    const currentNode = flowMap[targetIndex];

    // 🔥 END / RESET
    if (!currentNode || !currentNode.next || currentNode.next.length === 0) {
      setTargetIndex(0);
      setSelectedBranch(null);
      setTraversedNodes([0]);
      setActiveRequests([{ id: 0, position: 0 }]);
      setNodePathIndex({}); // reset round robin

      if (config?.connections) {
        const rebuilt = buildFlowMapFromConnections(config.connections);
        setFlowMap(rebuilt);
      }

      return;
    }

    // ===============================
    // PARALLEL SPLIT
    // ===============================
    if (currentNode.type === "parallel" && currentNode.next.length > 1) {
      const newRequests = currentNode.next.map((nextPos, idx) => ({
        id: Date.now() + idx,
        position: nextPos,
        fromPosition: targetIndex
      }));

      setActiveRequests(newRequests);
      setTraversedNodes(prev => [...prev, ...currentNode.next]);
      setTargetIndex(currentNode.next[0]);
      return;
    }

    // ===============================
    // MULTIPLE ACTIVE REQUESTS
    // ===============================
    if (activeRequests.length > 1) {
      const allAtSamePosition = activeRequests.every(
        req => req.position === activeRequests[0].position
      );

      // CONVERGENCE
      if (allAtSamePosition) {
        const convergedPosition = activeRequests[0].position;
        const nextNode = getNextNodeForPosition(convergedPosition);

        if (nextNode !== null) {
          setTargetIndex(nextNode);

          if (!traversedNodes.includes(nextNode)) {
            setTraversedNodes(prev => [...prev, nextNode]);
          }

          setActiveRequests([
            {
              id: Date.now(),
              position: nextNode,
              fromPosition: convergedPosition
            }
          ]);
        }

        return;
      }

      // Continue parallel execution
      const nextRequests = activeRequests
        .map((req, idx) => {
          const nextNode = getNextNodeForPosition(req.position);

          return nextNode !== null
            ? {
                id: Date.now() + idx,
                position: nextNode,
                fromPosition: req.position
              }
            : null;
        })
        .filter(Boolean);

      if (nextRequests.length > 0) {
        setActiveRequests(nextRequests);
        const firstTarget = nextRequests[0].position;
        setTargetIndex(firstTarget);

        const newNodes = nextRequests
          .map(r => r.position)
          .filter(n => !traversedNodes.includes(n));

        if (newNodes.length > 0) {
          setTraversedNodes(prev => [...prev, ...newNodes]);
        }
      }

      return;
    }

    // ===============================
    // NORMAL SEQUENTIAL
    // ===============================
    const nextNode = getNextNodeForPosition(targetIndex);

    if (nextNode !== null) {
      setTargetIndex(nextNode);

      if (!traversedNodes.includes(nextNode)) {
        setTraversedNodes(prev => [...prev, nextNode]);
      }

      setActiveRequests([
        {
          id: Date.now(),
          position: nextNode,
          fromPosition: targetIndex
        }
      ]);
    }
  };

  if (isLoading) return null;
  if (error) return <div>Error: {error}</div>;
  if (!config) return null;

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#9caa9e" }}>
      <div style={{ position: "absolute", top: 30, left: 30, zIndex: 10 }}>
        {!showDecision ? (
          <button onClick={handleNextStep}>Next Step</button>
        ) : (
          flowMap[targetIndex]?.next.map((_, index) => (
            <button key={index} onClick={() => handleDecision(index)}>
              Option {index + 1}
            </button>
          ))
        )}
      </div>

      <Canvas
        shadows
        camera={{
          position: config.settings.camera.position,
          fov: config.settings.camera.fov
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={0.7} castShadow />
        <WorkFlowExecution
          targetIndex={targetIndex}
          flowMap={flowMap}
          activeRequests={activeRequests}
          traversedNodes={traversedNodes}
          config={config}
        />
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}