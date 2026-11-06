// frontend/src/landing_page/signup/Signup.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";
const DASHBOARD_URL = process.env.REACT_APP_DASHBOARD_URL || "https://zerodha-clone-dashboard-pa1.vercel.app/";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (stored && token) {
        setLoggedInUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 1200);
      } else {
        const errorMsg = data.message || "Signup failed";
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Error during signup:", err);
      const errorMsg = "Something went wrong! Check backend or network connection.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
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
            Active Account
          </div>

          <h2 style={{ fontSize: "1.45rem", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
            You're already logged in as {loggedInUser.name}
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "20px" }}>
            You already have active trading access under <strong>{loggedInUser.email}</strong>.
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
            Open Kite Trading Dashboard &rarr;
          </a>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              setLoggedInUser(null);
            }}
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
            Register a new / different account
          </button>
        </div>
      ) : (
        <div>
          <h2 style={{ textAlign: "center", marginBottom: "6px", fontWeight: 700, color: "#0f172a", fontSize: "1.5rem" }}>
            Open a Zerodha Account
          </h2>
          <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.85rem", marginBottom: "24px" }}>
            Sign up now for modern, low-cost trading & investment
          </p>

          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: "4px" }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
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
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="e.g. rahul@example.com"
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
              placeholder="Minimum 6 characters"
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
              {loading ? "Creating Account..." : "Create Account"}
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
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              style={{ color: "#387ed1", cursor: "pointer", fontWeight: 700 }}
            >
              Login here
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Signup;
