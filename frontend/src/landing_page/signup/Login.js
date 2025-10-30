// frontend/src/landing_page/signup/Login.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 

    try {
      const response = await fetch("https://zerodha-clone-pa1.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        
        
        credentials: "include", 
      });

      if (response.ok) {
        alert("Login successful! Redirecting to dashboard...");

        
        window.location.href = "https://zerodha-clone-dashboard-pa1.vercel.app/";

      } else {
        const data = await response.json(); 
        const errorMsg = data.message || "Login failed";
        setError(errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMsg = "Something went wrong! Check console or backend.";
      setError(errorMsg);
      alert(errorMsg);
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
      }}
    >
      <h2 style={{ textAlign: "center" }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ width: "100%", margin: "10px 0", padding: "10px" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ width: "100%", margin: "10px 0", padding: "10px" }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Login
        </button>
        {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</p>}
      </form>

      <p style={{ textAlign: "center", marginTop: "15px" }}>
        Don’t have an account?{" "}
        <span
          onClick={() => navigate("/signup")}
          style={{ color: "#007bff", cursor: "pointer", fontWeight: "bold" }}
        >
          Signup here
        </span>
      </p>
    </div>
  );
};

export default Login;