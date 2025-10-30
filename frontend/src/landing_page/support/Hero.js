import React from "react";

function Hero() {
    

    return (
        <section className="container-fluid" id="support-hero" style={{
            backgroundColor: 'rgb(56, 126, 209)',
        }}>

            <div className="d-flex justify-content-between align-items-center py-4 px-md-5 px-3 border-bottom border-primary-light">
                <h4 className="mb-0 fs-5 fw-bold text-white">Support Portal</h4>
                <a
                    href="#track"
                    className=""
                >
                    Track Tickets &rarr;
                </a>
            </div>

            {/* Main Content Row */}
            <div className="row p-3 p-md-5 mx-0 mx-md-5">

                {/* Left Column: Search & Quick Links */}
                <div className="col-lg-7 col-12 p-3">
                    <h1 className="fs-3 fw-light mb-4">
                        Search for an answer or browse help topics to create a ticket
                    </h1>

                    {/* Search Input */}
                    <div className="input-group mb-4">
                        <input
                            type="text"
                            className="form-control form-control-lg rounded shadow"
                            placeholder="Eg. how do I activate F&O, why is my order rejected..."
                            aria-label="Search support topics"
                        />
                    </div>

                    {/* Quick Links */}
                    <div className="d-flex flex-wrap gap-3">
                        <a href="#account" className="text-white text-opacity-75 small fw-semibold text-decoration-underline hover-text-warning">
                            Track Account opening
                        </a>
                        <span className="text-white text-opacity-50">|</span>
                        <a href="#segment" className="text-white text-opacity-75 small fw-semibold text-decoration-underline hover-text-warning">
                            Track segment activation
                        </a>
                        <span className="text-white text-opacity-50">|</span>
                        <a href="#margins" className="text-white text-opacity-75 small fw-semibold text-decoration-underline hover-text-warning">
                            Intraday Margins
                        </a>
                        <span className="text-white text-opacity-50">|</span>
                        <a href="#manual" className="text-white text-opacity-75 small fw-semibold text-decoration-underline hover-text-warning">
                            Kite user manual
                        </a>
                    </div>
                </div>

                {/* Right Column: Featured Topics */}
                <div className="col-lg-5 col-12 p-3 mt-4 mt-lg-0 border-start-lg">
                    <h1 className="fs-4 fw-bold mb-3 border-bottom border-light pb-2">Featured</h1>
                    <ol className="list-unstyled space-y-3">
                        <li className="mb-2">
                            <a href="#takeovers" className="text-white text-opacity-75 hover-text-warning">
                                1. Current Takeovers and Delisting - January 2024
                            </a>
                        </li>
                        <li className="mb-2">
                            <a href="#leverages" className="text-white text-opacity-75 hover-text-warning">
                                2. Latest Intraday leverages - MIS & CO
                            </a>
                        </li>

                    </ol>
                </div>
            </div>
        </section>
    );
}

export default Hero;
