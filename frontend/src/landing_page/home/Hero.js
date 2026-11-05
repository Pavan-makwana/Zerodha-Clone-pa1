import React from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <div className='container p-5 mb-5'> 
      <div className='row text-center'>
        <img src='media/images/homeHero.png' alt='Hero' className='img-fluid mb-5' />
        <h1 className='mt-5'>Invest in Everything</h1>
        <p>Online platform to invest in stocks, derivatives, mutual funds, ETFs, bonds, and more.</p>
        <Link 
          to="/signup" 
          className='p-2 btn btn-primary fs-5 mb-5' 
          style={{ width: "20%", minWidth: "180px", margin: "0 auto", textDecoration: "none" }}
        >
          Sign up for Free
        </Link>
      </div>
    </div>
  );
}

export default Hero;
