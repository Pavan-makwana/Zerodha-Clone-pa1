// dashboard/src/components/BuyActionWindow.js

import React, { useState, useContext } from "react"; 
import axios from "axios";
import GeneralContext from "./GeneralContext"; 

import "./BuyActionWindow.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";

const BuyActionWindow = ({ uid, initialMode = "BUY" }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(100.0);
  const [orderMode, setOrderMode] = useState(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [error, setError] = useState(""); 

  const { closeBuyWindow } = useContext(GeneralContext);

  const isSell = orderMode === "SELL";

  const handleOrderSubmit = async () => { 
    if (isSubmitting) return; 

    if (stockQuantity <= 0) {
      setError("Please enter a valid quantity greater than 0");
      return;
    }
    if (stockPrice <= 0) {
      setError("Please enter a valid price greater than 0");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      await axios.post(
        `${API_BASE_URL}/newOrder`,
        {
          name: uid,
          qty: stockQuantity,
          price: stockPrice,
          mode: orderMode,
        },
        {
          withCredentials: true, 
        }
      );

      alert(`${orderMode} order for ${uid} placed successfully!`);
      setIsSubmitting(false);
      closeBuyWindow(); 

    } catch (err) {
      console.error("Order failed:", err);
      let errorMsg = "Order failed. Please try again.";
      if (err.response && (err.response.status === 401 || err.response.status === 400)) {
        errorMsg = err.response.data?.message || "Authentication failed. Please login again.";
      }
      setError(errorMsg);
      alert(errorMsg); 
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    if (isSubmitting) return; 
    closeBuyWindow();
  };

  return (
    <div className="container" id="buy-window">
      <div className={`header ${isSell ? "sell-header" : ""}`}>
        <h3>{isSell ? "Sell" : "Buy"} {uid}</h3>
        <span className="mode-badge">{orderMode}</span>
      </div>

      <div className="regular-order">
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button
            type="button"
            className={`btn ${!isSell ? "btn-blue" : "btn-grey"}`}
            style={{ padding: "4px 12px", fontSize: "12px", margin: 0 }}
            onClick={() => setOrderMode("BUY")}
          >
            BUY
          </button>
          <button
            type="button"
            className={`btn ${isSell ? "btn-orange" : "btn-grey"}`}
            style={{ padding: "4px 12px", fontSize: "12px", margin: 0 }}
            onClick={() => setOrderMode("SELL")}
          >
            SELL
          </button>
        </div>

        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              onChange={(e) => setStockQuantity(Math.max(1, Number(e.target.value)))} 
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              min="0.05"
              onChange={(e) => setStockPrice(Number(e.target.value))} 
              value={stockPrice}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>Margin required ₹{(stockQuantity * stockPrice).toFixed(2)}</span>
        <div>
          <button
            className={`btn ${isSell ? "btn-orange" : "btn-blue"}`}
            onClick={handleOrderSubmit}
            disabled={isSubmitting} 
          >
            {isSubmitting ? "Processing..." : (isSell ? "Sell" : "Buy")}
          </button>
          <button
            className="btn btn-grey"
            onClick={handleCancelClick}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </div>
      {error && <p style={{ color: "red", textAlign: "center", fontSize: "12px", margin: "5px 0" }}>{error}</p>}
    </div>
  );
}; 

export default BuyActionWindow;
