import React from "react";
import { Link } from "react-router-dom";

function Stats() {
  return (
    <div className="container p-3">
      <div className="row p-5">
        <div className="col-6 p-5">
          <h1 className="fs-2 mb-5">Trust with confidence</h1>
          <h3 className="fs-4">Customer-first always</h3>
          <p className="text-muted">
            That's why 1.6+ crore customers trust Zerodha with ~ ₹6 lakh crores
            of equity investments, making us India’s largest broker;
            contributing to 15% of daily retail exchange volumes in India.
          </p>

          <h3 className="fs-4">No spam or gimmicks</h3>
          <p className="text-muted">
            No gimmicks, spam, "gamification", or annoying push notifications.
            High quality apps that you use at your pace, the way you like.
          </p>

          <h3 className="fs-4">The Zerodha universe</h3>
          <p className="text-muted">
            Not just an app, but a whole ecosystem. Our investments in 30+
            fintech startups offer you tailored services specific to your needs.
          </p>

          <h3 className="fs-4">Do better with money</h3>
          <p className="text-muted">
            With initiatives like Nudge and Kill Switch, we don't just
            facilitate transactions, but actively help you do better with your
            money.
          </p>
        </div>
        <div className="col-6 p-5">
          <img
            src="media/images/ecosystem.png"
            alt="ecosystem"
            className="img-fluid"
            style={{ width: "90%" }}
          />
          <div className="text-center mt-4">
            <Link to="/products" className="mx-4 text-decoration-none">
              Explore our products&nbsp;<i className="fa fa-long-arrow-right" aria-hidden="true"></i>
            </Link>
            <a href="https://kite-demo.zerodha.com" target="_blank" rel="noopener noreferrer" className="mx-4 text-decoration-none">
              Try Kite Demo&nbsp;<i className="fa fa-long-arrow-right" aria-hidden="true"></i>
            </a>
          </div> 
        </div>
      </div>
    </div>
  );
}

export default Stats;
