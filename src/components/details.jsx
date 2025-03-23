import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);



function ModelViewer() {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const requestRef = useRef(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene with transparent background
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      10, // field of view
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.4, 10);
    cameraRef.current = camera;

    // Create renderer with transparent background
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Use modern color space if available
    if (renderer.outputColorSpace !== undefined) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else {
      renderer.outputEncoding = THREE.sRGBEncoding;
    }

    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(-5, -5, -5);
    scene.add(pointLight);

    // Load 3D model
    const loader = new GLTFLoader();
    loader.load(
      '/models/can4.glb',
      (gltf) => {
        const model = gltf.scene;

        // Enhance materials
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Center and scale model
        model.scale.set(3.5, 3.5, 3.5);

        scene.add(model);
        modelRef.current = model;
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Track mouse movement
    const handleMouseMove = (event) => {
      mousePosition.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -((event.clientY / window.innerHeight) * 2 - 1)
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Target rotation values
    const targetRotation = { x: 0, y: 0 };

    // Animation loop
    const animate = () => {
      if (modelRef.current) {
        // Base rotation speed
        const baseRotationSpeed = 0.003;

        // Update target rotation based on mouse position
        targetRotation.y = mousePosition.current.x * 0.8; // Horizontal mouse movement affects Y rotation
        targetRotation.x = mousePosition.current.y * 0.5; // Vertical mouse movement affects X rotation

        // Apply smooth lerping to both axes with different sensitivity
        modelRef.current.rotation.y = THREE.MathUtils.lerp(
          modelRef.current.rotation.y,
          targetRotation.y,
          0.09 // Faster response on Y axis
        );

        modelRef.current.rotation.x = THREE.MathUtils.lerp(
          modelRef.current.rotation.x,
          targetRotation.x,
          0.06 // Slower response on X axis for more natural movement
        );

        // Add a subtle continuous rotation
        modelRef.current.rotation.y += baseRotationSpeed;
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);

      cancelAnimationFrame(requestRef.current);

      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }

      // Dispose of Three.js resources
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      if (modelRef.current) {
        scene.remove(modelRef.current);
        modelRef.current.traverse((child) => {
          if (child.isMesh) {
            child.geometry.dispose();
            if (child.material.dispose) {
              child.material.dispose();
            }
          }
        });
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ backgroundColor: 'transparent' }}
    ></div>
  );
}

function Details() {
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const sectionRef = useRef(null);

  const items = [
    ' Mango', ' Strawberry', ' Citrus', ' Watermelon', ' Orange',
    ' Pineapple', ' Coconut', ' Grape', ' Blueberry', ' Cherry'
  ];

  useGSAP(() => {
    gsap.set(sectionRef.current, {
      scale: 0.5,
      y: 200,
  
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 90%", // Start animation when the top of the section is 80% from the top of viewport
        end: "top 30%",
        scrub: 1, // Smooth scrubbing effect
      }
    });

    // Add animation to timeline for the entire section
    tl.to(sectionRef.current, {
      scale: 1,
      y: 0,
  
      duration: 1,
      ease: "power2.out"
    });

  }, { scope: sectionRef });

  return (
    <div ref={sectionRef} className="min-h-fit w-10/12 mx-auto shadow-2xl rounded-3xl bg-orange-500 overflow-hidden flex flex-col">
 
      <div className=" mx-auto px-4 py-16 flex-grow">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2 h-[500px] relative bg-transparent">
            <ModelViewer />
          </div>

          <div className="w-full lg:w-1/2 text-white space-y-6 relative">
            <h1 className="text-4xl md:text-5xl font-bold">Energy Drink</h1>
            <p className="text-white/80 text-lg">
              Our premium energy drink provides the boost you need with a refreshing taste.
              Available in multiple flavors to suit your preference.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="text-blue-300 text-xl font-medium mb-2">Natural</div>
                <p className="text-white/70">Made with natural ingredients and flavors</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="text-purple-300 text-xl font-medium mb-2">Energy</div>
                <p className="text-white/70">Provides sustained energy without crashes</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="text-green-300 text-xl font-medium mb-2">Vitamins</div>
                <p className="text-white/70">Enhanced with essential vitamins and minerals</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="text-yellow-300 text-xl font-medium mb-2">Taste</div>
                <p className="text-white/70">Delicious flavors that refresh and energize</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-full transition-all duration-300 hover:bg-white/20 border border-white/20">
                Buy Now
              </button>
              <button className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full transition-all duration-300 border border-white/10">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

  
    </div>
  );
}

export default Details;
