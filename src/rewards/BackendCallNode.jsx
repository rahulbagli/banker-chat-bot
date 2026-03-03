import { Edges, Text } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function BackendCallNode({ position, color, label, isActive = false }) {
    const groupRef = useRef();
    const glowRef = useRef();
    
    useFrame((state) => {
        if (glowRef.current && isActive) {
            const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
            glowRef.current.scale.setScalar(pulse);
        }
    });

    return (
        <group ref={groupRef} position={position}  rotation={[0,4.7, 0]}>
            {/* Outer glow - thin layer */}
            <mesh ref={glowRef}>
                <boxGeometry args={[6.3, 1, 3]} />
                <meshBasicMaterial 
                    color={color} 
                    transparent 
                    opacity={isActive ? 0.3 : 0.15}
                    wireframe={false}
                />
            </mesh>

            {/* Main box */}
            <mesh>
                <boxGeometry args={[6,1, 3]} />
                <meshStandardMaterial 
                    color={color}
                    metalness={0.4}
                    roughness={0.3}
                    emissive={color}
                    emissiveIntensity={isActive ? 0.4 : 0.1}
                />
                <Edges color={isActive ? "#ffff00" : "white"} linewidth={0.5} />
            </mesh>

            {/* Label - positioned in front */}
            <Text
                position={[0, 0.7, 0]}
                rotation={[4.8,0,0]}
                fontSize={0.55}
                color="white"
                anchorX="center"
                anchorY="middle"
                maxWidth={4.5}
            >
                {label}
            </Text>
        </group>
    );
}

export default BackendCallNode;