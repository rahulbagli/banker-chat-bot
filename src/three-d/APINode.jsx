import { Edges, Text } from "@react-three/drei";

function APINode({ position, isActive }) {
    return (
        <>
            <group position={position} rotation={[0, 4.7, 0]}>
                <mesh >
                    <cylinderGeometry args={[
                        2,// radiusTop
                        2,      // radiusBottom
                        0.8,      // height
                        6,      // radialSegments
                        1,      // heightSegments
                        false,  // openEnded
                        0
                    ]} />
                    <meshPhysicalMaterial
                        color="#2563eb"
                        transmission={0.9}   // higher = more transparent
                        thickness={1}        // depth of refraction
                        roughness={0.1}      // smoother surface
                        metalness={0}
                        ior={1.5}            // index of refraction (glass ~1.5)
                        transparent={true}   // allow transparency
                        emissive="#1d4ed8"
                        emissiveIntensity={isActive ? 0.6 : 0.2}
                    />

                    <Edges color="white" opacity={0.5} transparent />
                </mesh>

                <Text
                    position={[0, 0.5, 0]}
                    rotation={[4.8, 0, 0]}
                    fontSize={0.5}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    API
                </Text>
            </group>
        </>
    )
}

export default APINode