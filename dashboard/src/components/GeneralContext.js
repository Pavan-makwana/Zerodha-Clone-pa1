import React, { useState } from "react";
import BuyActionWindow from "./BuyActionWindow";

const GeneralContext = React.createContext({
  openBuyWindow: (uid) => {},
  openSellWindow: (uid) => {},
  closeBuyWindow: () => {},
});

export const GeneralContextProvider = (props) => {
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [orderMode, setOrderMode] = useState("BUY");

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

  return (
    <GeneralContext.Provider
      value={{
        openBuyWindow: handleOpenBuyWindow,
        openSellWindow: handleOpenSellWindow,
        closeBuyWindow: handleCloseWindow,
      }}
    >
      {props.children}
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
