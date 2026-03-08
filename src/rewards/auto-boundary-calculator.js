/**
 * Auto-calculate boundaries for ZOS nodes and parallel groups
 * @param {Array} nodes - Array of node objects from config
 * @param {Array} connections - Array of connection objects from config
 * @returns {Array} - Array of boundary objects with min, max, and label
 */
export function calculateAutoBoundaries(nodes, connections) {
  const boundaries = [];

  // Find all ZOS nodes
  const zosNodes = nodes.filter(node => node.type === "zos");
  
  zosNodes.forEach(zosNode => {
    const [x, y, z] = zosNode.position;
    
    boundaries.push({
      min: [x - 2, 0, z - 2],
      max: [x + 2, 0, z + 2],
      label: zosNode.label || zosNode.name || "Z/OS System"
    });
  });

  // Find all parallel connections
  const parallelConnections = connections.filter(conn => conn.type === "parallel");
  
  parallelConnections.forEach(conn => {
    const parallelNodes = conn.to.map(nodeId => 
      nodes.find(n => n.id === nodeId)
    ).filter(Boolean);

    if (parallelNodes.length > 1) {
      // Get all positions
      const positions = parallelNodes.map(n => n.position);
      
      // Find min and max for each dimension
      const xValues = positions.map(p => p[0]);
      const zValues = positions.map(p => p[2]);
      
      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);
      const minZ = Math.min(...zValues);
      const maxZ = Math.max(...zValues);
      
      boundaries.push({
        min: [minX - 2, 0, minZ - 2],
        max: [maxX + 2, 0, maxZ + 2],
        label: "Parallel Execution Zone"
      });
    }
  });

  return boundaries;
}
