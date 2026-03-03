import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

// Microservice Node Component
function MicroserviceNode({ position, name, color, type, onClick, isActive }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (isActive) {
      meshRef.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    } else {
      meshRef.current.material.emissiveIntensity = hovered ? 0.4 : 0.2;
    }
  });

  const size = type === 'api-gateway' ? [1.5, 1.5, 1.5] : 
               type === 'database' ? [1.2, 0.6, 1.2] : 
               [1, 1, 1];

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        {type === 'database' ? (
          <cylinderGeometry args={size} />
        ) : (
          <boxGeometry args={size} />
        )}
        <meshStandardMaterial
          color={color}
          metalness={0.6}
          roughness={0.3}
          emissive={color}
          emissiveIntensity={isActive ? 0.5 : 0.2}
        />
      </mesh>
      <Text
        position={[0, type === 'database' ? -1 : -1.2, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
      {hovered && (
        <Html distanceFactor={10}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}>
            {type === 'api-gateway' && '🌐 API Gateway'}
            {type === 'service' && '⚙️ Microservice'}
            {type === 'database' && '💾 Database'}
          </div>
        </Html>
      )}
    </group>
  );
}

// Animated Data Packet
function DataPacket({ start, end, duration, color, onComplete }) {
  const meshRef = useRef();
  const [progress, setProgress] = useState(0);

  useFrame((state, delta) => {
    const newProgress = progress + (delta / duration);
    if (newProgress >= 1) {
      onComplete();
    } else {
      setProgress(newProgress);
      const x = start[0] + (end[0] - start[0]) * newProgress;
      const y = start[1] + (end[1] - start[1]) * newProgress + Math.sin(newProgress * Math.PI) * 0.5;
      const z = start[2] + (end[2] - start[2]) * newProgress;
      meshRef.current.position.set(x, y, z);
    }
  });

  return (
    <mesh ref={meshRef} position={start}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1}
      />
    </mesh>
  );
}

// Connection Line
function ConnectionLine({ start, end, isActive }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  
  return (
    <Line
      points={points}
      color={isActive ? '#00ff88' : '#444444'}
      lineWidth={isActive ? 3 : 1}
      opacity={isActive ? 0.8 : 0.3}
      transparent
    />
  );
}

