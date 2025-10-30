// frontend/src/landing_page/signup/Login.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(""); // Error state
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Har submit par error reset karein

    try {
      const response = await fetch("http://localhost:3002/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        
        // --- YEH SABSE ZAROORI HAI ---
        // Browser ko batata hai ki cookie receive karni hai
        credentials: "include", 
      });

      if (response.ok) {
        // Login successful, backend ne cookie set kar di hai
        alert("Login successful! Redirecting to dashboard...");

        // localStorage.setItem("token", data.token); // <-- ISEY ISTEMAAL NAHI KARNA HAI
        
        // Ab Dashboard app (Port 3001) par redirect karein
        // "/" route par bhej rahe hain jahan aapka Summary component hai
        window.location.href = "http://localhost:3001/";

      } else {
        const data = await response.json(); // Error message ke liye
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
        {/* Error message dikhane ke liye */}
        {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</p>}
      </form>

      {/* Yeh link 'navigate' use karega kyunki yeh same app (Port 3000) par hai */}
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