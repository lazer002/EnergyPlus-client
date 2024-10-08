import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../css/nav.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleMenu() {
    setIsOpen(!isOpen);
  }

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <div className="">

        <div className='my-3 fixed right-10 top-5 z-30'>
          { !isOpen && (
            <span className='text-2xl' onClick={toggleMenu}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 cursor-pointer opacity-100">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5 " />
              </svg>
            </span>
          )}
        </div>

        {/* <div className='text-2xl py-3'>Logo</div>
        <div className='text-2xl py-3'>
          <span className='mx-4'>cart</span>
          <span>user</span>
        </div> */}
        
        <div className={`bg-2 pl-5 ${isOpen ? 'flex' : 'hidden'} transition-all ease-in duration-700 bg-slate-200 navtbs`} >
          <div className='m-4 hover:text-orange-600 hover:scale-125 hover:left-32'><NavLink to="/" onClick={closeMenu}>Home</NavLink></div>
          <div className='m-4 hover:text-orange-600  hover:scale-125'><NavLink to="/Product" onClick={closeMenu}>Product</NavLink></div>
          <div className='m-4 hover:text-orange-600  hover:scale-125'><NavLink to="/About" onClick={closeMenu}>About</NavLink></div>
          <div className='m-4 hover:text-orange-600  hover:scale-125'><NavLink to="/Contact" onClick={closeMenu}>Contact</NavLink></div>
          <div className='m-4 hover:text-orange-600  hover:scale-125'><NavLink to="/Signup" onClick={closeMenu}>Signup</NavLink></div>
          <span className='text-2xl absolute right-28 top-11' onClick={toggleMenu}> X </span>
        </div>

    </div>
  );
}

export default Navbar;
