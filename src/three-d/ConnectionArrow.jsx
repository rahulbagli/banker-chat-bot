import React from "react";
import * as THREE from "three";

function ConnectionArrow({ start, end, isActive, isTraversed }) {
  // Create 90-degree elbow path
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const midVec = new THREE.Vector3(endVec.x, startVec.y, startVec.z);

  // First segment (horizontal)
  const seg1Points = [startVec, midVec];
  const seg1Curve = new THREE.LineCurve3(seg1Points[0], seg1Points[1]);
  const seg1Geometry = new THREE.TubeGeometry(seg1Curve, 20, 0.05, 8, false);

  // Second segment (vertical or depth)
  const seg2Points = [midVec, endVec];
  const seg2Curve = new THREE.LineCurve3(seg2Points[0], seg2Points[1]);
  const seg2Geometry = new THREE.TubeGeometry(seg2Curve, 20, 0.05, 8, false);

  // Clear 3-state color system:
  // 1. GREEN (#00ff00) - Currently active path (request moving on it)
  // 2. AMBER (#ffa500) - Already traversed path (completed)
  // 3. GREY (#555555) - Not yet traversed (future path)
  
  let color, opacity, emissiveIntensity;
  
  if (isActive) {
    // Currently active - GREEN
    color = "#00ff00";
    opacity = 0.9;
    emissiveIntensity = 0.4;
  } else if (isTraversed) {
    // Already traversed - AMBER
    color = "#ffa500";
    opacity = 0.6;
    emissiveIntensity = 0.2;
  } else {
    // Not yet traversed - GREY
    color = "#555555";
    opacity = 0.3;
    emissiveIntensity = 0;
  }

  return (
    <>
      <mesh geometry={seg1Geometry}>
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={opacity}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      <mesh geometry={seg2Geometry}>
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={opacity}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
    </>
  );
}

export default ConnectionArrow;