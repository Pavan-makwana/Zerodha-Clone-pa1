// dashboard/src/components/Summary.js

import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import { getIndianMarketStatus } from "../utils/marketHours";
import {
  CandlestickChartOutlined,
  SchoolOutlined,
  FilterListOutlined,
  CheckCircle,
  RadioButtonUnchecked,
  TrendingUpOutlined,
  ShoppingCartOutlined,
  RestartAltOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
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

const LEARNING_MISSIONS = [
  {
    id: "m1",
    title: "1. Virtual Capital & Safe Practice",
    concept: "Claim ₹10,00,000 risk-free virtual practice funds to trade live Indian equities with zero real financial exposure.",
    actionType: "reset_funds",
    actionLabel: "Claim ₹10L Capital",
    icon: <RestartAltOutlined style={{ fontSize: "18px", color: "#387ed1" }} />,
  },
  {
    id: "m2",
    title: "2. Scan Market Momentum with Screener",
    concept: "Scan 50+ major Indian equities by Top Gainers, Losers, and 52-Week High Breakouts to spot high-probability setups.",
    actionType: "link",
    actionLink: "/screener",
    actionLabel: "Launch Stock Screener",
    icon: <FilterListOutlined style={{ fontSize: "18px", color: "#7c3aed" }} />,
  },
  {
    id: "m3",
    title: "3. Order Types & 5x Intraday Leverage (CNC vs MIS)",
    concept: "Understand Delivery (CNC - 100% cash, hold forever) vs Intraday MIS (5x leverage margin, day trading).",
    actionType: "buy_modal",
    stock: "RELIANCE",
    actionLabel: "Practice Buy Order",
    icon: <ShoppingCartOutlined style={{ fontSize: "18px", color: "#00a25b" }} />,
  },
  {
    id: "m4",
    title: "4. Live Candlestick & Volume Analysis",
    concept: "Read real-time OHLC candles, green/red ticks, and dynamic volume bars across 1D/1W/1M intervals.",
    actionType: "chart_modal",
    stock: "NIFTY 50",
    actionLabel: "Open Live Chart",
    icon: <CandlestickChartOutlined style={{ fontSize: "18px", color: "#0ea5e9" }} />,
  },
  {
    id: "m5",
    title: "5. Mark-to-Market (MTM) & Position Square-Off",
    concept: "Watch live P&L tick in real-time and practice 1-click square-off to lock in gains or protect capital.",
    actionType: "link",
    actionLink: "/positions",
    actionLabel: "Track Live Positions",
    icon: <TrendingUpOutlined style={{ fontSize: "18px", color: "#f59e0b" }} />,
  },
];

const Summary = () => {
  const [user, setUser] = useState({ name: "Trader" });
  const [allHoldings, setAllHoldings] = useState([]);
  const [availableMargin, setAvailableMargin] = useState(1000000.0);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missionsOpen, setMissionsOpen] = useState(true);
  const [completedMissions, setCompletedMissions] = useState({ m1: true });
  const [resettingFunds, setResettingFunds] = useState(false);
  const generalContext = useContext(GeneralContext);

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

    // 4. Fetch Trade Analytics
    axios
      .get(`${API_BASE_URL}/trade-analytics`, { withCredentials: true, headers })
      .then((res) => {
        if (res.data) {
          setAnalytics(res.data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch trade analytics:", err);
      });
  };

  useEffect(() => {
    fetchUserData();

    try {
      const stored = localStorage.getItem("kite:completed-steps");
      if (stored) {
        setCompletedMissions((prev) => ({ ...prev, ...JSON.parse(stored) }));
      }
    } catch (e) {}

    const handleOrderPlaced = () => {
      fetchUserData();
    };
    window.addEventListener("kite:order-placed", handleOrderPlaced);
    return () => window.removeEventListener("kite:order-placed", handleOrderPlaced);
  }, []);

  const toggleMission = (id) => {
    const updated = { ...completedMissions, [id]: !completedMissions[id] };
    setCompletedMissions(updated);
    localStorage.setItem("kite:completed-steps", JSON.stringify(updated));
  };

  const handleResetFunds = async () => {
    try {
      setResettingFunds(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`${API_BASE_URL}/funds/reset`, {}, { withCredentials: true, headers });

      const newFunds = res.data?.availableMargin || 1000000.0;
      setAvailableMargin(newFunds);
      toggleMission("m1");
      generalContext.showToast(
        "Virtual practice wallet restored to ₹10,00,000.00!",
        "success",
        10000
      );
      window.dispatchEvent(new CustomEvent("kite:order-placed"));
    } catch (err) {
      console.error("Funds reset error:", err);
      generalContext.showToast("Could not reset practice funds", "error", 10000);
    } finally {
      setResettingFunds(false);
    }
  };

  const completedCount = LEARNING_MISSIONS.filter((m) => completedMissions[m.id]).length;
  const progressPercent = Math.round((completedCount / LEARNING_MISSIONS.length) * 100);

  const getTraderTier = () => {
    if (completedCount === 5) return { label: "Master Paper Trader", color: "#7c3aed", bg: "#f3e8ff" };
    if (completedCount >= 3) return { label: "Proficient Trader", color: "#00a25b", bg: "#e6f7ed" };
    if (completedCount >= 2) return { label: "Apprentice Trader", color: "#2563eb", bg: "#eff6ff" };
    return { label: "Novice Trader", color: "#d97706", bg: "#fef3c7" };
  };

  const tier = getTraderTier();

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
      {/* User Greeting & Header Actions */}
      <div className="username" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h4 style={{ margin: 0, fontWeight: 700, color: "#1e293b", fontSize: "1.4rem" }}>
            Hi, {user.name || "Trader"}!
          </h4>
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
            Account ID: {user.id || user._id ? String(user.id || user._id).substring(0, 8).toUpperCase() : "PA10506"} &bull; Real-Time Paper Trading & Training Simulator
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => generalContext.openChartWindow("NIFTY 50")}
            style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "20px",
              padding: "5px 14px",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#387ed1",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <CandlestickChartOutlined style={{ fontSize: "16px" }} />
            Live Market Chart
          </button>
          {(() => {
            const marketStatus = getIndianMarketStatus();
            return (
              <span
                title={`Trading Hours: Mon-Fri 09:15 AM - 03:30 PM IST (${marketStatus.nextOpenMessage})`}
                style={{
                  background: marketStatus.isOpen ? "#e6f7ed" : "#f1f5f9",
                  color: marketStatus.isOpen ? "#00a25b" : "#475569",
                  border: marketStatus.isOpen ? "none" : "1px solid #cbd5e1",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: marketStatus.isOpen ? "#00a25b" : "#94a3b8",
                  }}
                ></span>
                {marketStatus.statusText} {!marketStatus.isOpen ? `(${marketStatus.nextOpenMessage})` : ""}
              </span>
            );
          })()}
        </div>
      </div>

      <hr className="divider" style={{ border: "none", borderTop: "1px solid #eef2f6", margin: "12px 0 20px" }} />

      {/* Top Visual Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {/* Equity Margin Card */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Available Margin</span>
            <span style={{ fontSize: "0.72rem", background: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: "12px", fontWeight: 700 }}>
              Virtual ₹10L
            </span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1e293b", margin: "4px 0 12px" }}>
            ₹{availableMargin.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: "10px" }}>
            <span>Margins used: <strong style={{ color: "#1e293b" }}>₹0.00</strong></span>
            <button
              type="button"
              disabled={resettingFunds}
              onClick={handleResetFunds}
              style={{
                background: "none",
                border: "none",
                color: "#387ed1",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.78rem",
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <RestartAltOutlined style={{ fontSize: "14px" }} />
              {resettingFunds ? "Resetting..." : "Reset ₹10L Funds"}
            </button>
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

        {/* Trading Analytics Card */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Win Rate & Stats</span>
            <span style={{ fontSize: "0.75rem", background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", color: "#475569", fontWeight: 700 }}>
              {analytics?.winRate !== undefined ? `${analytics.winRate}% Win` : "New Trader"}
            </span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1e293b", margin: "4px 0 12px" }}>
            {analytics?.closedTrades || 0} Trades
          </h2>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: "10px" }}>
            <span>Realized P&L: <strong style={{ color: (analytics?.netRealizedPL || 0) >= 0 ? "#00a25b" : "#df514c" }}>{analytics?.netRealizedPL >= 0 ? "+" : ""}₹{(analytics?.netRealizedPL || 0).toFixed(2)}</strong></span>
            <span>Growth: <strong style={{ color: "#387ed1" }}>{analytics?.capitalGrowth >= 0 ? "+" : ""}{(analytics?.capitalGrowth || 0).toFixed(2)}%</strong></span>
          </div>
        </div>
      </div>

      {/* STEP-BY-STEP LEARNING MISSIONS ROADMAP */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px 24px",
          marginBottom: "28px",
          boxShadow: "0 3px 12px rgba(0,0,0,0.03)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            flexWrap: "wrap",
            gap: "12px",
          }}
          onClick={() => setMissionsOpen(!missionsOpen)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                background: tier.bg,
                color: tier.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SchoolOutlined style={{ fontSize: "22px" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                  Kite Trading Academy: Step-by-Step Missions
                </h4>
                <span
                  style={{
                    background: tier.bg,
                    color: tier.color,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "10px",
                  }}
                >
                  {tier.label}
                </span>
              </div>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                Complete these 5 interactive missions to master live market trading risk-free ({completedCount}/5 Complete &bull; {progressPercent}%)
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Progress Bar */}
            <div style={{ width: "130px", height: "8px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #387ed1, #00a25b)",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            {missionsOpen ? <KeyboardArrowUp style={{ color: "#64748b" }} /> : <KeyboardArrowDown style={{ color: "#64748b" }} />}
          </div>
        </div>

        {missionsOpen && (
          <div style={{ marginTop: "18px", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px" }}>
              {LEARNING_MISSIONS.map((m) => {
                const isDone = !!completedMissions[m.id];
                return (
                  <div
                    key={m.id}
                    style={{
                      border: isDone ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                      background: isDone ? "#f0fdf4" : "#ffffff",
                      borderRadius: "8px",
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {m.icon}
                          <strong style={{ fontSize: "0.88rem", color: "#0f172a" }}>{m.title}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleMission(m.id)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            color: isDone ? "#00a25b" : "#cbd5e1",
                          }}
                          title={isDone ? "Mark as Incomplete" : "Mark as Complete"}
                        >
                          {isDone ? <CheckCircle style={{ fontSize: "20px" }} /> : <RadioButtonUnchecked style={{ fontSize: "20px" }} />}
                        </button>
                      </div>
                      <p style={{ margin: "4px 0 12px", fontSize: "0.8rem", color: "#475569", lineHeight: "1.4" }}>
                        {m.concept}
                      </p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      {m.actionType === "reset_funds" && (
                        <button
                          type="button"
                          onClick={handleResetFunds}
                          style={{
                            padding: "6px 12px",
                            background: "#387ed1",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "5px",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {m.actionLabel}
                        </button>
                      )}
                      {m.actionType === "buy_modal" && (
                        <button
                          type="button"
                          onClick={() => {
                            generalContext.openBuyWindow(m.stock);
                            toggleMission(m.id);
                          }}
                          style={{
                            padding: "6px 12px",
                            background: "#00a25b",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "5px",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {m.actionLabel} &rarr;
                        </button>
                      )}
                      {m.actionType === "chart_modal" && (
                        <button
                          type="button"
                          onClick={() => {
                            generalContext.openChartWindow(m.stock);
                            toggleMission(m.id);
                          }}
                          style={{
                            padding: "6px 12px",
                            background: "#0ea5e9",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "5px",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {m.actionLabel} &rarr;
                        </button>
                      )}
                      {m.actionType === "link" && (
                        <Link
                          to={m.actionLink}
                          onClick={() => toggleMission(m.id)}
                          style={{
                            padding: "6px 12px",
                            background: "#475569",
                            color: "#ffffff",
                            borderRadius: "5px",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            textDecoration: "none",
                          }}
                        >
                          {m.actionLabel} &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
