import { Edges, Text } from "@react-three/drei";
import { useRef } from "react";

function APINode({ position, isActive, label, color }) {
  const pulseRef = useRef();

  return (
    <group position={position}>
      {/* ===== Central Cube ===== */}
      <mesh ref={pulseRef} castShadow receiveShadow>
        <boxGeometry args={[2.5,2.5,2.5]} />
        <meshPhysicalMaterial
          color={color || "#ec4899"}
          metalness={0.8}
          roughness={0.25}
          clearcoat={0.6}
          clearcoatRoughness={0.15}
          emissive={color || "#ec4899"}
          emissiveIntensity={isActive ? 0.5 : 0.1}
        />
        <Edges color={isActive ? "#f9a8d4" : "#f472b6"} linewidth={1.5} />
      </mesh>

      {/* ===== Label ===== */}
      <Text
        position={[0, 1.3, 0]}
        rotation={[4.7, 0, 0]}
        fontSize={0.4}
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

export default APINode;