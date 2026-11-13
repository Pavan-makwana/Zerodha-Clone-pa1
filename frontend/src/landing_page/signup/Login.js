// frontend/src/landing_page/signup/Login.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";
const DASHBOARD_URL = process.env.REACT_APP_DASHBOARD_URL || "https://zerodha-clone-dashboard-pa1.vercel.app/";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.name || parsed.email)) {
          setLoggedInUser(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleDirectLogin = async (email, password) => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    setFormData({ email, password });

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        setSuccessMsg(`Welcome, ${data.user?.name || "Trader"}! Redirecting to Dashboard...`);
        setTimeout(() => {
          window.location.href = DASHBOARD_URL;
        }, 500);
      } else {
        const errorMsg = data.message || "Login failed";
        setError(errorMsg);
      }
    } catch (error) {
      console.error("Error during login:", error);
      const errorMsg = "Something went wrong! Please check backend or network connection.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleDirectLogin(formData.email, formData.password);
  };

  const handleSwitchAccount = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setLoggedInUser(null);
    setFormData({ email: "", password: "" });
  };

  return (
    <div
      style={{
        maxWidth: "460px",
        margin: "50px auto 70px",
        padding: "32px 28px",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        backgroundColor: "#ffffff",
        border: "1px solid #eef2f6",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* CASE 1: USER IS ALREADY LOGGED IN */}
      {loggedInUser ? (
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#e6f7ed",
            color: "#00a25b",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "0.8rem",
            fontWeight: 700,
            marginBottom: "16px",
          }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00a25b" }}></span>
            Active Session Detected
          </div>

          <h2 style={{ fontSize: "1.45rem", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
            Welcome back, {loggedInUser.name}!
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "20px" }}>
            You are already logged into Zerodha Kite as <strong>{loggedInUser.email}</strong>.
          </p>

          <a
            href={DASHBOARD_URL}
            style={{
              display: "block",
              width: "100%",
              padding: "12px",
              backgroundColor: "#387ed1",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontWeight: 700,
              fontSize: "0.95rem",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(56, 126, 209, 0.3)",
              marginBottom: "14px",
              boxSizing: "border-box",
            }}
          >
            Go to Kite Trading Dashboard &rarr;
          </a>

          <button
            type="button"
            onClick={handleSwitchAccount}
            style={{
              background: "transparent",
              border: "none",
              color: "#64748b",
              fontSize: "0.85rem",
              cursor: "pointer",
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            Switch Account / Login with different credentials
          </button>
        </div>
      ) : (
        /* CASE 2: USER NOT LOGGED IN */
        <div>
          <h2 style={{ textAlign: "center", marginBottom: "6px", fontWeight: 700, color: "#0f172a", fontSize: "1.5rem" }}>
            Login to Kite
          </h2>
          <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.85rem", marginBottom: "22px" }}>
            Enter your Zerodha credentials to access your trading portal
          </p>

          {/* ONE-CLICK DEMO LOGIN BUTTONS */}
          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "14px",
            marginBottom: "20px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", display: "inline-flex", alignItems: "center" }}>
                <i className="fa fa-bolt" style={{ color: "#387ed1", marginRight: "6px" }}></i> One-Click Demo Login
              </span>
              <span style={{ fontSize: "0.72rem", background: "#e8f2fc", color: "#387ed1", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>
                Instant Access
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                onClick={() => handleDirectLogin("demo@zerodha.com", "demo1234")}
                disabled={loading}
                style={{
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  padding: "8px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#0f172a" }}>Demo Trader</div>
                <div style={{ fontSize: "0.7rem", color: "#64748b" }}>demo@zerodha.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleDirectLogin("pa10506@zerodha.com", "Makwanap@1")}
                disabled={loading}
                style={{
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  padding: "8px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#0f172a" }}>Pavan Makwana</div>
                <div style={{ fontSize: "0.7rem", color: "#64748b" }}>pa10506@zerodha.com</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: "4px" }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="e.g. demo@zerodha.com"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "0.95rem",
                color: "#0f172a",
                boxSizing: "border-box",
                marginBottom: "14px",
                outline: "none",
              }}
            />

            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: "4px" }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "0.95rem",
                color: "#0f172a",
                boxSizing: "border-box",
                marginBottom: "18px",
                outline: "none",
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: loading ? "#94a3b8" : "#387ed1",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 700,
                fontSize: "0.95rem",
                boxShadow: "0 4px 12px rgba(56, 126, 209, 0.25)",
                transition: "background 0.15s ease",
              }}
            >
              {loading ? "Authenticating..." : "Login"}
            </button>

            {error && (
              <p style={{
                color: "#df514c",
                textAlign: "center",
                marginTop: "14px",
                background: "#fdeeee",
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "0.85rem",
                fontWeight: 600,
                borderLeft: "3px solid #df514c",
              }}>
                {error}
              </p>
            )}

            {successMsg && (
              <p style={{
                color: "#00a25b",
                textAlign: "center",
                marginTop: "14px",
                background: "#e6f7ed",
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "0.85rem",
                fontWeight: 700,
                borderLeft: "3px solid #00a25b",
              }}>
                {successMsg}
              </p>
            )}
          </form>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.88rem", color: "#64748b" }}>
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              style={{ color: "#387ed1", cursor: "pointer", fontWeight: 700 }}
            >
              Signup here
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;
