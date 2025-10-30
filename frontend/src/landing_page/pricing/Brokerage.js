import React from 'react'

function Brokerage() {
    return (
        <div className='container p-5 mb-5 border-top'>
            <div className='row text-center mb-4'>
                <div className='col-8 p-4'>
                    <a href='/'  style={{textDecoration:"none"}}><h3 className='fs-4'>Brokerage calculator</h3></a>
                    <ul className='text-start' style={{ listStyleType: "disc" ,lineHeight:"1.9" }}>
                        <li className='fs-6 text-muted'>Call & Trade and RMS auto-squareoff: Additional charges of 50+ GST per order.</li>
                        <li className='fs-6 text-muted'>Digital contract notes will be sent via e-mail.</li>
                        <li className='fs-6 text-muted'>Physical copies of contract notes, if required, shall be charged 220 per contract note. Courier charges apply.</li>
                        <li className='fs-6 text-muted'>For NRI account (non-PIS), 0.5% or ₹100 per executed order for equity (whichever is lower).</li>
                        <li className='fs-6 text-muted'>For NRI account (PIS), 0.5% or ₹200 per executed order for equity (whichever is lower).</li>
                        <li className='fs-6 text-muted'>If the account is in debit balance, any order placed will be charged 240 per executed order instead of ₹20 per executed order</li>
                    </ul>
                </div>
                <div className='col-4 p-4'>
                    <a href='/' style={{textDecoration:"none"}}><h3 className='fs-4'>List of charges</h3></a>

                </div>
            </div>
        </div>
    );
}

export default Brokerage;