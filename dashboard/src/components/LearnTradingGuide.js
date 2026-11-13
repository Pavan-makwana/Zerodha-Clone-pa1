// dashboard/src/components/LearnTradingGuide.js

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  SchoolOutlined,
  CheckCircle,
  RadioButtonUnchecked,
  ShowChartOutlined,
  FilterListOutlined,
  ShoppingCartOutlined,
  SecurityOutlined,
  AccountBalanceWalletOutlined,
  RestartAltOutlined,
  TrendingUpOutlined,
} from "@mui/icons-material";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";

const MILESTONES = [
  {
    id: "step1",
    title: "1. Market Fundamentals & Live Price Action",
    summary: "Understand how the Indian stock market (NSE & BSE) moves during trading hours (09:15 AM to 03:30 PM IST).",
    badge: "Foundation",
    icon: <ShowChartOutlined style={{ color: "#387ed1" }} />,
    details: [
      "Benchmark Indices: NIFTY 50 tracks the top 50 Indian companies; SENSEX tracks 30 BSE bellwethers.",
      "Green vs Red: A green tick indicates trades matching at higher asking prices; red indicates sellers accepting lower bids.",
      "Live Ticking: Look at your sidebar watchlist to observe real-time price changes.",
    ],
    actionLink: "/",
    actionLabel: "Observe Live Watchlist & Indices",
  },
  {
    id: "step2",
    title: "2. Finding High-Probability Stocks with the Screener",
    summary: "Scan 50+ major equities across sectors, market capitalization, and performance metrics.",
    badge: "Opportunity Discovery",
    icon: <FilterListOutlined style={{ color: "#7c3aed" }} />,
    details: [
      "Sector Rotation: Capital flows between Banking, IT, Auto, and Defense based on market sentiment.",
      "Top Gainers & Losers: Quickly identify momentum breakout stocks.",
      "52-Week High Proximity: Stocks trading near their 52-week highs often show strong institutional demand.",
    ],
    actionLink: "/screener",
    actionLabel: "Launch Real-Time Stock Screener",
  },
  {
    id: "step3",
    title: "3. Order Types & Leverage (CNC vs MIS)",
    summary: "Learn the difference between Cash-and-Carry Delivery and 5x Intraday Trading leverage.",
    badge: "Execution Mastery",
    icon: <ShoppingCartOutlined style={{ color: "#00a25b" }} />,
    details: [
      "CNC (Cash & Carry): Delivery trades. You pay 100% of the share price (1x) and hold shares in your Demat indefinitely.",
      "MIS (Margin Intraday Square-off): Day trading. You get 5x virtual leverage (pay only 20% margin), but positions must be squared off before 3:20 PM.",
      "Market vs Limit: A Market order fills immediately at the best available rate. A Limit order waits until the stock reaches your desired price dip.",
    ],
    actionLink: "/screener",
    actionLabel: "Practice Placing a Trade",
  },
  {
    id: "step4",
    title: "4. Risk Management & Stop-Loss Discipline",
    summary: "Protect your virtual capital by mastering position sizing and cutting losses early.",
    badge: "Capital Preservation",
    icon: <SecurityOutlined style={{ color: "#df514c" }} />,
    details: [
      "The 2% Rule: Never risk more than 2% of your total capital on a single trade.",
      "Stop-Loss (SL): Always determine your invalidation point before entering a position.",
      "Risk-to-Reward: Aim for at least 1:2 risk-to-reward (risking ₹100 to make ₹200).",
    ],
    actionLink: "/orders",
    actionLabel: "Inspect Active & Pending Orders",
  },
  {
    id: "step5",
    title: "5. Mark-to-Market (MTM) P&L & Trade Journal",
    summary: "Monitor unrealized gains/losses in real time and evaluate your trading win rate.",
    badge: "Performance Review",
    icon: <TrendingUpOutlined style={{ color: "#f59e0b" }} />,
    details: [
      "Mark-to-Market (MTM): Your portfolio value recalculates dynamically with every price tick on the exchange.",
      "Realized vs Unrealized: Profits are only locked in when you execute a SELL order to close the position.",
      "Evaluate Your Edge: Review your win rate, profit factor, and return on investment in the Summary tab.",
    ],
    actionLink: "/holdings",
    actionLabel: "Track Live Portfolio & Holdings",
  },
];

