import React from "react";
import * as THREE from "three";

function ConnectionArrow({ start, end, isActive, isTraversed }) {
  // FIXED HEIGHT for all tracks
  const TRACK_HEIGHT = 0.5;
  
  // Extract X and Z only, completely ignore node Y positions
  const startX = start[0];
  const startZ = start[2];
  const endX = end[0];
  const endZ = end[2];
  // Create L-shaped path: start -> corner -> end (all at same Y)
  const startPoint = new THREE.Vector3(startX, TRACK_HEIGHT, startZ);
  const cornerPoint = new THREE.Vector3(endX, TRACK_HEIGHT, startZ);  // Corner of L
  const endPoint = new THREE.Vector3(endX, TRACK_HEIGHT, endZ);

  // Segment 1: Horizontal line along X axis (start to corner)
  const segment1Points = [startPoint, cornerPoint];
  const segment1Curve = new THREE.CatmullRomCurve3(segment1Points);
  const segment1Geometry = new THREE.TubeGeometry(segment1Curve, 20, 0.05, 8, false);

  // Segment 2: Line along Z axis (corner to end)  
  const segment2Points = [cornerPoint, endPoint];
  const segment2Curve = new THREE.CatmullRomCurve3(segment2Points);
  const segment2Geometry = new THREE.TubeGeometry(segment2Curve, 20, 0.05, 8, false);

  // Color logic
  let color, opacity, emissiveIntensity;

  if (isActive) {
    color = "#00ff00";
    opacity = 0.9;
    emissiveIntensity = 0.4;
  } else if (isTraversed) {
    color = "#ffa500";
    opacity = 0.6;
    emissiveIntensity = 0.2;
  } else {
    color = "#555555";
    opacity = 0.3;
    emissiveIntensity = 0;
  }

  return (
    <>
      {/* First segment - horizontal */}
      <mesh geometry={segment1Geometry}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      
      {/* Second segment - vertical */}
      <mesh geometry={segment2Geometry}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      
      {/* Debug spheres at key points (remove after testing) */}
      {false && (
        <>
          <mesh position={startPoint}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
          <mesh position={cornerPoint}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
          <mesh position={endPoint}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#0000ff" />
          </mesh>
        </>
      )}
    </>
  );
}

export default ConnectionArrow;