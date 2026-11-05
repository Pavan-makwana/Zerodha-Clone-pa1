import React from 'react';

function CreateTicket() {
  return (
    <div className='container mt-5'>
      <div className='row p-5 mt-5 mb-5'>
        <h1 className='fs-2'>To create a ticket, select a relevant topic</h1>

        <div className='col-md-4 mb-2 mt-2 p-4'>
          <h4 className='mb-4'>
            <i className="fa fa-plus-circle" aria-hidden="true"></i>&nbsp;Account Opening
          </h4>
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Online Account Opening</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Offline Account Opening</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Company, Partnership and HUF Account</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>NRI Account Opening</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Charges at Zerodha</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Zerodha IDFC FIRST Bank 3-in-1 Account</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Getting started</a><br />
        </div>

        <div className='col-md-4 mb-2 mt-2 p-4'>
          <h4 className='mb-4'>
            <i className="fa fa-user-o" aria-hidden="true"></i>&nbsp;Your Zerodha Account
          </h4>
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Login Credentials</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Account Modification and Segment Addition</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>DP ID and bank details</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Your Profile</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Transfer and conversion of shares</a><br />
        </div>

        <div className='col-md-4 mb-2 mt-2 p-4'>
          <h4 className='mb-4'>
            <i className="fa fa-bar-chart" aria-hidden="true"></i>&nbsp;Trading & Platforms
          </h4>
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Margin/average, Product and Order types</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Kite Web and Mobile</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Trading FAQs</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Corporate Actions</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Sentinel</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Kite Connect API</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Stockreports+</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>GTT+ Orders</a><br />
        </div>

        <div className='col-md-4 mb-2 mt-2 p-4'>
          <h4 className='mb-4'>
            <i className="fa fa-credit-card-alt" aria-hidden="true"></i>&nbsp;Funds
          </h4>
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Adding Funds</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Fund Withdrawal</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>eMandates</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Adding Bank Accounts</a><br />
        </div>

        <div className='col-md-4 mb-2 mt-2 p-4'>
          <h4 className='mb-4'>
            <i className="fa fa-circle-o-notch" aria-hidden="true"></i>&nbsp;Console
          </h4>
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Reports & Tax P&L</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Ledger</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Portfolio Analytics</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>60 Days Challenge</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>IPO Applications</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Referral Program</a><br />
        </div>

        <div className='col-md-4 mb-2 mt-2 p-4'>
          <h4 className='mb-4'>
            <i className="fa fa-circle-thin" aria-hidden="true"></i>&nbsp;Coin & Mutual Funds
          </h4>
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>About Coin</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Buying and Selling through Coin</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Starting an SIP</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Managing your Portfolio</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Coin Mobile App</a><br />
          <a href="/support" style={{ textDecoration: "none", lineHeight: "2.5" }}>Government Securities</a><br />
        </div>
      </div>
    </div>
  );
}

export default CreateTicket;
