import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const DrinkCan3D = () => {
  const mountRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const mousePosition = useRef({ x: 0, y: 0 });

  // Function to handle mouse move - optimized to use ref instead of state
  const handleMouseMove = (event) => {
    // Calculate normalized coordinates (-1 to 1)
    mousePosition.current = {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1
    };
  };

  // Function to handle mouse enter
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  // Function to handle mouse leave
  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 15; // Moved camera back to see all cans

    // Renderer setup with optimized settings
    const renderer = new THREE.WebGLRenderer({
      antialias: false, // Disable antialias for performance
      powerPreference: "high-performance"
    });

    // Set a fixed size for better performance
    const width = Math.min(window.innerWidth, 1920);
    const height = Math.min(window.innerHeight, 1080);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio
    mountRef.current.appendChild(renderer.domElement);

    // Bloom effect setup with optimized settings
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width / 2, height / 2), // Half resolution for bloom
      1.5,  // reduced strength
      0.4,  // reduced radius
      0.3   // increased threshold
    );

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // Create a group to hold all cans
    const cansGroup = new THREE.Group();
    scene.add(cansGroup);

    // Can colors - more vibrant and diverse colors for materials
    const canColors = [
      0xff2200, // Red-orange
      0xff6600, // Orange
      0xff0000, // Red
      0xcc3300, // Dark orange
      0xff3366  // Pink-red
    ];

    // Create 5 cans in a circle
    const cans = [];
    const radius = 6; // Radius of the circle
    const numCans = 5;

    // Load the GLTF model
    const loader = new GLTFLoader();
    const modelPath = '/models/energy_drink_can.glb';

    // Create a loading manager to track progress
    const loadingManager = new THREE.LoadingManager();

    // Create a placeholder for cans while loading
    for (let i = 0; i < numCans; i++) {
      // Create a simple placeholder cylinder
      const placeholderGeometry = new THREE.CylinderGeometry(0.8, 0.8, 3, 16);
      const placeholderMaterial = new THREE.MeshStandardMaterial({
        color: canColors[i],
        metalness: 0.9,
        roughness: 0.1,
        emissive: new THREE.Color(canColors[i]).multiplyScalar(0.2),
        emissiveIntensity: 0.3
      });

      const placeholder = new THREE.Mesh(placeholderGeometry, placeholderMaterial);

      // Position placeholders in a circle
      const angle = (i / numCans) * Math.PI * 2;
      placeholder.position.x = Math.cos(angle) * radius;
      placeholder.position.z = Math.sin(angle) * radius;

      cansGroup.add(placeholder);
      cans.push(placeholder);
    }

    // Try to load the model
    loader.load(
      modelPath,
      (gltf) => {
        // Model loaded successfully
        console.log('Model loaded successfully');

        // Remove placeholders
        cans.forEach(placeholder => {
          cansGroup.remove(placeholder);
        });

        // Clear the cans array
        cans.length = 0;

        // Create 5 instances of the model
        for (let i = 0; i < numCans; i++) {
          // Clone the model
          const model = gltf.scene.clone();

          // Scale the model appropriately
          model.scale.set(1.5, 1.5, 1.5);

          // Position models in a circle
          const angle = (i / numCans) * Math.PI * 2;
          model.position.x = Math.cos(angle) * radius;
          model.position.z = Math.sin(angle) * radius;

          // Apply different materials to parts of the model
          model.traverse((child) => {
            if (child.isMesh) {
              // Create a new material with the can color
              const newMaterial = new THREE.MeshStandardMaterial({
                color: canColors[i],
                metalness: 0.9,
                roughness: 0.1,
                emissive: new THREE.Color(canColors[i]).multiplyScalar(0.2),
                emissiveIntensity: 0.3
              });

              // Apply the material to the mesh
              child.material = newMaterial;
            }
          });

          // Add model to the group
          cansGroup.add(model);
          cans.push(model);
        }
      },
      (xhr) => {
        // Loading progress
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        // Error loading model
        console.error('An error happened while loading the model:', error);

        // Keep the placeholders if the model fails to load
        console.log('Using placeholder cylinders instead');
      }
    );

    // Add lighting - optimized
    const ambientLight = new THREE.AmbientLight(0x222222, 1);
    scene.add(ambientLight);

    // Main orange directional light (more efficient than spotlight)
    const mainLight = new THREE.DirectionalLight(0xff5500, 3);
    mainLight.position.set(10, 10, 10);
    scene.add(mainLight);

    // Red accent light
    const accentLight = new THREE.DirectionalLight(0xff0000, 2);
    accentLight.position.set(-10, -10, 10);
    scene.add(accentLight);

    // Animation loop - optimized
    let lastTime = 0;
    const rotationSpeed = 0.01;
    const floatSpeed = 0.001;

    const animate = (time) => {
      requestAnimationFrame(animate);

      // Throttle to ~30fps for better performance
      if (time - lastTime < 33) {
        return;
      }
      lastTime = time;

      if (isHovering) {
        // Follow cursor when hovering
        // Smooth transition to cursor position
        const targetX = mousePosition.current.x * 1.5; // Reduced effect
        const targetY = mousePosition.current.y * 1.0; // Reduced effect

        // Smoothly rotate the group based on mouse position
        cansGroup.rotation.y += (targetX - cansGroup.rotation.y) * 0.05;
        cansGroup.rotation.x += (targetY - cansGroup.rotation.x) * 0.05;
      } else {
        // Normal auto-rotation when not hovering
        cansGroup.rotation.y += rotationSpeed;
        cansGroup.rotation.x = Math.sin(time * 0.0003) * 0.1; // Slower tilt animation
      }

      // Add a slight floating motion to the group
      cansGroup.position.y = Math.sin(time * floatSpeed) * 0.2;

      // Rotate individual cans
      cans.forEach(can => {
        can.rotation.y += 0.02;
      });

      composer.render();
    };

    animate(0);

    // Handle window resize - debounced
    let resizeTimeout;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);

      resizeTimeout = setTimeout(() => {
        const width = Math.min(window.innerWidth, 1920);
        const height = Math.min(window.innerHeight, 1080);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        composer.setSize(width, height);
      }, 250); // 250ms debounce
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [isHovering]); // Reduced dependencies

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100vh' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <div className="model-instructions">
        <p>
          To use a custom 3D model, download an energy drink can model from
          <a href="https://sketchfab.com/models/66b14410917743aea577b9c10d76e795" target="_blank" rel="noopener noreferrer">
            Sketchfab
          </a>
          and place it in the public/models folder as energy_drink_can.glb
        </p>
      </div>
    </div>
  );
};


export default DrinkCan3D;