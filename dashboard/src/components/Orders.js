// dashboard/src/components/Orders.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ReceiptLongOutlined, FilterListOutlined } from "@mui/icons-material";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || "https://zerodha-clone-frontend-pa1.vercel.app";

const Orders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
      .get(`${API_BASE_URL}/allorders`, {
        withCredentials: true,
        headers,
      })
      .then((res) => {
        setAllOrders(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        if (err.response && (err.response.status === 401 || err.response.status === 400)) {
          setError("Authentication failed. Redirecting to login...");
          setTimeout(() => {
            window.location.href = `${FRONTEND_URL}/login`;
          }, 2000);
        } else {
          setError("Failed to fetch orders data.");
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();

    const handleOrderSync = () => fetchOrders();
    window.addEventListener("kite:order-placed", handleOrderSync);
    return () => window.removeEventListener("kite:order-placed", handleOrderSync);
  }, []);

  if (loading) {
    return <div style={{ padding: "40px 30px", color: "#64748b" }}>Loading simulated orders...</div>;
  }

  if (error) {
    return <h4 style={{ color: "red", padding: "20px" }}>{error}</h4>;
  }

  return (
    <div className="orders" style={{ padding: "20px 30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h3 className="title" style={{ margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <ReceiptLongOutlined style={{ color: "#387ed1" }} /> Executed Trade Book ({allOrders.length})
          </h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
            Real-time execution log of your simulated trades on NSE / BSE.
          </p>
        </div>

        <Link
          to="/screener"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#387ed1",
            color: "#ffffff",
            padding: "8px 16px",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "0.85rem",
            fontWeight: 700,
            boxShadow: "0 2px 6px rgba(56, 126, 209, 0.25)",
          }}
        >
          <FilterListOutlined style={{ fontSize: "18px" }} />
          Find Stocks in Screener
        </Link>
      </div>

      {allOrders.length === 0 ? (
        <div className="no-orders" style={{ padding: "50px 20px", textAlign: "center", background: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
          <p style={{ fontSize: "1.1rem", color: "#475569", fontWeight: 600, margin: "0 0 8px 0" }}>
            No simulated orders placed yet today
          </p>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 16px 0" }}>
            Use the Stock Screener or Watchlist to place your first risk-free paper trade!
          </p>
          <Link to="/screener" className="btn btn-blue" style={{ display: "inline-block" }}>
            Launch Screener
          </Link>
        </div>
      ) : (
        <div className="order-table" style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", background: "#ffffff" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", color: "#475569" }}>Time (IST)</th>
                <th style={{ padding: "12px 16px", color: "#475569" }}>Instrument</th>
                <th style={{ padding: "12px 16px", color: "#475569" }}>Type</th>
                <th style={{ padding: "12px 16px", color: "#475569" }}>Product</th>
                <th style={{ padding: "12px 16px", color: "#475569", textAlign: "right" }}>Qty</th>
                <th style={{ padding: "12px 16px", color: "#475569", textAlign: "right" }}>Exec. Price</th>
                <th style={{ padding: "12px 16px", color: "#475569", textAlign: "right" }}>Total Traded</th>
                <th style={{ padding: "12px 16px", color: "#475569", textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.map((order, index) => {
                const isBuy = order.mode === "BUY";
                const totalCost = (order.qty || 0) * (order.price || 0);
                const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
                const timeStr = orderDate.toLocaleTimeString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });

                return (
                  <tr key={order._id || index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.8rem" }}>
                      {timeStr}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a" }}>
                      {order.name}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          background: isBuy ? "#e6f7ed" : "#fdeeee",
                          color: isBuy ? "#00a25b" : "#df514c",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          padding: "2px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {order.mode}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          background: order.product === "MIS" ? "#eff6ff" : "#f8fafc",
                          color: order.product === "MIS" ? "#2563eb" : "#475569",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          border: "1px solid #cbd5e1",
                        }}
                      >
                        {order.product || "CNC"}
                        {order.product === "MIS" ? " (5x)" : ""}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600 }}>
                      {order.qty}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600 }}>
                      ₹{Number(order.price || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                      ₹{totalCost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <span
                        style={{
                          background: "#e6f7ed",
                          color: "#00a25b",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: "10px",
                        }}
                      >
                        {order.status || "COMPLETE"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
