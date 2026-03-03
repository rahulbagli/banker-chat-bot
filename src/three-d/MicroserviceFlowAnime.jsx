import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, RoundedBox, Edges, Stars, Float, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';

// --- Improved Database Node ---
function DatabaseNode({ position, name, color, isActive }) {
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={position}>
        {[0.4, 0, -0.4].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 0.3, 32]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isActive ? 1.5 : 0.2} />
            <Edges color="white" opacity={0.3} transparent />
          </mesh>
        ))}
        <Text position={[0, -1.8, 0]} fontSize={0.4} color="white" fontWeight="bold">{name}</Text>
      </group>
    </Float>
  );
}

// --- Service Node ---
function ServiceNode({ position, name, color, isActive, status }) {
  const meshRef = useRef();
  const finalColor = status === 'error' ? '#ff4757' : status === 'success' ? '#2ed573' : color;

  useFrame((state) => {
    if (isActive && meshRef.current) {
      meshRef.current.scale.setScalar(1.1 + Math.sin(state.clock.elapsedTime * 6) * 0.05);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        <mesh ref={meshRef}>
          <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.15}>
            <meshStandardMaterial color={finalColor} emissive={finalColor} emissiveIntensity={isActive ? 1.2 : 0.2} />
            <Edges color="white" opacity={0.5} transparent />
          </RoundedBox>
        </mesh>
        <Text position={[0, -1.8, 0]} fontSize={0.4} color="white" fontWeight="bold">{name}</Text>
      </group>
    </Float>
  );
}

// --- Animated Packet with Live Label ---
function DataPacket({ from, to, color, label, onComplete }) {
  const meshRef = useRef();
  const [progress, setProgress] = useState(0);

  useFrame((state, delta) => {
    const next = progress + delta * 0.8; // Slower speed to allow reading
    if (next >= 1) {
      onComplete();
    } else {
      setProgress(next);
      const startVec = new THREE.Vector3(...from);
      const endVec = new THREE.Vector3(...to);
      const pos = new THREE.Vector3().lerpVectors(startVec, endVec, next);
      pos.y += Math.sin(next * Math.PI) * 2; // Higher Arc
      meshRef.current.position.copy(pos);
    }
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} />
      </mesh>
      <Html distanceFactor={15} position={[0, 0.5, 0]}>
        <div style={{ background: color, color: 'black', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

export default function MassiveArchitecture() {
  const [step, setStep] = useState(0);
  const [branch, setBranch] = useState(null);
  const [packet, setPacket] = useState(null);
  const [log, setLog] = useState({ type: 'System', data: 'Ready to receive request...' });

  // Scaled up positions
  const services = {
    gateway: { position: [0, 6, 0], name: 'GATEWAY', color: '#a29bfe' },
    auth: { position: [0, 0, 0], name: 'AUTH-SRV', color: '#55efc4' },
    order: { position: [8, -5, 0], name: 'ORDER-SRV', color: '#fab1a0' },
    error: { position: [-8, -5, 0], name: 'ERR-SRV', color: '#ff7675' },
    db: { position: [0, -6, -4], name: 'USER-DB', color: '#00cec9' }
  };

  const flowData = {
    start: { label: 'POST /login', log: { method: 'POST', body: { user: 'admin', pass: '****' }, target: 'Auth-Service' } },
    success: { label: '200 OK', log: { status: 200, token: 'jwt_9921', user_id: 1, action: 'Forwarding to Order' } },
    fail: { label: '401 Unauthorized', log: { status: 401, error: 'Invalid Credentials', action: 'Redirecting to Error Handler' } },
    dbQuery: { label: 'SELECT *', log: { query: 'SELECT * FROM users WHERE id=1', type: 'SQL' } }
  };

  const handleAction = (type) => {
    if (type === 'init') {
      setPacket({ from: services.gateway.position, to: services.auth.position, color: '#74b9ff', label: flowData.start.label });
      setLog({ type: 'REQUEST', ...flowData.start.log });
      setStep(1);
    } else if (type === 'success') {
      setPacket({ from: services.auth.position, to: services.order.position, color: '#2ed573', label: flowData.success.label });
      setLog({ type: 'RESPONSE / SUCCESS', ...flowData.success.log });
      setBranch('success');
      setStep(2);
    } else if (type === 'fail') {
      setPacket({ from: services.auth.position, to: services.error.position, color: '#ff4757', label: flowData.fail.label });
      setLog({ type: 'RESPONSE / FAILURE', ...flowData.fail.log });
      setBranch('fail');
      setStep(2);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#020205', position: 'relative' }}>
      <Canvas camera={{ position: [0, 5, 20], fov: 45 }}>
        <color attach="background" args={['#020205']} />
        <Stars radius={150} depth={50} count={5000} factor={6} fade speed={1} />
        <Grid position={[0, -8, 0]} args={[100, 100]} sectionColor="#202030" cellColor="#101015" infiniteGrid />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#a29bfe" />

        {/* --- Wide Branching Paths --- */}
        <Line points={[services.gateway.position, services.auth.position]} color="#444" lineWidth={1} />
        <Line points={[services.auth.position, services.order.position]} color={branch === 'success' ? '#2ed573' : '#222'} lineWidth={branch === 'success' ? 5 : 1} />
        <Line points={[services.auth.position, services.error.position]} color={branch === 'fail' ? '#ff4757' : '#222'} lineWidth={branch === 'fail' ? 5 : 1} />

        {/* --- Render Nodes --- */}
        <ServiceNode {...services.gateway} isActive={step === 0} />
        <ServiceNode {...services.auth} isActive={step === 1} status={branch} />
        <ServiceNode {...services.order} isActive={branch === 'success'} status={branch === 'success' ? 'success' : 'normal'} />
        <ServiceNode {...services.error} isActive={branch === 'fail'} status={branch === 'fail' ? 'error' : 'normal'} />

        {/* --- Packet Animation --- */}
        {packet && <DataPacket {...packet} onComplete={() => setPacket(null)} />}

        <OrbitControls enablePan={true} maxPolarAngle={Math.PI / 1.8} />
      </Canvas>

      {/* --- Left Side: Control UI --- */}
      <div style={uiPanelLeft}>
        <h2 style={{ color: '#a29bfe', margin: '0 0 15px 0' }}>CONTROL PLANE</h2>
        {step === 0 && <button style={btnStyle} onClick={() => handleAction('init')}>🚀 INITIATE FLOW</button>}
        {step === 1 && !packet && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <p style={{ color: 'white', fontSize: '14px' }}>Simulation: How should the Auth Service respond?</p>
            <button style={{ ...btnStyle, background: '#2ed573' }} onClick={() => handleAction('success')}>IF (Auth Correct)</button>
            <button style={{ ...btnStyle, background: '#ff4757' }} onClick={() => handleAction('fail')}>ELSE (Invalid Auth)</button>
          </div>
        )}
        {step === 2 && !packet && <button style={btnStyle} onClick={() => window.location.reload()}>RESTART SYSTEM</button>}
      </div>

      {/* --- Right Side: System Log / JSON Response --- */}
      <div style={uiPanelRight}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#55efc4', margin: 0 }}>LIVE TERMINAL</h3>
            <span style={{ fontSize: '10px', color: '#666' }}>PORT: 8080</span>
        </div>
        <div style={{ background: '#000', padding: '15px', borderRadius: '4px', border: '1px solid #333', minHeight: '150px' }}>
          <pre style={{ color: '#00ff00', fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(log, null, 2)}
          </pre>
        </div>
        <div style={{ marginTop: '15px', fontSize: '11px', color: '#555' }}>
            {"> "} Waiting for state change...
        </div>
      </div>
    </div>
  );
}

const uiPanelLeft = {
  position: 'absolute', top: '40px', left: '40px', padding: '30px',
  background: 'rgba(5, 5, 20, 0.9)', border: '1px solid rgba(162, 155, 254, 0.3)',
  borderRadius: '10px', width: '280px', fontFamily: 'monospace', backdropFilter: 'blur(10px)'
};

const uiPanelRight = {
  position: 'absolute', top: '40px', right: '40px', padding: '30px',
  background: 'rgba(5, 5, 20, 0.9)', border: '1px solid rgba(85, 239, 196, 0.3)',
  borderRadius: '10px', width: '350px', fontFamily: 'monospace', backdropFilter: 'blur(10px)'
};

const btnStyle = {
  width: '100%', padding: '15px', background: '#6c5ce7', color: 'white',
  border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
};