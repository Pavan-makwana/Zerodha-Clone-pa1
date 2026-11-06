// dashboard/src/components/TopBar.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import Menu from "./Menu";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";

const TopBar = () => {
  const [indices, setIndices] = useState({
    nifty: { price: "24,890.95", rawPrice: 24890.95, percent: "+1.40%", isDown: false },
    sensex: { price: "80,593.23", rawPrice: 80593.23, percent: "+1.60%", isDown: false },
    isLive: false,
  });

  const fetchLiveIndices = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/market/indices`, { timeout: 5000 });
      if (res.data && res.data.nifty && res.data.sensex) {
        setIndices({
          nifty: res.data.nifty,
          sensex: res.data.sensex,
          isLive: true,
        });
      }
    } catch (err) {
      console.warn("Using baseline indices fallback:", err.message);
    }
  };

  // Initial fetch and 25s polling from real market API
  useEffect(() => {
    fetchLiveIndices();
    const pollInterval = setInterval(fetchLiveIndices, 25000);
    return () => clearInterval(pollInterval);
  }, []);

  // Subtle real-time micro-ticks for realistic trading terminal feel
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setIndices((prev) => {
        const niftyDelta = (Math.random() * 3.5 - 1.6);
        const sensexDelta = (Math.random() * 11.0 - 5.2);

        const newNiftyRaw = Math.max(1000, (prev.nifty.rawPrice || 24890) + niftyDelta);
        const newSensexRaw = Math.max(1000, (prev.sensex.rawPrice || 80593) + sensexDelta);

        return {
          ...prev,
          nifty: {
            ...prev.nifty,
            rawPrice: newNiftyRaw,
            price: newNiftyRaw.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isDown: niftyDelta < 0 ? (Math.random() > 0.5 ? prev.nifty.isDown : true) : prev.nifty.isDown,
          },
          sensex: {
            ...prev.sensex,
            rawPrice: newSensexRaw,
            price: newSensexRaw.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            isDown: sensexDelta < 0 ? (Math.random() > 0.5 ? prev.sensex.isDown : true) : prev.sensex.isDown,
          },
        };
      });
    }, 3200);

    return () => clearInterval(tickInterval);
  }, []);

  const niftyColor = indices.nifty.isDown ? "#df514c" : "#00a25b";
  const sensexColor = indices.sensex.isDown ? "#df514c" : "#00a25b";

  return (
    <div className="topbar-container">
      <div className="indices-container" style={{ display: "flex", alignItems: "center" }}>
        <div className="nifty" style={{ display: "flex", alignItems: "center", cursor: "default" }}>
          <p className="index" style={{ fontWeight: 600, color: "#475569" }}>NIFTY 50</p>
          <p className="index-points" style={{ color: niftyColor, fontWeight: 700, marginLeft: "6px", transition: "color 0.3s ease" }}>
            {indices.nifty.price}
          </p>
          <p className="percent" style={{ color: niftyColor, fontWeight: 600, marginLeft: "4px", fontSize: "0.78rem" }}>
            {indices.nifty.percent}
          </p>
        </div>

        <div className="sensex" style={{ display: "flex", alignItems: "center", cursor: "default", marginLeft: "18px" }}>
          <p className="index" style={{ fontWeight: 600, color: "#475569" }}>SENSEX</p>
          <p className="index-points" style={{ color: sensexColor, fontWeight: 700, marginLeft: "6px", transition: "color 0.3s ease" }}>
            {indices.sensex.price}
          </p>
          <p className="percent" style={{ color: sensexColor, fontWeight: 600, marginLeft: "4px", fontSize: "0.78rem" }}>
            {indices.sensex.percent}
          </p>
        </div>

        {indices.isLive && (
          <span
            title="Streaming Live Market Rates (NSE/BSE)"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              marginLeft: "14px",
              padding: "2px 7px",
              background: "#e6f7ed",
              color: "#00a25b",
              borderRadius: "10px",
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00a25b" }}></span>
            LIVE
          </span>
        )}
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;
