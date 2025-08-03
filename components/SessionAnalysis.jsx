'use client'
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const SessionAnalysis = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data for demonstration
        const mockTrades = [
          { session: 'London', pnl: 150 },
          { session: 'London', pnl: -50 },
          { session: 'London', pnl: 200 },
          { session: 'Asian', pnl: 100 },
          { session: 'Asian', pnl: -75 },
          { session: 'New York', pnl: 300 },
          { session: 'New York', pnl: 120 },
          { session: 'Overlap', pnl: -30 }, // This will now be categorized under 'Others'
          { session: 'Frankfurt', pnl: 50 }, // Example of another session to fall into 'Others'
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
    // Overlap will now be grouped into 'Others'
    Others: '#F59E0B', // Dedicated color for 'Others'
    Unknown: '#9CA3AF',
  };

  const getColorForSession = session => sessionColorMap[session] || getRandomColor(session);

  const getRandomColor = seed => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const generateSessionData = () => {
    if (!trades.length) return { winRateData: [], totalTradesData: [] };

    const sessionsMap = {};
    const knownSessions = ['London', 'Asian', 'New York'];

    trades.forEach(trade => {
      let sessionKey = (trade.session || 'Unknown').trim();

      // Group any session not explicitly listed in knownSessions into 'Others'
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

    // Ensure consistent order and inclusion of 'Others' even if empty initially
    const getFixedData = () => {
      const orderedNames = ['London', 'Asian', 'New York', 'Others'];
      const fixedData = orderedNames.map(name => {
        const session = sessionArray.find(s => s.name === name);
        if (session) {
          return session;
        } else {
          // If a known session or 'Others' has no trades, create a placeholder
          return {
            name: name,
            fullName: name,
            wins: 0,
            total: 0,
            winRate: 0,
            color: sessionColorMap[name] || sessionColorMap['Unknown'],
          };
        }
      });
      return fixedData;
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
    const controlsRef = useRef(null);
    const animationRef = useRef(null);
    const cleanupRef = useRef(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [hoveredSession, setHoveredSession] = useState(null);

    const lastFrameTimeRef = useRef(0);

    useEffect(() => {
      if (!mountRef.current || data.length === 0) return;

      let scene = sceneRef.current;
      let renderer = rendererRef.current;
      let camera = cameraRef.current;
      let controls = controlsRef.current;

      if (!scene || !renderer || !camera || !mountRef.current.contains(renderer.domElement)) {
        if (cleanupRef.current) {
            cleanupRef.current();
        }

        // Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f172a);
        sceneRef.current = scene;

        // Camera setup
        camera = new THREE.PerspectiveCamera(75, 550 / 450, 0.1, 1000);
        camera.position.set(0, 6, 12);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        // Renderer setup
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: false,
          preserveDrawingBuffer: false,
          powerPreference: "default"
        });
        renderer.setSize(590, 450);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setClearColor(0x0f172a, 1);
        rendererRef.current = renderer;
        mountRef.current.appendChild(renderer.domElement);

        // OrbitControls setup (simplified as provided)
        const OrbitControls = (function() {
          function OrbitControls(camera, domElement) {
            this.camera = camera;
            this.domElement = domElement;
            this.enabled = true;
            this.autoRotate = true;
            this.autoRotateSpeed = 2.0;
            this.enableDamping = true;
            this.dampingFactor = 0.05;
            this.enableZoom = true;
            this.enableRotate = true;
            this.enablePan = true;

            this.minDistance = 0;
            this.maxDistance = Infinity;
            this.minPolarAngle = 0;
            this.maxPolarAngle = Math.PI;

            this.spherical = new THREE.Spherical();
            this.sphericalDelta = new THREE.Spherical();
            this.scale = 1;
            this.target = new THREE.Vector3();
            this.panOffset = new THREE.Vector3();
            this.zoomChanged = false;

            this.rotateStart = new THREE.Vector2();
            this.rotateEnd = new THREE.Vector2();
            this.rotateDelta = new THREE.Vector2();

            this.panStart = new THREE.Vector2();
            this.panEnd = new THREE.Vector2();
            this.panDelta = new THREE.Vector2();

            this.dollyStart = new THREE.Vector2();
            this.dollyEnd = new THREE.Vector2();
            this.dollyDelta = new THREE.Vector2();

            this.STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_PAN: 4, TOUCH_DOLLY_PAN: 5, TOUCH_DOLLY_ROTATE: 6 };
            this.state = this.STATE.NONE;

            this.update();
            this.setupEventListeners();
          }

          OrbitControls.prototype.update = function() {
            const offset = new THREE.Vector3();
            const quat = new THREE.Quaternion().setFromUnitVectors(this.camera.up, new THREE.Vector3(0, 1, 0));
            const quatInverse = quat.clone().invert();

            offset.copy(this.camera.position).sub(this.target);
            offset.applyQuaternion(quat);

            this.spherical.setFromVector3(offset);

            if (this.autoRotate && this.state === this.STATE.NONE) {
              this.rotateLeft(this.getAutoRotationAngle());
            }

            this.spherical.theta += this.sphericalDelta.theta;
            this.spherical.phi += this.sphericalDelta.phi;

            this.spherical.theta = Math.max(this.minAzimuthAngle || -Infinity, Math.min(this.maxAzimuthAngle || Infinity, this.spherical.theta));
            this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));
            this.spherical.makeSafe();

            this.spherical.radius *= this.scale;
            this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));

            this.target.add(this.panOffset);

            offset.setFromSpherical(this.spherical);
            offset.applyQuaternion(quatInverse);

            this.camera.position.copy(this.target).add(offset);
            this.camera.lookAt(this.target);

            if (this.enableDamping === true) {
              this.sphericalDelta.theta *= (1 - this.dampingFactor);
              this.sphericalDelta.phi *= (1 - this.dampingFactor);
              this.panOffset.multiplyScalar(1 - this.dampingFactor);
            } else {
              this.sphericalDelta.set(0, 0, 0);
              this.panOffset.set(0, 0, 0);
            }

            this.scale = 1;

            if (this.zoomChanged) {
              this.zoomChanged = false;
              return true;
            }

            return false;
          };

          OrbitControls.prototype.getAutoRotationAngle = function() {
            return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
          };

          OrbitControls.prototype.rotateLeft = function(angle) {
            this.sphericalDelta.theta -= angle;
          };

          OrbitControls.prototype.setupEventListeners = function() {
            this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
            this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this), false);
          };

          OrbitControls.prototype.onMouseDown = function(event) {
            if (this.enabled === false) return;

            event.preventDefault();

            switch (event.button) {
              case 0: // left
                if (event.ctrlKey || event.metaKey || event.shiftKey) {
                  this.handleMouseDownPan(event);
                  this.state = this.STATE.PAN;
                } else {
                  this.handleMouseDownRotate(event);
                  this.state = this.STATE.ROTATE;
                }
                break;
              case 1: // middle
                this.handleMouseDownDolly(event);
                this.state = this.STATE.DOLLY;
                break;
              case 2: // right
                this.handleMouseDownPan(event);
                this.state = this.STATE.PAN;
                break;
            }

            if (this.state !== this.STATE.NONE) {
              document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
              document.addEventListener('mouseup', this.onMouseUp.bind(this), false);
            }
          };

          OrbitControls.prototype.onMouseMove = function(event) {
            if (this.enabled === false) return;

            event.preventDefault();

            switch (this.state) {
              case this.STATE.ROTATE:
                if (this.enableRotate === false) return;
                this.handleMouseMoveRotate(event);
                break;
              case this.STATE.DOLLY:
                if (this.enableZoom === false) return;
                this.handleMouseMoveDolly(event);
                break;
              case this.STATE.PAN:
                if (this.enablePan === false) return;
                this.handleMouseMovePan(event);
                break;
            }
          };

          OrbitControls.prototype.onMouseUp = function(event) {
            if (this.enabled === false) return;

            document.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
            document.removeEventListener('mouseup', this.onMouseUp.bind(this), false);

            this.state = this.STATE.NONE;
          };

          OrbitControls.prototype.onMouseWheel = function(event) {
            if (this.enabled === false || this.enableZoom === false || (this.state !== this.STATE.NONE && this.state !== this.STATE.ROTATE)) return;

            event.preventDefault();
            event.stopPropagation();

            this.handleMouseWheel(event);
          };

          OrbitControls.prototype.handleMouseDownRotate = function(event) {
            this.rotateStart.set(event.clientX, event.clientY);
          };

          OrbitControls.prototype.handleMouseDownDolly = function(event) {
            this.dollyStart.set(event.clientX, event.clientY);
          };

          OrbitControls.prototype.handleMouseDownPan = function(event) {
            this.panStart.set(event.clientX, event.clientY);
          };

          OrbitControls.prototype.handleMouseMoveRotate = function(event) {
            this.rotateEnd.set(event.clientX, event.clientY);
            this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(0.005);

            const element = this.domElement;

            this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientHeight);
            this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight);

            this.rotateStart.copy(this.rotateEnd);

            this.update();
          };

          OrbitControls.prototype.handleMouseMoveDolly = function(event) {
            this.dollyEnd.set(event.clientX, event.clientY);
            this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);

            if (this.dollyDelta.y > 0) {
              this.dollyIn(this.getZoomScale());
            } else if (this.dollyDelta.y < 0) {
              this.dollyOut(this.getZoomScale());
            }

            this.dollyStart.copy(this.dollyEnd);

            this.update();
          };

          OrbitControls.prototype.handleMouseMovePan = function(event) {
            this.panEnd.set(event.clientX, event.clientY);
            this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(0.005);

            this.pan(this.panDelta.x, this.panDelta.y);

            this.panStart.copy(this.panEnd);

            this.update();
          };

          OrbitControls.prototype.handleMouseWheel = function(event) {
            if (event.deltaY < 0) {
              this.dollyOut(this.getZoomScale());
            } else if (event.deltaY > 0) {
              this.dollyIn(this.getZoomScale());
            }

            this.update();
          };

          OrbitControls.prototype.rotateUp = function(angle) {
            this.sphericalDelta.phi -= angle;
          };

          OrbitControls.prototype.dollyIn = function(dollyScale) {
            this.scale /= dollyScale;
          };

          OrbitControls.prototype.dollyOut = function(dollyScale) {
            this.scale *= dollyScale;
          };

          OrbitControls.prototype.getZoomScale = function() {
            return Math.pow(0.95, 1);
          };

          OrbitControls.prototype.pan = function(deltaX, deltaY) {
            const offset = new THREE.Vector3();

            offset.copy(this.camera.position).sub(this.target);

            let targetDistance = offset.length();

            targetDistance *= Math.tan((this.camera.fov / 2) * Math.PI / 180.0);

            this.panLeft(2 * deltaX * targetDistance / this.domElement.clientHeight, this.camera.matrix);
            this.panUp(2 * deltaY * targetDistance / this.domElement.clientHeight, this.camera.matrix);
          };

          OrbitControls.prototype.panLeft = function(distance, objectMatrix) {
            const v = new THREE.Vector3();

            v.setFromMatrixColumn(objectMatrix, 0);
            v.multiplyScalar(-distance);

            this.panOffset.add(v);
          };

          OrbitControls.prototype.panUp = function(distance, objectMatrix) {
            const v = new THREE.Vector3();

            v.setFromMatrixColumn(objectMatrix, 1);
            v.multiplyScalar(distance);

            this.panOffset.add(v);
          };

          OrbitControls.prototype.dispose = function() {
            this.domElement.removeEventListener('mousedown', this.onMouseDown.bind(this), false);
            this.domElement.removeEventListener('wheel', this.onMouseWheel.bind(this), false);
          };

          return OrbitControls;
        })();

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5; // Decreased speed
        controlsRef.current = controls;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

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

        // Create pyramid geometry
        const pyramidGeometry = new THREE.ConeGeometry(4.8, 7.2, 4);

        // Create gradient material for pyramid (changed to a bluer shade)
        const pyramidMaterial = new THREE.MeshPhongMaterial({
          color: 0x3b82f6, // A darker blue shade for the pyramid
          transparent: true,
          opacity: 0.8,
          shininess: 100,
          specular: 0x06b6d4,
        });

        const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
        pyramid.position.y = 1.5;
        pyramid.castShadow = true;
        pyramid.receiveShadow = true;
        scene.add(pyramid);

        // Create wireframe overlay
        const wireframeGeometry = new THREE.EdgesGeometry(pyramidGeometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.8
        });
        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        pyramid.add(wireframe);

        // Create session points on pyramid faces
        const sessionMeshes = [];
        data.forEach((session, index) => {
          const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
          const sphereMaterial = new THREE.MeshPhongMaterial({
            color: session.color,
            emissive: new THREE.Color(session.color).multiplyScalar(0.3),
            emissiveIntensity: 0.8,
          });

          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

          // Position spheres on pyramid faces - adjusted for more spread
          const angle = (index / data.length) * Math.PI * 2;
          const radius = 2.2;
          const heightOffset = 0.5 + index * (4.0 / data.length);
          sphere.position.set(
            Math.cos(angle) * radius,
            heightOffset,
            Math.sin(angle) * radius
          );

          sphere.castShadow = true;
          sphere.userData = { session, index };
          sessionMeshes.push(sphere);
          scene.add(sphere);

          // Add pulsing animation to spheres
          const originalScale = sphere.scale.clone();
          sphere.userData.originalScale = originalScale;
        });

        // Create floating particles
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 50;
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
          positions[i] = (Math.random() - 0.5) * 10;
          positions[i + 1] = Math.random() * 5;
          positions[i + 2] = (Math.random() - 0.5) * 10;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
          color: 0x06b6d4,
          size: 0.05,
          transparent: true,
          opacity: 0.6,
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // Mouse interaction
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onMouseMove = (event) => {
          const rect = renderer.domElement.getBoundingClientRect();
          mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(sessionMeshes);

          if (intersects.length > 0) {
            const session = intersects[0].object.userData.session;
            setHoveredSession(session);
            setShowTooltip(true);
          } else {
            setHoveredSession(null);
            setShowTooltip(false);
          }
        };

        renderer.domElement.addEventListener('mousemove', onMouseMove);

        // Animation loop
        const animate = (currentTime) => {
          if (!sceneRef.current || !rendererRef.current || !cameraRef.current || !controlsRef.current) return;

          animationRef.current = requestAnimationFrame(animate);

          const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000;
          lastFrameTimeRef.current = currentTime;

          // Update controls
          const controls = controlsRef.current;
          controls.update();

          // Animate session spheres
          sessionMeshes.forEach((sphere, index) => {
            if (sphere) {
              const time = currentTime * 0.01;
              sphere.position.y += Math.sin(time + index) * 0.005;
              if (sphere.position.y > 4.5 || sphere.position.y < 0.5) {
                  sphere.position.y = 0.5 + index * (4.0 / data.length);
              }

              // Pulsing effect
              const scale = 1 + Math.sin(time * 2 + index) * 0.2;
              sphere.scale.setScalar(scale);
            }
          });

          // Animate particles
          if (particles && particles.geometry && particles.geometry.attributes.position) {
            const positions = particles.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i += 3) {
              positions[i] += 0.01 * deltaTime * 60;
              if (positions[i] > 5) positions[i] = 0;
            }
            particles.geometry.attributes.position.needsUpdate = true;
            particles.rotation.y += 0.002 * deltaTime * 60;
          }

          // Animate wireframe
          if (wireframe && wireframe.material) {
            wireframe.material.opacity = 0.5 + Math.sin(currentTime * 0.003) * 0.3;
          }

          // Render scene with camera
          const scene = sceneRef.current;
          const renderer = rendererRef.current;
          const camera = cameraRef.current;

          renderer.render(scene, camera);
        };

        // Initialize lastFrameTimeRef
        lastFrameTimeRef.current = performance.now();
        animate(lastFrameTimeRef.current);

        // Cleanup function for this specific Three.js instance
        cleanupRef.current = () => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
          }

          if (controls) {
            controls.dispose();
          }

          if (renderer && renderer.domElement) {
            renderer.domElement.removeEventListener('mousemove', onMouseMove);
          }

          if (scene) {
            scene.traverse((object) => {
              if (object.geometry) {
                object.geometry.dispose();
              }
              if (object.material) {
                if (Array.isArray(object.material)) {
                  object.material.forEach((material) => {
                    if (material.map) material.map.dispose();
                    material.dispose();
                  });
                } else {
                  if (object.material.map) object.material.map.dispose();
                  object.material.dispose();
                }
              }
            });
            scene.clear();
          }

          if (renderer) {
            renderer.dispose();
          }

          if (mountRef.current && renderer && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
            try {
              mountRef.current.removeChild(renderer.domElement);
            } catch (e) {
              console.warn("Error removing renderer DOM element:", e);
            }
          }

          sceneRef.current = null;
          rendererRef.current = null;
          cameraRef.current = null;
          controlsRef.current = null;
        };
      }

    }, [data, showWinRate]);

    // Cleanup on unmount of the PyramidChart component
    useEffect(() => {
      return () => {
        if (cleanupRef.current) {
          cleanupRef.current();
        }
      };
    }, []);

    return (
      <div className="relative flex justify-center items-center w-full h-80">
        <div
          ref={mountRef}
          className="rounded-lg overflow-hidden flex justify-center items-center"
          style={{ width: '590px', height: '340px' }}
        ></div>

        {showTooltip && hoveredSession && (
          <div className="absolute top-4 right-4 bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 border border-slate-600 shadow-lg transition-all duration-300 z-20" style={{ marginRight: '10px', marginTop: '10px' }}>
            <div className="text-sm text-gray-200 font-medium space-y-2">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: hoveredSession.color }}
                ></div>
                <span className="whitespace-nowrap">
                  {hoveredSession.fullName}:{' '}
                  <span className="font-semibold text-cyan-400">
                    {showWinRate
                      ? `${hoveredSession.winRate.toFixed(1)}%`
                      : `${hoveredSession.total} trades`
                    }
                  </span>
                </span>
              </div>
              {showWinRate && (
                <div className="text-xs text-gray-400">
                  {hoveredSession.wins}/{hoveredSession.total} wins
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-slate-800/90 backdrop-blur-sm rounded-lg p-2 border border-slate-600 z-20" style={{ marginLeft: '10px', marginBottom: '10px' }}>
          <div className="text-xs text-gray-300 space-y-1">
            {data.map((session, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: session.color }}
                ></div>
                <span className="text-xs whitespace-nowrap">
                  {session.name}
                  {showWinRate
                    ? ` (${session.winRate.toFixed(1)}%)`
                    : ` (${session.total} trades)` // Added total trades here
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading || error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20 rounded-xl blur-xl"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
                {/* Skeleton for the chart area */}
                <div className="flex justify-center items-center h-80 bg-slate-700 rounded overflow-hidden relative">
                    <div className="text-slate-500 text-lg font-semibold z-10">Loading Chart...</div>
                    {/* Basic pyramid shape skeleton */}
                    <div className="absolute bottom-0 w-2/3 h-2/3 bg-slate-600 rounded-lg transform rotate-45 opacity-50"></div>
                </div>
              </div>
              {error && (
                <div className="text-red-400 text-center mt-4">
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const sessionData = generateSessionData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Win Rate By Session
          </h2>
          <PyramidChart data={sessionData.winRateData} showWinRate={true} />
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-all duration-300"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">📈</span>
            Total Trades By Session
          </h2>
          <PyramidChart data={sessionData.totalTradesData} showWinRate={false} />
        </div>
      </div>
    </div>
  );
};

export default SessionAnalysis;