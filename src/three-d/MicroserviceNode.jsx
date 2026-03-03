import { Edges } from "@react-three/drei";

export default function MicroserviceNode({ position, isActive }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2,2,2]} />
        <meshPhysicalMaterial
          color="#2563eb"
          transmission={0.5}
          roughness={0.2}
          thickness={1}
          metalness={0.2}
          emissive="#1d4ed8"
          emissiveIntensity={isActive ? 0.6 : 0.2}
        />
        <Edges color="white" opacity={0.5} transparent />
      </mesh>
    </group>
  );
}