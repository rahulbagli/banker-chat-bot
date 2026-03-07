import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function RequestRoute({ waypoints, connections, targetIndex, fromIndex, isParallel }) {
  const ref = useRef();
  const progress = useRef(0);
  const lastTargetKey = useRef(null);
  
  // SAME HEIGHT as tracks
  const TRACK_HEIGHT = 0.5;

  useFrame((_, delta) => {
    if (!ref.current) return;

    // Find the connection
    const conn = connections.find(
      (c) => (c.from === fromIndex && c.to === targetIndex) || 
             (c.from === targetIndex && c.to === fromIndex)
    );

    if (!conn || fromIndex === undefined || fromIndex === targetIndex) {
      // Snap to target
      const targetWP = waypoints[targetIndex];
      if (targetWP) {
        ref.current.position.set(targetWP[0], TRACK_HEIGHT, targetWP[2]);
      }
      return;
    }

    // Reset progress on new movement
    const movementKey = `${fromIndex}-${targetIndex}`;
    if (lastTargetKey.current !== movementKey) {
      progress.current = 0;
      lastTargetKey.current = movementKey;
    }

    // Get waypoints (extract X and Z only)
    const startWP = waypoints[conn.from];
    const endWP = waypoints[conn.to];
    
    if (!startWP || !endWP) return;
    
    // Create exact same L-shaped path as ConnectionArrow
    const startPoint = new THREE.Vector3(startWP[0], TRACK_HEIGHT, startWP[2]);
    const cornerPoint = new THREE.Vector3(endWP[0], TRACK_HEIGHT, startWP[2]);  // L corner
    const endPoint = new THREE.Vector3(endWP[0], TRACK_HEIGHT, endWP[2]);

    // Determine if moving forward or backward
    const isMovingForward = (fromIndex === conn.from);

    // Animate along the L-shaped path
    if (progress.current < 1) {
      progress.current = Math.min(progress.current + delta * 0.8, 1);
      const t = progress.current;

      let currentPos = new THREE.Vector3();

      if (isMovingForward) {
        // Forward: start -> corner -> end
        if (t < 0.5) {
          // First half: start to corner (horizontal movement)
          currentPos.lerpVectors(startPoint, cornerPoint, t / 0.5);
        } else {
          // Second half: corner to end (Z movement)
          currentPos.lerpVectors(cornerPoint, endPoint, (t - 0.5) / 0.5);
        }
      } else {
        // Backward: end -> corner -> start
        if (t < 0.5) {
          // First half: end to corner
          currentPos.lerpVectors(endPoint, cornerPoint, t / 0.5);
        } else {
          // Second half: corner to start
          currentPos.lerpVectors(cornerPoint, startPoint, (t - 0.5) / 0.5);
        }
      }

      ref.current.position.copy(currentPos);
      
      // Rolling animation
      ref.current.rotation.x += delta * 4;
      ref.current.rotation.z += delta * 2;
    }
  });

  const sphereSize = isParallel ? 0.28 : 0.4;
  const sphereColor = "#ffff00";

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[sphereSize, 32, 32]} />
      <meshStandardMaterial
        color={sphereColor}
        emissive={sphereColor}
        emissiveIntensity={0.6}
        roughness={0.1}
        metalness={0.5}
      />
    </mesh>
  );
}

export default RequestRoute;