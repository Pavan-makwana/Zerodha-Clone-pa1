import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import { Tooltip, Grow } from "@mui/material";
import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  DeleteOutline,
  Add,
} from "@mui/icons-material";

import { watchlist as defaultLocalWatchlist } from "../data/data";
import { DoughnutChart } from "./DoughnoutChart";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";

const WatchList = () => {
  const [watchlistItems, setWatchlistItems] = useState(defaultLocalWatchlist);
  const [searchTerm, setSearchTerm] = useState("");
  const [newStockSymbol, setNewStockSymbol] = useState("");
  const [newStockPrice, setNewStockPrice] = useState("");
  const [isAddingStock, setIsAddingStock] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
      .get(`${API_BASE_URL}/watchlist`, { withCredentials: true, headers })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setWatchlistItems(res.data);
        }
      })
      .catch((err) => {
        console.warn("Using local watchlist fallback:", err);
      });
  }, []);

  // Simulated live price ticks for trading realism
  useEffect(() => {
    const interval = setInterval(() => {
      setWatchlistItems((prevItems) => {
        return prevItems.map((stock) => {
          // randomly tick 1 or 2 stocks every cycle
          if (Math.random() > 0.4) {
            const delta = (Math.random() * 2 - 0.98); // -0.98 to +1.02
            const newPrice = Math.max(1, Number((stock.price + delta).toFixed(2)));
            const isDown = delta < 0;
            const percentVal = (delta / stock.price) * 100;
            const percentStr = `${percentVal >= 0 ? "+" : ""}${percentVal.toFixed(2)}%`;
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
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!newStockSymbol.trim()) return;

    const symbol = newStockSymbol.toUpperCase().trim();
    const price = Number(newStockPrice) || 500.0;

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        `${API_BASE_URL}/watchlist/add`,
        { name: symbol, price },
        { withCredentials: true, headers }
      );
      setWatchlistItems((prev) => [...prev, res.data]);
    } catch (err) {
      console.warn("Adding locally:", err);
      const newItem = {
        name: symbol,
        price,
        percent: "+0.00%",
        isDown: false,
      };
      setWatchlistItems((prev) => [...prev, newItem]);
    }

    setNewStockSymbol("");
    setNewStockPrice("");
    setIsAddingStock(false);
  };

  const handleDeleteStock = async (stockName) => {
    if (!window.confirm(`Remove ${stockName} from watchlist?`)) return;

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
  };

  const filteredWatchlist = watchlistItems.filter((stock) =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const labels = filteredWatchlist.slice(0, 10).map((s) => s.name);

  const data = {
    labels,
    datasets: [
      {
        label: "Price",
        data: filteredWatchlist.slice(0, 10).map((stock) => stock.price),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
          "rgba(199, 199, 199, 0.5)",
          "rgba(83, 102, 255, 0.5)",
          "rgba(40, 167, 69, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(199, 199, 199, 1)",
          "rgba(83, 102, 255, 1)",
          "rgba(40, 167, 69, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

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

      <div style={{ padding: "6px 14px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "12px", color: "#888" }}>Watchlist 1</span>
        <button
          type="button"
          onClick={() => setIsAddingStock(!isAddingStock)}
          style={{
            background: "none",
            border: "none",
            color: "#4184f3",
            cursor: "pointer",
            fontSize: "12px",
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
            background: "#f9f9f9",
            borderBottom: "1px solid #eee",
            display: "flex",
            gap: "6px",
          }}
        >
          <input
            type="text"
            placeholder="Symbol (e.g. TATASTEEL)"
            value={newStockSymbol}
            onChange={(e) => setNewStockSymbol(e.target.value)}
            style={{ flex: 1, padding: "5px 8px", fontSize: "12px", border: "1px solid #ccc", borderRadius: "3px" }}
            required
          />
          <input
            type="number"
            step="0.05"
            placeholder="Price"
            value={newStockPrice}
            onChange={(e) => setNewStockPrice(e.target.value)}
            style={{ width: "70px", padding: "5px 8px", fontSize: "12px", border: "1px solid #ccc", borderRadius: "3px" }}
          />
          <button
            type="submit"
            className="btn btn-blue"
            style={{ padding: "4px 10px", fontSize: "12px", margin: 0 }}
          >
            Save
          </button>
        </form>
      )}

      <ul className="list">
        {filteredWatchlist.length > 0 ? (
          filteredWatchlist.map((stock, index) => {
            return (
              <WatchListItem
                stock={stock}
                key={stock._id || index}
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

      {filteredWatchlist.length > 0 && <DoughnutChart data={data} />}
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock, onDelete }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  const handleMouseEnter = () => {
    setShowWatchlistActions(true);
  };

  const handleMouseLeave = () => {
    setShowWatchlistActions(false);
  };

  return (
    <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
        <div className="itemInfo">
          <span className="percent">{stock.percent}</span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="up" />
          )}
          <span className="price">₹{Number(stock.price).toFixed(2)}</span>
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
          <button className="action">
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip title="Delete from Watchlist" placement="top" arrow TransitionComponent={Grow}>
          <button className="action" onClick={onDelete}>
            <DeleteOutline className="icon" style={{ color: "#d9534f" }} />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};
