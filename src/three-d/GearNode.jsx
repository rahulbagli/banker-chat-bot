import React, { useRef, useState, useMemo } from 'react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";


export default function GearNode({ position = [-10, 0, 0] }) {

const teeth = 12;
const outerRadius = 1.2;
const innerRadius = 0.75;
const toothDepth = 0.3;
const toothWidth = 0.15;

return (
  <group position={position}>
    {/* Main gear body with metallic look */}
    <mesh castShadow receiveShadow>
      <torusGeometry args={[0.5, 0.25, 3, 64]} />
      <meshStandardMaterial 
        color="#7f8c8d"
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>

    {/* Outer ring */}
    <mesh castShadow receiveShadow>
      <torusGeometry args={[outerRadius - toothDepth/2, toothDepth/2, 16, 64]} />
      <meshStandardMaterial 
        color="#7f8c8d"
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>

    {/* Teeth - trapezoidal shape for realism */}
    {Array.from({ length: teeth }).map((_, i) => {
      const angle = (i / teeth) * Math.PI * 2;
      const x = Math.cos(angle) * outerRadius;
      const y = Math.sin(angle) * outerRadius;
      
      return (
        <mesh 
          key={i} 
          position={[x, y, 0]} 
          rotation={[0, 0, angle + Math.PI / 2]}
          castShadow
        >
          <boxGeometry args={[toothWidth, toothDepth, 0.25]} />
          <meshStandardMaterial 
            color="#95a5a6"
            metalness={0.8}
            roughness={0.25}
          />
        </mesh>
      );
    })}

   
  </group>
);
}