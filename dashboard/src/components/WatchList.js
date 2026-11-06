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
} from "@mui/icons-material";

import { watchlist as defaultLocalWatchlist } from "../data/data";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";

const WatchList = () => {
  const [watchlistItems, setWatchlistItems] = useState(defaultLocalWatchlist);
  const [searchTerm, setSearchTerm] = useState("");
  const [newStockSymbol, setNewStockSymbol] = useState("");
  const [newStockPrice, setNewStockPrice] = useState("");
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const { showToast } = useContext(GeneralContext);

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

            // calculate new net percent
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
          price = 500.0;
        }
      } catch (err) {
        console.warn("Live ticker lookup failed, using default:", err.message);
        price = 500.0;
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

  const filteredWatchlist = watchlistItems.filter((stock) =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="watchlist-container">
      <div className="search-container" style={{ position: "relative" }}>
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search eg: infy, bse, tcs, reliance"
          className="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="counts">
          {filteredWatchlist.length} / {watchlistItems.length}
        </span>
      </div>

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
          <li style={{ padding: "16px", color: "#888", textAlign: "center" }}>
            No stocks found matching "{searchTerm}"
          </li>
        )}
      </ul>

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
        <span style={{ fontSize: "11px", color: "#999" }}>Kite 3.0</span>
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
