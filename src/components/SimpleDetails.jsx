import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

function SimpleModelViewer() {
  // Load model-viewer web component
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
    script.type = 'module';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <model-viewer
        src="/models/can4.glb"
        alt="3D Model"
        auto-rotate
        disable-zoom
        rotation-per-second="30deg"
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1"
        background-color="transparent"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent'
        }}
      ></model-viewer>
    </div>
  );
}

function ProductDetails() {
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const sectionRef = useRef(null);

  useGSAP(() => {
    ScrollTrigger.getAll().forEach(st => st.kill());

    const sectionTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => {
        initMarquees();
      },
      onEnterBack: () => {
        initMarquees();
      }
    });

    function initMarquees() {
      gsap.killTweensOf(topRef.current);
      gsap.killTweensOf(bottomRef.current);

      gsap.set(topRef.current, { xPercent: 0 });
      gsap.set(bottomRef.current, { xPercent: 0 });

      gsap.to(topRef.current, {
        xPercent: -50,
        ease: "none",
        duration: 70,
        repeat: -1
      });

      gsap.to(bottomRef.current, {
        xPercent: -50,
        ease: "none",
        duration: 70,
        repeat: -1
      });
    }

    if (ScrollTrigger.isInViewport(sectionRef.current)) {
      initMarquees();
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
      gsap.killTweensOf(topRef.current);
      gsap.killTweensOf(bottomRef.current);
    };
  }, []);

  const items = [
    '🥭 Mango', '🍓 Strawberry', '🍋 Citrus', '🍉 Watermelon', '🍊 Orange',
    '🍍 Pineapple', '🥥 Coconut', '🍇 Grape', '🫐 Blueberry', '🍒 Cherry'
  ];

  return (
    <div ref={sectionRef} className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2 h-[500px] relative bg-transparent">
            <SimpleModelViewer />
          </div>

          <div className="w-full lg:w-1/2 text-white space-y-6">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium">
              PRODUCT
            </div>
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

      <div className="py-16 overflow-hidden">
        <div className="relative">
          <div ref={topRef} className="whitespace-nowrap flex">
            {[...items, ...items].map((item, index) => (
              <div key={index} className="text-4xl font-bold px-8 text-white/80">
                {item}
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative mt-4">
          <div ref={bottomRef} className="whitespace-nowrap flex">
            {[...items.reverse(), ...items.reverse()].map((item, index) => (
              <div key={index} className="text-4xl font-bold px-8 text-white/80">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white mb-8">Product ProductDetails</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors duration-300">
            <div className="text-blue-300 text-xl font-medium mb-4">Ingredients</div>
            <ul className="text-white/70 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                Natural Caffeine
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                B Vitamins
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                Taurine
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                Natural Flavors
              </li>
            </ul>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors duration-300">
            <div className="text-purple-300 text-xl font-medium mb-4">Nutrition</div>
            <ul className="text-white/70 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-300 rounded-full"></span>
                80 Calories
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-300 rounded-full"></span>
                0g Fat
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-300 rounded-full"></span>
                20g Carbs
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-300 rounded-full"></span>
                0g Protein
              </li>
            </ul>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors duration-300">
            <div className="text-green-300 text-xl font-medium mb-4">Benefits</div>
            <ul className="text-white/70 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                Increased Energy
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                Enhanced Focus
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                Improved Performance
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                Quick Recovery
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 mt-8">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white/50">© 2023 Energy Plus Drinks</div>
            <div className="flex gap-6">
              <button className="text-white/50 hover:text-white transition-colors">Products</button>
              <button className="text-white/50 hover:text-white transition-colors">About</button>
              <button className="text-white/50 hover:text-white transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;