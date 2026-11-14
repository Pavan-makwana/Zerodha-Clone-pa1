// dashboard/src/components/Positions.js

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import {
  BarChartOutlined,
  CloseFullscreenOutlined,
  TrendingUpOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { getIndianMarketStatus } from "../utils/marketHours";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";

const Positions = () => {
  const [allPositions, setAllPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exitingSymbol, setExitingSymbol] = useState(null);
  const [lastTickChanges, setLastTickChanges] = useState({});
  const { showToast, openChartWindow } = useContext(GeneralContext);

  const fetchPositions = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE_URL}/allpositions`, {
        withCredentials: true,
        headers,
      });
      if (Array.isArray(res.data)) {
        setAllPositions(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching positions:", err);
      setError("Failed to fetch positions data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    const handleOrderPlaced = () => fetchPositions();
    window.addEventListener("kite:order-placed", handleOrderPlaced);
    return () => window.removeEventListener("kite:order-placed", handleOrderPlaced);
  }, []);

  // Real-time market tick polling & simulated exchange micro-ticks (ONLY during live market hours)
  useEffect(() => {
    if (allPositions.length === 0 || !getIndianMarketStatus().isOpen) return;

    const tickInterval = setInterval(() => {
      setAllPositions((prevPositions) => {
        const tickStatus = {};
        const updated = prevPositions.map((pos) => {
          // 50% chance of micro-tick per cycle
          if (Math.random() > 0.45) {
            const pctDelta = (Math.random() * 0.16 - 0.08); // -0.08% to +0.08%
            const priceDelta = Number(((pos.price * pctDelta) / 100).toFixed(2));
            const newPrice = Math.max(1, Number((pos.price + priceDelta).toFixed(2)));
            tickStatus[pos.name] = priceDelta >= 0 ? "up" : "down";

            const avg = pos.avg || newPrice;
            const netPct = avg > 0 ? (((newPrice - avg) / avg) * 100).toFixed(2) : "0.00";
            return {
              ...pos,
              price: newPrice,
              net: `${Number(netPct) >= 0 ? "+" : ""}${netPct}%`,
              isLoss: priceDelta < 0,
            };
          }
          return pos;
        });
        setLastTickChanges(tickStatus);
        setTimeout(() => setLastTickChanges({}), 1000);
        return updated;
      });
    }, 3800);

    return () => clearInterval(tickInterval);
  }, [allPositions.length]);

  // Square off a single position
  const handleSquareOff = async (stock) => {
    try {
      setExitingSymbol(stock.name);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        `${API_BASE_URL}/positions/exit`,
        {
          name: stock.name,
          product: stock.product,
          price: stock.price,
        },
        { withCredentials: true, headers }
      );

      const pl = res.data?.realizedPL !== undefined
        ? res.data.realizedPL
        : ((stock.price - stock.avg) * stock.qty);

      showToast(
        `Squared off ${stock.qty} shares of ${stock.name}! Realized P&L: ${pl >= 0 ? "+" : ""}₹${Number(pl).toFixed(2)}`,
        pl >= 0 ? "success" : "warning",
        10000
      );

      // Notify other views (Summary, Funds, Orders)
      window.dispatchEvent(new CustomEvent("kite:order-placed"));
      fetchPositions();
    } catch (err) {
      console.error("Square off failed:", err);
      showToast(
        err.response?.data?.message || `Failed to square off ${stock.name}`,
        "error",
        10000
      );
    } finally {
      setExitingSymbol(null);
    }
  };

  // Square off all open positions
  const handleSquareOffAll = async () => {
    if (allPositions.length === 0) return;
    try {
      setExitingSymbol("ALL");
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        `${API_BASE_URL}/positions/exit-all`,
        {},
        { withCredentials: true, headers }
      );

      showToast(
        res.data?.message || "All positions squared off successfully!",
        "success",
        10000
      );

      window.dispatchEvent(new CustomEvent("kite:order-placed"));
      fetchPositions();
    } catch (err) {
      console.error("Square off all failed:", err);
      showToast("Failed to square off all positions", "error", 10000);
    } finally {
      setExitingSymbol(null);
    }
  };

  const totalPositionsPL = allPositions.reduce((acc, stock) => {
    const curVal = (stock.price || 0) * (stock.qty || 0);
    const cost = (stock.avg || 0) * (stock.qty || 0);
    return acc + (curVal - cost);
  }, 0);

  const isOverallProfit = totalPositionsPL >= 0;

  if (loading) {
    return <div style={{ padding: "24px", color: "#64748b" }}>Loading positions...</div>;
  }

  if (error) {
    return <h4 style={{ color: "#df514c", padding: "20px" }}>{error}</h4>;
  }

  return (
    <div style={{ padding: "10px 24px 40px" }}>
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div>
          <h3 className="title" style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "#1e293b" }}>
            Open Positions ({allPositions.length})
          </h3>
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
            Real-time Mark-to-Market (MTM) P&L updates with live exchange ticks
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {!getIndianMarketStatus().isOpen && (
            <span
              style={{
                background: "#f1f5f9",
                color: "#64748b",
                border: "1px solid #cbd5e1",
                padding: "4px 10px",
                borderRadius: "14px",
                fontSize: "0.72rem",
                fontWeight: 600,
              }}
            >
              Market Closed (Friday Close)
            </span>
          )}
          {allPositions.length > 0 && (
            <div
              style={{
                background: isOverallProfit ? "#e6f7ed" : "#fdeeee",
                color: isOverallProfit ? "#00a25b" : "#df514c",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <TrendingUpOutlined style={{ fontSize: "16px" }} />
              Total MTM: {isOverallProfit ? "+" : ""}₹{totalPositionsPL.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}

          {allPositions.length > 0 && (
            <button
              type="button"
              disabled={exitingSymbol === "ALL"}
              onClick={handleSquareOffAll}
              style={{
                background: "#df514c",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "7px 14px",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 6px rgba(223, 81, 76, 0.25)",
              }}
            >
              <CloseFullscreenOutlined style={{ fontSize: "14px" }} />
              {exitingSymbol === "ALL" ? "Exiting All..." : "Square Off All"}
            </button>
          )}
        </div>
      </div>

      {/* Intraday Leverage Learning Note */}
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "10px 14px",
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "0.78rem",
          color: "#475569",
        }}
      >
        <InfoOutlined style={{ fontSize: "16px", color: "#387ed1" }} />
        <span>
          <strong>MIS Intraday Positions:</strong> 5x leverage applied. Intraday positions are auto-squared off before market close (3:20 PM IST). Click <strong>Exit (Square Off)</strong> to book profits or cut losses anytime.
        </span>
      </div>

      {/* Positions Table */}
      <div className="order-table" style={{ background: "#ffffff", borderRadius: "8px", overflow: "hidden", border: "1px solid #eef2f6" }}>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Chg.</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allPositions.length > 0 ? (
              allPositions.map((stock, index) => {
                const curValue = (stock.price || 0) * (stock.qty || 0);
                const cost = (stock.avg || 0) * (stock.qty || 0);
                const pl = curValue - cost;
                const isProfit = pl >= 0.0;
                const profClass = isProfit ? "profit" : "loss";
                const dayClass = stock.isLoss ? "loss" : "profit";
                const tickState = lastTickChanges[stock.name];

                return (
                  <tr key={index}>
                    <td>
                      <span
                        style={{
                          background: stock.product === "MIS" ? "#eff6ff" : "#f1f5f9",
                          color: stock.product === "MIS" ? "#2563eb" : "#475569",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {stock.product || "MIS"} {stock.product === "MIS" ? "(5x)" : ""}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "#0f172a" }}>{stock.name}</strong>
                    </td>
                    <td>{stock.qty}</td>
                    <td>₹{(stock.avg || 0).toFixed(2)}</td>
                    <td
                      style={{
                        fontWeight: 600,
                        backgroundColor: tickState === "up" ? "#e6f7ed" : tickState === "down" ? "#fdeeee" : "transparent",
                        transition: "background-color 0.4s ease",
                      }}
                    >
                      ₹{(stock.price || 0).toFixed(2)}
                    </td>
                    <td>₹{curValue.toFixed(2)}</td>
                    <td className={profClass} style={{ fontWeight: 700 }}>
                      {isProfit ? "+" : ""}₹{pl.toFixed(2)}
                    </td>
                    <td className={dayClass} style={{ fontWeight: 600 }}>
                      {stock.day || "+0.00%"}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        type="button"
                        title="View Live Candlestick Chart"
                        onClick={() => openChartWindow(stock.name)}
                        style={{
                          padding: "4px 8px",
                          fontSize: "11px",
                          background: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          cursor: "pointer",
                          color: "#475569",
                          marginRight: "6px",
                          verticalAlign: "middle",
                        }}
                      >
                        <BarChartOutlined style={{ fontSize: "14px" }} />
                      </button>
                      <button
                        type="button"
                        disabled={exitingSymbol === stock.name}
                        onClick={() => handleSquareOff(stock)}
                        style={{
                          padding: "4px 12px",
                          fontSize: "11px",
                          fontWeight: 700,
                          background: "#df514c",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          verticalAlign: "middle",
                          boxShadow: "0 1px 3px rgba(223, 81, 76, 0.2)",
                        }}
                      >
                        {exitingSymbol === stock.name ? "Exiting..." : "Exit (Square Off)"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "28px 16px", color: "#64748b" }}>
                  <div style={{ marginBottom: "6px", fontWeight: 600 }}>No open positions right now</div>
                  <div style={{ fontSize: "0.82rem" }}>
                    Select a stock from the <strong>Watchlist</strong> or <strong>Stock Screener</strong> with product <strong>MIS (Intraday)</strong> to practice leveraged trading.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Positions;
