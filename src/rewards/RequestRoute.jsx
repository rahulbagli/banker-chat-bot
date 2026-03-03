import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function RequestRoute({ waypoints, connections, targetIndex, fromIndex, isParallel }) {
  const ref = useRef();
  const progress = useRef(0);
  const startPoint = useRef(new THREE.Vector3(...waypoints[0]));
  const endPoint = useRef(new THREE.Vector3(...waypoints[0]));
  const lastTarget = useRef(null);

  useFrame((_, delta) => {
    if (!ref.current) return;

    // Find the connection that leads to this targetIndex from fromIndex
    const conn = fromIndex !== undefined 
      ? connections.find(c => c.from === fromIndex && c.to === targetIndex)
      : connections.find(c => c.to === targetIndex);
    
    if (!conn) {
      // No connection defined, just place at target
      ref.current.position.copy(new THREE.Vector3(...waypoints[targetIndex]));
      return;
    }

    // Reset animation when target changes
    if (lastTarget.current !== `${fromIndex}-${targetIndex}`) {
      startPoint.current = new THREE.Vector3(...waypoints[conn.from]);
      endPoint.current = new THREE.Vector3(...waypoints[conn.to]);
      progress.current = 0;
      lastTarget.current = `${fromIndex}-${targetIndex}`;
    }

    // Animate along the path
    if (progress.current < 1) {
      progress.current += delta * 0.6;
      if (progress.current > 1) progress.current = 1;

      const start = startPoint.current;
      const end = endPoint.current;

      // 90° elbow routing (X first → then Z)
      const mid = new THREE.Vector3(end.x, start.y, start.z);

      let pos;
      if (progress.current < 0.5) {
        const t = progress.current / 0.5;
        pos = new THREE.Vector3().lerpVectors(start, mid, t);
      } else {
        const t = (progress.current - 0.5) / 0.5;
        pos = new THREE.Vector3().lerpVectors(mid, end, t);
      }

      ref.current.position.copy(pos);
    }
  });

  // Use smaller spheres for parallel execution
  const sphereSize = isParallel ? 0.25 : 0.4;
  const sphereColor = isParallel ? "#ffaa00" : "#ffff00";

  return (
    <mesh ref={ref} position={waypoints[targetIndex]}>
      <sphereGeometry args={[sphereSize, 32, 32]} />
      <meshStandardMaterial 
        color={sphereColor} 
        emissive={sphereColor} 
        emissiveIntensity={1} 
      />
    </mesh>
  );
}

export default RequestRoute;