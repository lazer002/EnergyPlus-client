import React,{useEffect} from 'react'

import gsap from "gsap";
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';
import p1 from '../assets/p3.png'
import Fourtwo from './fourtwo';

function Contect() {

  gsap.registerPlugin(ScrollTrigger)
    useGSAP(() => {
// const section = gsap.utils.toArray('.page')
// gsap.to(section,{
//         xPercent: -100 * (section.length - 1),
//         ease:'none',
//         scrollTrigger:{
//             trigger:'.pages',
//             pin:true,
//             scrub:1,
//             end:'+=6000'
//         }
// })

gsap.to('.offertext',{
  x:'-300%',
  scrollTrigger:{
    trigger:'.body',
    scrub:2
  }
})



}); 
 

  return (
    <>

{/* <div className="h100">ofwafwafwafne</div>
<div className="wrapper">      

<div className="pages">
        <div className="page "><Fourtwo pimg={p1} pname='ORANGEDRINK' bghover='bg-orange-600'/></div>
        <div className="page "><Fourtwo pimg={p1} pname='ORANGEDRINK' bghover='bg-orange-600'/></div>
        <div className="page "><Fourtwo pimg={p1} pname='ORANGEDRINK' bghover='bg-orange-600'/></div>
        <div className="page "><Fourtwo pimg={p1} pname='ORANGEDRINK' bghover='bg-orange-600'/></div>
        <div className="page "><Fourtwo pimg={p1} pname='ORANGEDRINK' bghover='bg-orange-600'/></div>
        <div className="page "><Fourtwo pimg={p1} pname='ORANGEDRINK' bghover='bg-orange-600'/></div>

      </div>
      </div>
      <div className="h100">ofwafawfawfane</div> */}






<div className="h-screen w-screen relative bg-red-400"> lala</div>
<div className="h-screen w-screen relative bg-green-400"> lala</div>
<div className="h-screen w-screen relative bg-red-400"> lala</div>
<div className="h-screen w-screen relative bg-green-400"> lala</div>

<div >
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

  <div className="h-screen w-screen relative bg-green-400"> lala</div>
  <div className="h-screen w-screen relative bg-green-400"> lala</div>


</>
  );

}

export default Contect