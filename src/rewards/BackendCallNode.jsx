import { Edges, Text } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function BackendCallNode({ position, color, label, isActive = false }) {
  const glowRef = useRef();
  const dataFlowRef = useRef();
  
  useFrame((state) => {
    if (glowRef.current && isActive) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.06;
      glowRef.current.scale.setScalar(pulse);
    }
    if (dataFlowRef.current) {
      dataFlowRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  return (
    <group position={position} rotation={[0, 4.7, 0]}>
      {/* ===== Outer Glow Layer ===== */}
      <mesh ref={glowRef}>
        <boxGeometry args={[5.5, 1.3, 3.3]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={isActive ? 0.15 : 0.05}
        />
      </mesh>

      {/* ===== Main Server Box ===== */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[5, 1.2, 3]} />
        <meshPhysicalMaterial 
          color={color}
          metalness={0.85}
          roughness={0.25}
          clearcoat={0.5}
          clearcoatRoughness={0.2}
          emissive={color}
          emissiveIntensity={isActive ? 0.4 : 0.08}
        />
        <Edges color={isActive ? "#ffffff" : "#94a3b8"} linewidth={1.2} />
      </mesh>

      {/* ===== Front Panel ===== */}
      <mesh position={[0, 0, 1.51]}>
        <boxGeometry args={[4.7, 0.9, 0.08]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>

      {/* ===== Status LED Indicators ===== */}
      {[-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8].map((x, i) => (
        <mesh key={i} position={[x, 0.3, 1.56]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial
            color={isActive ? "#22c55e" : "#475569"}
            emissive={isActive ? "#22c55e" : "#000000"}
            emissiveIntensity={isActive ? 2.5 : 0}
          />
        </mesh>
      ))}


      {/* ===== Data Flow Animation ===== */}
      {isActive && (
        <mesh ref={dataFlowRef} position={[0, 0, 1.58]}>
          <boxGeometry args={[0.15, 0.8, 0.05]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={1.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* ===== Bottom Rack Mount Rails ===== */}
      <mesh position={[0, -0.7, 0]}>
        <boxGeometry args={[5.2, 0.1, 3.2]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

    
      {/* ===== Label ===== */}
      <Text
        position={[0, 0.7, 0]}
        rotation={[4.7, 0, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={4.5}
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {label}
      </Text>
    </group>
  );
}

export default BackendCallNode;