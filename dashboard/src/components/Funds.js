// dashboard/src/components/Funds.js

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";

const Funds = () => {
  const [availableCash, setAvailableCash] = useState(100000.00);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState(5000);
  const [withdrawAmount, setWithdrawAmount] = useState(2000);
  const [upiId, setUpiId] = useState("pa10506@okhdfcbank");
  const [loading, setLoading] = useState(false);

  const { showToast } = useContext(GeneralContext);

  const fetchFunds = () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
      .get(`${API_BASE_URL}/funds`, { withCredentials: true, headers })
      .then((res) => {
        if (res.data?.availableMargin !== undefined) {
          setAvailableCash(res.data.availableMargin);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch user funds, using fallback:", err);
      });
  };

  useEffect(() => {
    fetchFunds();

    const handleOrderSync = (e) => {
      if (e.detail?.updatedMargin !== undefined) {
        setAvailableCash(e.detail.updatedMargin);
      }
    };
    window.addEventListener("kite:order-placed", handleOrderSync);
    return () => window.removeEventListener("kite:order-placed", handleOrderSync);
  }, []);

  const handleAddFunds = async (e) => {
    e?.preventDefault();
    const amount = Number(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast({ title: "Invalid Amount", message: "Please enter an amount greater than 0", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        `${API_BASE_URL}/funds/add`,
        { amount },
        { withCredentials: true, headers }
      );
      const newMargin = res.data?.availableMargin ?? (availableCash + amount);
      setAvailableCash(newMargin);

      showToast({
        title: "Funds Added",
        message: `₹${amount.toLocaleString("en-IN")} deposited via UPI (${upiId}) successfully! Available margin updated.`,
        type: "success",
        duration: 10000,
      });

      setIsDepositModalOpen(false);
      setFundAmount(5000);

      window.dispatchEvent(new CustomEvent("kite:order-placed", { detail: { updatedMargin: newMargin } }));
    } catch (err) {
      console.error("Failed to add funds:", err);
      const simulated = availableCash + amount;
      setAvailableCash(simulated);
      showToast({
        title: "Funds Added",
        message: `₹${amount.toLocaleString("en-IN")} deposited (demo mode). Available margin updated.`,
        type: "success",
        duration: 10000,
      });
      setIsDepositModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e?.preventDefault();
    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast({ title: "Invalid Amount", message: "Please enter a valid amount greater than 0", type: "error" });
      return;
    }
    if (amount > availableCash) {
      showToast({ title: "Insufficient Balance", message: "Withdrawal amount exceeds available cash margin!", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        `${API_BASE_URL}/funds/withdraw`,
        { amount },
        { withCredentials: true, headers }
      );
      const newMargin = res.data?.availableMargin ?? (availableCash - amount);
      setAvailableCash(newMargin);

      showToast({
        title: "Withdrawal Processed",
        message: `₹${amount.toLocaleString("en-IN")} payout initiated to HDFC Bank (****1981).`,
        type: "info",
        duration: 10000,
      });

      setIsWithdrawModalOpen(false);
      window.dispatchEvent(new CustomEvent("kite:order-placed", { detail: { updatedMargin: newMargin } }));
    } catch (err) {
      console.error("Failed to withdraw:", err);
      const simulated = availableCash - amount;
      setAvailableCash(simulated);
      showToast({
        title: "Withdrawal Processed",
        message: `₹${amount.toLocaleString("en-IN")} payout processed (demo mode).`,
        type: "info",
        duration: 10000,
      });
      setIsWithdrawModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [1000, 5000, 10000, 25000];

  return (
    <div style={{ padding: "16px 28px 48px", maxWidth: "1200px" }}>
      {/* Top Action Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
        marginBottom: "24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.2rem" }}>⚡</span>
          <div>
            <h5 style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: "0.98rem" }}>
              Instant & Zero-Cost Fund Transfers
            </h5>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Deposit instantly via UPI, Google Pay, PhonePe, or Netbanking. Zero charges.
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={() => setIsDepositModalOpen(true)}
            style={{
              background: "#00a25b",
              color: "#ffffff",
              border: "none",
              padding: "10px 22px",
              borderRadius: "6px",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0, 162, 91, 0.25)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "background 0.15s ease",
            }}
          >
            <span>+</span> Add funds
          </button>

          <button
            type="button"
            onClick={() => setIsWithdrawModalOpen(true)}
            style={{
              background: "#387ed1",
              color: "#ffffff",
              border: "none",
              padding: "10px 22px",
              borderRadius: "6px",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(56, 126, 209, 0.25)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "background 0.15s ease",
            }}
          >
            <span>↓</span> Withdraw
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px" }}>
        {/* Left Column: Equity Segment */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}>
          {/* Section Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>📊</span> Equity Segment
            </h4>
            <span style={{
              background: "#e6f7ed",
              color: "#00a25b",
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: "12px",
            }}>
              NSE / BSE Active
            </span>
          </div>

          {/* Large Available Margin Callout */}
          <div style={{
            background: "#f8fafc",
            border: "1px solid #eef2f6",
            borderRadius: "8px",
            padding: "18px 20px",
            marginBottom: "20px",
          }}>
            <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Available Margin
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#387ed1", margin: "4px 0 0" }}>
              ₹{availableCash.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>

          {/* High-Contrast Breakdown Table */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.88rem", color: "#475569", fontWeight: 500 }}>Used Margin</span>
              <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>₹0.00</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.88rem", color: "#475569", fontWeight: 500 }}>Available Cash</span>
              <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>
                ₹{availableCash.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.88rem", color: "#475569", fontWeight: 500 }}>Opening Balance</span>
              <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>
                ₹{availableCash.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.88rem", color: "#475569", fontWeight: 500 }}>Payin</span>
              <span style={{ fontSize: "0.92rem", color: "#0f172a", fontWeight: 600 }}>₹0.00</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.88rem", color: "#475569", fontWeight: 500 }}>SPAN Margin</span>
              <span style={{ fontSize: "0.92rem", color: "#0f172a", fontWeight: 600 }}>₹0.00</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.88rem", color: "#475569", fontWeight: 500 }}>Delivery Margin</span>
              <span style={{ fontSize: "0.92rem", color: "#0f172a", fontWeight: 600 }}>₹0.00</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.88rem", color: "#475569", fontWeight: 500 }}>Exposure Margin</span>
              <span style={{ fontSize: "0.92rem", color: "#0f172a", fontWeight: 600 }}>₹0.00</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.88rem", color: "#475569", fontWeight: 500 }}>Options Premium</span>
              <span style={{ fontSize: "0.92rem", color: "#0f172a", fontWeight: 600 }}>₹0.00</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
              <span style={{ fontSize: "0.88rem", color: "#475569", fontWeight: 500 }}>Total Collateral</span>
              <span style={{ fontSize: "0.92rem", color: "#0f172a", fontWeight: 600 }}>₹0.00</span>
            </div>
          </div>
        </div>

        {/* Right Column: Commodity Segment */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h4 style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🪙</span> Commodity Segment
              </h4>
              <span style={{
                background: "#f1f5f9",
                color: "#475569",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "12px",
              }}>
                MCX Segment
              </span>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.5, marginBottom: "20px" }}>
              Trade Gold, Silver, Crude Oil, Natural Gas, and Agri-commodities on MCX with up to 1:1 leverage and dedicated margin allocation.
            </p>

            <div style={{
              background: "#f8fafc",
              border: "1px solid #eef2f6",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Commodity Margin Available</span>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", margin: "4px 0 0" }}>
                ₹50,000.00
              </h3>
            </div>

            <div style={{ fontSize: "0.82rem", color: "#475569", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>MCX Gold / Silver:</span>
                <strong style={{ color: "#00a25b" }}>Active</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Crude Oil Futures:</span>
                <strong style={{ color: "#00a25b" }}>Active</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Linked Bank Account:</span>
                <strong>HDFC Bank (****1981)</strong>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
            <button
              type="button"
              onClick={() => {
                showToast({
                  title: "Commodity Activated",
                  message: "Your MCX Commodity trading segment is fully active with ₹50,000 paper margin.",
                  type: "info",
                  duration: 6000,
                });
              }}
              style={{
                width: "100%",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                padding: "10px",
                borderRadius: "6px",
                color: "#1e293b",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Manage Commodity Segments
            </button>
          </div>
        </div>
      </div>

      {/* Modern UPI Deposit Modal */}
      {isDepositModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999999,
        }}>
          <div style={{
            background: "#ffffff",
            padding: "28px",
            borderRadius: "12px",
            width: "420px",
            boxShadow: "0 20px 45px rgba(0,0,0,0.22)",
            border: "1px solid #e2e8f0",
            animation: "orderWindowPop 0.25s ease forwards",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: "1.2rem" }}>
                Add Funds via UPI
              </h3>
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "1.4rem", color: "#94a3b8", cursor: "pointer" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddFunds}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>
                Deposit Amount (₹)
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  boxSizing: "border-box",
                  marginBottom: "10px",
                  outline: "none",
                }}
                required
              />

              {/* Quick Amount Chips */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setFundAmount(amt)}
                    style={{
                      background: fundAmount === amt ? "#e8f2fc" : "#f1f5f9",
                      color: fundAmount === amt ? "#387ed1" : "#475569",
                      border: fundAmount === amt ? "1px solid #387ed1" : "1px solid transparent",
                      padding: "4px 10px",
                      borderRadius: "14px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    +₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>
                UPI ID (Virtual Payment Address)
              </label>
              <input
                type="text"
                placeholder="pa10506@okhdfcbank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontSize: "0.95rem",
                  color: "#0f172a",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  boxSizing: "border-box",
                  marginBottom: "20px",
                  outline: "none",
                }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "6px",
                    color: "#475569",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "#00a25b",
                    border: "none",
                    padding: "10px 22px",
                    borderRadius: "6px",
                    color: "#ffffff",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0, 162, 91, 0.3)",
                  }}
                >
                  {loading ? "Processing..." : `Deposit ₹${Number(fundAmount || 0).toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999999,
        }}>
          <div style={{
            background: "#ffffff",
            padding: "28px",
            borderRadius: "12px",
            width: "420px",
            boxShadow: "0 20px 45px rgba(0,0,0,0.22)",
            border: "1px solid #e2e8f0",
            animation: "orderWindowPop 0.25s ease forwards",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: "1.2rem" }}>
                Withdraw Funds
              </h3>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "1.4rem", color: "#94a3b8", cursor: "pointer" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit}>
              <div style={{
                background: "#f8fafc",
                padding: "12px 14px",
                borderRadius: "6px",
                marginBottom: "16px",
                fontSize: "0.85rem",
                color: "#475569",
              }}>
                Available to withdraw: <strong style={{ color: "#0f172a" }}>₹{availableCash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
              </div>

              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>
                Withdrawal Amount (₹)
              </label>
              <input
                type="number"
                min="100"
                max={availableCash}
                step="100"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  boxSizing: "border-box",
                  marginBottom: "16px",
                  outline: "none",
                }}
                required
              />

              <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "20px" }}>
                Destination: <strong>HDFC Bank Account (****1981)</strong> &bull; Credit timeframe: ~2-4 hours.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "6px",
                    color: "#475569",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "#387ed1",
                    border: "none",
                    padding: "10px 22px",
                    borderRadius: "6px",
                    color: "#ffffff",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(56, 126, 209, 0.3)",
                  }}
                >
                  {loading ? "Processing..." : `Withdraw ₹${Number(withdrawAmount || 0).toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Funds;
