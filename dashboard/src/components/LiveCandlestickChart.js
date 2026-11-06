// dashboard/src/components/LiveCandlestickChart.js

import React, { useRef, useEffect, useState, useCallback } from "react";

/**
 * High-Performance Interactive Candlestick & Volume Chart
 * Screener & TradingView style with real-time price ticking, crosshairs,
 * and responsive DPI scaling.
 */
const LiveCandlestickChart = ({
  candles = [],
  currentPrice,
  symbol,
  chartType = "candles", // "candles" | "line"
  timeframe = "1D",
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredCandle, setHoveredCandle] = useState(null);
  const [mousePos, setMousePos] = useState(null);

  // Measure container and render chart
  const renderChart = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length === 0) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = Math.max(380, rect.height || 420);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Layout Margins
    const marginTop = 30;
    const marginBottom = 35;
    const marginRight = 75;
    const marginLeft = 10;

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;
    const volHeight = chartHeight * 0.18; // bottom 18% for volume
    const priceChartHeight = chartHeight - volHeight - 15;

    // Calculate Price Min & Max
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    candles.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    });

    if (currentPrice) {
      if (currentPrice < minPrice) minPrice = currentPrice;
      if (currentPrice > maxPrice) maxPrice = currentPrice;
    }

    // Add padding (2.5%) to price range
    const priceRange = maxPrice - minPrice || 1;
    const padding = priceRange * 0.035;
    minPrice -= padding;
    maxPrice += padding;

    const getY = (price) => {
      return marginTop + priceChartHeight - ((price - minPrice) / (maxPrice - minPrice)) * priceChartHeight;
    };

    const count = candles.length;
    const step = chartWidth / count;
    const candleWidth = Math.max(2, Math.min(18, step * 0.72));

    // 1. Draw Background Grid Lines (Horizontal Price Grid)
    const gridLinesCount = 6;
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    ctx.font = "11px Inter, system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "left";

    for (let i = 0; i <= gridLinesCount; i++) {
      const price = minPrice + (i / gridLinesCount) * (maxPrice - minPrice);
      const y = getY(price);

      // Line
      ctx.beginPath();
      ctx.setLineDash([3, 4]);
      ctx.moveTo(marginLeft, y);
      ctx.lineTo(marginLeft + chartWidth, y);
      ctx.stroke();

      // Right Axis Label
      ctx.setLineDash([]);
      ctx.fillText(price.toFixed(2), marginLeft + chartWidth + 10, y + 4);
    }

    // 2. Draw Vertical Time Grid Lines
    const timeStep = Math.max(1, Math.floor(count / 6));
    ctx.textAlign = "center";
    for (let i = 0; i < count; i += timeStep) {
      const c = candles[i];
      const x = marginLeft + i * step + step / 2;

      ctx.beginPath();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = "#f1f5f9";
      ctx.moveTo(x, marginTop);
      ctx.lineTo(x, marginTop + chartHeight);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(c.time || "", x, marginTop + chartHeight + 20);
    }

    // 3. Draw Volume Histogram
    const volBottom = marginTop + chartHeight;
    candles.forEach((c, i) => {
      const x = marginLeft + i * step + (step - candleWidth) / 2;
      const barHeight = maxVolume > 0 ? (c.volume / maxVolume) * volHeight : 0;
      const y = volBottom - barHeight;

      ctx.fillStyle = c.close >= c.open ? "rgba(0, 162, 91, 0.22)" : "rgba(223, 81, 76, 0.22)";
      ctx.fillRect(x, y, candleWidth, barHeight);
    });

    // 4. Draw Price Data: Candlestick or Line
    if (chartType === "line") {
      // Area Gradient Fill
      const grad = ctx.createLinearGradient(0, marginTop, 0, marginTop + priceChartHeight);
      grad.addColorStop(0, "rgba(56, 126, 209, 0.35)");
      grad.addColorStop(1, "rgba(56, 126, 209, 0.0)");

      ctx.beginPath();
      candles.forEach((c, i) => {
        const x = marginLeft + i * step + step / 2;
        const y = getY(c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      const lastX = marginLeft + (count - 1) * step + step / 2;
      const firstX = marginLeft + step / 2;
      ctx.lineTo(lastX, marginTop + priceChartHeight);
      ctx.lineTo(firstX, marginTop + priceChartHeight);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Stroke Line
      ctx.beginPath();
      ctx.strokeStyle = "#387ed1";
      ctx.lineWidth = 2;
      candles.forEach((c, i) => {
        const x = marginLeft + i * step + step / 2;
        const y = getY(c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    } else {
      // Candlesticks
      candles.forEach((c, i) => {
        const x = marginLeft + i * step + (step - candleWidth) / 2;
        const centerX = x + candleWidth / 2;
        const isUp = c.close >= c.open;
        const color = isUp ? "#00a25b" : "#df514c";

        const openY = getY(c.open);
        const closeY = getY(c.close);
        const highY = getY(c.high);
        const lowY = getY(c.low);

        const bodyY = Math.min(openY, closeY);
        const bodyHeight = Math.max(1.5, Math.abs(openY - closeY));

        // Draw Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(centerX, highY);
        ctx.lineTo(centerX, lowY);
        ctx.stroke();

        // Draw Body
        ctx.fillStyle = color;
        ctx.fillRect(x, bodyY, candleWidth, bodyHeight);
      });
    }

    // 5. Draw Current Price Live Line
    const activePrice = currentPrice || candles[count - 1]?.close;
    if (activePrice) {
      const liveY = getY(activePrice);
      const isUp = candles[count - 1] ? activePrice >= candles[count - 1].open : true;
      const liveColor = isUp ? "#00a25b" : "#df514c";

      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = liveColor;
      ctx.lineWidth = 1.2;
      ctx.moveTo(marginLeft, liveY);
      ctx.lineTo(marginLeft + chartWidth, liveY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Badge on right axis
      ctx.fillStyle = liveColor;
      const badgeW = 68;
      const badgeH = 20;
      const badgeX = marginLeft + chartWidth + 4;
      const badgeY = liveY - badgeH / 2;

      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4) : ctx.rect(badgeX, badgeY, badgeW, badgeH);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`₹${activePrice.toFixed(2)}`, badgeX + badgeW / 2, liveY + 4);
    }

    // 6. Draw Interactive Crosshair & Hover Tooltip
    if (mousePos && mousePos.x >= marginLeft && mousePos.x <= marginLeft + chartWidth) {
      const candleIndex = Math.min(
        count - 1,
        Math.max(0, Math.floor((mousePos.x - marginLeft) / step))
      );
      const candleCenterX = marginLeft + candleIndex * step + step / 2;

      // Vertical crosshair
      ctx.beginPath();
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      ctx.moveTo(candleCenterX, marginTop);
      ctx.lineTo(candleCenterX, marginTop + chartHeight);
      ctx.stroke();

      // Horizontal crosshair
      ctx.beginPath();
      ctx.moveTo(marginLeft, mousePos.y);
      ctx.lineTo(marginLeft + chartWidth, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tooltip price at mouse Y
      const hoverPrice = minPrice + ((marginTop + priceChartHeight - mousePos.y) / priceChartHeight) * (maxPrice - minPrice);
      if (mousePos.y >= marginTop && mousePos.y <= marginTop + priceChartHeight) {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(marginLeft + chartWidth + 4, mousePos.y - 10, 68, 20);
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(hoverPrice.toFixed(2), marginLeft + chartWidth + 38, mousePos.y + 4);
      }
    }
  }, [candles, currentPrice, chartType, mousePos]);

  // Handle Resize
  useEffect(() => {
    renderChart();
    const handleResize = () => renderChart();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderChart]);

  // Handle Mouse Events for Crosshair
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    const marginLeft = 10;
    const marginRight = 75;
    const chartWidth = rect.width - marginLeft - marginRight;
    const step = chartWidth / candles.length;

    if (x >= marginLeft && x <= marginLeft + chartWidth) {
      const idx = Math.min(candles.length - 1, Math.max(0, Math.floor((x - marginLeft) / step)));
      setHoveredCandle(candles[idx]);
    } else {
      setHoveredCandle(null);
    }
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setHoveredCandle(null);
  };

  // Active Candle for Header HUD
  const activeCandle = hoveredCandle || candles[candles.length - 1] || null;
  const candleChange = activeCandle ? (activeCandle.close - activeCandle.open) : 0;
  const candleChangePct = activeCandle && activeCandle.open > 0 ? (candleChange / activeCandle.open) * 100 : 0;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
      }}
    >
      {/* Top OHLC HUD Bar (Screener / TradingView style) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "6px 14px",
          background: "#f8fafc",
          borderBottom: "1px solid #f1f5f9",
          fontSize: "12px",
          color: "#475569",
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontWeight: 700, color: "#0f172a" }}>
          {symbol} <span style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>({timeframe})</span>
        </div>

        {activeCandle && (
          <>
            <div>
              <span style={{ color: "#94a3b8", marginRight: "4px" }}>O:</span>
              <strong style={{ color: "#0f172a" }}>₹{activeCandle.open?.toFixed(2)}</strong>
            </div>
            <div>
              <span style={{ color: "#94a3b8", marginRight: "4px" }}>H:</span>
              <strong style={{ color: "#00a25b" }}>₹{activeCandle.high?.toFixed(2)}</strong>
            </div>
            <div>
              <span style={{ color: "#94a3b8", marginRight: "4px" }}>L:</span>
              <strong style={{ color: "#df514c" }}>₹{activeCandle.low?.toFixed(2)}</strong>
            </div>
            <div>
              <span style={{ color: "#94a3b8", marginRight: "4px" }}>C:</span>
              <strong style={{ color: activeCandle.close >= activeCandle.open ? "#00a25b" : "#df514c" }}>
                ₹{activeCandle.close?.toFixed(2)}
              </strong>
            </div>
            <div>
              <span style={{ color: "#94a3b8", marginRight: "4px" }}>Chg:</span>
              <strong style={{ color: candleChange >= 0 ? "#00a25b" : "#df514c" }}>
                {candleChange >= 0 ? "+" : ""}{candleChange.toFixed(2)} ({candleChangePct >= 0 ? "+" : ""}{candleChangePct.toFixed(2)}%)
              </strong>
            </div>
            {activeCandle.volume > 0 && (
              <div>
                <span style={{ color: "#94a3b8", marginRight: "4px" }}>Vol:</span>
                <strong style={{ color: "#475569" }}>
                  {(activeCandle.volume / 1000).toFixed(1)}k
                </strong>
              </div>
            )}
            <div style={{ marginLeft: "auto", color: "#64748b", fontSize: "11px" }}>
              {activeCandle.time}
            </div>
          </>
        )}
      </div>

      {/* Chart Canvas Area */}
      <div style={{ flex: 1, position: "relative", minHeight: "360px" }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            display: "block",
            cursor: "crosshair",
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </div>
  );
};

export default LiveCandlestickChart;
