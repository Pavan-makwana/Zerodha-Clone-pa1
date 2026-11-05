import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DASHBOARD_URL = process.env.REACT_APP_DASHBOARD_URL || "https://zerodha-clone-dashboard-pa1.vercel.app/";

function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setCurrentUser(null);
    window.location.href = "/login";
  };

  return (
    <nav className="navbar navbar-expand-lg border-bottom bg-body-tertiary" style={{ backgroundColor: "#FFF" }}>
      <div className="container p-2 fs-6">
        <Link className="navbar-brand" to="/">
          <img src='media/images/logo.svg' alt='Logo' style={{ width: "30%" }} />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <form className="d-flex ms-auto" role="search" onSubmit={(e) => e.preventDefault()}>
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
              {currentUser ? (
                <>
                  <li className="nav-item">
                    <a className="nav-link text-primary fw-semibold" href={DASHBOARD_URL}>
                      Go to Dashboard →
                    </a>
                  </li>
                  <li className="nav-item">
                    <span className="nav-link text-muted">Hi, {currentUser.name}</span>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="btn btn-outline-danger btn-sm ms-2"
                      style={{ padding: "3px 10px", fontSize: "12px" }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link text-muted" to="/signup">Signup</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-muted" to="/login">Login</Link>
                  </li>
                </>
              )}
              <li className="nav-item">
                <Link className="nav-link text-muted" to="/about">About</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-muted" to="/products">Product</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-muted" to="/pricing">Pricing</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-muted" to="/support">Support</Link>
              </li>
            </ul>
          </form>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
