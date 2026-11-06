// frontend/src/landing_page/Navbar.js
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
    <nav className="navbar navbar-expand-lg border-bottom bg-white sticky-top" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="container py-2 px-3">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src="media/images/logo.svg"
            alt="Zerodha"
            style={{ width: "135px", height: "auto" }}
          />
        </Link>

        {/* Mobile Hamburger Toggle */}
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

        {/* Navigation Items */}
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center gap-2" style={{ whiteSpace: "nowrap" }}>
            {currentUser ? (
              <>
                <li className="nav-item">
                  <a
                    className="btn btn-sm fw-semibold text-white d-inline-flex align-items-center"
                    href={DASHBOARD_URL}
                    style={{
                      backgroundColor: "#387ed1",
                      borderRadius: "20px",
                      padding: "6px 16px",
                      fontSize: "0.85rem",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      boxShadow: "0 2px 6px rgba(56, 126, 209, 0.25)",
                    }}
                  >
                    Go to Dashboard &rarr;
                  </a>
                </li>
                <li className="nav-item px-1">
                  <span
                    className="fw-semibold"
                    style={{ color: "#1e293b", fontSize: "0.88rem", whiteSpace: "nowrap" }}
                  >
                    Hi, {currentUser.name}
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-outline-danger btn-sm"
                    style={{
                      padding: "4px 12px",
                      fontSize: "0.8rem",
                      borderRadius: "4px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link px-2"
                    to="/signup"
                    style={{ color: "#475569", fontWeight: 500, fontSize: "0.9rem", whiteSpace: "nowrap" }}
                  >
                    Signup
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link px-2"
                    to="/login"
                    style={{ color: "#387ed1", fontWeight: 600, fontSize: "0.9rem", whiteSpace: "nowrap" }}
                  >
                    Login
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <Link
                className="nav-link px-2"
                to="/about"
                style={{ color: "#475569", fontWeight: 500, fontSize: "0.9rem", whiteSpace: "nowrap" }}
              >
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link px-2"
                to="/products"
                style={{ color: "#475569", fontWeight: 500, fontSize: "0.9rem", whiteSpace: "nowrap" }}
              >
                Product
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link px-2"
                to="/pricing"
                style={{ color: "#475569", fontWeight: 500, fontSize: "0.9rem", whiteSpace: "nowrap" }}
              >
                Pricing
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link px-2"
                to="/support"
                style={{ color: "#475569", fontWeight: 500, fontSize: "0.9rem", whiteSpace: "nowrap" }}
              >
                Support
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
