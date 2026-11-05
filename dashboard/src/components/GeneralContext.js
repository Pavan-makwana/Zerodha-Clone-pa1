// dashboard/src/components/GeneralContext.js
import React, { useState, useCallback } from "react";
import BuyActionWindow from "./BuyActionWindow";
import ToastContainer from "./Toast";

const GeneralContext = React.createContext({
  openBuyWindow: (uid) => {},
  openSellWindow: (uid) => {},
  closeBuyWindow: () => {},
  showToast: ({ title, message, type, duration }) => {},
});

export const GeneralContextProvider = (props) => {
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [orderMode, setOrderMode] = useState("BUY");
  const [toasts, setToasts] = useState([]);

  const handleOpenBuyWindow = (uid) => {
    setIsWindowOpen(true);
    setSelectedStockUID(uid);
    setOrderMode("BUY");
  };

  const handleOpenSellWindow = (uid) => {
    setIsWindowOpen(true);
    setSelectedStockUID(uid);
    setOrderMode("SELL");
  };

  const handleCloseWindow = () => {
    setIsWindowOpen(false);
    setSelectedStockUID("");
  };

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ title, message, type = "success", duration = 10000 }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast = { id, title, message, type, duration };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  return (
    <GeneralContext.Provider
      value={{
        openBuyWindow: handleOpenBuyWindow,
        openSellWindow: handleOpenSellWindow,
        closeBuyWindow: handleCloseWindow,
        showToast,
      }}
    >
      {props.children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {isWindowOpen && (
        <BuyActionWindow
          uid={selectedStockUID}
          initialMode={orderMode}
        />
      )}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;
