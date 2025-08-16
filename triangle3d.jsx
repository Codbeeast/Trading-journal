'use client'

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const SessionAnalysis = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const labels = [];

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockTrades = [
          { session: 'London', pnl: 150 },
          { session: 'London', pnl: -50 },
          { session: 'London', pnl: 200 },
          { session: 'london', pnl: 100 },
          { session: 'Asian', pnl: -75 },
          { session: 'New York', pnl: 300 },
          { session: 'New York', pnl: 120 },
          { session: 'Overlap', pnl: -30 },
          { session: 'Frankfurt', pnl: 50 },
        ];
        setTrades(mockTrades);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, []);

  const sessionColorMap = {
    London: '#06B6D4',
    'New York': '#8B5CF6',
    Asian: '#10B981',
    Others: '#F59E0B',
    Unknown: '#9CA3AF',
  };

  const getColorForSession = session => sessionColorMap[session] || sessionColorMap.Unknown;

  const generateSessionData = () => {
    if (!trades.length) return { winRateData: [], totalTradesData: [] };

    const sessionsMap = {};
    const knownSessions = ['London', 'Asian', 'New York'];

    trades.forEach(trade => {
      let sessionKey = (trade.session || 'Unknown').trim();
      if (!knownSessions.includes(sessionKey)) {
        sessionKey = 'Others';
      }

      if (!sessionsMap[sessionKey]) {
        sessionsMap[sessionKey] = {
          name: sessionKey,
          fullName: sessionKey,
          wins: 0,
          total: 0,
          winRate: 0,
          color: getColorForSession(sessionKey),
        };
      }

      sessionsMap[sessionKey].total += 1;
      const pnl = parseFloat(trade.pnl) || 0;
      if (pnl > 0) sessionsMap[sessionKey].wins += 1;
    });

    const sessionArray = Object.values(sessionsMap).map((session) => ({
      ...session,
      winRate: session.total > 0 ? (session.wins / session.total) * 100 : 0,
    }));

    const getFixedData = () => {
      const orderedNames = ['London', 'Asian', 'New York', 'Others'];
      return orderedNames.map(name => {
        const session = sessionArray.find(s => s.name === name);
        return session || {
          name: name,
          fullName: name,
          wins: 0,
          total: 0,
          winRate: 0,
          color: sessionColorMap[name] || sessionColorMap['Unknown'],
        };
      });
    };

    return {
      winRateData: getFixedData(),
      totalTradesData: getFixedData(),
    };
  };

  const PyramidChart = ({ data, showWinRate = false }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const animationRef = useRef(null);
    const cleanupRef = useRef(null);
    const pyramidGroupRef = useRef(null);

    // Simple OrbitControls implementation
    const createSimpleControls = (camera, domElement) => {
      let isRotating = false;
      let previousMousePosition = { x: 0, y: 0 };
      let rotationSpeed = 0.005;
      let autoRotateSpeed = 0.01;
      let spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position);

      const onMouseDown = (event) => {
        event.preventDefault();
        isRotating = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
      };

      const onMouseMove = (event) => {
        if (!isRotating) return;
        event.preventDefault();

        const deltaMove = {
          x: event.clientX - previousMousePosition.x,
          y: event.clientY - previousMousePosition.y
        };

        spherical.theta -= deltaMove.x * rotationSpeed;
        spherical.phi += deltaMove.y * rotationSpeed;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

        camera.position.setFromSpherical(spherical);
        camera.lookAt(0, 0, 0);

        previousMousePosition = { x: event.clientX, y: event.clientY };
      };

      const onMouseUp = (event) => {
        event.preventDefault();
        isRotating = false;
      };

      const onWheel = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const scale = event.deltaY > 0 ? 1.1 : 0.9;
        spherical.radius = Math.max(5, Math.min(50, spherical.radius * scale));
        camera.position.setFromSpherical(spherical);
        camera.lookAt(0, 0, 0);
      };

      domElement.addEventListener('mousedown', onMouseDown);
      domElement.addEventListener('mousemove', onMouseMove);
      domElement.addEventListener('mouseup', onMouseUp);
      domElement.addEventListener('wheel', onWheel, { passive: false });

      document.addEventListener('mouseup', onMouseUp);

      return {
        update: () => {
          if (!isRotating) {
            spherical.theta += autoRotateSpeed;
            camera.position.setFromSpherical(spherical);
            camera.lookAt(0, 0, 0);
          }
        },
        dispose: () => {
          domElement.removeEventListener('mousedown', onMouseDown);
          domElement.removeEventListener('mousemove', onMouseMove);
          domElement.removeEventListener('mouseup', onMouseUp);
          domElement.removeEventListener('wheel', onWheel);
          document.removeEventListener('mouseup', onMouseUp);
        }
      };
    };

    // Custom CSS2DObject implementation
    class CSS2DObject extends THREE.Object3D {
      constructor(element) {
        super();
        this.element = element;
        this.element.style.position = 'absolute';
        this.element.style.userSelect = 'none';
      }
    }

    const CSS2DRenderer = function() {
      let _width, _height;
      let _widthHalf, _heightHalf;
      const domElement = document.createElement('div');
      domElement.style.overflow = 'hidden'; // Changed back to hidden

      this.domElement = domElement;

      this.setSize = function(width, height) {
        _width = width;
        _height = height;
        _widthHalf = _width / 2;
        _heightHalf = _height / 2;
        domElement.style.width = width + 'px';
        domElement.style.height = height + 'px';
      };

      this.render = function(scene, camera) {
        const vector = new THREE.Vector3();
        const renderObject = (object) => {
          if (object.element) {
            vector.setFromMatrixPosition(object.matrixWorld);
            vector.project(camera);

            const element = object.element;
            if (vector.z > 1) {
              element.style.display = 'none';
            } else {
              element.style.display = '';
              
              // Calculate screen position
              let screenX = (vector.x * _widthHalf) + _widthHalf;
              let screenY = (-vector.y * _heightHalf) + _heightHalf;
              
              // Get element dimensions
              const rect = element.getBoundingClientRect();
              const elementWidth = rect.width || 120; // fallback width
              const elementHeight = rect.height || 40; // fallback height
              
              // Constrain to container bounds with padding
              const padding = 10;
              screenX = Math.max(padding + elementWidth/2, Math.min(_width - padding - elementWidth/2, screenX));
              screenY = Math.max(padding + elementHeight/2, Math.min(_height - padding - elementHeight/2, screenY));
              
              element.style.transform = `translate(-50%, -50%) translate(${screenX}px, ${screenY}px)`;
              element.style.zIndex = '1000';

              if (element.parentNode !== domElement) {
                domElement.appendChild(element);
              }
            }
          }

          for (let i = 0; i < object.children.length; i++) {
            renderObject(object.children[i]);
          }
        };

        if (scene.autoUpdate === true) scene.updateMatrixWorld();
        if (camera.parent === null) camera.updateMatrixWorld();
        renderObject(scene);
      };
    };

    useEffect(() => {
      if (!mountRef.current || data.length === 0) return;

      if (cleanupRef.current) cleanupRef.current();

      // Responsive dimensions
      const containerRect = mountRef.current.getBoundingClientRect();
      const WIDTH = Math.min(containerRect.width, window.innerWidth - 40);
      const HEIGHT = Math.min(450, window.innerHeight * 0.6);
      const aspect = WIDTH / HEIGHT;

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a);
      sceneRef.current = scene;

      // Camera setup
      const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
      camera.position.set(5, 6, 12);
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(WIDTH, HEIGHT);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setClearColor(0x0f172a, 1);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      // CSS2D renderer for labels - constrained to container
      const labelRenderer = new CSS2DRenderer();
      labelRenderer.setSize(WIDTH, HEIGHT);
      labelRenderer.domElement.style.position = 'absolute';
      labelRenderer.domElement.style.top = '0px';
      labelRenderer.domElement.style.pointerEvents = 'none';
      labelRenderer.domElement.style.overflow = 'hidden'; // Ensure labels stay within bounds
      labelRenderer.domElement.style.zIndex = '10';
      mountRef.current.appendChild(labelRenderer.domElement);

      // Controls
      const controls = createSimpleControls(camera, renderer.domElement);

      // Create a group to hold both pyramid and labels and center it
      const pyramidGroup = new THREE.Group();
      // Increased size and pulled slightly to the top
      const pyramidHeight = 9.5; // Increased from 7.2
      const yOffset = -pyramidHeight / 2 + 1.5; // Added +1.5 to pull it up
      pyramidGroup.position.set(0, yOffset, 0);

      scene.add(pyramidGroup);
      pyramidGroupRef.current = pyramidGroup;

      // Lighting
      scene.add(new THREE.AmbientLight(0x404040, 0.6));

      const directionalLight = new THREE.DirectionalLight(0x0ea5e9, 1);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      const pointLight = new THREE.PointLight(0x3b82f6, 0.8, 100);
      pointLight.position.set(-10, 10, 10);
      scene.add(pointLight);

      const spotLight = new THREE.SpotLight(0x06b6d4, 1);
      spotLight.position.set(0, 10, 0);
      spotLight.castShadow = true;
      scene.add(spotLight);

      // Create dynamic pyramid geometry
      const createDynamicPyramidGeometry = (sessionData) => {
        // Scale based on screen size
        const scale = Math.min(WIDTH / 530, HEIGHT / 450);
        const baseSize = 4.5 * scale;
        const height = 9.5 * scale;
        const maxStretch = 3 * scale;

        const values = sessionData.map(session =>
          showWinRate ? session.winRate : session.total
        );
        const maxValue = Math.max(...values, 1);

        const corners = [];
        const sessionOrder = ['London', 'New York', 'Asian', 'Others'];

        // Create a centered square base with proper angles
        sessionOrder.forEach((sessionName, index) => {
          const session = sessionData.find(s => s.name === sessionName) ||
            { name: sessionName, winRate: 0, total: 0 };

          const value = showWinRate ? session.winRate : session.total;
          const stretchFactor = (value / maxValue) * maxStretch;
          const baseDistance = baseSize + stretchFactor;

          // Use proper angles to create a centered square (45° offset to center the square)
          const angle = (index * Math.PI / 2) + (Math.PI / 4);
          corners.push({
            x: Math.cos(angle) * baseDistance,
            z: Math.sin(angle) * baseDistance,
            session: session
          });
        });

        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];

        // Add base vertices
        corners.forEach(corner => {
          vertices.push(corner.x, 0, corner.z);
        });

        // Add apex vertex (centered above the base)
        vertices.push(0, height, 0);
        const apexIndex = 4;

        // Create base faces (two triangles for the square base)
        indices.push(0, 2, 1, 0, 3, 2);

        // Create triangular faces from base to apex
        for (let i = 0; i < 4; i++) {
          const nextI = (i + 1) % 4;
          indices.push(i, apexIndex, nextI);
        }

        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();

        return { geometry, corners };
      };

      const { geometry: pyramidGeometry, corners } = createDynamicPyramidGeometry(data);

      const pyramidMaterial = new THREE.MeshPhongMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.8,
        shininess: 100,
        specular: 0x06b6d4,
      });

      const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
      pyramid.castShadow = true;
      pyramid.receiveShadow = true;
      pyramidGroup.add(pyramid);

      // Wireframe overlay
      const wireframeGeometry = new THREE.EdgesGeometry(pyramidGeometry);
      const wireframeMaterial = new THREE.LineBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.8
      });
      const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
      pyramid.add(wireframe);

      // Create labels that are children of the pyramid group
      corners.forEach((corner, index) => {
        const labelDiv = document.createElement('div');
        labelDiv.className = 'session-label';
        labelDiv.style.color = corner.session.color || '#06B6D4';
        labelDiv.style.fontFamily = 'Arial, sans-serif';
        labelDiv.style.fontSize = `${Math.max(12, 14 * Math.min(WIDTH / 530, HEIGHT / 450))}px`;
        labelDiv.style.fontWeight = 'bold';
        labelDiv.style.background = 'rgba(15, 23, 42, 0.9)';
        labelDiv.style.padding = '6px 10px';
        labelDiv.style.borderRadius = '8px';
        labelDiv.style.border = `2px solid ${corner.session.color || '#06B6D4'}`;
        labelDiv.style.backdropFilter = 'blur(6px)';
        labelDiv.style.whiteSpace = 'nowrap';
        labelDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        labelDiv.style.minWidth = 'max-content';
        labelDiv.style.zIndex = '20';
        labelDiv.style.maxWidth = `${WIDTH * 0.3}px`; // Limit label width
        labelDiv.style.overflow = 'hidden';
        labelDiv.style.textOverflow = 'ellipsis';

        const value = showWinRate ? corner.session.winRate?.toFixed(1) + '%' : corner.session.total;
        labelDiv.textContent = `${corner.session.name}: ${value}`;

        // Create CSS2DObject and add it as a child of the pyramid group
        const label = new CSS2DObject(labelDiv);
        // Reduced label offset to keep them closer to the pyramid
        const labelOffset = 1.2; // Reduced from 1.4
        label.position.set(corner.x * labelOffset, 1, corner.z * labelOffset);
        pyramidGroup.add(label);

        labels.push(label);
      });

      const raycaster = new THREE.Raycaster();

      function updateLabelVisibility() {
        const pyramidCenter = new THREE.Vector3();
        pyramidGroup.getWorldPosition(pyramidCenter);
        
        labels.forEach((labelObj) => {
          const labelWorldPos = new THREE.Vector3();
          labelObj.getWorldPosition(labelWorldPos);

          // Calculate vector from pyramid center to label
          const pyramidToLabel = new THREE.Vector3().subVectors(labelWorldPos, pyramidCenter);
          
          // Calculate vector from camera to pyramid center
          const cameraToCenter = new THREE.Vector3().subVectors(pyramidCenter, camera.position).normalize();
          
          // Normalize the pyramid to label vector
          pyramidToLabel.normalize();
          
          // Calculate dot product to determine if label is on the front side
          // If dot product is negative, label is on the front side (facing camera)
          const dotProduct = pyramidToLabel.dot(cameraToCenter);
          
          // Show label if it's on the front side (dot product < 0.3 gives some tolerance)
          const isOnFrontSide = dotProduct < 0.3;
          
          // Also check if the label is not behind the camera
          const labelScreenPos = labelWorldPos.clone();
          labelScreenPos.project(camera);
          const isInFrontOfCamera = labelScreenPos.z < 1;
          
          const shouldShow = isOnFrontSide && isInFrontOfCamera;
          
          if (shouldShow) {
            labelObj.element.style.display = 'block';
            labelObj.element.style.opacity = '1';
          } else {
            labelObj.element.style.display = 'none';
          }
        });
      }

      // Animation loop
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);

        updateLabelVisibility();
      };

      animate();

      // Cleanup function
      cleanupRef.current = () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        controls.dispose();

        if (mountRef.current) {
          if (renderer.domElement.parentNode === mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
          }
          if (labelRenderer.domElement.parentNode === mountRef.current) {
            mountRef.current.removeChild(labelRenderer.domElement);
          }
        }

        renderer.dispose();
        pyramidGeometry.dispose();
        pyramidMaterial.dispose();
        wireframeGeometry.dispose();
        wireframeMaterial.dispose();
      };

      return cleanupRef.current;
    }, [data, showWinRate]);

    return (
      <div className="relative w-full h-full">
        <div 
          ref={mountRef} 
          className="relative" 
          style={{ 
            width: '100%', 
            height: '450px',
            minHeight: '300px',
            maxWidth: '100%',
            overflow: 'hidden' // Ensure container clips content
          }} 
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading session analysis...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  const { winRateData, totalTradesData } = generateSessionData();

  return (
    <div className="bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-400 mb-6 lg:mb-8 text-center">
          Trading Session Analysis
        </h1>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          <div className="bg-slate-800 rounded-lg p-4 sm:p-6 shadow-xl">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-4 text-center">
              Win Rate by Session
            </h2>
            <div className="flex items-center justify-center relative rounded-lg min-h-[300px] sm:min-h-[400px] lg:min-h-[450px]">
              <PyramidChart data={winRateData} showWinRate={true} />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 sm:p-6 shadow-xl">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-4 text-center">
              Total Trades by Session
            </h2>
            <div className="flex items-center justify-center relative rounded-lg min-h-[300px] sm:min-h-[400px] lg:min-h-[450px]">
              <PyramidChart data={totalTradesData} showWinRate={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionAnalysis;