/**
 * Converts new connections array format to flowMap format
 * Handles multiple connections from same node by merging destinations
 */
export function buildFlowMapFromConnections(connections) {
  const flowMap = {};
  
  connections.forEach(conn => {
    const from = conn.from;
    
    if (!flowMap[from]) {
      flowMap[from] = { next: [], type: conn.type };
    }
    
    // Add all destinations
    flowMap[from].next.push(...conn.to);
    
    // Priority: decision > parallel > convergence > sequential
    const typePriority = { decision: 4, parallel: 3, convergence: 2, sequential: 1 };
    const currentPriority = typePriority[flowMap[from].type] || 0;
    const newPriority = typePriority[conn.type] || 0;
    
    if (newPriority > currentPriority) {
      flowMap[from].type = conn.type;
    }
  });
  
  // Remove duplicates in next arrays
  Object.keys(flowMap).forEach(key => {
    flowMap[key].next = [...new Set(flowMap[key].next)];
  });
  
  return flowMap;
}

/**
 * Converts flowMap format back to connections array
 */
export function buildConnectionsFromFlowMap(flowMap) {
  const connections = [];
  let id = 0;
  
  Object.entries(flowMap).forEach(([from, nodeData]) => {
    nodeData.next.forEach(to => {
      connections.push({
        id: `c${id++}`,
        from: Number(from),
        to: [to],
        type: nodeData.type
      });
    });
  });
  
  return connections;
}