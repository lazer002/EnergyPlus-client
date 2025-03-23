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

// BOX CONTAINER DIMENSIONS (in 3D units)
const BOX_WIDTH = 12;      // 300px equivalent in 3D space
const BOX_HEIGHT = 4;     // 100px equivalent in 3D space
const BOX_DEPTH = 0.5;    // 50px equivalent in 3D space
const BOX_POSITION_X = 2; // Center position
const BOX_POSITION_Y = -1; // Slightly above center
const BOX_POSITION_Z = -5; // In front of the scene

// TEXT SIZE RELATIVE TO BOX
const TEXT_SIZE = 0.2;          // Size of the text relative to box (reduced to fit)
const TEXT_THICKNESS = 0.01;    // Thickness/depth of the text (extremely thin)

const DrinkCanCarousel3D = () => {
  const mountRef = useRef(null);
  const carouselRef = useRef(null);
  const modelsRef = useRef([]);
  const currentCanIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const mousePositionRef = useRef({ x: 0, y: 0 }); // Track mouse position
  const raycasterRef = useRef(new THREE.Raycaster()); // For detecting mouse hover
  const mouse2DRef = useRef(new THREE.Vector2()); // 2D mouse coordinates
  const rotationSpeedRef = useRef({
    normal: 0.005,    // Slower rotation between cans
    slow: 0.001,      // Very slow when can is in front (20% of normal speed)
    current: 0.005,
    isSlowing: false
  });
  const [autoRotate, setAutoRotate] = useState(true);
  const [baseSpeed, setBaseSpeed] = useState(0.005); // Adjusted base speed

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

    // Add bloom effect with enhanced settings for orange text
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,    // strength - increased for more intense bloom
      1.6,    // radius - increased for wider glow
      0.85    // threshold - lowered to make orange text bloom more
    );
    composer.addPass(bloomPass);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; 
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 0, 0);

    // Environment lighting with HDR
    const rgbeLoader = new RGBELoader();
    rgbeLoader.setPath('/');
    rgbeLoader.load('sky.hdr', function(texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = new THREE.Color(0xFF5F1F);
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

    // Create a box container first
    console.log("Creating box container for text...");

    // Create box geometry with specified dimensions
    const boxGeometry = new THREE.BoxGeometry(BOX_WIDTH, BOX_HEIGHT, BOX_DEPTH);

    // Create an invisible material for the box (no visible borders)
    const boxMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,  // Completely transparent
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // Create the box mesh
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.set(BOX_POSITION_X, BOX_POSITION_Y, BOX_POSITION_Z);

    // Add box to scene
    scene.add(boxMesh);

    // Create a flat plane with text texture inside the box
    console.log("Creating flat text plane...");

    // Create a canvas for the text texture
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Set canvas size (power of 2 for better texture performance)
    canvas.width = 512;
    canvas.height = 128;

    // Clear canvas with transparent background
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Set text properties
    const fontSize = 64;
    context.font = `bold ${fontSize}px Arial, Helvetica, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Add orange gradient for text
    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#B46000');  // Bright orange
    gradient.addColorStop(0.5, '#ff6600'); // Deeper orange
    gradient.addColorStop(1, '#ff8800');  // Bright orange again

    // Fill text with gradient
    context.fillStyle = gradient;
    context.fillText('ENERGY PLUS', canvas.width / 2, canvas.height / 2);

    // Add glow effect
    context.shadowColor = '#ff5500';
    context.shadowBlur = 15;
    context.fillText('ENERGY PLUS', canvas.width / 2, canvas.height / 2);

    // Add second layer of glow for enhanced bloom effect
    context.shadowColor = '#ffaa00';
    context.shadowBlur = 30;
    context.fillText('ENERGY PLUS', canvas.width / 2, canvas.height / 2);

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // Create dimensions for elements
    const planeWidth = BOX_WIDTH * 0.9;  // 90% of box width
    const planeHeight = BOX_HEIGHT * 0.5; // 50% of box height
    const backingDepth = BOX_DEPTH * 0.8; // 80% of box depth for much thicker 3D backing

    // Create a 3D backing for the text (thicker box)
    const backingGeometry = new THREE.BoxGeometry(planeWidth, planeHeight, backingDepth);
    const backingMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6600,  // Orange color matching text
      metalness: 0.95,  // Further increased metalness for more reflectivity
      roughness: 0.05,  // Further decreased roughness for smoother, more reflective surface
      emissive: 0xff4400, // Orange emissive color
      emissiveIntensity: 0.6, // Increased emissive intensity for stronger bloom
      envMapIntensity: 2.0,   // Increased environment map intensity for better reflections
      clearcoat: 0.5,         // Add clearcoat for a glossy finish
      clearcoatRoughness: 0.1 // Slightly rough clearcoat for realistic appearance
    });

    // Create the backing mesh
    const backingMesh = new THREE.Mesh(backingGeometry, backingMaterial);

    // Position the backing inside the box
    backingMesh.position.set(
      0,                    // Center horizontally
      BOX_HEIGHT * 0.1,     // Slightly above center
      0                     // Center in z-axis
    );

    // Add the backing to the box
    boxMesh.add(backingMesh);

    // Create a plane geometry for the text that sits just in front of the backing
    const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

    // Create material with the text texture
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    // Create the front plane mesh
    const frontTextPlane = new THREE.Mesh(planeGeometry, planeMaterial);

    // Position the plane just in front of the backing
    frontTextPlane.position.set(
      0,                    // Center horizontally
      0,                    // Same height as backing
      backingDepth/2 + 0.02 // Just in front of the backing (increased offset)
    );

    // Add the front plane to the backing
    backingMesh.add(frontTextPlane);

    // Create the back plane mesh (using the same texture)
    const backTextPlane = new THREE.Mesh(planeGeometry, planeMaterial.clone());

    // Position the back plane just behind the backing
    backTextPlane.position.set(
      0,                     // Center horizontally
      0,                     // Same height as backing
      -backingDepth/2 - 0.02 // Just behind the backing (increased offset)
    );

    // Rotate the back plane to face the back
    backTextPlane.rotation.y = Math.PI;

    // Add the back plane to the backing
    backingMesh.add(backTextPlane);

    // Add 3D beveled frame around the text for additional depth
    const frameWidth = planeWidth * 1.05;
    const frameHeight = planeHeight * 1.05;
    const frameDepth = backingDepth * 0.7; // Increased frame depth to match thicker backing

    // Create rounded rectangle shape for the frame
    const frameShape = new THREE.Shape();
    const frameRadius = 0.1; // Corner radius

    frameShape.moveTo(-frameWidth/2 + frameRadius, -frameHeight/2);
    frameShape.lineTo(frameWidth/2 - frameRadius, -frameHeight/2);
    frameShape.quadraticCurveTo(frameWidth/2, -frameHeight/2, frameWidth/2, -frameHeight/2 + frameRadius);
    frameShape.lineTo(frameWidth/2, frameHeight/2 - frameRadius);
    frameShape.quadraticCurveTo(frameWidth/2, frameHeight/2, frameWidth/2 - frameRadius, frameHeight/2);
    frameShape.lineTo(-frameWidth/2 + frameRadius, frameHeight/2);
    frameShape.quadraticCurveTo(-frameWidth/2, frameHeight/2, -frameWidth/2, frameHeight/2 - frameRadius);
    frameShape.lineTo(-frameWidth/2, -frameHeight/2 + frameRadius);
    frameShape.quadraticCurveTo(-frameWidth/2, -frameHeight/2, -frameWidth/2 + frameRadius, -frameHeight/2);

    // Create hole in the shape (for the inner part)
    const holeShape = new THREE.Shape();
    const innerWidth = planeWidth * 0.95;
    const innerHeight = planeHeight * 0.95;
    const innerRadius = 0.08;

    holeShape.moveTo(-innerWidth/2 + innerRadius, -innerHeight/2);
    holeShape.lineTo(innerWidth/2 - innerRadius, -innerHeight/2);
    holeShape.quadraticCurveTo(innerWidth/2, -innerHeight/2, innerWidth/2, -innerHeight/2 + innerRadius);
    holeShape.lineTo(innerWidth/2, innerHeight/2 - innerRadius);
    holeShape.quadraticCurveTo(innerWidth/2, innerHeight/2, innerWidth/2 - innerRadius, innerHeight/2);
    holeShape.lineTo(-innerWidth/2 + innerRadius, innerHeight/2);
    holeShape.quadraticCurveTo(-innerWidth/2, innerHeight/2, -innerWidth/2, innerHeight/2 - innerRadius);
    holeShape.lineTo(-innerWidth/2, -innerHeight/2 + innerRadius);
    holeShape.quadraticCurveTo(-innerWidth/2, -innerHeight/2, -innerWidth/2 + innerRadius, -innerHeight/2);

    frameShape.holes.push(holeShape);

    // Extrude settings
    const extrudeSettings = {
      steps: 2,
      depth: frameDepth,
      bevelEnabled: true,
      bevelThickness: 0.05,  // Increased bevel thickness
      bevelSize: 0.04,       // Increased bevel size
      bevelOffset: 0,
      bevelSegments: 5       // More segments for smoother bevels
    };

    // Create extruded geometry
    const frameGeometry = new THREE.ExtrudeGeometry(frameShape, extrudeSettings);

    // Create material for the frame with enhanced metallic bloom
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xff9900,
      metalness: 0.95,  // Increased metalness for more reflectivity
      roughness: 0.05,  // Decreased roughness for smoother, more reflective surface
      emissive: 0xff7700,
      emissiveIntensity: 0.4,  // Increased emissive intensity for stronger bloom
      envMapIntensity: 2.0     // Increased environment map intensity for better reflections
    });

    // Create frame mesh
    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);

    // Position frame
    frameMesh.position.set(0, 0, -backingDepth/2 - frameDepth/2);

    // Add frame to backing
    backingMesh.add(frameMesh);

    // Create a reference to track rotation
    const rotationRef = { value: 0 };

    // Animate the box with a floating effect and slow continuous rotation
    const animateBox = () => {
      const time = Date.now() * 0.001;

      // Subtle floating movement
      boxMesh.position.y = Math.sin(time * 0.5) * 0.2 + BOX_POSITION_Y;

      // Slow continuous rotation
      rotationRef.value += 0.003; // Very slow rotation speed
      boxMesh.rotation.y = rotationRef.value;

      requestAnimationFrame(animateBox);
    };

    animateBox();

    console.log("2D text plane added inside box container");


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

      // Update raycaster with current mouse position
      raycasterRef.current.setFromCamera(mouse2DRef.current, camera);

      // Apply wave effect to models
      if (modelsRef.current.length > 0) {
        // Check for intersections with models
        const intersects = raycasterRef.current.intersectObjects(scene.children, true);

        // Track which models the mouse is hovering near
        const hoverModels = new Set();

        // Find models that are being hovered
        intersects.forEach(intersect => {
          let obj = intersect.object;
          // Traverse up to find the model container
          while (obj && obj.parent) {
            if (obj.parent === carousel) {
              hoverModels.add(obj);
              break;
            }
            obj = obj.parent;
          }
        });

        modelsRef.current.forEach((model, i) => {

          // Apply wave effect
          const time = Date.now() * 0.001; // Time in seconds
          const waveHeight = 2; // Adjust the height of the wave
          const waveSpeed = 0.5; // Adjust the speed of the wave
          model.position.y = Math.sin(time * waveSpeed + i) * waveHeight;

          // Calculate distance from mouse to model in screen space
          const worldPos = new THREE.Vector3();
          worldPos.setFromMatrixPosition(model.matrixWorld);
          const vector = worldPos.clone();
          vector.project(camera);

          const modelScreenX = (vector.x * 0.5 + 0.5) * window.innerWidth;
          const modelScreenY = (-(vector.y * 0.5) + 0.5) * window.innerHeight;

          const mouseX = mousePositionRef.current.x;
          const mouseY = mousePositionRef.current.y;

          const distance = Math.sqrt(
            Math.pow(modelScreenX - mouseX, 2) +
            Math.pow(modelScreenY - mouseY, 2)
          );

          // Get the original position in the circle
          const originalAngle = (i / numModels) * Math.PI * 2;
          const originalX = Math.sin(originalAngle) * radius;
          const originalZ = Math.cos(originalAngle) * radius;

          // If mouse is close to the model, make it run away
          if (distance < 300) { // Even larger detection radius for ultra-smooth transition
            // Calculate direction away from mouse
            const angle = Math.atan2(modelScreenY - mouseY, modelScreenX - mouseX);

            // Use a stronger repel effect that doesn't diminish as quickly with distance
            // This allows models to be pushed further away
            const repelStrength = Math.max(0, 1 - distance / 300) * 0.5; // Increased strength for more movement

            // Calculate repel vector with increased magnitude for more dramatic movement
            // Increased multiplier to allow models to move much further
            const repelX = Math.cos(angle) * repelStrength * 8; // Increased multiplier (2 -> 8)
            const repelZ = Math.sin(angle) * repelStrength * 8;

            // Calculate target position with unlimited repel effect
            // No longer tied to the original circle position - can go anywhere
            const targetX = model.position.x + repelX;
            const targetZ = model.position.z + repelZ;

            // Apply the repel effect with extremely smooth interpolation
            model.position.x += (targetX - model.position.x) * 0.05; // Slightly faster to see movement
            model.position.z += (targetZ - model.position.z) * 0.05;

            // Make the model rotate away from the mouse
            const targetRotationY = model.userData.baseRotation + repelStrength * Math.PI * 0.3; // More rotation
            model.rotation.y += (targetRotationY - model.rotation.y) * 0.05;
          } else {
            // Very smoothly return to original position
            model.position.x += (originalX - model.position.x) * 0.02; // Much slower return
            model.position.z += (originalZ - model.position.z) * 0.02;

            // Reset rotation very gradually
            model.rotation.y += (model.userData.baseRotation - model.rotation.y) * 0.02;
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

    // Track mouse position for the "run away" effect
    const handleMouseMove = (event) => {
      // Update mouse position
      mousePositionRef.current = {
        x: event.clientX,
        y: event.clientY
      };

      // Calculate normalized device coordinates (-1 to +1)
      mouse2DRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse2DRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);

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
      rotationSpeedRef.current.slow = baseSpeed * 0.2; // 20% of normal speed

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
