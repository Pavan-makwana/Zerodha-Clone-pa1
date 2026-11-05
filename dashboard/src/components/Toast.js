// dashboard/src/components/Toast.js
import React, { useEffect } from "react";
import "./Toast.css";

export const ToastItem = ({ toast, onDismiss }) => {
  const { id, title, message, type = "success", duration = 10000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const getIcon = () => {
    if (type === "sell" || type === "error") {
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      );
    }
    if (type === "info") {
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
      );
    }
    // success (BUY or general success)
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    );
  };

  return (
    <div className={`kite-toast-card toast-${type}`}>
      <div className="toast-content-wrapper">
        <div className="toast-icon">{getIcon()}</div>
        <div className="toast-body">
          <div className="toast-header">
            <span className="toast-title">{title}</span>
            <span className="toast-time">Just now</span>
          </div>
          <div className="toast-message">{message}</div>
        </div>
        <button
          className="toast-close-btn"
          onClick={() => onDismiss(id)}
          aria-label="Close notification"
        >
          &times;
        </button>
      </div>
      <div
        className="toast-progress-bar"
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
};

export const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="kite-toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default ToastContainer;
