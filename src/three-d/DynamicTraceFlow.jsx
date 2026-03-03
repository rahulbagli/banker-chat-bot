import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Html, RoundedBox, Edges, Stars, Float, Grid } from '@react-three/drei';
import * as THREE from 'three';

// --- Database Visual (Stacked Disks) ---
function DatabaseMesh({ color, isActive, isError }) {
  const finalColor = isError ? "#ff4757" : color;
  return (
    <group>
      {[0.4, 0, -0.4].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.25, 32]} />
          <meshStandardMaterial 
            color={finalColor} 
            emissive={finalColor} 
            emissiveIntensity={isActive ? 1.2 : 0.2} 
          />
          <Edges color="white" opacity={0.3} transparent />
        </mesh>
      ))}
    </group>
  );
}

// --- Service Node Component ---
function MicroserviceNode({ position, name, color, type, isActive, isError }) {
  const meshRef = useRef();
  const finalColor = isError ? "#ff4757" : color;

  useFrame((state) => {
    if (isActive && meshRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
      meshRef.current.scale.set(s, s, s);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={position}>
        <mesh ref={meshRef}>
          {type === 'database' ? (
            <DatabaseMesh color={finalColor} isActive={isActive} isError={isError} />
          ) : (
            <RoundedBox args={[1, 1, 1]} radius={0.15}>
              <meshStandardMaterial 
                color={finalColor} 
                emissive={finalColor} 
                emissiveIntensity={isActive ? 0.8 : 0.15} 
              />
              <Edges color="white" opacity={0.4} transparent />
            </RoundedBox>
          )}
        </mesh>
        <Text 
          position={[0, -1.3, 0]} 
          fontSize={0.25} 
          color="white" 
          anchorX="center"
        >
          {name}
        </Text>
      </group>
    </Float>
  );
}

// --- Data Packet Component ---
function DataPacket({ start, end, color, onComplete }) {
  const meshRef = useRef();
  const [progress, setProgress] = useState(0);

  useFrame((state, delta) => {
    const next = progress + delta * 1.2; // Speed of packet
    if (next >= 1) {
      onComplete();
    } else {
      setProgress(next);
      const s = new THREE.Vector3(...start);
      const e = new THREE.Vector3(...end);
      const pos = new THREE.Vector3().lerpVectors(s, e, next);
      pos.y += Math.sin(next * Math.PI) * 1; // Arc height
      meshRef.current.position.copy(pos);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
    </mesh>
  );
}

export default function MicroserviceScene() {
  const [step, setStep] = useState(0); 
  const [activePacket, setActivePacket] = useState(null);
  const [systemStatus, setSystemStatus] = useState('idle'); // 'idle', 'success', 'error'

  const services = {
    gateway: { position: [0, 3, 0], name: 'API GATEWAY', color: '#a29bfe', type: 'api-gateway' },
    auth: { position: [-4, 0, 0], name: 'AUTH SERVICE', color: '#55efc4', type: 'service' },
    order: { position: [4, 0, 0], name: 'ORDER SERVICE', color: '#fab1a0', type: 'service' },
    authDb: { position: [-4, -3, 0], name: 'USER DB', color: '#00cec9', type: 'database' },
  };

  // Logic Flow Handler
  const triggerMove = (from, to, color, nextStep, status = 'idle') => {
    setSystemStatus(status);
    setActivePacket({ from: services[from].position, to: services[to].position, color });
    setStep(nextStep);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#020205', position: 'relative' }}>
      <Canvas camera={{ position: [0, 5, 12], fov: 45 }}>
        <color attach="background" args={['#020205']} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        <Grid position={[0, -4, 0]} args={[40, 40]} sectionColor="#202030" cellColor="#101015" infiniteGrid />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#a29bfe" />

        {/* Connections */}
        <Line points={[services.gateway.position, services.auth.position]} color="#333" lineWidth={0.5} transparent opacity={0.3} />
        <Line points={[services.auth.position, services.authDb.position]} color="#333" lineWidth={0.5} transparent opacity={0.3} />
        <Line points={[services.gateway.position, services.order.position]} color="#333" lineWidth={0.5} transparent opacity={0.3} />

        {/* Nodes */}
        {Object.entries(services).map(([key, s]) => (
          <MicroserviceNode 
            key={key} 
            {...s} 
            isActive={activePacket !== null && (key === 'auth' || key === 'gateway')}
            isError={systemStatus === 'error' && (key === 'auth' || key === 'gateway')}
          />
        ))}

        {/* Active Data Packet */}
        {activePacket && (
          <DataPacket 
            start={activePacket.from} 
            end={activePacket.to} 
            color={activePacket.color} 
            onComplete={() => setActivePacket(null)} 
          />
        )}

        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 1.8} />
      </Canvas>

      {/* --- Overlay UI --- */}
      <div style={uiContainerStyle}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#a29bfe', margin: 0 }}>SYSTEM LOGIC</h2>
          <p style={{ color: '#666', fontSize: '12px' }}>Current Step: {step}</p>
        </div>

        {/* Step 0: Start */}
        {step === 0 && (
          <button style={btnStyle} onClick={() => triggerMove('gateway', 'auth', '#74b9ff', 1)}>
            SEND LOGIN REQUEST
          </button>
        )}

        {/* Step 1: The If/Else Decision */}
        {step === 1 && !activePacket && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ color: 'white' }}>Auth Service Received Request. <br/>Validate user?</p>
            <button style={{ ...btnStyle, background: '#2ed573' }} onClick={() => triggerMove('auth', 'authDb', '#2ed573', 2)}>
              IF (Valid) → Check DB
            </button>
            <button style={{ ...btnStyle, background: '#ff4757' }} onClick={() => triggerMove('auth', 'gateway', '#ff4757', -1, 'error')}>
              ELSE (Invalid) → Reject
            </button>
          </div>
        )}

        {/* Step 2: DB to Auth */}
        {step === 2 && !activePacket && (
          <button style={btnStyle} onClick={() => triggerMove('authDb', 'auth', '#2ed573', 3)}>
            DB RETURN DATA
          </button>
        )}

        {/* Step 3: Success Path to Order */}
        {step === 3 && !activePacket && (
          <button style={btnStyle} onClick={() => triggerMove('auth', 'order', '#fab1a0', 4, 'success')}>
            PROCEED TO ORDER
          </button>
        )}

        {/* Reset / Final States */}
        {(step === 4 || step === -1) && !activePacket && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: systemStatus === 'error' ? '#ff4757' : '#2ed573' }}>
              {systemStatus === 'error' ? 'ACCESS DENIED' : 'ORDER CREATED'}
            </h3>
            <button style={btnStyle} onClick={() => window.location.reload()}>RESTART SIMULATION</button>
          </div>
        )}
      </div>
    </div>
  );
}

const uiContainerStyle = {
  position: 'absolute',
  top: '40px',
  left: '40px',
  padding: '25px',
  background: 'rgba(5, 5, 15, 0.85)',
  borderRadius: '12px',
  border: '1px solid rgba(162, 155, 254, 0.3)',
  backdropFilter: 'blur(10px)',
  fontFamily: 'sans-serif',
  width: '280px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
};

const btnStyle = {
  width: '100%',
  padding: '12px',
  background: '#6c5ce7',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  letterSpacing: '1px',
  transition: 'transform 0.1s'
};