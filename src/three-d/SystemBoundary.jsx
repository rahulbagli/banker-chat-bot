import { Line } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

function SystemBoundary({ min, max, label, backgroundColor = "rgba(104, 207, 145, 0.1)" }) {
  const points = useMemo(() => {
    return [
      new THREE.Vector3(min[0], min[1], min[2]),
      new THREE.Vector3(max[0], min[1], min[2]),
      new THREE.Vector3(max[0], min[1], max[2]),
      new THREE.Vector3(min[0], min[1], max[2]),
      new THREE.Vector3(min[0], min[1], min[2]), // close loop
    ];
  }, [min, max]);

  const width = max[0] - min[0];
  const height = max[2] - min[2];
  const centerX = (min[0] + max[0]) / 2;
  const centerZ = (min[2] + max[2]) / 2;

  return (
    <>
      {/* Background plane */}
      <mesh position={[centerX, min[1], centerZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={backgroundColor}
          opacity={1} // adjust transparency
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Dashed boundary outline */}
      <Line
        points={points}
        color="#1c0da7"
        dashed
        dashSize={0.6}
        gapSize={0.4}
        lineWidth={1}
      />
    </>
  );
}

export default SystemBoundary;