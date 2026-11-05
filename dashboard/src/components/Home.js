import React, { useState, useEffect } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || "https://zerodha-clone-frontend-pa1.vercel.app";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Check if user has token or active session
    const storedToken = localStorage.getItem("token");
    const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};

    axios
      .get(`${API_BASE_URL}/api/auth/check-auth`, {
        withCredentials: true,
        headers,
      })
      .then((res) => {
        setIsAuthenticated(true);
      })
      .catch((err) => {
        console.warn("Unauthenticated access to dashboard:", err);
        setIsAuthenticated(false);
        // Redirect to login page
        window.location.href = `${FRONTEND_URL}/login`;
      });
  }, []);

  if (isAuthenticated === null) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif" }}>
        <p style={{ color: "#666" }}>Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif" }}>
        <p style={{ color: "#d9534f" }}>Session expired. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <>
      <TopBar />
      <Dashboard />
    </>
  );
};

export default Home;
