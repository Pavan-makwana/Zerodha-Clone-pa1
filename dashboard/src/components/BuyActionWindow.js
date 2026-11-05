// dashboard/src/components/BuyActionWindow.js

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";

import "./BuyActionWindow.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";

const BuyActionWindow = ({ uid, initialMode = "BUY" }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(1500.0);
  const [orderMode, setOrderMode] = useState(initialMode);
  const [productType, setProductType] = useState("CNC"); // CNC (Longterm) or MIS (Intraday)
  const [orderType, setOrderType] = useState("MARKET"); // MARKET or LIMIT
  const [availableMargin, setAvailableMargin] = useState(100000.0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { closeBuyWindow, showToast } = useContext(GeneralContext);

  const isSell = orderMode === "SELL";
  const totalCost = Number(stockQuantity) * Number(stockPrice);
  const hasInsufficientFunds = !isSell && totalCost > availableMargin;

  // Fetch stock current price and user funds on window open
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
      .get(`${API_BASE_URL}/funds`, { withCredentials: true, headers })
      .then((res) => {
        if (res.data?.availableMargin !== undefined) {
          setAvailableMargin(res.data.availableMargin);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch margin:", err);
      });

    // Try to get stock price from watchlist
    axios
      .get(`${API_BASE_URL}/watchlist`, { withCredentials: true, headers })
      .then((res) => {
        if (Array.isArray(res.data)) {
          const item = res.data.find(
            (s) => s.name?.toUpperCase() === uid?.toUpperCase()
          );
          if (item && item.price) {
            setStockPrice(item.price);
          }
        }
      })
      .catch(() => {});
  }, [uid]);

  const handleOrderSubmit = async (e) => {
    e?.preventDefault();
    if (isSubmitting) return;

    const qty = Number(stockQuantity);
    const price = Number(stockPrice);

    if (isNaN(qty) || qty <= 0) {
      setError("Please enter a valid quantity greater than 0");
      return;
    }
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid price greater than 0");
      return;
    }

    if (hasInsufficientFunds) {
      const msg = `Insufficient funds. Required: ₹${totalCost.toFixed(2)}, Available: ₹${availableMargin.toFixed(2)}`;
      setError(msg);
      showToast({
        title: "Order Rejected",
        message: msg,
        type: "error",
        duration: 8000,
      });
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(
        `${API_BASE_URL}/newOrder`,
        {
          name: uid,
          qty,
          price,
          mode: orderMode,
          product: productType,
          orderType,
        },
        {
          withCredentials: true,
          headers,
        }
      );

      const updatedMargin = response.data?.availableMargin ?? (availableMargin - (isSell ? -totalCost : totalCost));

      showToast({
        title: `${orderMode} Order Placed`,
        message: `${orderMode} ${qty}x ${uid} executed @ ₹${price.toFixed(2)}. ${isSell ? "Cash credited" : "Margin used"}: ₹${totalCost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}.`,
        type: isSell ? "sell" : "success",
        duration: 10000,
      });

      setIsSubmitting(false);
      closeBuyWindow();

      // Trigger optional local state refreshes
      window.dispatchEvent(new CustomEvent("kite:order-placed", { detail: { order: response.data?.order, updatedMargin } }));

    } catch (err) {
      console.error("Order failed:", err);
      let errorMsg = "Order failed. Please try again.";
      if (err.response && (err.response.status === 401 || err.response.status === 400)) {
        errorMsg = err.response.data?.message || "Authentication failed or invalid order parameters.";
      }
      setError(errorMsg);
      showToast({
        title: "Order Failed",
        message: errorMsg,
        type: "error",
        duration: 8000,
      });
      setIsSubmitting(false);
    }
  };

  const handleQtyChange = (delta) => {
    setStockQuantity((prev) => Math.max(1, (Number(prev) || 0) + delta));
  };

  return (
    <div className="kite-modal-overlay">
      <div className={`kite-order-window ${isSell ? "mode-sell" : "mode-buy"}`} id="buy-window">
        {/* Header */}
        <div className="kite-order-header">
          <div className="instrument-info">
            <span className="instrument-name">{uid}</span>
            <span className="exchange-pill">NSE</span>
            <span className="live-price-tag">₹{(Number(stockPrice) || 0).toFixed(2)}</span>
          </div>

          <div className="header-right-actions">
            <div className="mode-segmented-control">
              <button
                type="button"
                className={`mode-tab ${!isSell ? "active-buy" : ""}`}
                onClick={() => {
                  setOrderMode("BUY");
                  setError("");
                }}
              >
                BUY
              </button>
              <button
                type="button"
                className={`mode-tab ${isSell ? "active-sell" : ""}`}
                onClick={() => {
                  setOrderMode("SELL");
                  setError("");
                }}
              >
                SELL
              </button>
            </div>
            <button
              type="button"
              className="window-close-icon"
              onClick={closeBuyWindow}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Product & Type Tabs */}
        <div className="order-options-bar">
          <div className="options-group">
            <span className="options-label">Product:</span>
            <button
              type="button"
              className={`pill-option ${productType === "CNC" ? "selected" : ""}`}
              onClick={() => setProductType("CNC")}
            >
              CNC <small>Longterm</small>
            </button>
            <button
              type="button"
              className={`pill-option ${productType === "MIS" ? "selected" : ""}`}
              onClick={() => setProductType("MIS")}
            >
              MIS <small>Intraday</small>
            </button>
          </div>

          <div className="options-group">
            <span className="options-label">Type:</span>
            <button
              type="button"
              className={`pill-option ${orderType === "MARKET" ? "selected" : ""}`}
              onClick={() => setOrderType("MARKET")}
            >
              Market
            </button>
            <button
              type="button"
              className={`pill-option ${orderType === "LIMIT" ? "selected" : ""}`}
              onClick={() => setOrderType("LIMIT")}
            >
              Limit
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleOrderSubmit} className="order-form-body">
          <div className="inputs-row">
            <div className="field-block">
              <label htmlFor="order-qty">Qty</label>
              <div className="stepper-input">
                <button
                  type="button"
                  className="step-btn"
                  onClick={() => handleQtyChange(-1)}
                  disabled={stockQuantity <= 1}
                >
                  -
                </button>
                <input
                  id="order-qty"
                  type="number"
                  min="1"
                  step="1"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                />
                <button
                  type="button"
                  className="step-btn"
                  onClick={() => handleQtyChange(1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="field-block">
              <label htmlFor="order-price">Price (₹)</label>
              <div className="stepper-input">
                <input
                  id="order-price"
                  type="number"
                  min="0.05"
                  step="0.05"
                  value={stockPrice}
                  onChange={(e) => setStockPrice(parseFloat(e.target.value) || 0)}
                  disabled={orderType === "MARKET"}
                  required
                />
              </div>
              {orderType === "MARKET" && (
                <span className="field-subnote">Executes at current LTP</span>
              )}
            </div>
          </div>

          {error && <div className="order-error-message">{error}</div>}

          {/* Margin & Account Summary Bar */}
          <div className="margin-status-bar">
            <div className="margin-item">
              <span className="label">Margin required:</span>
              <strong className={`value ${hasInsufficientFunds ? "insufficient" : ""}`}>
                ₹{totalCost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="margin-item">
              <span className="label">Available margin:</span>
              <span className="value">
                ₹{availableMargin.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="kite-order-footer">
            <div className="footer-status-pill">
              {isSell ? (
                <span className="sell-indicator">Selling from holdings / intraday</span>
              ) : (
                <span className="buy-indicator">Ready to execute on NSE</span>
              )}
            </div>

            <div className="footer-button-group">
              <button
                type="submit"
                className={`order-cta-btn ${isSell ? "btn-sell" : "btn-buy"}`}
                disabled={isSubmitting || hasInsufficientFunds}
              >
                {isSubmitting ? (
                  <span className="btn-spinner-text">Placing Order...</span>
                ) : (
                  <span>
                    {orderMode} {stockQuantity} {uid}
                  </span>
                )}
              </button>
              <button
                type="button"
                className="order-cancel-btn"
                onClick={closeBuyWindow}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyActionWindow;
