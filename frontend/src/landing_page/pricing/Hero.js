
function Hero() {
    return (
        <div className='container '>
            <div className='row mb-5  mt-5 '>
                <h1 className='text-center '>Pricing </h1>
                <h2 className='text-center text-muted fs-4 mb-5'>List of all charges and taxes </h2>
            </div>

            <div className='row text-center '>
                <div className='col-4 text-center p-3'>
                    <img src='media/images/pricing0.svg' alt='pricing' style={{ width: "70%" }} />
                    <h1 className='fs-3 mb-3'>
                        Free Equity delivery
                    </h1>
                    <p className='fs-6 text-muted'>All equity delivery investments (NSE, BSE), are absolutely free — ₹ 0 brokerage.</p>
                </div>
                <div className='col-4 text-center p-3'>
                    <img src='media/images/intradayTrades.svg' alt='pricing' style={{ width: "70%" }} />
                    <h1 className='fs-3 mb-3'>
                        Intraday and F&O trades
                    </h1>
                    <p className='fs-6 text-muted'>Flat ₹ 20 or 0.03% (whichever is lower) per executed order on intraday trades across equity, currency, and commodity trades. Flat ₹20 on all option trades.</p>
                </div>
                <div className='col-4 text-center p-3'>
                    <img src='media/images/pricing0.svg' alt='pricing' style={{ width: "70%" }} />
                    <h1 className='fs-3 mb-3'>
                        Free direct MF
                    </h1>
                    <p className='fs-6 text-muted'>All direct mutual fund investments are absolutely free — ₹ 0 commissions & DP charges.</p>
                </div>

            </div>
        </div>
    );
}

export default Hero;