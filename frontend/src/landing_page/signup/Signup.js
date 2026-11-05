// frontend/src/landing_page/signup/Signup.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

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
        setSuccessMsg("Signup successful! Redirecting to login...");
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
        maxWidth: "400px",
        margin: "60px auto",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Create an Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Enter full name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{ width: "100%", margin: "10px 0", padding: "10px", boxSizing: "border-box" }}
        />
        <input
          type="email"
          name="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ width: "100%", margin: "10px 0", padding: "10px", boxSizing: "border-box" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ width: "100%", margin: "10px 0", padding: "10px", boxSizing: "border-box" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: loading ? "#6c757d" : "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            marginTop: "10px",
          }}
        >
          {loading ? "Registering..." : "Sign Up"}
        </button>
        {error && <p style={{ color: '#d9534f', textAlign: 'center', marginTop: '12px', background: '#fdeeee', padding: '8px', borderRadius: '4px', fontSize: '13px' }}>{error}</p>}
        {successMsg && <p style={{ color: '#00a25b', textAlign: 'center', marginTop: '12px', background: '#e6f7ed', padding: '8px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>{successMsg}</p>}
      </form>

      <p style={{ textAlign: "center", marginTop: "15px" }}>
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          style={{ color: "#007bff", cursor: "pointer", fontWeight: "bold" }}
        >
          Login here
        </span>
      </p>
    </div>
  );
};

export default Signup;
