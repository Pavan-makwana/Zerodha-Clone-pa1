import React from "react";

function Team() {
  return (
    <div className="container">
      <div className="row p-5 ">
        <h1 className="fs-3 text-center">People</h1>
      </div>

      <div className="row p-5 justify-content-center align-items-center">
        <div className="col-md-4 p-3 d-flex flex-column align-items-center">
          <img
            src="media/images/nithinKamath.jpg"
            alt="Nithin Kamath"
            style={{ width: "60%", borderRadius: "100%" }}
          />
          <h5 className="mt-4">Nithin Kamath</h5>
          <p className="text-grey">Founder, CEO</p>
        </div>
        <div
          className="col-md-6 p-3 text-muted"
          style={{ lineHeight: "2", fontSize: "16px" }}
        >
          <p>
            Nithin bootstrapped and founded Zerodha in 2010 to overcome the
            hurdles he faced during his decade long stint as a trader. Today,
            Zerodha has changed the landscape of the Indian broking industry.
          </p>
          <p>
            He is a member of the SEBI Secondary Market Advisory Committee
            (SMAC) and the Market Data Advisory Committee (MDAC).
          </p>
          <p>Playing basketball is his zen.</p>
          <p>
            Connect on &nbsp;
            <a href="*" style={{ textDecoration: "none" }}>
              Homepage/
            </a>
            <a href="*" style={{ textDecoration: "none" }}>
              TradingQnA/
            </a>
            <a href="*" style={{ textDecoration: "none" }}>
              Twitter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Team;
