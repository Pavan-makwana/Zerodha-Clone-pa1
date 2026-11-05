import React from 'react';
import { Link } from 'react-router-dom';

function Universe() {
  return (
    <div className='container text-center p-5 mb-5'>
      <div className='row'>
        <h1>The Zerodha Universe</h1>
        <p className='text-muted mb-5'>Extend your trading and investment experience even further with our partner platforms</p>
        
        <div className='col-4 p-3'>
          <img src="media/images/smallcaseLogo.png" alt="smallcase" className='img-fluid' style={{ width: "65%" }} />
          <p className='text-muted mt-3' style={{ fontSize: "13px" }}>
            Thematic investing platform that helps you invest in diversified baskets of stocks on ETFs.
          </p>
        </div>
        <div className='col-4 p-3'>
          <img src="media/images/streakLogo.png" alt="streak" className='img-fluid' style={{ width: "50%" }} />
          <p className='text-muted mt-3' style={{ fontSize: "13px" }}>
            Systematic trading platform that allows you to create and backtest strategies without coding.
          </p>
        </div>
        <div className='col-4 p-3'>
          <img src="media/images/sensibullLogo.svg" alt="sensibull" className='img-fluid' style={{ width: "65%" }} />
          <p className='text-muted mt-3' style={{ fontSize: "13px" }}>
            Options trading platform that lets you create strategies, analyze positions, and examine data.
          </p>
        </div>
        <div className='col-4 p-3'>
          <img src="media/images/zerodhaFundhouse.png" alt="zerodha fundhouse" className='img-fluid' style={{ width: "65%" }} />
          <p className='text-muted mt-3' style={{ fontSize: "13px" }}>
            Our asset management venture that creates simple and transparent index funds to help you save for your goals.
          </p>
        </div>
        <div className='col-4 p-3'>
          <img src="media/images/goldenpiLogo.png" alt="goldenpi" className='img-fluid' style={{ width: "65%" }} />
          <p className='text-muted mt-3' style={{ fontSize: "13px" }}>
            Bonds trading platform to invest in high-yielding government, corporate, and PSU bonds.
          </p>
        </div>
        <div className='col-4 p-3'>
          <img src="media/images/dittoLogo.png" alt="ditto" className='img-fluid' style={{ width: "40%" }} />
          <p className='text-muted mt-3' style={{ fontSize: "13px" }}>
            Personalized advice on life and health insurance. No spam and no mis-selling.
          </p>
        </div>
      </div>
      <br />
      <Link 
        to="/signup" 
        className='p-2 btn btn-primary fs-5 mb-5' 
        style={{ width: "20%", minWidth: "180px", margin: "0 auto", textDecoration: "none" }}
      >
        Sign up for Free
      </Link>
    </div>
  );
}

export default Universe;
