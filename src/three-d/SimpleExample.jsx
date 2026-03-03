import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Grid, RoundedBox, Edges, Html } from "@react-three/drei";
import GearNode from "./GearNode";

function MovingObjects({ shouldMove }) {
  const start = [-10, 0, 0];
  const end = [10, 0, 0];
  const ref = useRef();
  const progress = useRef(0);

  useFrame((_, delta) => {
    if (!shouldMove) return;

    if (progress.current < 1) {
      progress.current += delta * 0.5;
    }

    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const pos = new THREE.Vector3().lerpVectors(s, e, progress.current);
    if (ref.current) {
      ref.current.position.copy(pos);
    }
  });

  return (
    <>
      <mesh position={start}>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      <mesh position={end}>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color="green"
          emissive="green"
          emissiveIntensity={0.4} />
      </mesh>

      <mesh ref={ref} position={start}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="yellow" />
      </mesh>

      <mesh position={[0, 2, -3]}>
        <RoundedBox args={[3, 3, 3]} radius={0.3} >
          <meshStandardMaterial
            color="red"
            emissive="red"
            emissiveIntensity={0.4}
          />
        </RoundedBox>
      </mesh>

      <group>
        {[1, 0, -1].map((y) => (
          <mesh position={[0, y, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 0.6, 32]} />
            <meshStandardMaterial
              color={"blue"}
              emissive={"blue"}
              emissiveIntensity={0.4}
            />
            <Edges color="white" opacity={0.2} transparent />
          </mesh>
        ))}
      </group>

      <GearNode position={[0, 0, -5]} name="Rewards Service" />
    </>
  );
}

export default function SimpleExample() {
  const [move, setMove] = useState(false);
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#a2bcc6', position: 'relative' }}>
      <button
        onClick={() => setMove(true)}
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
        <Grid position={[0, -10, 0]} args={[60, 60]} sectionColor="#a7a7a7" cellColor="#1b1b23" infiniteGrid />
        <ambientLight intensity={1.2} />
        <MovingObjects shouldMove={move} />

        <OrbitControls />
      </Canvas>
    </div>
  );
}