import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import { Tooltip, Grow } from "@mui/material";
import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  DeleteOutline,
  Add,
  FiberManualRecord,
  SearchOutlined,
} from "@mui/icons-material";

import { watchlist as defaultLocalWatchlist } from "../data/data";
import { INDIAN_STOCKS_DIRECTORY } from "../data/indianStocks";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";

const WatchList = () => {
  const [watchlistItems, setWatchlistItems] = useState(defaultLocalWatchlist);
  const [searchTerm, setSearchTerm] = useState("");
  const [newStockSymbol, setNewStockSymbol] = useState("");
  const [newStockPrice, setNewStockPrice] = useState("");
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const { showToast, openBuyWindow, openSellWindow, openChartWindow } = useContext(GeneralContext);

  // Sync real-time market quotes for given items
  const syncLiveMarketPrices = async (items) => {
    if (!items || items.length === 0) return;
    try {
      const symbols = items.map((s) => s.name).join(",");
      const res = await axios.get(`${API_BASE_URL}/api/market/quotes?symbols=${symbols}`, { timeout: 6000 });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setIsLiveStreaming(true);
        const quoteMap = new Map();
        res.data.forEach((q) => quoteMap.set(q.name.toUpperCase(), q));

        setWatchlistItems((prev) =>
          prev.map((item) => {
            const live = quoteMap.get(item.name.toUpperCase());
            if (live) {
              return {
                ...item,
                price: live.price,
                percent: live.percent,
                isDown: live.isDown,
                isLive: live.isLive,
              };
            }
            return item;
          })
        );
      }
    } catch (err) {
      console.warn("Could not sync live market quotes:", err.message);
    }
  };

  // Initial load from user's saved watchlist + live market quotes
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
      .get(`${API_BASE_URL}/watchlist`, { withCredentials: true, headers })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setWatchlistItems(res.data);
          syncLiveMarketPrices(res.data);
        } else {
          syncLiveMarketPrices(defaultLocalWatchlist);
        }
      })
      .catch((err) => {
        console.warn("Using local watchlist fallback:", err);
        syncLiveMarketPrices(defaultLocalWatchlist);
      });
  }, []);

  // Poll real market prices periodically (every 25 seconds)
  useEffect(() => {
    const pollInterval = setInterval(() => {
      syncLiveMarketPrices(watchlistItems);
    }, 25000);

    return () => clearInterval(pollInterval);
  }, [watchlistItems]);

  // Subtle live micro-ticks for realistic trading terminal dynamics
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setWatchlistItems((prevItems) => {
        return prevItems.map((stock) => {
          // randomly tick ~40% of stocks each cycle
          if (Math.random() > 0.6) {
            const pctChange = (Math.random() * 0.16 - 0.08); // -0.08% to +0.08%
            const delta = Number(((stock.price * pctChange) / 100).toFixed(2));
            const newPrice = Math.max(1, Number((stock.price + delta).toFixed(2)));
            const isDown = delta < 0;

            const currentPctNum = parseFloat(stock.percent || "0");
            const newPctNum = currentPctNum + (pctChange * 0.5);
            const percentStr = `${newPctNum >= 0 ? "+" : ""}${newPctNum.toFixed(2)}%`;

            return {
              ...stock,
              price: newPrice,
              isDown,
              percent: percentStr,
            };
          }
          return stock;
        });
      });
    }, 3000);

    return () => clearInterval(tickInterval);
  }, []);

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!newStockSymbol.trim()) return;

    const symbol = newStockSymbol.toUpperCase().trim();
    let price = Number(newStockPrice);
    let percent = "+0.00%";
    let isDown = false;

    // If user left price empty, fetch live market price for that ticker!
    if (!price || isNaN(price)) {
      try {
        const liveRes = await axios.get(`${API_BASE_URL}/api/market/quote/${symbol}`, { timeout: 4500 });
        if (liveRes.data && liveRes.data.price) {
          price = liveRes.data.price;
          percent = liveRes.data.percent || "+0.00%";
          isDown = liveRes.data.isDown || false;
        } else {
          // Check local directory
          const match = INDIAN_STOCKS_DIRECTORY.find((s) => s.symbol === symbol);
          price = match ? match.baseline : 500.0;
        }
      } catch (err) {
        const match = INDIAN_STOCKS_DIRECTORY.find((s) => s.symbol === symbol);
        price = match ? match.baseline : 500.0;
      }
    }

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        `${API_BASE_URL}/watchlist/add`,
        { name: symbol, price },
        { withCredentials: true, headers }
      );
      setWatchlistItems((prev) => [...prev, { ...res.data, percent, isDown }]);
      showToast({ title: "Stock Added", message: `Added ${symbol} at ₹${price.toFixed(2)} from live market.`, type: "success", duration: 5000 });
    } catch (err) {
      console.warn("Adding locally:", err);
      const newItem = {
        name: symbol,
        price,
        percent,
        isDown,
      };
      setWatchlistItems((prev) => [...prev, newItem]);
      showToast({ title: "Stock Added", message: `Added ${symbol} at ₹${price.toFixed(2)}.`, type: "success", duration: 5000 });
    }

    setNewStockSymbol("");
    setNewStockPrice("");
    setIsAddingStock(false);
  };

  const handleAddDirectStock = async (marketStock) => {
    const symbol = marketStock.symbol;
    let price = marketStock.baseline;
    let percent = "+0.50%";
    let isDown = false;

    try {
      const liveRes = await axios.get(`${API_BASE_URL}/api/market/quote/${symbol}`, { timeout: 4000 });
      if (liveRes.data?.price) {
        price = liveRes.data.price;
        percent = liveRes.data.percent || "+0.50%";
        isDown = liveRes.data.isDown || false;
      }
    } catch (e) {}

    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const res = await axios.post(
        `${API_BASE_URL}/watchlist/add`,
        { name: symbol, price },
        { withCredentials: true, headers }
      );
      setWatchlistItems((prev) => [...prev, { ...res.data, percent, isDown }]);
    } catch (err) {
      setWatchlistItems((prev) => [...prev, { name: symbol, price, percent, isDown }]);
    }

    showToast({
      title: "Stock Added",
      message: `Added ${symbol} (${marketStock.name}) at ₹${price.toFixed(2)} to watchlist.`,
      type: "success",
      duration: 5000,
    });
    setSearchTerm("");
  };

  const handleDeleteStock = async (stockName) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(`${API_BASE_URL}/watchlist/${stockName}`, {
        withCredentials: true,
        headers,
      });
    } catch (err) {
      console.warn("Deleting locally:", err);
    }

    setWatchlistItems((prev) => prev.filter((item) => item.name !== stockName));
    showToast({ title: "Watchlist Updated", message: `Removed ${stockName} from watchlist.`, type: "info", duration: 5000 });
  };

  // 1. Current Watchlist Items matching search
  const filteredWatchlist = watchlistItems.filter((stock) =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Global Indian Market Directory Results matching search (excluding already in watchlist)
  const existingSymbols = new Set(watchlistItems.map((s) => s.name.toUpperCase()));
  const marketSearchResults = searchTerm.trim().length > 0
    ? INDIAN_STOCKS_DIRECTORY.filter(
        (s) =>
          !existingSymbols.has(s.symbol) &&
          (s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.sector.toLowerCase().includes(searchTerm.toLowerCase()))
      ).slice(0, 8)
    : [];

  return (
    <div className="watchlist-container">
      {/* Search Input Bar */}
      <div className="search-container" style={{ position: "relative" }}>
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search eg: reliance, tcs, hdfc, infy, tata"
          className="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="counts">
          {filteredWatchlist.length} / {watchlistItems.length}
        </span>
      </div>

      {/* Watchlist Header Bar */}
      <div style={{ padding: "8px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>Watchlist 1</span>
          {isLiveStreaming && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "#00a25b",
                background: "#e6f7ed",
                padding: "1px 6px",
                borderRadius: "8px",
              }}
            >
              <FiberManualRecord style={{ fontSize: "8px", color: "#00a25b" }} />
              LIVE
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsAddingStock(!isAddingStock)}
          style={{
            background: "none",
            border: "none",
            color: "#387ed1",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "2px",
          }}
        >
          <Add style={{ fontSize: "16px" }} /> Add Stock
        </button>
      </div>

      {/* Manual Quick Add Form */}
      {isAddingStock && (
        <form
          onSubmit={handleAddStock}
          style={{
            padding: "10px 14px",
            background: "#f1f5f9",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            gap: "6px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Symbol (e.g. ZOMATO, SBIN, PAYTM)"
            value={newStockSymbol}
            onChange={(e) => setNewStockSymbol(e.target.value)}
            style={{ flex: 1, padding: "6px 10px", fontSize: "12px", border: "1px solid #cbd5e1", borderRadius: "4px", outline: "none" }}
            required
          />
          <input
            type="number"
            step="0.05"
            placeholder="Price (auto if blank)"
            value={newStockPrice}
            onChange={(e) => setNewStockPrice(e.target.value)}
            style={{ width: "110px", padding: "6px 8px", fontSize: "12px", border: "1px solid #cbd5e1", borderRadius: "4px", outline: "none" }}
          />
          <button
            type="submit"
            style={{
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 700,
              backgroundColor: "#387ed1",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </form>
      )}

      {/* Current Watchlist Items */}
      <ul className="list">
        {filteredWatchlist.length > 0 ? (
          filteredWatchlist.map((stock, index) => {
            return (
              <WatchListItem
                stock={stock}
                key={stock._id || `${stock.name}_${index}`}
                onDelete={() => handleDeleteStock(stock.name)}
              />
            );
          })
        ) : (
          searchTerm.trim().length === 0 && (
            <li style={{ padding: "16px", color: "#888", textAlign: "center" }}>
              Your watchlist is empty. Search any Indian stock above to add!
            </li>
          )
        )}
      </ul>

      {/* Global Indian Market (NSE) Search Results */}
      {marketSearchResults.length > 0 && (
        <div style={{ borderTop: "2px solid #e2e8f0", background: "#f8fafc" }}>
          <div
            style={{
              padding: "7px 14px",
              fontSize: "11px",
              fontWeight: 700,
              color: "#475569",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#f1f5f9",
              letterSpacing: "0.5px",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <SearchOutlined style={{ fontSize: "14px", color: "#387ed1" }} />
              NSE MARKET DIRECTORY
            </span>
            <span style={{ fontSize: "10px", color: "#64748b" }}>
              {marketSearchResults.length} stocks found
            </span>
          </div>

          <ul className="list" style={{ margin: 0, padding: 0 }}>
            {marketSearchResults.map((stock) => (
              <MarketSearchResultRow
                key={stock.symbol}
                stock={stock}
                onAdd={() => handleAddDirectStock(stock)}
                onBuy={() => openBuyWindow(stock.symbol)}
                onSell={() => openSellWindow(stock.symbol)}
                onChart={() => openChartWindow(stock.symbol)}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Kite Watchlist Pagination Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        borderTop: "1px solid #eee",
        background: "#fafafa",
        fontSize: "12px",
        color: "#666"
      }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setActiveTab(num)}
              style={{
                background: activeTab === num ? "#387ed1" : "transparent",
                color: activeTab === num ? "#fff" : "#666",
                border: "none",
                borderRadius: "3px",
                width: "24px",
                height: "24px",
                cursor: "pointer",
                fontWeight: activeTab === num ? "bold" : "normal",
                fontSize: "11px",
              }}
            >
              {num}
            </button>
          ))}
        </div>
        <span style={{ fontSize: "11px", color: "#999" }}>Kite 3.0 &bull; NSE Live</span>
      </div>
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock, onDelete }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);
  const [flashColor, setFlashColor] = useState(null);
  const prevPriceRef = useRef(stock.price);

  useEffect(() => {
    if (prevPriceRef.current !== undefined && prevPriceRef.current !== stock.price) {
      if (stock.price > prevPriceRef.current) {
        setFlashColor("#e6f7ed"); // green flash
      } else if (stock.price < prevPriceRef.current) {
        setFlashColor("#fdeeee"); // red flash
      }
      const timer = setTimeout(() => setFlashColor(null), 600);
      prevPriceRef.current = stock.price;
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = stock.price;
  }, [stock.price]);

  const handleMouseEnter = () => {
    setShowWatchlistActions(true);
  };

  const handleMouseLeave = () => {
    setShowWatchlistActions(false);
  };

  return (
    <li
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundColor: flashColor || "transparent",
        transition: "background-color 0.4s ease",
      }}
    >
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
        <div className="itemInfo">
          <span className="percent">{stock.percent}</span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="up" />
          )}
          <span className="price" style={{ fontWeight: 600 }}>₹{Number(stock.price).toFixed(2)}</span>
        </div>
      </div>
      {showWatchlistActions && (
        <WatchListActions uid={stock.name} onDelete={onDelete} />
      )}
    </li>
  );
};

const WatchListActions = ({ uid, onDelete }) => {
  const generalContext = useContext(GeneralContext);

  const handleBuyClick = () => {
    generalContext.openBuyWindow(uid);
  };

  const handleSellClick = () => {
    generalContext.openSellWindow(uid);
  };

  return (
    <span className="actions">
      <span>
        <Tooltip title="Buy (B)" placement="top" arrow TransitionComponent={Grow}>
          <button className="buy" onClick={handleBuyClick}>Buy</button>
        </Tooltip>
        <Tooltip title="Sell (S)" placement="top" arrow TransitionComponent={Grow}>
          <button className="sell" onClick={handleSellClick}>Sell</button>
        </Tooltip>
        <Tooltip title="Chart" placement="top" arrow TransitionComponent={Grow}>
          <button className="action" onClick={() => generalContext.openChartWindow(uid)}>
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip title="Delete from Watchlist" placement="top" arrow TransitionComponent={Grow}>
          <button className="action" onClick={onDelete}>
            <DeleteOutline className="icon" style={{ color: "#df514c" }} />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};

/**
 * Global Search Result Row Component
 * Allows 1-click addition to Watchlist, Live Chart inspection, and Buy/Sell
 */
const MarketSearchResultRow = ({ stock, onAdd, onBuy, onSell, onChart }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <li
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "8px 14px",
        borderBottom: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: hovered ? "#f8fafc" : "#ffffff",
        transition: "background 0.15s ease",
      }}
    >
      <div style={{ flex: 1, minWidth: 0, paddingRight: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <strong style={{ fontSize: "12px", color: "#0f172a" }}>{stock.symbol}</strong>
          <span style={{ fontSize: "10px", background: "#f1f5f9", color: "#64748b", padding: "1px 5px", borderRadius: "3px" }}>
            NSE
          </span>
        </div>
        <div style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {stock.name} &bull; <span style={{ color: "#94a3b8" }}>{stock.sector}</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
          ₹{stock.baseline.toFixed(2)}
        </span>

        {hovered ? (
          <div style={{ display: "flex", gap: "4px" }}>
            <Tooltip title="Add to Watchlist" arrow>
              <button
                type="button"
                onClick={onAdd}
                style={{
                  background: "#00a25b",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "3px",
                  padding: "3px 7px",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + Add
              </button>
            </Tooltip>
            <Tooltip title="View Candlestick Chart" arrow>
              <button
                type="button"
                onClick={onChart}
                style={{
                  background: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  borderRadius: "3px",
                  padding: "3px 6px",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <BarChartOutlined style={{ fontSize: "14px" }} />
              </button>
            </Tooltip>
            <Tooltip title="Buy" arrow>
              <button
                type="button"
                onClick={onBuy}
                style={{
                  background: "#387ed1",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "3px",
                  padding: "3px 7px",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                B
              </button>
            </Tooltip>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            style={{
              background: "#e8f2fc",
              color: "#387ed1",
              border: "1px solid #d0e3fa",
              borderRadius: "3px",
              padding: "2px 8px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            + Add
          </button>
        )}
      </div>
    </li>
  );
};
