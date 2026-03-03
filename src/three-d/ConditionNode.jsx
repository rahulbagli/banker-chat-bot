import { Edges, Text } from "@react-three/drei";

export default function ConditionNode({ position, isActive }) {

    return (
        <>
            <group position={position} rotation={[0,4.7, 0]}>
                <mesh >
                    <cylinderGeometry args={[
                        2,// radiusTop
                        2,      // radiusBottom
                        0.8,      // height
                        4,      // radialSegments
                        1,      // heightSegments
                        false,  // openEnded
                        0
                    ]} />
                    <meshStandardMaterial
                        color={isActive ? "#1e40af" : "blue"}
                        emissive="blue"
                        emissiveIntensity={isActive ? 0.4 : 0.1}
                    />
                    <Edges color="white" opacity={0.5} transparent />
                </mesh>

                <Text
                    position={[0, 0.5, 0]}
                    rotation={[4.8,0,0]}
                    fontSize={0.5}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    Condition
                </Text>
            </group>
        </>
    );
}
