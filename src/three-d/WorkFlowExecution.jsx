import MicroserviceNode from "./MicroserviceNode";
import DatabaseNode from "./DatabaseNode";
import BackendCallNode from "./BackendCallNode";
import ConditionNode from "./ConditionNode";
import RequestRoute from "./RequestRoute";
import ArchitectureBase from "./ArchitectureBase";
import ConnectionArrow from "./ConnectionArrow";
import SystemBoundary from "./SystemBoundary";
import APINode from "./APINode";

function WorkFlowExecution({ targetIndex, isPaused, flowMap, activeRequests, traversedNodes }) {

  // Node positions (X, Y, Z) - Now 7 nodes (0-6)
  const waypoints = [
    [31, 0.7, 0],      // 0 - Microservice
    [15, 0.5, 0],       // 1 - Condition (Decision)
    [1, 0.5, 5],       // 2 - EPSILON Call (triggers parallel)
    [1, 0.5, -5],      // 3 - Eligibility Call
    [-4, 1.4, 0],      // 4 - Database Query
    [-9, 0.5, -8],     // 5 - API Call
    [-15, 0.5, 7],     // 6 - Final Response
  ];

  // Use flowMap from props to generate connections dynamically
  const connections = Object.entries(flowMap).flatMap(([from, nodeData]) =>
    nodeData.next.map(to => ({
      from: Number(from),
      to,
      type: nodeData.type
    }))
  );

  return (
    <>
      {/* Base Floor */}
      <ArchitectureBase
        size={[50, 30]}
        color="#f2d357"
        position={[7, 0, 0]}
      />

      {/* ===== Dashed Boundary Around External Calls ===== */}
      <SystemBoundary
        min={[-1, 0, -9]}
        max={[3, 0, 9]}
        label="External System"
      />

      {/* ===== Nodes ===== */}
      <MicroserviceNode
        position={waypoints[0]}
        isActive={targetIndex === 0}
      />

      <ConditionNode
        position={waypoints[1]}
        isActive={targetIndex === 1}
      />

      <BackendCallNode
        position={waypoints[2]}
        color="#ff0000"
        label="EPSILON Call"
        isActive={targetIndex === 2}
      />

      <BackendCallNode
        position={waypoints[3]}
        color="#cdcd17"
        label="Eligibility Call"
        isActive={targetIndex === 3}
      />

      <DatabaseNode
        position={waypoints[4]}
        isActive={targetIndex === 4}
      />

      <APINode
        position={waypoints[5]}
        isActive={targetIndex === 5}
      />

      <BackendCallNode
        position={waypoints[6]}
        color="#42c04f"
        label="Final Response"
        isActive={targetIndex === 6}
      />

      {/* ===== Dashed 90° Connection Lines ===== */}
      {connections.map((conn, index) => {
        const isCurrentlyActive = activeRequests?.some(req => 
          req.fromPosition === conn.from && req.position === conn.to
        );
        const isTraversed = traversedNodes?.includes(conn.from) && traversedNodes?.includes(conn.to);
        
        // Treat convergence connections as parallel for visual purposes
        const isParallelConnection = conn.type === "parallel" || conn.type === "convergence";
        
        return (
          <ConnectionArrow
            key={index}
            start={waypoints[conn.from]}
            end={waypoints[conn.to]}
            isActive={isCurrentlyActive}
            isTraversed={isTraversed && !isCurrentlyActive}
            isParallel={isParallelConnection}
            activeRequests={activeRequests}
          />
        );
      })}

      {/* ===== Moving Request Spheres (supports multiple for parallel execution) ===== */}
      {activeRequests && activeRequests.map((request) => (
        <RequestRoute
          key={request.id}
          waypoints={waypoints}
          connections={connections}
          targetIndex={request.position}
          fromIndex={request.fromPosition}
          isParallel={activeRequests.length > 1}
        />
      ))}
    </>
  );
}

export default WorkFlowExecution;