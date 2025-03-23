import React, { useRef } from 'react'
import gsap from "gsap";
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';
import '../css/hscroll.css'
import '../css/drinkCan3D.css'
import Perks from './Perks.jsx';
import Details from './details.jsx';
import Footer from './Footer.jsx';
import Fourtwo from './fourtwo.jsx';
import p1 from '../assets/p3.png';
import p2 from '../assets/p6.png';
import p3 from '../assets/p5.png';
import p4 from '../assets/p9.png';
import LocomotiveScroll from 'locomotive-scroll';
import DrinkCan3D from './DrinkCanCarousel3D.jsx';
import banner from '../assets/p9.png';
import ProductDetails from './SimpleDetails.jsx';

function Home() {
  const locomotiveScroll = new LocomotiveScroll();
  const animate = useRef(null)

  gsap.registerPlugin(ScrollTrigger);
  useGSAP(() => {
    const section = gsap.utils.toArray('.page');

    gsap.to(section, {
      xPercent: -100 * (section.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: '.pages',
        pin: true,
        scrub: 1,
        end: '+=5000',
      },
    });
    gsap.to('.offertext', {
      x: '-300%',
      scrollTrigger: {
        trigger: '.offertext',

        scrub: 3,
      },
    });

    gsap.from('.offertext1', {
      x: '-300%',
      scrollTrigger: {
        trigger: '.offertext1',

        scrub: 3,
      },
    });

    // Weekly Offer Animation Timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.body',

        scrub: 9,
      },
    });

    tl.to('.weekly-offer img', {
      width: '60%',
      ease: 'none',
      duration: 3,
      
    });
    tl.to('.weekly-offer', {
      backgroundColor: '#ff7300',
      borderRadius: '3rem',
      ease: 'power2.inOut',
      duration: 4,
      pin: true,
    });

    tl.to('.weekly-offer img', {
      width: '40%',
      ease: 'power2.inOut',
      duration: 2,
    });


    tl.to('.weekly-offer', {
      scale: 0.8,

      borderRadius: '1rem',
      ease: 'power2.inOut',
      duration: 2,
    });
    tl.to('.weekly-offer', {
      scale: 0.8,
      borderRadius: '1rem',
      ease: 'power2.inOut',
      duration: 6,
    });

    gsap.to(animate.current, {
      scrollTrigger: {
        trigger: animate.current,
        start: "50px 80%",
        end: "100px 20%",
        scrub: 2,
      },
      y: "-=100",
      scale: 2.5,
      duration: 3,

    })


  });

  return (
    <>
      <div className="banner">
        <DrinkCan3D />
      </div>

      <div className="relative h-screen w-screen weekly-offer overflow-hidden">
        <div className="absolute translate-x-[-50%] translate-y-[-50%] top-1/2 left-1/2 text-center z-10">
          <div className="text-xl font-semibold my-5">Weekly Offer</div>
          <div className="text-6xl font-bold text-center mt-10 mb-10">
            GET OUR BRAND NEW FLAVOR iCEARA
          </div>
        </div>
        <img
          src={banner}
          alt=""
          className="absolute translate-x-[-50%] translate-y-[-50%] top-1/2 left-1/2 w-32"
        />
      </div>

        <div ref={animate} className="flex justify-center items-center relative" >
          <div className='scroll-anime text-white' >
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className='scroll-div'>
                <div>GIVE</div>
                <div className='size-20 bg-orange-600 rounded-full m-8'></div>
                <div>YOU</div>
                <div className='size-20 bg-orange-600 rounded-full m-8'></div>
                <div>ENERGY</div>
                <div className='size-20 bg-orange-600 rounded-full m-8'></div>
              </div>
            ))}
          </div>
        </div>



      <div className=''>
        <div className="text-banner bg-black relative -bottom-16 rotate-1 z-50 overflow-hidden">
          <div className="offertext flex border-2 border-white py-2">
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="whitespace-nowrap px-8">
                $ Get Discount Up TO 30% $
              </div>
            ))}
          </div>
        </div>

        <div className="text-banner bg-black relative -bottom-24 -rotate-1 z-50">
          <div className="offertext1 flex border-2 border-white py-2 text-left">
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="whitespace-nowrap px-8">
                $ Get Discount Up TO 30% $
              </div>
            ))}
          </div>
        </div>

        <div className="text-banner bg-black relative py-12 rotate-3 -top-4 -left-2 z-40">
          <div className="offertext1 flex border-2 border-white text-left">
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="whitespace-nowrap px-8">
                $ Get Discount Up TO 30% $
              </div>
            ))}
          </div>
        </div>

        <div className="text-banner bg-black relative -rotate-1 z-50 overflow-hidden -top-12">
          <div className="offertext flex border-2 border-white py-2">
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="whitespace-nowrap px-8">
                $ Get Discount Up TO 30% $
              </div>
            ))}
          </div>
        </div>
      </div>




      <div>
        <Details />
      </div>

      <div className=' '>
        <div className="text-banner bg-black relative -bottom-16 rotate-1 z-50 overflow-hidden">
          <div className="offertext flex border-2 border-white py-2">
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="whitespace-nowrap px-8">
                $ Get Discount Up TO 30% $
              </div>
            ))}
          </div>
        </div>

        <div className="text-banner bg-black relative -bottom-24 -rotate-1 z-50">
          <div className="offertext1 flex border-2 border-white py-2 text-left">
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="whitespace-nowrap px-8">
                $ Get Discount Up TO 30% $
              </div>
            ))}
          </div>
        </div>

        <div className="text-banner bg-black relative py-12 rotate-3 -top-4 -left-2 z-40">
          <div className="offertext1 flex border-2 border-white text-left">
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="whitespace-nowrap px-8">
                $ Get Discount Up TO 30% $
              </div>
            ))}
          </div>
        </div>

        <div className="text-banner bg-black relative -rotate-1 z-50 overflow-hidden -top-12">
          <div className="offertext flex border-2 border-white py-2">
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="whitespace-nowrap px-8">
                $ Get Discount Up TO 30% $
              </div>
            ))}
          </div>
        </div>
      </div>



      
      <div className="wrapper -top-20">
    <div className="pages">
      <Fourtwo pimg={p1} bghover="bg-orange-600 text-white" sidetext="OrangeTang Flavor" index={0} />
      <Fourtwo pimg={p2} bghover="bg-white text-black" sidetext="Lemon Flavor" index={1} />
      <Fourtwo pimg={p3} bghover="bg-red-700 text-white" sidetext="Pomegranate Flavor" index={2} />
      <Fourtwo pimg={p4} bghover="bg-pink-600 text-white" sidetext="Lychee Flavor" index={3} />
    </div>
  </div>

  <Perks />
  <Footer />


    </>
  );
}

export default Home;
