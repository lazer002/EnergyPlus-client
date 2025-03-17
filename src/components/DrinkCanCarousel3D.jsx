import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Try to import GSAP, but provide fallback animation if not available
let gsap;
try {
  gsap = require('gsap');
} catch (e) {
  console.warn('GSAP not found. Using fallback animations. Run npm install gsap to enable enhanced animations.');
  // Fallback animation utility
  gsap = {
    to: (obj, config) => {
      const { duration = 1, ease = 'linear', onComplete, ...props } = config;
      const startValues = {};
      const changeValues = {};

      // Store starting values and calculate changes
      for (const prop in props) {
        if (obj[prop] !== undefined) {
          startValues[prop] = obj[prop];
          changeValues[prop] = props[prop] - startValues[prop];
        }
      }

      const startTime = Date.now();
      const endTime = startTime + duration * 1000;

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);

        // Simple linear interpolation
        for (const prop in changeValues) {
          obj[prop] = startValues[prop] + changeValues[prop] * progress;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else if (onComplete) {
          onComplete();
        }
      };

      animate();

      // Return a simple tween-like object
      return {
        progress: 0,
        kill: () => {}
      };
    },
    timeline: () => {
      // Simple timeline implementation
      const queue = [];
      let currentIndex = 0;

      const executeNext = () => {
        if (currentIndex < queue.length) {
          const current = queue[currentIndex];
          currentIndex++;

          gsap.to(current.obj, {
            ...current.props,
            onComplete: () => {
              if (current.onComplete) current.onComplete();
              executeNext();
            }
          });
        }
      };

      return {
        to: (obj, props) => {
          queue.push({ obj, props });
          if (queue.length === 1) {
            executeNext();
          }
          return this;
        }
      };
    }
  };
}

