import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

function IconNode({ position, icon, size = 4 }) {
  const texture = useLoader(TextureLoader, icon);

  return (
    <mesh position={position}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

export default IconNode