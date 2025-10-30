import React from 'react'

function Universe({ image, details }) {
    return (
        <div className='container text-center p-5 mb-5 '>
            <div className='row'>
                <h1>The Zerodha Universe</h1>
                <p className=''>Extend your trading and investment experience even further with our partner platforms</p>
                <div className='col-4 p-3'>
                    <img src="media/images/smallcaseLogo.png" alt="universe" className='img-fluid' style={{ width: "70%" }} />
                    <p className=' text-muted text center' style={{ fontSize: "12px" }}>
                    
                    </p>
                </div>
                <div className='col-4 p-3'>
                    <img src="media/images/streakLogo.png" alt="universe" className='img-fluid' style={{ width: "50%" }} />
                    <p className=' text-muted text center' style={{ fontSize: "12px" }}>
                    
                    </p>
                </div>
                <div className='col-4 p-3'>
                    <img src="media/images/sensibullLogo.svg" alt="universe" className='img-fluid' style={{ width: "70%" }} />
                    <p className=' text-muted text center' style={{ fontSize: "12px" }}>
                    
                    </p>
                </div>
                <div className='col-4 p-3'>
                    <img src="media/images/zerodhaFundhouse.png" alt="universe" className='img-fluid' style={{ width: "70%" }} />
                    <p className=' text-muted text center' style={{ fontSize: "12px" }}>
                    
                    </p>
                </div>
                <div className='col-4 p-3'>
                    <img src="media/images/goldenpiLogo.png" alt="universe" className='img-fluid' style={{ width: "70%" }} />
                    <p className=' text-muted text center' style={{ fontSize: "12px" }}>
                    
                    </p>
                </div>
                <div className='col-4 p-3'>
                    <img src="media/images/dittoLogo.png" alt="universe" className='img-fluid' style={{ width: "40%" }} />
                    <p className=' text-muted text center' style={{ fontSize: "12px" }}>
                    
                    </p>
                </div>
                
            </div>
            <br/>
            <button className='p-2 btn btn-primary fs-5 mb-5' style={{width:"20%" , margin:"0 auto" }}>Sign up for Free</button>
        </div>
    );
}

export default Universe;