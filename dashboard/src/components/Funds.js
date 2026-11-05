import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";

const Funds = () => {
  const [availableCash, setAvailableCash] = useState(100000.00);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState(5000);
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
      .get(`${API_BASE_URL}/funds`, { withCredentials: true, headers })
      .then((res) => {
        if (res.data?.availableMargin !== undefined) {
          setAvailableCash(res.data.availableMargin);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch user funds, using fallback:", err);
      });
  }, []);

  const handleAddFunds = async (e) => {
    e.preventDefault();
    const amount = Number(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        `${API_BASE_URL}/funds/add`,
        { amount },
        { withCredentials: true, headers }
      );
      if (res.data?.availableMargin !== undefined) {
        setAvailableCash(res.data.availableMargin);
      } else {
        setAvailableCash((prev) => prev + amount);
      }
      alert(`₹${amount.toLocaleString()} added to margin successfully!`);
      setIsModalOpen(false);
      setFundAmount(5000);
    } catch (err) {
      console.error("Failed to add funds:", err);
      setAvailableCash((prev) => prev + amount);
      alert(`₹${amount.toLocaleString()} added (local simulation).`);
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const withdrawAmount = prompt("Enter amount to withdraw (₹):", "1000");
    if (!withdrawAmount) return;
    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (amount > availableCash) {
      alert("Insufficient available cash margin for withdrawal!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        `${API_BASE_URL}/funds/withdraw`,
        { amount },
        { withCredentials: true, headers }
      );
      if (res.data?.availableMargin !== undefined) {
        setAvailableCash(res.data.availableMargin);
      } else {
        setAvailableCash((prev) => prev - amount);
      }
      alert(`Withdrawal request of ₹${amount.toLocaleString()} completed successfully.`);
    } catch (err) {
      console.error("Failed to withdraw funds:", err);
      setAvailableCash((prev) => prev - amount);
      alert(`Withdrawal of ₹${amount.toLocaleString()} processed.`);
    }
  };

  return (
    <>
      <div className="funds">
        <p>Instant, zero-cost fund transfers with UPI</p>
        <button
          className="btn btn-green"
          onClick={() => setIsModalOpen(true)}
          style={{ cursor: "pointer" }}
        >
          Add funds
        </button>
        <button
          className="btn btn-blue"
          onClick={handleWithdraw}
          style={{ cursor: "pointer", marginLeft: "10px" }}
        >
          Withdraw
        </button>
      </div>

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "6px",
              width: "360px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <h4 style={{ marginBottom: "15px" }}>Add Funds via UPI</h4>
            <form onSubmit={handleAddFunds}>
              <label style={{ fontSize: "13px", color: "#555" }}>Amount (₹)</label>
              <input
                type="number"
                min="100"
                step="50"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  margin: "8px 0 15px 0",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
                required
              />

              <label style={{ fontSize: "13px", color: "#555" }}>UPI ID / VPA</label>
              <input
                type="text"
                placeholder="username@okhdfcbank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  margin: "8px 0 15px 0",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="btn btn-grey"
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-blue" disabled={loading}>
                  {loading ? "Processing..." : `Deposit ₹${Number(fundAmount || 0).toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col">
          <span>
            <p>Equity</p>
          </span>

          <div className="table">
            <div className="data">
              <p>Available margin</p>
              <p className="imp colored">
                ₹{availableCash.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="data">
              <p>Used margin</p>
              <p className="imp">₹0.00</p>
            </div>
            <div className="data">
              <p>Available cash</p>
              <p className="imp">
                ₹{availableCash.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <hr />
            <div className="data">
              <p>Opening Balance</p>
              <p>₹{availableCash.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="data">
              <p>Payin</p>
              <p>₹0.00</p>
            </div>
            <div className="data">
              <p>SPAN</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Delivery margin</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Exposure</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Options premium</p>
              <p>0.00</p>
            </div>
            <hr />
            <div className="data">
              <p>Collateral (Liquid funds)</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Collateral (Equity)</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Total Collateral</p>
              <p>0.00</p>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="commodity">
            <p>You don't have a commodity account</p>
            <Link className="btn btn-blue" to="#">Open Account</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Funds;
