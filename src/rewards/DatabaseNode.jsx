import { Edges, Text } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function DatabaseNode({ position, isActive, label, color }) {
  const glowRef = useRef();
  
  useFrame((state) => {
    if (isActive && glowRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.08;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      {/* ===== Outer Glow (when active) ===== */}
      <mesh ref={glowRef}>
        <cylinderGeometry args={[1.9, 1.9, 2.5, 32]} />
        <meshBasicMaterial
          color={color || "#10b981"}
          transparent
          opacity={isActive ? 0.2 : 0}
        />
      </mesh>

      {/* ===== Main Database Cylinder ===== */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.6, 1.6, 2.2, 32]} />
        <meshPhysicalMaterial
          color={color || "#059669"}
          metalness={0.7}
          roughness={0.3}
          clearcoat={0.5}
          clearcoatRoughness={0.2}
          emissive={color || "#059669"}
          emissiveIntensity={isActive ? 0.4 : 0.08}
        />
        <Edges color={isActive ? "#34d399" : "#10b981"} linewidth={1} />
      </mesh>

      {/* ===== Top Disc ===== */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[1.7, 1.7, 0.2, 32]} />
        <meshStandardMaterial
          color="#064e3b"
          metalness={0.85}
          roughness={0.25}
        />
        <Edges color="#10b981" />
      </mesh>

      {/* ===== Bottom Disc ===== */}
      <mesh position={[0, -1.1, 0]} receiveShadow>
        <cylinderGeometry args={[1.7, 1.7, 0.2, 32]} />
        <meshStandardMaterial
          color="#064e3b"
          metalness={0.85}
          roughness={0.25}
        />
        <Edges color="#10b981" />
      </mesh>

 

      {/* ===== Access Ports (LED-like indicators) ===== */}
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 1.5;
        const z = Math.sin(rad) * 1.5;
        return (
          <mesh key={i} position={[x, 0.7, z]}>
            <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
            <meshStandardMaterial
              color={isActive ? "#22c55e" : "#334155"}
              emissive={isActive ? "#22c55e" : "#000000"}
              emissiveIntensity={isActive ? 2 : 0}
            />
          </mesh>
        );
      })}

      {/* ===== Data Stream Indicators ===== */}
      {[0, 120, 240].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 1.6;
        const z = Math.sin(rad) * 1.6;
        return (
          <mesh key={`stream-${i}`} position={[x, -0.3, z]}>
            <boxGeometry args={[0.15, 0.8, 0.05]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={isActive ? 0.6 : 0.2}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}

      {/* ===== Base Platform ===== */}
      <mesh position={[0, -1.35, 0]} receiveShadow>
        <cylinderGeometry args={[1.9, 1.9, 0.1, 32]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* ===== Label ===== */}
      <Text
        position={[0, 1.3, 0]}
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

export default DatabaseNode;