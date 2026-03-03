import { Edges, Grid } from "@react-three/drei";

export default function ArchitectureBase({size, color, position}) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.1} // fully transparent plane
          side={2}
        />
        <Edges color="white" opacity={0.2} transparent />
      </mesh>

      {/* Transparent grid overlay */}
      <Grid
        args={[size[0], size[1]]}
        cellSize={1}
        cellThickness={0.8}
        cellColor={"#3e69cd"}
        sectionSize={5}
        sectionThickness={1}
        sectionColor={"gray"}
        fadeDistance={30}
        fadeStrength={1}
        infiniteGrid={false}
      />
    </group>
  );
}