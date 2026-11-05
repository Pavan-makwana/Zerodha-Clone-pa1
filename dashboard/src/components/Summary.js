// dashboard/src/components/Summary.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";

const Summary = () => {
  const [user, setUser] = useState({ name: "Trader" });
  const [allHoldings, setAllHoldings] = useState([]);
  const [availableMargin, setAvailableMargin] = useState(100000.0);
  const [loading, setLoading] = useState(true);

  const fetchUserData = () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 1. Fetch User Profile
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
          if (stored) setUser(JSON.parse(stored));
        } catch (e) {}
      });

    // 2. Fetch Holdings
    axios
      .get(`${API_BASE_URL}/allholdings`, { withCredentials: true, headers })
      .then((res) => {
        setAllHoldings(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching summary holdings:", err);
        setLoading(false);
      });

    // 3. Fetch Margin & Funds
    axios
      .get(`${API_BASE_URL}/funds`, { withCredentials: true, headers })
      .then((res) => {
        if (res.data?.availableMargin !== undefined) {
          setAvailableMargin(res.data.availableMargin);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch user funds:", err);
      });
  };

  useEffect(() => {
    fetchUserData();

    // Listen to custom order-placed events to auto-refresh summary
    const handleOrderPlaced = () => {
      fetchUserData();
    };
    window.addEventListener("kite:order-placed", handleOrderPlaced);
    return () => window.removeEventListener("kite:order-placed", handleOrderPlaced);
  }, []);

  const totalInvestment = allHoldings.reduce(
    (acc, stock) => acc + (stock.avg || 0) * (stock.qty || 0),
    0
  );
  const currentValue = allHoldings.reduce(
    (acc, stock) => acc + (stock.price || 0) * (stock.qty || 0),
    0
  );
  const totalPL = currentValue - totalInvestment;
  const plPercent = totalInvestment > 0 ? (totalPL / totalInvestment) * 100 : 0;
  const isProfit = totalPL >= 0;

  // Chart 1: Portfolio Allocation Doughnut Chart Data
  const chartColors = [
    "#387ed1",
    "#00a25b",
    "#f39c12",
    "#9b59b6",
    "#1abc9c",
    "#e67e22",
    "#df514c",
    "#34495e",
    "#2ecc71",
    "#d35400",
    "#8e44ad",
    "#2980b9",
    "#16a085",
  ];

  const doughnutData = {
    labels: allHoldings.map((h) => h.name),
    datasets: [
      {
        data: allHoldings.map((h) => (h.price || 0) * (h.qty || 0)),
        backgroundColor: chartColors.slice(0, allHoldings.length),
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          padding: 10,
          font: { size: 11, family: "sans-serif" },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const pct = currentValue > 0 ? ((val / currentValue) * 100).toFixed(1) : 0;
            return ` ₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2 })} (${pct}%)`;
          },
        },
      },
    },
    cutout: "68%",
  };

  // Chart 2: P&L by Stock Bar Chart Data
  const plBarData = {
    labels: allHoldings.map((h) => h.name),
    datasets: [
      {
        label: "P&L (₹)",
        data: allHoldings.map((h) => {
          const cur = (h.price || 0) * (h.qty || 0);
          const cost = (h.avg || 0) * (h.qty || 0);
          return Math.round((cur - cost) * 100) / 100;
        }),
        backgroundColor: allHoldings.map((h) => {
          const cur = (h.price || 0) * (h.qty || 0);
          const cost = (h.avg || 0) * (h.qty || 0);
          return cur >= cost ? "rgba(0, 162, 91, 0.75)" : "rgba(223, 81, 76, 0.75)";
        }),
        borderRadius: 4,
      },
    ],
  };

  const plBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` P&L: ₹${context.raw.toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } },
      },
      y: {
        grid: { color: "#f1f5f9" },
        ticks: { font: { size: 10 } },
      },
    },
  };

  return (
    <div className="kite-summary-container" style={{ padding: "10px 24px 40px" }}>
      {/* User Greeting */}
      <div className="username" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h4 style={{ margin: 0, fontWeight: 600, color: "#1e293b", fontSize: "1.35rem" }}>
            Hi, {user.name || "Trader"}!
          </h4>
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
            Account ID: {user.id || user._id ? String(user.id || user._id).substring(0, 8).toUpperCase() : "PA10506"} &bull; Equity Trading Active
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <span style={{ background: "#e6f7ed", color: "#00a25b", padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>
            Market Open
          </span>
        </div>
      </div>
      <hr className="divider" style={{ border: "none", borderTop: "1px solid #eef2f6", margin: "12px 0 24px" }} />

      {/* Top Visual Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {/* Equity Margin Card */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Equity Margin</span>
            <span style={{ fontSize: "0.75rem", background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", color: "#475569" }}>Available</span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1e293b", margin: "4px 0 12px" }}>
            ₹{availableMargin.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: "10px" }}>
            <span>Margins used: <strong style={{ color: "#1e293b" }}>₹0.00</strong></span>
            <span>Opening: <strong style={{ color: "#1e293b" }}>₹{availableMargin.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></span>
          </div>
        </div>

        {/* Portfolio Holdings Card */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Holdings ({allHoldings.length})</span>
            <span style={{
              fontSize: "0.75rem",
              background: isProfit ? "#e6f7ed" : "#fdeeee",
              color: isProfit ? "#00a25b" : "#df514c",
              padding: "2px 8px",
              borderRadius: "4px",
              fontWeight: 700
            }}>
              {isProfit ? "+" : ""}{plPercent.toFixed(2)}%
            </span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: isProfit ? "#00a25b" : "#df514c", margin: "4px 0 12px" }}>
            {isProfit ? "+" : ""}₹{totalPL.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: "10px" }}>
            <span>Current: <strong style={{ color: "#1e293b" }}>₹{currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></span>
            <span>Invested: <strong style={{ color: "#1e293b" }}>₹{totalInvestment.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></span>
          </div>
        </div>
      </div>

      {/* Portfolio Charts Section */}
      {allHoldings.length > 0 && !loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
          {/* Chart 1: Doughnut */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h5 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "#1e293b" }}>
                Portfolio Allocation
              </h5>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Total: ₹{currentValue.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
              </span>
            </div>
            <div style={{ height: "260px", position: "relative" }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>

          {/* Chart 2: P&L Distribution Bar */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h5 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "#1e293b" }}>
                Holdings Profit & Loss (₹)
              </h5>
              <span style={{ fontSize: "0.75rem", color: isProfit ? "#00a25b" : "#df514c", fontWeight: 600 }}>
                Net: {isProfit ? "+" : ""}₹{totalPL.toFixed(2)}
              </span>
            </div>
            <div style={{ height: "260px", position: "relative" }}>
              <Bar data={plBarData} options={plBarOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary;
