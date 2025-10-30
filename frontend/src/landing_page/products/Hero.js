import React from 'react'

function Hero() {
    return (
        <div className='container'>
            <div className='text-center p-3 mt-5 mb-5 border-bottom'>
                <h1 className='fs-2  '>Zerodha Products </h1>
                <h3 className='fs-5 text-muted mt-3'>Sleek, modern, and intuitive trading platforms</h3>
                <p className='mt-4 mb-5'>Check out our &nbsp; 
                   <a href="/" style={{textDecoration:"none"}}>investment offerings <i class='fa fa-long-arrow-right' aria-hidden="true"></i></a> </p>
                
            </div>
        </div>);
}

export default Hero;