const DrinkCanCarousel3D = () => {
  const mountRef = useRef(null);
  const carouselRef = useRef(null);
  const modelsRef = useRef([]);
  const currentCanIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const rotationSpeedRef = useRef({
    normal: 0.02,    // Fast rotation between cans
    slow: 0.003,     // Very slow when can is in front (15% of normal speed)
    current: 0.02,
    isSlowing: false
  });
  const [autoRotate, setAutoRotate] = useState(true);
  const [baseSpeed, setBaseSpeed] = useState(0.02);

  useEffect(() => {
    console.log("Initializing 3D carousel scene");

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      40,  // Field of view
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 16;  // Move camera back to see carousel
    camera.position.y = 5;   // Slightly elevated view
    camera.position.x = -5;   // Slightly elevated view

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputEncoding = THREE.sRGBEncoding;
    mountRef.current.appendChild(renderer.domElement);

    // Setup post-processing for bloom effect
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Add bloom effect
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.2,    // strength
      6.4,    // radius
      12.85    // threshold
    );
    composer.addPass(bloomPass);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 0, 0);

    // Environment lighting with HDR
    const rgbeLoader = new RGBELoader();
    rgbeLoader.setPath('/');
    rgbeLoader.load('sky.hdr', function(texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
      renderer.physicallyCorrectLights = true;
      console.log("HDR environment loaded");
    }, undefined, function(error) {
      console.error("Error loading HDR:", error);
      scene.background = new THREE.Color(0x111122); // Dark blue background as fallback
    });

    // Add lights for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add spotlight for the front position
    const spotlight = new THREE.SpotLight(0xffffff, 2);
    spotlight.position.set(0, 10, 15);
    spotlight.angle = Math.PI / 6;
    spotlight.penumbra = 0.2;
    spotlight.decay = 2;
    spotlight.distance = 50;
    spotlight.castShadow = true;
    scene.add(spotlight);

    // Create a carousel container
    const carousel = new THREE.Object3D();
    carousel.position.set(0, 0, 0);
    scene.add(carousel);
    carouselRef.current = carousel;

    // Model file to load (using the same model 5 times)
    const modelFile = '/models/can4.glb';
    const modelScale = { x: 15, y: 15, z: 15 };

    // Number of models in the carousel
    const numModels = 5;

    // Carousel radius
    const radius = 10;

    // Load the model once and clone it for the carousel
    const loader = new GLTFLoader();

    console.log(`Loading model from ${modelFile}`);

    // Add text labels
    const labels = [];
    for (let i = 0; i < numModels; i++) {
      const div = document.createElement('div');
      div.className = 'model-label';
      div.textContent = `Can ${i+1}`;
      div.style.position = 'absolute';
      div.style.color = 'white';
      div.style.padding = '2px 6px';
      div.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      div.style.borderRadius = '4px';
      div.style.fontSize = '12px';
      div.style.fontWeight = 'bold';
      div.style.pointerEvents = 'none'; // Prevent interaction with labels
      div.style.opacity = '0.8';
      div.style.transition = 'opacity 0.3s ease';
      document.body.appendChild(div);
      labels.push(div);
    }

    // Load the actual model
    loader.load(
      modelFile,
      (gltf) => {
        console.log(`Successfully loaded model`);
        const originalModel = gltf.scene;

        // Apply materials with bloom effect
        originalModel.traverse((child) => {
          if (child.isMesh) {
            const newMaterial = new THREE.MeshStandardMaterial({
              color: child.material ? child.material.color : 0xffffff,
              metalness: 0.8,
              roughness: 0.2,
              envMapIntensity: 1.5,
              emissive: new THREE.Color(0x222222), // Subtle emissive for bloom
              emissiveIntensity: 0.2
            });

            if (child.material && child.material.map) {
              newMaterial.map = child.material.map;
            }

            child.material = newMaterial;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Create model instances and store references
        const modelInstances = [];

        // Create 5 instances and position them in a circle
        for (let i = 0; i < numModels; i++) {
          const model = originalModel.clone();

          // Create a container for the model to handle individual animations
          const modelContainer = new THREE.Object3D();
          modelContainer.userData.index = i;

          // Scale the model
          model.scale.set(modelScale.x, modelScale.y, modelScale.z);

          // Add model to its container
          modelContainer.add(model);

          // Position in a circle
          const angle = (i / numModels) * Math.PI * 2;
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;

          modelContainer.position.set(x, 0, z);
          modelContainer.rotation.y = -angle + Math.PI; // Make it face the center

          // Store the base rotation for reference
          modelContainer.userData.baseRotation = modelContainer.rotation.y;

          // Add to carousel
          carousel.add(modelContainer);
          modelInstances.push(modelContainer);

          console.log(`Model ${i+1} positioned at angle: ${angle.toFixed(2)}, x: ${x.toFixed(2)}, z: ${z.toFixed(2)}`);
        }

        // Store model references for animation
        modelsRef.current = modelInstances;

        // Animation will start automatically with the continuous rotation
      },
      (xhr) => {
        const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
        console.log(`Model loading: ${percent}%`);
      },
      (error) => {
        console.error(`Error loading model:`, error);
      }
    );

    // Load font and create text
    const fontLoader = new FontLoader();
    fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
      const textGeometry = new TextGeometry('ENERGY PLUS', {
        font: font,
        size: 10,
        height: 1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.5,
        bevelSize: 0.2,
        bevelOffset: 0,
        bevelSegments: 5
      });

      const textMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: new THREE.Color(0x444444), // Emissive color for bloom
        emissiveIntensity: 1.0
      });

      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(-30, 0, -20); // Position the text behind the carousel
      scene.add(textMesh);
    });

    // Function to determine if a model is at the front position
    const isModelAtFront = (model) => {
      // Convert model position to world position
      const worldPos = new THREE.Vector3();
      worldPos.setFromMatrixPosition(model.matrixWorld);

      // Check if it's close to the front (z axis)
      return Math.abs(worldPos.z - 10) < 1 && Math.abs(worldPos.x) < 1;
    };

    // Variable for slowdown timer
    let slowdownTimer = null;

    // Function to handle continuous rotation with speed variations
    const updateCarouselRotation = () => {
      if (!autoRotate) return;

      // Rotate the carousel at current speed
      carousel.rotation.y += rotationSpeedRef.current.current;

      // Check if any can is approaching the front position
      const angleStep = (2 * Math.PI) / numModels;
      const currentAngle = carousel.rotation.y % (2 * Math.PI);

      // Calculate how close we are to a can being in front
      // Front positions occur at multiples of angleStep
      for (let i = 0; i < numModels; i++) {
        const frontAngle = (i * angleStep) % (2 * Math.PI);
        const distanceToFront = Math.abs(((currentAngle - frontAngle) + Math.PI) % (2 * Math.PI) - Math.PI);

        // If we're approaching a front position (within 0.2 radians) and not already slowing
        if (distanceToFront < 0.2 && !rotationSpeedRef.current.isSlowing) {
          // Slow down dramatically
          rotationSpeedRef.current.current = rotationSpeedRef.current.slow;
          rotationSpeedRef.current.isSlowing = true;

          // Get the can that will be in front
          const frontCanIndex = (numModels - Math.round(currentAngle / angleStep)) % numModels;
          const frontCan = modelsRef.current[frontCanIndex];

          // Just mark this can as being in front - rotation happens in the animation loop
          if (frontCan) {
            // Store the original y-rotation to maintain proper orientation
            frontCan.userData.originalYRotation = frontCan.rotation.y;

            // Set timer to return to normal (fast) speed
            clearTimeout(slowdownTimer);
            slowdownTimer = setTimeout(() => {
              // Accelerate back to normal speed
              gsap.to(rotationSpeedRef.current, {
                current: rotationSpeedRef.current.normal,
                duration: 0.5,
                ease: "power2.in",
                onComplete: () => {
                  rotationSpeedRef.current.isSlowing = false;
                }
              });
            }, 4000); // Stay slow for 4 seconds to showcase the can with full animation

            // Update current index
            currentCanIndexRef.current = frontCanIndex;
          }
          break;
        }
      }
    };

    // Track the front can for rotation
    let frontCanForRotation = null;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update carousel rotation with dynamic speed
      updateCarouselRotation();

      // Update controls
      controls.update();

      // Update label positions
      if (labels.length > 0 && modelsRef.current.length > 0) {
        modelsRef.current.forEach((model, i) => {
          if (labels[i]) {
            const worldPos = new THREE.Vector3();
            worldPos.setFromMatrixPosition(model.matrixWorld);
            worldPos.y += 3; // Position above the model

            const vector = worldPos.clone();
            vector.project(camera);

            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;

            labels[i].style.left = `${x}px`;
            labels[i].style.top = `${y}px`;

            // Make labels more visible when in front
            if (isModelAtFront(model)) {
              labels[i].style.opacity = '1';
              labels[i].style.fontSize = '14px';

              // If this model is in front, rotate it like a fan (around its own center)
              if (rotationSpeedRef.current.isSlowing) {
                // Get the first child of the model container (the actual can model)
                if (model.children.length > 0) {
                  const can = model.children[0];

                  // Rotate the can around its own center (like a fan)
                  can.rotation.y += 0.15; // Faster continuous rotation for more visible effect

                  // Reset rotation if it gets too large to avoid precision issues
                  if (can.rotation.y > Math.PI * 20) {
                    can.rotation.y = 0;
                  }
                }
              }
            } else {
              labels[i].style.opacity = '0.6';
              labels[i].style.fontSize = '12px';
            }
          }
        });
      }

      // Render with post-processing (bloom)
      composer.render();
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      controls.update();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);

      // Remove all labels
      labels.forEach(label => {
        if (document.body.contains(label)) {
          document.body.removeChild(label);
        }
      });

      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [autoRotate]);

  // Speed control is handled by the baseSpeed state at the top of the component

  // Update rotation speeds when baseSpeed changes
  useEffect(() => {
    if (typeof window !== 'undefined' && rotationSpeedRef.current) {
      rotationSpeedRef.current.normal = baseSpeed;
      rotationSpeedRef.current.slow = baseSpeed * 0.15; // 15% of normal speed for more dramatic slowdown

      // Only update current speed if not in a slowdown phase
      if (!rotationSpeedRef.current.isSlowing) {
        rotationSpeedRef.current.current = baseSpeed;
      }
    }
  }, [baseSpeed]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

 
    </div>
  );
};

export default DrinkCanCarousel3D;
