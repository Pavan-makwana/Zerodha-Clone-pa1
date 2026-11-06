// dashboard/src/components/LiveChartModal.js

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import LiveCandlestickChart from "./LiveCandlestickChart";
import {
  CloseOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CandlestickChartOutlined,
  ShowChartOutlined,
  RefreshOutlined,
  FiberManualRecord,
} from "@mui/icons-material";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";

const LiveChartModal = ({ symbol, onClose }) => {
  const [candles, setCandles] = useState([]);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [timeframe, setTimeframe] = useState("1D");
  const [chartType, setChartType] = useState("candles");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  const { openBuyWindow, openSellWindow } = useContext(GeneralContext);

  const stockSymbol = symbol ? symbol.toUpperCase() : "INFY";

  // Fetch candle data for current timeframe
  const fetchCandleData = async (tf = timeframe) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/market/history/${stockSymbol}?timeframe=${tf}`, { timeout: 6000 });
      if (res.data?.candles && Array.isArray(res.data.candles)) {
        setCandles(res.data.candles);
      }
    } catch (err) {
      console.warn("Could not fetch candles:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch live current quote
  const fetchCurrentQuote = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/market/quote/${stockSymbol}`, { timeout: 5000 });
      if (res.data) {
        setCurrentQuote(res.data);
        if (res.data.price) {
          setCandles((prev) => {
            if (!prev || prev.length === 0) return prev;
            const updated = [...prev];
            const last = { ...updated[updated.length - 1] };
            last.close = res.data.price;
            last.high = Math.max(last.high, res.data.price);
            last.low = Math.min(last.low, res.data.price);
            last.isUp = last.close >= last.open;
            updated[updated.length - 1] = last;
            return updated;
          });
        }
      }
    } catch (err) {
      console.warn("Could not fetch current quote:", err.message);
    }
  };

  useEffect(() => {
    fetchCandleData(timeframe);
    fetchCurrentQuote();

    const quoteInterval = setInterval(fetchCurrentQuote, 8000);
    return () => clearInterval(quoteInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockSymbol, timeframe]);

  // Live micro-ticking: updates the latest candle in real-time
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setCandles((prevCandles) => {
        if (!prevCandles || prevCandles.length === 0) return prevCandles;

        const lastIdx = prevCandles.length - 1;
        const lastCandle = { ...prevCandles[lastIdx] };

        // subtle tick ±0.04%
        const delta = (Math.random() * 0.08 - 0.038) * (lastCandle.close * 0.01);
        const newClose = Number((lastCandle.close + delta).toFixed(2));
        const newHigh = Number(Math.max(lastCandle.high, newClose).toFixed(2));
        const newLow = Number(Math.min(lastCandle.low, newClose).toFixed(2));

        lastCandle.close = newClose;
        lastCandle.high = newHigh;
        lastCandle.low = newLow;
        lastCandle.isUp = newClose >= lastCandle.open;

        const updated = [...prevCandles];
        updated[lastIdx] = lastCandle;

        // Also update quote price
        setCurrentQuote((q) => (q ? { ...q, price: newClose } : { price: newClose }));

        return updated;
      });
    }, 2800);

    return () => clearInterval(tickInterval);
  }, []);

  const handleBuy = () => {
    openBuyWindow(stockSymbol);
  };

  const handleSell = () => {
    openSellWindow(stockSymbol);
  };

  const activePrice = currentQuote?.price || candles[candles.length - 1]?.close || 0;
  const activePercent = currentQuote?.percent || "+0.00%";
  const isDown = currentQuote?.isDown ?? (candles[candles.length - 1] ? candles[candles.length - 1].close < candles[candles.length - 1].open : false);
  const color = isDown ? "#df514c" : "#00a25b";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: isFullscreen ? "0" : "20px",
        boxSizing: "border-box",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: isFullscreen ? "100vw" : "92vw",
          maxWidth: isFullscreen ? "100vw" : "1100px",
          height: isFullscreen ? "100vh" : "85vh",
          maxHeight: isFullscreen ? "100vh" : "750px",
          backgroundColor: "#ffffff",
          borderRadius: isFullscreen ? "0" : "12px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          border: isFullscreen ? "none" : "1px solid #e2e8f0",
        }}
      >
        {/* Top Control Toolbar */}
        <div
          style={{
            padding: "12px 18px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#ffffff",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {/* Stock Info & Live Price */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontSize: "1.15rem",
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.2px",
              }}
            >
              {stockSymbol}
            </span>
            <span
              style={{
                fontSize: "0.72rem",
                background: "#f1f5f9",
                color: "#475569",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "4px",
              }}
            >
              NSE
            </span>

            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginLeft: "6px" }}>
              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
                ₹{Number(activePrice).toFixed(2)}
              </span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color }}>
                {activePercent}
              </span>
            </div>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "#00a25b",
                background: "#e6f7ed",
                padding: "2px 8px",
                borderRadius: "10px",
                marginLeft: "6px",
              }}
            >
              <FiberManualRecord style={{ fontSize: "8px", color: "#00a25b" }} />
              LIVE STREAM • IST
            </span>
          </div>

          {/* Timeframe & Chart Type Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Timeframe selector */}
            <div
              style={{
                display: "flex",
                background: "#f1f5f9",
                borderRadius: "6px",
                padding: "2px",
              }}
            >
              {["1D", "1W", "1M", "1Y"].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  style={{
                    padding: "4px 10px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    background: timeframe === tf ? "#ffffff" : "transparent",
                    color: timeframe === tf ? "#387ed1" : "#64748b",
                    boxShadow: timeframe === tf ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Chart Type Toggle */}
            <div
              style={{
                display: "flex",
                background: "#f1f5f9",
                borderRadius: "6px",
                padding: "2px",
              }}
            >
              <button
                type="button"
                title="Candlestick Chart"
                onClick={() => setChartType("candles")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px 8px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  background: chartType === "candles" ? "#ffffff" : "transparent",
                  color: chartType === "candles" ? "#387ed1" : "#64748b",
                  boxShadow: chartType === "candles" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                <CandlestickChartOutlined style={{ fontSize: "18px" }} />
              </button>
              <button
                type="button"
                title="Line Chart"
                onClick={() => setChartType("line")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px 8px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  background: chartType === "line" ? "#ffffff" : "transparent",
                  color: chartType === "line" ? "#387ed1" : "#64748b",
                  boxShadow: chartType === "line" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                <ShowChartOutlined style={{ fontSize: "18px" }} />
              </button>
            </div>

            {/* Buy / Sell Quick Buttons */}
            <div style={{ display: "flex", gap: "6px", marginLeft: "4px" }}>
              <button
                type="button"
                onClick={handleBuy}
                style={{
                  background: "#387ed1",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "5px 14px",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                Buy (B)
              </button>
              <button
                type="button"
                onClick={handleSell}
                style={{
                  background: "#df514c",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "5px 14px",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                Sell (S)
              </button>
            </div>

            {/* Refresh */}
            <button
              type="button"
              title="Refresh Data"
              onClick={() => fetchCandleData(timeframe)}
              style={{
                background: "none",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <RefreshOutlined style={{ fontSize: "20px" }} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              onClick={() => setIsFullscreen(!isFullscreen)}
              style={{
                background: "none",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {isFullscreen ? (
                <FullscreenExitOutlined style={{ fontSize: "20px" }} />
              ) : (
                <FullscreenOutlined style={{ fontSize: "20px" }} />
              )}
            </button>

            {/* Close Modal */}
            <button
              type="button"
              title="Close (Esc)"
              onClick={onClose}
              style={{
                background: "#f1f5f9",
                border: "none",
                borderRadius: "50%",
                color: "#475569",
                cursor: "pointer",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloseOutlined style={{ fontSize: "16px" }} />
            </button>
          </div>
        </div>

        {/* Chart Body */}
        <div style={{ flex: 1, position: "relative", minHeight: "350px", overflow: "hidden" }}>
          {loading && candles.length === 0 ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Loading real-time candlestick data for {stockSymbol}...
            </div>
          ) : (
            <LiveCandlestickChart
              candles={candles}
              currentPrice={activePrice}
              symbol={stockSymbol}
              chartType={chartType}
              timeframe={timeframe}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveChartModal;
