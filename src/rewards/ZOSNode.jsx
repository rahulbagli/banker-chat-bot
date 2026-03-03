import { Edges, Text } from "@react-three/drei";

function ZOSNode({ position, isActive, label }) {
  return (
    <group position={position}>
      {/* ===== Main Rack Body (Further Reduced Height) ===== */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.1, 3, 2]} /> {/* Height ~3 */}
        <meshPhysicalMaterial
          color="#1e293b"
          metalness={0.9}
          roughness={0.35}
          clearcoat={0.5}
          clearcoatRoughness={0.2}
          emissive="#0ea5e9"
          emissiveIntensity={isActive ? 0.4 : 0.05}
        />
        <Edges color="#0ea5e9" />
      </mesh>

      {/* ===== Front Panel Strip ===== */}
      <mesh position={[0, 0.9, 1.01]}>
        <boxGeometry args={[1.8, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.8}
          roughness={0.4}
        />
      </mesh>

      {/* ===== LED Indicators ===== */}
      {[-0.6, -0.3, 0, 0.3, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 0.9, 1.06]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial
            color={isActive ? "#00ff88" : "#334155"}
            emissive={isActive ? "#00ff88" : "#000000"}
            emissiveIntensity={isActive ? 2 : 0}
          />
        </mesh>
      ))}

      {/* ===== Vent Grill Lines ===== */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[0, 0.3 - i * 0.4, 1.02]}>
          <boxGeometry args={[1.7, 0.05, 0.05]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      ))}

      {/* ===== Bottom Base ===== */}
      <mesh position={[0, -1.7, 0]}>
        <boxGeometry args={[2.5, 0.3, 2.4]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.7}
          roughness={0.4}
        />
      </mesh>
      <Text
        position={[0, 1.6, 0]}
        rotation={[4.8, 0, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

export default ZOSNode;