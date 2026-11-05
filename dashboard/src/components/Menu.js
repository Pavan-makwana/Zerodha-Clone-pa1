import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || "https://zerodha-clone-frontend-pa1.vercel.app";

const Menu = () => {
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState({ name: "User", email: "" });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error reading stored user:", e);
    }
  }, []);

  const handleMenuClick = (index) => {
    setSelectedMenu(index);
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      localStorage.removeItem("user");
      window.location.href = `${FRONTEND_URL}/login`;
    }
  };

  const menuClass = "menu";
  const activeMenuClass = "menu selected";

  const initials = user.name ? user.name.slice(0, 2).toUpperCase() : "ZU";

  return (
    <div className="menu-container" style={{ position: "relative" }}>
      <img src="logo.png" style={{ width: "40px" }} alt="Zerodha Kite Logo" />
      <div className="menus">
        <ul>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/"
              onClick={() => handleMenuClick(0)}
            >
              <p className={selectedMenu === 0 ? activeMenuClass : menuClass}>
                Dashboard
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/orders"
              onClick={() => handleMenuClick(1)}
            >
              <p className={selectedMenu === 1 ? activeMenuClass : menuClass}>
                Orders
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/holdings"
              onClick={() => handleMenuClick(2)}
            >
              <p className={selectedMenu === 2 ? activeMenuClass : menuClass}>
                Holdings
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/positions"
              onClick={() => handleMenuClick(3)}
            >
              <p className={selectedMenu === 3 ? activeMenuClass : menuClass}>
                Positions
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/funds"
              onClick={() => handleMenuClick(4)}
            >
              <p className={selectedMenu === 4 ? activeMenuClass : menuClass}>
                Funds
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/apps"
              onClick={() => handleMenuClick(5)}
            >
              <p className={selectedMenu === 5 ? activeMenuClass : menuClass}>
                Apps
              </p>
            </Link>
          </li>
        </ul>
        <hr />
        <div className="profile" onClick={handleProfileClick} style={{ cursor: "pointer", position: "relative" }}>
          <div className="avatar">{initials}</div>
          <p className="username">{user.name || "USERID"}</p>
        </div>

        {isProfileDropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "50px",
              right: "20px",
              backgroundColor: "#fff",
              borderRadius: "4px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
              border: "1px solid #e0e0e0",
              minWidth: "200px",
              zIndex: 9999,
              padding: "10px 0",
            }}
          >
            <div style={{ padding: "8px 16px", borderBottom: "1px solid #eee" }}>
              <div style={{ fontWeight: 600, fontSize: "14px" }}>{user.name}</div>
              {user.email && (
                <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                  {user.email}
                </div>
              )}
            </div>
            <Link
              to="/"
              style={{
                display: "block",
                padding: "8px 16px",
                fontSize: "13px",
                color: "#333",
                textDecoration: "none",
              }}
              onClick={() => setIsProfileDropdownOpen(false)}
            >
              My Profile
            </Link>
            <Link
              to="/funds"
              style={{
                display: "block",
                padding: "8px 16px",
                fontSize: "13px",
                color: "#333",
                textDecoration: "none",
              }}
              onClick={() => setIsProfileDropdownOpen(false)}
            >
              Funds & Margin
            </Link>
            <hr style={{ margin: "5px 0", borderColor: "#eee" }} />
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 16px",
                fontSize: "13px",
                color: "#d9534f",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
