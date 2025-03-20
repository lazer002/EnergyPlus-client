import React from 'react'
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
import Move from './Move.jsx';
import LocomotiveScroll from 'locomotive-scroll';
import DrinkCan3D from './DrinkCanCarousel3D.jsx';
import banner from '../assets/p9.png';
import ProductDetails from './SimpleDetails.jsx';

function Home() {
  const locomotiveScroll = new LocomotiveScroll();

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
      transform: 'translateX(-300%)',
      scrollTrigger: {
        trigger: 'offertext',
        scrub: 3,
      },
    });

    gsap.from('.offertext1', {
      transform: 'translateX(-300%)',
      scrollTrigger: {
        trigger: 'offertext1',
        scrub: 3,
      },
    });

    // Weekly Offer Animation Timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.weekly-offer',
        start: 'top top',
        end: '+=400%',
        scrub: 9,
        pin: true,
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
      duration: 2,
    });

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

      <div className="">
  
     <Move />
     </div>

      <div className=" bg-red-700">
        <Details />
     
      </div>
    </>
  );
}

export default Home;
