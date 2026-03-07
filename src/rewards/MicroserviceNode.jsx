import { Edges, Text } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function MicroserviceNode({ position, isActive, label, color }) {
  const groupRef = useRef();
  const innerRingRef = useRef();
  
  useFrame((state) => {
    if (innerRingRef.current) {
      innerRingRef.current.rotation.y += 0.005;
    }
    if (isActive && groupRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
      groupRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* ===== Main Hexagonal Container ===== */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.4, 1.4, 1.8, 6]} />
        <meshPhysicalMaterial
          color={color || "#7c3aed"}
          metalness={0.85}
          roughness={0.25}
          clearcoat={0.6}
          clearcoatRoughness={0.15}
          emissive={color || "#7c3aed"}
          emissiveIntensity={isActive ? 0.5 : 0.1}
        />
        <Edges color={isActive ? "#a78bfa" : "#8b5cf6"} linewidth={1.5} />
      </mesh>

      {/* ===== Top Cap ===== */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.15, 6]} />
        <meshStandardMaterial
          color="#1e1b4b"
          metalness={0.9}
          roughness={0.2}
        />
        <Edges color="#6366f1" />
      </mesh>

      {/* ===== Bottom Cap ===== */}
      <mesh position={[0, -0.9, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.15, 6]} />
        <meshStandardMaterial
          color="#1e1b4b"
          metalness={0.9}
          roughness={0.2}
        />
        <Edges color="#6366f1" />
      </mesh>

      {/* ===== Status Ring Indicators ===== */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 1.2;
        const z = Math.sin(rad) * 1.2;
        return (
          <mesh key={i} position={[x, 0.3, z]}>
            <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
            <meshStandardMaterial
              color={isActive ? "#22c55e" : "#475569"}
              emissive={isActive ? "#22c55e" : "#000000"}
              emissiveIntensity={isActive ? 1.5 : 0}
            />
          </mesh>
        );
      })}

   

      {/* ===== Label ===== */}
      <Text
        position={[0, 1, 0]}
        rotation={[4.7, 0, 4.7]}
        fontSize={0.45}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {label}
      </Text>
    </group>
  );
}

export default MicroserviceNode;