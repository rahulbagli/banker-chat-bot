import { Edges, Text } from "@react-three/drei";

function DatabaseNode({ position, isActive = false }) {

    return (
        <group position={position}>
            {/* Outer glow */}
            <mesh  position={[0, -0.5, 0]}>
                <cylinderGeometry args={[1.3,1.3, 2.5, 32]} />
                <meshBasicMaterial 
                    color={isActive ? "#ff6b00" : "#ff8c00"} 
                    transparent 
                    opacity={0.15}
                />
            </mesh>

            {/* Bottom disk */}
            <mesh castShadow receiveShadow position={[0, -1, 0]}>
                <cylinderGeometry args={[1,1, 1, 64]} />
                <meshStandardMaterial 
                    color="#ff6b00"
                    metalness={0.6}
                    roughness={0.3}
                    emissive={isActive ? "#ff6b00" : "#000000"}
                    emissiveIntensity={isActive ? 0.4 : 0}
                />
                <Edges color={isActive ? "#ffff00" : "white"} linewidth={0.5} />
            </mesh>

            {/* Middle disk */}
            <mesh castShadow receiveShadow position={[0, -0.5, 0]}>
                <cylinderGeometry args={[1,1, 1, 64]} />
                <meshStandardMaterial 
                    color="#ff8c00"
                    metalness={0.6}
                    roughness={0.3}
                    emissive={isActive ? "#ff8c00" : "#000000"}
                    emissiveIntensity={isActive ? 0.4 : 0}
                />
                <Edges color={isActive ? "#ffff00" : "white"} linewidth={0.5} />
            </mesh>

            {/* Top disk */}
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
                <cylinderGeometry args={[1,1, 1, 64]} />
                <meshStandardMaterial 
                    color="#ffa500"
                    metalness={0.6}
                    roughness={0.3}
                    emissive={isActive ? "#ffa500" : "#000000"}
                    emissiveIntensity={isActive ? 0.4 : 0}
                />
                <Edges color={isActive ? "#ffff00" : "white"} linewidth={0.5} />
            </mesh>

            {/* Database icon on top */}
            <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.8, 32]} />
                <meshBasicMaterial 
                    color={isActive ? "#ffff00" : "#ffffff"} 
                    transparent 
                    opacity={0.9}
                />
            </mesh>

            {/* Database name label below */}
            <Text
                position={[0, 0.8, 0]}
                 rotation={[4.7,0,4.7]}
                fontSize={0.4}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                DATABASE
            </Text>
        </group>
    );
}

export default DatabaseNode;