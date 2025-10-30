import React from 'react'
function Awards() {
    return (
        <div className='container mt-5'>
            <div className='row  '>
                <div className='col-6 p-5'>
                    <img src='media/images/largestBroker.svg' alt='Award1' className='img-fluid mb-3' />
                </div>
                <div className='col-6 p-5 mt-5'>
                    <h1>Largest stock broker in India</h1>
                    <p className='mb-5'>2+ million zerodha clients contibute to over 15% of all  volumes in india dailt by training investing in : </p>
                    <div className='row'>
                        <div className='col-6'>
                            <ul>
                                <li><p>Futures and options</p> </li>
                                <li><p>Commodity derivatives</p> </li>
                                <li><p>Currency derivatives </p></li>
                            </ul>
                        </div>
                        <div className='col-6'>
                            <ul>
                                <li><p>stocks & IPOs</p> </li>
                                <li><p>Directmutual funds</p> </li>
                                <li><p>Bonds and Government Security</p></li>
                            </ul>
                        </div>
                    </div>
                    <img src='media/images/pressLogos.png' alt='pressLogo' className='img-fluid mt-3' style={{width:"90%"}} />
 
                </div>
            </div>
        </div>
    );
}

export default Awards;