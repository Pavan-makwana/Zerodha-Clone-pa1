// dashboard/src/components/Menu.js

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || "https://zerodha-clone-frontend-pa1.vercel.app";

const Menu = () => {
  const location = useLocation();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState({ name: "Pavan Makwana", email: "pa10506@zerodha.com" });
  const [availableFunds, setAvailableFunds] = useState(100000.0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 1. Fetch current authenticated user profile
    axios
      .get(`${API_BASE_URL}/api/auth/me`, { withCredentials: true, headers })
      .then((res) => {
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      })
      .catch(() => {
        try {
          const stored = localStorage.getItem("user");
          if (stored) {
            setUser(JSON.parse(stored));
          }
        } catch (e) {}
      });

    // 2. Fetch available funds
    axios
      .get(`${API_BASE_URL}/funds`, { withCredentials: true, headers })
      .then((res) => {
        if (res.data?.availableMargin !== undefined) {
          setAvailableFunds(res.data.availableMargin);
        }
      })
      .catch(() => {});

    // Listen to order placement events to keep margin in sync
    const handleOrderSync = (e) => {
      if (e.detail?.updatedMargin !== undefined) {
        setAvailableFunds(e.detail.updatedMargin);
      }
    };
    window.addEventListener("kite:order-placed", handleOrderSync);
    return () => window.removeEventListener("kite:order-placed", handleOrderSync);
  }, []);

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
      localStorage.removeItem("token");
      window.location.href = `${FRONTEND_URL}/login`;
    }
  };

  // Compute initials e.g. "Pavan Makwana" -> "PM"
  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "PM";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const clientId = user.id || user._id ? String(user.id || user._id).substring(0, 7).toUpperCase() : "PA10506";
  const userInitials = getInitials(user.name);

  // Active tab check
  const path = location.pathname;
  const isTabActive = (route) => {
    if (route === "/" && path === "/") return true;
    if (route !== "/" && path.startsWith(route)) return true;
    return false;
  };

  const navLinks = [
    { label: "Dashboard", to: "/" },
    { label: "Orders", to: "/orders" },
    { label: "Holdings", to: "/holdings" },
    { label: "Positions", to: "/positions" },
    { label: "Funds", to: "/funds" },
    { label: "Apps", to: "/apps" },
  ];

  return (
    <div className="menu-container" style={{ position: "relative" }}>
      <Link to="/" style={{ display: "flex", alignItems: "center" }}>
        <img src="logo.png" style={{ width: "38px", height: "auto" }} alt="Zerodha Kite Logo" />
      </Link>

      <div className="menus">
        <ul>
          {navLinks.map((item) => {
            const active = isTabActive(item.to);
            return (
              <li key={item.to}>
                <Link style={{ textDecoration: "none" }} to={item.to}>
                  <p className={`menu ${active ? "selected" : ""}`}>
                    {item.label}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>

        <hr />

        {/* User Account / Profile Button */}
        <div
          className="profile"
          onClick={handleProfileClick}
          style={{ cursor: "pointer", position: "relative" }}
          title="Account & Settings"
        >
          <div className="avatar" style={{ background: "#e8f2fc", color: "#387ed1", fontWeight: 700 }}>
            {userInitials}
          </div>
          <p className="username" style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.85rem" }}>
            {clientId}
          </p>
        </div>

        {/* Rich Kite Profile & Account Dropdown */}
        {isProfileDropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "54px",
              right: "20px",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.06)",
              border: "1px solid #e2e8f0",
              minWidth: "260px",
              zIndex: 99999,
              overflow: "hidden",
              animation: "fadeIn 0.2s ease",
            }}
          >
            {/* User Profile Header */}
            <div style={{ padding: "16px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#387ed1",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "14px"
                }}>
                  {userInitials}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b" }}>
                    {user.name || "Pavan Makwana"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    {user.email || "pa10506@zerodha.com"}
                  </div>
                </div>
              </div>

              {/* Account Balance Pill */}
              <div style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                padding: "8px 12px",
                borderRadius: "6px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "12px",
              }}>
                <span style={{ color: "#64748b" }}>Cash Margin:</span>
                <strong style={{ color: "#00a25b" }}>
                  ₹{availableFunds.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            {/* Menu Links */}
            <div style={{ padding: "6px 0" }}>
              <Link
                to="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 18px",
                  fontSize: "13px",
                  color: "#334155",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
                onClick={() => setIsProfileDropdownOpen(false)}
              >
                <span>👤</span> My Profile
              </Link>

              <Link
                to="/funds"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 18px",
                  fontSize: "13px",
                  color: "#334155",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
                onClick={() => setIsProfileDropdownOpen(false)}
              >
                <span>💳</span> Funds & Margin
              </Link>

              <Link
                to="/orders"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 18px",
                  fontSize: "13px",
                  color: "#334155",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
                onClick={() => setIsProfileDropdownOpen(false)}
              >
                <span>📜</span> Order Book & Trades
              </Link>

              <Link
                to="/holdings"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 18px",
                  fontSize: "13px",
                  color: "#334155",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
                onClick={() => setIsProfileDropdownOpen(false)}
              >
                <span>📈</span> Portfolio & Holdings
              </Link>

              <hr style={{ margin: "6px 0", borderColor: "#f1f5f9" }} />

              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 18px",
                  fontSize: "13px",
                  color: "#df514c",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>🚪</span> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
