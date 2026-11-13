// dashboard/src/components/Screener.js

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import LiveChartModal from "./LiveChartModal";
import {
  SearchOutlined,
  ShowChartOutlined,
  AddOutlined,
  FiberManualRecord,
  CheckCircleOutline,
} from "@mui/icons-material";
import "./Screener.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";

const SECTORS_LIST = [
  "All",
  "Banking & Financials",
  "Information Technology",
  "Automotive",
  "Energy / Telecom",
  "Energy & Oil",
  "Defense & Aerospace",
  "FMCG",
  "Metals & Mining",
  "Utilities",
  "Internet & Delivery",
  "Financial Services",
];

const Screener = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePill, setActivePill] = useState("all");
  const [selectedSector, setSelectedSector] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("gainers");
  const [activeChartSymbol, setActiveChartSymbol] = useState(null);
  const [addedSymbols, setAddedSymbols] = useState({});

  const { openBuyWindow, openSellWindow } = useContext(GeneralContext);

  const fetchScreenerData = async () => {
    try {
      const params = {};
      if (selectedSector !== "All") params.sector = selectedSector;
      if (activePill === "gainers") params.sort = "gainers";
      else if (activePill === "losers") params.sort = "losers";
      else if (activePill === "52w_high") params.filter = "52w_high";
      else if (activePill === "large_cap") params.marketCap = "Large Cap";
      else if (activePill === "mid_cap") params.marketCap = "Mid Cap";
      else if (sortField) params.sort = sortField;

      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await axios.get(`${API_BASE_URL}/api/market/screener`, { params });
      if (Array.isArray(res.data)) {
        setStocks(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch screener data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenerData();
    const interval = setInterval(fetchScreenerData, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePill, selectedSector, searchQuery, sortField]);

  const handleAddWatchlist = async (stock) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        `${API_BASE_URL}/watchlist/add`,
        { name: stock.symbol, price: stock.price, percent: stock.percent, isDown: stock.isDown },
        { withCredentials: true, headers }
      );
      setAddedSymbols((prev) => ({ ...prev, [stock.symbol]: true }));
      window.dispatchEvent(new CustomEvent("kite:watchlist-updated"));
      setTimeout(() => {
        setAddedSymbols((prev) => ({ ...prev, [stock.symbol]: false }));
      }, 3000);
    } catch (err) {
      console.error("Failed to add to watchlist:", err);
    }
  };

  return (
    <div className="screener-wrapper">
      {/* Header */}
      <div className="screener-header">
        <div className="screener-title-area">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2>NSE Real-Time Stock Screener</h2>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#00a25b",
                background: "#e6f7ed",
                padding: "2px 8px",
                borderRadius: "10px",
              }}
            >
              <FiberManualRecord style={{ fontSize: "8px", color: "#00a25b" }} />
              LIVE FEED
            </span>
          </div>
          <p>Filter, screen, and execute simulated paper trades across 50+ Indian equities with real market rates.</p>
        </div>

        {/* Action Callout */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setActiveChartSymbol("NIFTY 50")}
            style={{
              background: "#f1f5f9",
              border: "1px solid #cbd5e1",
              padding: "6px 14px",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.8rem",
              cursor: "pointer",
              color: "#334155",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ShowChartOutlined style={{ fontSize: "16px", color: "#00a25b" }} />
            NIFTY 50 Chart
          </button>
        </div>
      </div>

      {/* Preset Filter Pills */}
      <div className="screener-pills-bar">
        {[
          { id: "all", label: "All Stocks" },
          { id: "gainers", label: "🔥 Top Gainers" },
          { id: "losers", label: "🔻 Top Losers" },
          { id: "52w_high", label: "🎯 Near 52W High" },
          { id: "large_cap", label: "🏢 Large Cap" },
          { id: "mid_cap", label: "🚀 Mid Cap" },
        ].map((pill) => (
          <button
            key={pill.id}
            type="button"
            className={`screener-pill ${activePill === pill.id ? "active" : ""}`}
            onClick={() => setActivePill(pill.id)}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Filter Row: Search & Sector Dropdown */}
      <div className="screener-filter-row">
        <div className="screener-search-box">
          <SearchOutlined
            style={{
              position: "absolute",
              left: "10px",
              top: "9px",
              fontSize: "18px",
              color: "#94a3b8",
            }}
          />
          <input
            type="text"
            className="screener-search-input"
            placeholder="Search stock by symbol, company, or sector (e.g. Reliance, IT, Tata)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="screener-sector-select"
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
        >
          {SECTORS_LIST.map((sec) => (
            <option key={sec} value={sec}>
              {sec === "All" ? "All Sectors" : sec}
            </option>
          ))}
        </select>

        <select
          className="screener-sector-select"
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
        >
          <option value="gainers">Sort: Highest Gainers %</option>
          <option value="losers">Sort: Highest Losers %</option>
          <option value="price">Sort: Share Price (High to Low)</option>
          <option value="volume">Sort: High Volume</option>
        </select>
      </div>

      {/* Screener Table */}
      <div className="screener-table-container">
        {loading && stocks.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            Scanning real-time Indian stock market feeds...
          </div>
        ) : stocks.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            No stocks matched your screener criteria. Try clearing search or selecting "All Sectors".
          </div>
        ) : (
          <table className="screener-table">
            <thead>
              <tr>
                <th>Stock & Sector</th>
                <th style={{ textAlign: "right" }}>Live Price</th>
                <th style={{ textAlign: "right" }}>Day Change</th>
                <th style={{ textAlign: "center" }}>52-Week Range</th>
                <th style={{ textAlign: "right" }}>Volume</th>
                <th style={{ textAlign: "center" }}>Paper Trade Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => {
                const capClass =
                  stock.marketCapCategory === "Large Cap"
                    ? "cap-large"
                    : stock.marketCapCategory === "Mid Cap"
                    ? "cap-mid"
                    : "cap-small";

                const rangePct =
                  stock.high52w && stock.low52w && stock.high52w > stock.low52w
                    ? Math.min(
                        100,
                        Math.max(
                          0,
                          ((stock.price - stock.low52w) / (stock.high52w - stock.low52w)) * 100
                        )
                      )
                    : 50;

                return (
                  <tr key={stock.symbol}>
                    <td>
                      <div style={{ display: "flex", alignItems: "baseline" }}>
                        <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                          {stock.symbol}
                        </strong>
                        <span className={`screener-badge-cap ${capClass}`}>
                          {stock.marketCapCategory}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#475569" }}>{stock.name}</div>
                      <span className="screener-badge-sector">{stock.sector}</span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <strong style={{ fontSize: "0.98rem", color: "#0f172a" }}>
                        ₹{Number(stock.price).toFixed(2)}
                      </strong>
                    </td>

                    <td
                      style={{
                        textAlign: "right",
                        color: stock.isDown ? "#df514c" : "#00a25b",
                        fontWeight: 700,
                      }}
                    >
                      <div>{stock.percent}</div>
                      <div style={{ fontSize: "0.74rem", fontWeight: 500 }}>
                        {stock.change >= 0 ? "+" : ""}
                        {Number(stock.change).toFixed(2)}
                      </div>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        ₹{Math.round(stock.low52w)}
                      </span>
                      <div className="screener-range-track">
                        <div
                          className="screener-range-thumb"
                          style={{ left: `calc(${rangePct}% - 5px)` }}
                        />
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        ₹{Math.round(stock.high52w)}
                      </span>
                    </td>

                    <td style={{ textAlign: "right", color: "#475569", fontSize: "0.82rem" }}>
                      {(stock.volume / 1000).toFixed(1)}k
                    </td>

                    <td>
                      <div
                        className="screener-actions-group"
                        style={{ justifyContent: "center" }}
                      >
                        <button
                          type="button"
                          className="btn-action-buy"
                          title={`Buy ${stock.symbol}`}
                          onClick={() => openBuyWindow(stock.symbol)}
                        >
                          B
                        </button>
                        <button
                          type="button"
                          className="btn-action-sell"
                          title={`Sell ${stock.symbol}`}
                          onClick={() => openSellWindow(stock.symbol)}
                        >
                          S
                        </button>
                        <button
                          type="button"
                          className="btn-action-chart"
                          title="Open Live Candlestick Chart"
                          onClick={() => setActiveChartSymbol(stock.symbol)}
                        >
                          <ShowChartOutlined style={{ fontSize: "14px" }} />
                          Chart
                        </button>
                        <button
                          type="button"
                          className="btn-action-chart"
                          title="Add to Watchlist"
                          onClick={() => handleAddWatchlist(stock)}
                          style={{
                            color: addedSymbols[stock.symbol] ? "#00a25b" : "#475569",
                          }}
                        >
                          {addedSymbols[stock.symbol] ? (
                            <CheckCircleOutline style={{ fontSize: "14px", color: "#00a25b" }} />
                          ) : (
                            <AddOutlined style={{ fontSize: "14px" }} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Live Candlestick Chart Modal */}
      {activeChartSymbol && (
        <LiveChartModal
          symbol={activeChartSymbol}
          onClose={() => setActiveChartSymbol(null)}
        />
      )}
    </div>
  );
};

export default Screener;