// Request/Response Info Panel
function InfoPanel({ request, response, position }) {
  return (
    <Html position={position} distanceFactor={8}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#00ff88',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '11px',
        fontFamily: 'monospace',
        border: '1px solid #00ff88',
        minWidth: '250px',
        maxWidth: '300px'
      }}>
        {request && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ color: '#4fc3f7', fontWeight: 'bold', marginBottom: '5px' }}>
              📤 REQUEST
            </div>
            <div style={{ color: '#aaa' }}>
              <div><strong>Method:</strong> {request.method}</div>
              <div><strong>Endpoint:</strong> {request.endpoint}</div>
              {request.payload && (
                <div style={{ marginTop: '5px' }}>
                  <strong>Payload:</strong>
                  <pre style={{ margin: '3px 0', fontSize: '10px' }}>
                    {JSON.stringify(request.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
        {response && (
          <div>
            <div style={{ color: '#00ff88', fontWeight: 'bold', marginBottom: '5px' }}>
              📥 RESPONSE
            </div>
            <div style={{ color: '#aaa' }}>
              <div><strong>Status:</strong> <span style={{ color: response.status === 200 ? '#00ff88' : '#ff4444' }}>{response.status}</span></div>
              <div><strong>Time:</strong> {response.time}</div>
              {response.data && (
                <div style={{ marginTop: '5px' }}>
                  <strong>Data:</strong>
                  <pre style={{ margin: '3px 0', fontSize: '10px' }}>
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Html>
  );
}

// Main Scene
function MicroserviceScene() {
  const [activeNode, setActiveNode] = useState(null);
  const [packets, setPackets] = useState([]);
  const [activeConnections, setActiveConnections] = useState([]);
  const [flowStep, setFlowStep] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [currentResponse, setCurrentResponse] = useState(null);

  // Define microservice architecture
  const services = {
    gateway: { position: [0, 3, 0], name: 'API Gateway', color: '#6c5ce7', type: 'api-gateway' },
    auth: { position: [-4, 0, 2], name: 'Auth Service', color: '#00b894', type: 'service' },
    user: { position: [-2, 0, -2], name: 'User Service', color: '#0984e3', type: 'service' },
    order: { position: [2, 0, -2], name: 'Order Service', color: '#fdcb6e', type: 'service' },
    payment: { position: [4, 0, 2], name: 'Payment Service', color: '#e17055', type: 'service' },
    authDb: { position: [-4, -3, 2], name: 'Auth DB', color: '#2d3436', type: 'database' },
    userDb: { position: [-2, -3, -2], name: 'User DB', color: '#2d3436', type: 'database' },
    orderDb: { position: [2, -3, -2], name: 'Order DB', color: '#2d3436', type: 'database' },
  };

  // Define flow sequences
  const flowSequences = [
    {
      from: 'gateway',
      to: 'auth',
      request: {
        method: 'POST',
        endpoint: '/api/auth/login',
        payload: { username: 'user@example.com', password: '***' }
      },
      response: null,
      duration: 1
    },
    {
      from: 'auth',
      to: 'authDb',
      request: {
        method: 'SELECT',
        endpoint: 'users table',
        payload: { query: 'SELECT * FROM users WHERE email = ?' }
      },
      response: null,
      duration: 0.8
    },
    {
      from: 'authDb',
      to: 'auth',
      request: null,
      response: {
        status: 200,
        time: '45ms',
        data: { id: 123, email: 'user@example.com', verified: true }
      },
      duration: 0.8
    },
    {
      from: 'auth',
      to: 'gateway',
      request: null,
      response: {
        status: 200,
        time: '120ms',
        data: { token: 'eyJhbGc...', userId: 123, expiresIn: 3600 }
      },
      duration: 1
    },
    {
      from: 'gateway',
      to: 'order',
      request: {
        method: 'POST',
        endpoint: '/api/orders/create',
        payload: { userId: 123, items: [{ id: 1, qty: 2 }], total: 99.99 }
      },
      response: null,
      duration: 1
    },
    {
      from: 'order',
      to: 'orderDb',
      request: {
        method: 'INSERT',
        endpoint: 'orders table',
        payload: { query: 'INSERT INTO orders VALUES (...)' }
      },
      response: null,
      duration: 0.8
    },
    {
      from: 'orderDb',
      to: 'order',
      request: null,
      response: {
        status: 200,
        time: '32ms',
        data: { orderId: 'ORD-12345', created: true }
      },
      duration: 0.8
    },
    {
      from: 'order',
      to: 'payment',
      request: {
        method: 'POST',
        endpoint: '/api/payment/process',
        payload: { orderId: 'ORD-12345', amount: 99.99, method: 'credit_card' }
      },
      response: null,
      duration: 1.2
    },
    {
      from: 'payment',
      to: 'order',
      request: null,
      response: {
        status: 200,
        time: '850ms',
        data: { transactionId: 'TXN-789', status: 'completed', orderId: 'ORD-12345' }
      },
      duration: 1.2
    },
    {
      from: 'order',
      to: 'gateway',
      request: null,
      response: {
        status: 200,
        time: '2.1s',
        data: { orderId: 'ORD-12345', status: 'confirmed', total: 99.99 }
      },
      duration: 1
    }
  ];

  useEffect(() => {
    if (flowStep < flowSequences.length) {
      const flow = flowSequences[flowStep];
      const fromPos = services[flow.from].position;
      const toPos = services[flow.to].position;

      setActiveNode(flow.from);
      setActiveConnections([`${flow.from}-${flow.to}`]);
      setCurrentRequest(flow.request);
      setCurrentResponse(flow.response);
      setShowInfo(true);

      // Create data packet
      const packetId = Date.now();
      setPackets(prev => [...prev, {
        id: packetId,
        start: fromPos,
        end: toPos,
        color: flow.response ? '#00ff88' : '#4fc3f7',
        duration: flow.duration
      }]);

      const timer = setTimeout(() => {
        setFlowStep(prev => prev + 1);
        setPackets(prev => prev.filter(p => p.id !== packetId));
      }, flow.duration * 1000);

      return () => clearTimeout(timer);
    } else {
      // Reset and loop
      setTimeout(() => {
        setFlowStep(0);
        setPackets([]);
        setActiveConnections([]);
        setShowInfo(false);
        setCurrentRequest(null);
        setCurrentResponse(null);
      }, 2000);
    }
  }, [flowStep]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4fc3f7" />

      {/* Draw connections */}
      {Object.entries(services).map(([key, service]) => {
        if (key.endsWith('Db')) {
          const parentKey = key.replace('Db', '');
          if (services[parentKey]) {
            return (
              <ConnectionLine
                key={`${parentKey}-${key}`}
                start={services[parentKey].position}
                end={service.position}
                isActive={activeConnections.includes(`${parentKey}-${key}`)}
              />
            );
          }
        }
        return null;
      })}

      {/* Gateway to services */}
      <ConnectionLine start={services.gateway.position} end={services.auth.position} isActive={activeConnections.includes('gateway-auth')} />
      <ConnectionLine start={services.gateway.position} end={services.user.position} isActive={activeConnections.includes('gateway-user')} />
      <ConnectionLine start={services.gateway.position} end={services.order.position} isActive={activeConnections.includes('gateway-order')} />
      <ConnectionLine start={services.order.position} end={services.payment.position} isActive={activeConnections.includes('order-payment')} />

      {/* Draw services */}
      {Object.entries(services).map(([key, service]) => (
        <MicroserviceNode
          key={key}
          position={service.position}
          name={service.name}
          color={service.color}
          type={service.type}
          isActive={activeNode === key}
          onClick={() => setActiveNode(key)}
        />
      ))}

      {/* Draw data packets */}
      {packets.map(packet => (
        <DataPacket
          key={packet.id}
          start={packet.start}
          end={packet.end}
          duration={packet.duration}
          color={packet.color}
          onComplete={() => {}}
        />
      ))}

      {/* Show request/response info */}
      {showInfo && (currentRequest || currentResponse) && (
        <InfoPanel
          request={currentRequest}
          response={currentResponse}
          position={[6, 2, 0]}
        />
      )}

      <OrbitControls
        enableZoom={true}
        enablePan={true}
        minDistance={8}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

// Main App Component
export default function App() {
  const [autoRotate, setAutoRotate] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a', position: 'relative' }}>
      <Canvas
        camera={{ position: [12, 8, 12], fov: 60 }}
        dpr={[1, 2]}
      >
        <MicroserviceScene autoRotate={autoRotate} />
      </Canvas>

      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.85)',
        padding: '20px',
        borderRadius: '10px',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(108, 92, 231, 0.3)',
        maxWidth: '300px'
      }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#6c5ce7' }}>
          🏗️ Microservice Architecture
        </h2>
        <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#ccc' }}>
          <p style={{ margin: '0 0 10px 0' }}>
            <strong style={{ color: '#00ff88' }}>Live Flow Visualization</strong>
          </p>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            <li>User Login → Auth Service</li>
            <li>Database Queries</li>
            <li>Order Creation</li>
            <li>Payment Processing</li>
          </ul>
          <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(108, 92, 231, 0.2)', borderRadius: '5px' }}>
            <div style={{ fontSize: '11px', color: '#aaa' }}>
              <div>🔵 Blue packets = Requests</div>
              <div>🟢 Green packets = Responses</div>
              <div style={{ marginTop: '5px' }}>💡 Drag to rotate view</div>
              <div>🔍 Scroll to zoom</div>
            </div>
          </div>
        </div>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          style={{
            marginTop: '15px',
            padding: '10px 15px',
            background: autoRotate ? '#00ff88' : '#6c5ce7',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer',
            width: '100%',
            fontWeight: 'bold'
          }}
        >
          {autoRotate ? '⏸ Stop Rotation' : '▶ Auto Rotate'}
        </button>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.85)',
        padding: '15px',
        borderRadius: '8px',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(108, 92, 231, 0.3)'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#6c5ce7' }}>Components</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div><span style={{ color: '#6c5ce7' }}>◼</span> API Gateway</div>
          <div><span style={{ color: '#00b894' }}>◼</span> Auth Service</div>
          <div><span style={{ color: '#fdcb6e' }}>◼</span> Order Service</div>
          <div><span style={{ color: '#e17055' }}>◼</span> Payment Service</div>
          <div><span style={{ color: '#2d3436' }}>◼</span> Databases</div>
        </div>
      </div>
    </div>
  );
}