import { Edges, Grid } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

export default function ArchitectureBase({ size, color, position }) {
  const { camera, gl } = useThree();

  useEffect(() => {
    // Enable panning with right-click or middle mouse
    const canvas = gl.domElement;
    
    const handleWheel = (e) => {
      if (e.shiftKey) {
        // Horizontal scroll when holding shift
        camera.position.x += e.deltaY * 0.01;
        e.preventDefault();
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [camera, gl]);

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
          side={2}
        />
        <Edges color="white" opacity={0.3} transparent />
      </mesh>

      {/* Grid overlay */}
      <Grid
        args={[size[0], size[1]]}
        cellSize={1}
        cellThickness={0.8}
        cellColor={"#6366f1"}
        sectionSize={5}
        sectionThickness={1.2}
        sectionColor={"#818cf8"}
        fadeDistance={40}
        fadeStrength={1}
        infiniteGrid={false}
      />
    </group>
  );
}