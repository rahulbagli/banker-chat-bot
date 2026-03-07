import { Edges, Text } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function ConditionNode({ position, isActive, label, color }) {
  const outerRotateRef = useRef();
  const innerRotateRef = useRef();
  
  useFrame(() => {
    if (outerRotateRef.current) {
      outerRotateRef.current.rotation.y += 0.008;
    }
    if (innerRotateRef.current) {
      innerRotateRef.current.rotation.y -= 0.012;
    }
  });

  return (
    <group position={position} rotation={[0, 4.7, 0]}>
      {/* ===== Diamond/Rhombus Core ===== */}
      <mesh rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 1, 3]} />
        <meshPhysicalMaterial
          color={color || "#f59e0b"}
          metalness={0.8}
          roughness={0.3}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          emissive={color || "#f59e0b"}
          emissiveIntensity={isActive ? 0.5 : 0.12}
        />
        <Edges color={isActive ? "#208ab1" : "#1114be"} linewidth={1.5} />
      </mesh>


      {/* ===== Corner LED Indicators ===== */}
      {[
        [1, 0, 1.2],
        [-1, 0, 1.2],
        [1, 0, -1.2],
        [-1, 0, -1.2]
      ].map((pos, i) => (
        <mesh key={`led-${i}`} position={pos}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color={isActive ? "#3b82f6" : "#334155"}
            emissive={isActive ? "#3b82f6" : "#000000"}
            emissiveIntensity={isActive ? 2.5 : 0}
          />
        </mesh>
      ))}

      <mesh position={[0, -0.35, 1.3]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#fff"
          emissive="#fff"
          emissiveIntensity={isActive ? 0.8 : 0.3}
        />
      </mesh>


      {/* ===== Label ===== */}
      <Text
        position={[0, .6, 0]}
        rotation={[4.8, 0, 0]}
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

export default ConditionNode;