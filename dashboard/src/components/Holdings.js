// dashboard/src/components/Holdings.js

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalGraph";
import GeneralContext from "./GeneralContext";
import { BarChartOutlined, TrendingUpOutlined } from "@mui/icons-material";
import { getIndianMarketStatus } from "../utils/marketHours";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastTickChanges, setLastTickChanges] = useState({});
  const generalContext = useContext(GeneralContext);

  const fetchHoldings = () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
      .get(`${API_BASE_URL}/allholdings`, { withCredentials: true, headers })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setAllHoldings(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching holdings:", err);
        setError("Failed to fetch holdings data.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHoldings();
    const handleOrderPlaced = () => fetchHoldings();
    window.addEventListener("kite:order-placed", handleOrderPlaced);
    return () => window.removeEventListener("kite:order-placed", handleOrderPlaced);
  }, []);

  // Real-time micro-ticks and MTM recalculation (ONLY during live market hours)
  useEffect(() => {
    if (allHoldings.length === 0 || !getIndianMarketStatus().isOpen) return;

    const tickInterval = setInterval(() => {
      setAllHoldings((prevHoldings) => {
        const tickStatus = {};
        const updated = prevHoldings.map((stock) => {
          if (Math.random() > 0.45) {
            const pctDelta = (Math.random() * 0.14 - 0.07); // -0.07% to +0.07%
            const priceDelta = Number(((stock.price * pctDelta) / 100).toFixed(2));
            const newPrice = Math.max(1, Number((stock.price + priceDelta).toFixed(2)));
            tickStatus[stock.name] = priceDelta >= 0 ? "up" : "down";

            const avg = stock.avg || newPrice;
            const netPct = avg > 0 ? (((newPrice - avg) / avg) * 100).toFixed(2) : "0.00";
            return {
              ...stock,
              price: newPrice,
              net: `${Number(netPct) >= 0 ? "+" : ""}${netPct}%`,
              isLoss: priceDelta < 0,
            };
          }
          return stock;
        });
        setLastTickChanges(tickStatus);
        setTimeout(() => setLastTickChanges({}), 1000);
        return updated;
      });
    }, 4000);

    return () => clearInterval(tickInterval);
  }, [allHoldings.length]);

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
  const isOverallProfit = totalPL >= 0;

  const labels = allHoldings.map((subArray) => subArray["name"]);

  const data = {
    labels,
    datasets: [
      {
        label: "Stock Price",
        data: allHoldings.map((stock) => stock.price),
        backgroundColor: "rgba(56, 126, 209, 0.6)",
      },
    ],
  };

  if (loading) {
    return <div style={{ padding: "24px", color: "#64748b" }}>Loading holdings...</div>;
  }

  if (error) {
    return <h4 style={{ color: "#df514c", padding: "20px" }}>{error}</h4>;
  }

  return (
    <div style={{ padding: "10px 24px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h3 className="title" style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "#1e293b" }}>
            Holdings ({allHoldings.length})
          </h3>
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
            Delivery (CNC) equity investments held in your Demat account
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
          <span
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
            Total P&L: {isOverallProfit ? "+" : ""}₹{totalPL.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isOverallProfit ? "+" : ""}{plPercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="order-table" style={{ background: "#ffffff", borderRadius: "8px", overflow: "hidden", border: "1px solid #eef2f6" }}>
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Net chg.</th>
              <th>Day chg.</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allHoldings.length > 0 ? (
              allHoldings.map((stock, index) => {
                const curValue = stock.price * stock.qty;
                const isProfit = curValue - stock.avg * stock.qty >= 0.0;
                const profClass = isProfit ? "profit" : "loss";
                const dayClass = stock.isLoss ? "loss" : "profit";
                const tickState = lastTickChanges[stock.name];

                return (
                  <tr key={index}>
                    <td><strong style={{ color: "#0f172a" }}>{stock.name}</strong></td>
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
                      {isProfit ? "+" : ""}₹{(curValue - stock.avg * stock.qty).toFixed(2)}
                    </td>
                    <td className={profClass}>{stock.net || "+0.00%"}</td>
                    <td className={dayClass}>{stock.day || "+0.00%"}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        className="btn btn-blue"
                        style={{ padding: "4px 10px", fontSize: "11px", margin: 0, fontWeight: 700 }}
                        onClick={() => generalContext.openBuyWindow(stock.name)}
                      >
                        Buy
                      </button>
                      <button
                        className="btn btn-orange"
                        style={{ padding: "4px 10px", fontSize: "11px", marginLeft: "4px", fontWeight: 700 }}
                        onClick={() => generalContext.openSellWindow(stock.name)}
                      >
                        Sell
                      </button>
                      <button
                        type="button"
                        title="View Candlestick Chart"
                        style={{
                          padding: "4px 8px",
                          fontSize: "11px",
                          marginLeft: "4px",
                          background: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          cursor: "pointer",
                          color: "#475569",
                          verticalAlign: "middle",
                        }}
                        onClick={() => generalContext.openChartWindow(stock.name)}
                      >
                        <BarChartOutlined style={{ fontSize: "14px" }} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "28px 16px", color: "#64748b" }}>
                  <div style={{ marginBottom: "6px", fontWeight: 600 }}>No holdings yet in your Demat account</div>
                  <div style={{ fontSize: "0.82rem" }}>
                    Buy delivery shares with product <strong>CNC</strong> from Watchlist or Screener to start building your portfolio.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="row" style={{ marginTop: "24px" }}>
        <div className="col">
          <h5>
            ₹{totalInvestment.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5>
            ₹{currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5 className={isOverallProfit ? "profit" : "loss"}>
            {isOverallProfit ? "+" : ""}₹{totalPL.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (
            {isOverallProfit ? "+" : ""}
            {plPercent.toFixed(2)}%)
          </h5>
          <p>P&L</p>
        </div>
      </div>
      {allHoldings.length > 0 && <VerticalGraph data={data} />}
    </div>
  );
};

export default Holdings;