const LearnTradingGuide = () => {
  const [completedSteps, setCompletedSteps] = useState({});
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kite:completed-steps");
      if (stored) {
        setCompletedSteps(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const toggleStep = (id) => {
    const updated = { ...completedSteps, [id]: !completedSteps[id] };
    setCompletedSteps(updated);
    localStorage.setItem("kite:completed-steps", JSON.stringify(updated));
  };

  const handleResetFunds = async () => {
    try {
      setResetting(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(
        `${API_BASE_URL}/funds/reset`,
        {},
        { withCredentials: true, headers }
      );
      setResetMessage(res.data?.message || "Virtual capital reset to ₹10,00,000!");
      window.dispatchEvent(
        new CustomEvent("kite:order-placed", {
          detail: { updatedMargin: 1000000.0 },
        })
      );
      setTimeout(() => setResetMessage(""), 4000);
    } catch (err) {
      setResetMessage("Could not reset virtual funds. Try again.");
    } finally {
      setResetting(false);
    }
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPct = Math.round((completedCount / MILESTONES.length) * 100);

  return (
    <div style={{ padding: "24px 32px", backgroundColor: "#ffffff", minHeight: "100%" }}>
      {/* Academy Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          borderRadius: "12px",
          padding: "24px 28px",
          color: "#ffffff",
          marginBottom: "25px",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <SchoolOutlined style={{ fontSize: "28px", color: "#387ed1" }} />
              <h2 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 700 }}>
                Kite Paper Trading Academy
              </h2>
            </div>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem", maxWidth: "650px", lineHeight: "1.5" }}>
              Master Indian equities trading step-by-step with real-time market feeds and ₹10,00,000 risk-free virtual capital.
            </p>
          </div>

          <div style={{ textAlign: "right", minWidth: "200px" }}>
            <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "4px" }}>
              Academy Completion
            </div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#387ed1" }}>
              {progressPct}% ({completedCount}/{MILESTONES.length} Steps)
            </div>
            <div
              style={{
                width: "100%",
                height: "6px",
                background: "#334155",
                borderRadius: "3px",
                overflow: "hidden",
                marginTop: "6px",
              }}
            >
              <div
                style={{
                  width: `${progressPct}%`,
                  height: "100%",
                  background: "#387ed1",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* Practice Wallet Callout */}
        <div
          style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AccountBalanceWalletOutlined style={{ color: "#00a25b", fontSize: "22px" }} />
            <div>
              <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Virtual Practice Capital: </span>
              <strong style={{ fontSize: "0.95rem", color: "#ffffff" }}>₹10,00,000.00</strong>
            </div>
          </div>

          <button
            onClick={handleResetFunds}
            disabled={resetting}
            style={{
              background: "#334155",
              color: "#ffffff",
              border: "1px solid #475569",
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <RestartAltOutlined style={{ fontSize: "16px" }} />
            {resetting ? "Resetting..." : "Reset Virtual Capital (₹10L)"}
          </button>
        </div>

        {resetMessage && (
          <div style={{ marginTop: "10px", fontSize: "0.82rem", color: "#00a25b", fontWeight: 600 }}>
            {resetMessage}
          </div>
        )}
      </div>

      {/* Step-by-Step Milestone Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {MILESTONES.map((m) => {
          const isDone = Boolean(completedSteps[m.id]);
          return (
            <div
              key={m.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "20px 24px",
                background: isDone ? "#f8fafc" : "#ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div
                    onClick={() => toggleStep(m.id)}
                    style={{ cursor: "pointer", marginTop: "2px" }}
                    title={isDone ? "Mark as Incomplete" : "Mark as Completed"}
                  >
                    {isDone ? (
                      <CheckCircle style={{ color: "#00a25b", fontSize: "24px" }} />
                    ) : (
                      <RadioButtonUnchecked style={{ color: "#94a3b8", fontSize: "24px" }} />
                    )}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
                        {m.title}
                      </h3>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background: "#eff6ff",
                          color: "#2563eb",
                        }}
                      >
                        {m.badge}
                      </span>
                    </div>

                    <p style={{ margin: "0 0 12px 0", color: "#475569", fontSize: "0.88rem" }}>
                      {m.summary}
                    </p>

                    {/* Bullet Points */}
                    <ul style={{ margin: "0 0 16px 0", paddingLeft: "18px", color: "#64748b", fontSize: "0.83rem", lineHeight: "1.6" }}>
                      {m.details.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    <Link
                      to={m.actionLink}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        background: "#387ed1",
                        color: "#ffffff",
                        textDecoration: "none",
                        borderRadius: "5px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      {m.actionLabel} &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearnTradingGuide;
