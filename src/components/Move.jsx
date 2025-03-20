import React from 'react'
import gsap from "gsap";
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';




function Move() {
  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger)

    gsap.to(".zo", {
      scrollTrigger: {
        trigger: ".zo",
     
        start: "100px 80%",
      end: "100px 20%",
        scrub: 2,
      },
      scale: 2.5,
      duration: 3,
  
    })
    

  })
  return (
    <>
<div className="zo">
      <div className="flex justify-center items-center mt-40" >
        <div className='scroll-anime text-white' >
          <div className='scroll-div'>
            <div>GIVE</div>
            <div className='size-20 bg-orange-600 rounded-full m-8'></div>
            <div>YOU</div>
            <div className='size-20 bg-orange-600 rounded-full m-8'></div>
            <div>ENERGY</div>
            <div className='size-20 bg-orange-600 rounded-full m-8'></div>
          </div>
          <div className='scroll-div'>
            <div>GIVE</div>
            <div className='size-20 bg-orange-600 rounded-full m-8'></div>
            <div>YOU</div>
            <div className='size-20 bg-orange-600 rounded-full m-8'></div>
            <div>ENERGY</div>
            <div className='size-20 bg-orange-600 rounded-full m-8'></div>
          </div>
          <div className='scroll-div'>
            <div>GIVE</div>
            <div className='size-20 bg-orange-600 rounded-full m-8'></div>
            <div>YOU</div>
            <div className='size-20 bg-orange-600 rounded-full m-8'></div>
            <div>ENERGY</div>
            <div className='size-20 bg-orange-600 rounded-full m-8'></div>
          </div>

        </div>
      </div>
      </div>
    </>
  )
}

export default Move