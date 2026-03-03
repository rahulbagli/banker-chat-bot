import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Grid, RoundedBox, Edges } from "@react-three/drei";

function MovingObjects({ targetIndex }) {
  // Define multiple waypoints
  const waypoints = [
    new THREE.Vector3(-10, 0, 0), // first cube
    new THREE.Vector3(10, 0, 0),  // second cube
    new THREE.Vector3(0, 2, -3),  // red box
    new THREE.Vector3(0, -1, 0),  // one of the cylinders
  ];

  const ref = useRef();
  const progress = useRef(0);
  const currentTarget = useRef(targetIndex);

  useFrame((_, delta) => {
    if (currentTarget.current !== targetIndex) {
      // reset progress when target changes
      progress.current = 0;
      currentTarget.current = targetIndex;
    }

    if (progress.current < 1) {
      progress.current += delta * 0.5; // speed
    }

    const start = ref.current?.position || waypoints[0];
    const end = waypoints[targetIndex];
    const pos = new THREE.Vector3().lerpVectors(start, end, progress.current);

    if (ref.current) {
      ref.current.position.copy(pos);
    }
  });

  return (
    <>
      {/* Static objects */}
      <mesh position={[-10, 0, 0]}>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      <mesh position={[10, 0, 0]}>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color="green" emissive="green" emissiveIntensity={0.4} />
      </mesh>

      <mesh position={[0, 2, -3]}>
        <RoundedBox args={[3, 3, 3]} radius={0.3}>
          <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.4} />
        </RoundedBox>
      </mesh>

      <group>
        {[1, 0, -1].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 0.6, 32]} />
            <meshStandardMaterial color="blue" emissive="blue" emissiveIntensity={0.4} />
            <Edges color="white" opacity={0.2} transparent />
          </mesh>
        ))}
      </group>

      {/* Moving sphere */}
      <mesh ref={ref} position={[-10, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
    </>
  );
}

export default function SimpleExample() {
  const [targetIndex, setTargetIndex] = useState(0);

  const handleClick = () => {
    setTargetIndex((prev) => (prev + 1) % 4); // cycle through waypoints
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020205", position: "relative" }}>
      <button
        onClick={handleClick}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Move Sphere
      </button>

      <Canvas shadows camera={{ position: [0, 35, 50], fov: 45 }}>
        <Grid position={[0, -4, 0]} args={[60, 60]} sectionColor="#282828" cellColor="#1b1b23" infiniteGrid />
        <ambientLight intensity={1.2} />
        <MovingObjects targetIndex={targetIndex} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}