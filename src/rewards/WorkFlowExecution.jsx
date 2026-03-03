import MicroserviceNode from "./MicroserviceNode";
import DatabaseNode from "./DatabaseNode";
import BackendCallNode from "./BackendCallNode";
import ConditionNode from "./ConditionNode";
import RequestRoute from "./RequestRoute";
import ArchitectureBase from "./ArchitectureBase";
import ConnectionArrow from "./ConnectionArrow";
import SystemBoundary from "./SystemBoundary";
import APINode from "./APINode";
import ZOSNode from "./ZOSNode";

// Node type to component mapping
const NODE_COMPONENTS = {
  microservice: MicroserviceNode,
  condition: ConditionNode,
  database: DatabaseNode,
  api: APINode,
  zos: ZOSNode,
  backend: BackendCallNode,
};

function WorkFlowExecution({ targetIndex, flowMap, activeRequests, traversedNodes, config }) {

  const waypoints = config.nodes.map(node => node.position);

  const connections = Object.entries(flowMap).flatMap(([from, nodeData]) =>
    nodeData.next.map(to => ({
      from: Number(from),
      to,
      type: nodeData.type
    }))
  );

  const renderNode = (node) => {
    const isActive = targetIndex === node.id;
    const NodeComponent = NODE_COMPONENTS[node.type];

    if (!NodeComponent) {
      return (
        <BackendCallNode
          key={node.id}
          position={node.position}
          color={node.color || "#4a90e2"}
          label={node.label || node.name}
          isActive={isActive}
        />
      );
    }

    const commonProps = {
      key: node.id,
      position: node.position,
      isActive: isActive,
    };

    const typeSpecificProps = {};
    
    if (node.type === "backend" || node.type === "zos") {
      typeSpecificProps.color = node.color;
      typeSpecificProps.label = node.label || node.name;
    }

    return <NodeComponent {...commonProps} {...typeSpecificProps} />;
  };

  return (
    <>
      <ArchitectureBase
        size={config.settings.base.size}
        color={config.settings.base.color}
        position={config.settings.base.position}
      />

      {config.settings.boundaries && config.settings.boundaries.map((boundary, index) => (
        <SystemBoundary
          key={index}
          min={boundary.min}
          max={boundary.max}
          label={boundary.label}
        />
      ))}

      {config.nodes.map(renderNode)}

      {connections.map((conn, index) => {
        const isCurrentlyActive = activeRequests?.some(req =>
          req.fromPosition === conn.from && req.position === conn.to
        );
        const isTraversed = traversedNodes?.includes(conn.from) && traversedNodes?.includes(conn.to);
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