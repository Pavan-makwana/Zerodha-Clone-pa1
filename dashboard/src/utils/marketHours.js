// dashboard/src/utils/marketHours.js

/**
 * Indian Stock Market (NSE & BSE) Trading Hours Utility
 *
 * Trading Days: Monday through Friday (excluding exchange holidays)
 * Regular Trading Hours: 09:15 AM to 03:30 PM IST (Asia/Kolkata, UTC+5:30)
 * Pre-market Session: 09:00 AM to 09:08 AM IST
 */

export function getIndianMarketStatus(customDate = null) {
  const now = customDate ? new Date(customDate) : new Date();

  // Convert current time to Indian Standard Time (IST / Asia/Kolkata)
  const istDateString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const ist = new Date(istDateString);

  const dayOfWeek = ist.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  const preMarketOpen = 9 * 60;        // 09:00 AM IST (540 mins)
  const regularOpen = 9 * 60 + 15;     // 09:15 AM IST (555 mins)
  const regularClose = 15 * 60 + 30;   // 03:30 PM IST (930 mins)

  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isRegularSession = isWeekday && currentMinutes >= regularOpen && currentMinutes < regularClose;
  const isPreMarket = isWeekday && currentMinutes >= preMarketOpen && currentMinutes < regularOpen;
  const isOpen = isRegularSession;

  let session = "CLOSED";
  let statusText = "Market Closed";
  let badgeText = "NSE CLOSED";
  let chartBadge = "MARKET CLOSED • CLOSING PRICE";
  let nextOpenMessage = "";

  if (isRegularSession) {
    session = "REGULAR";
    statusText = "Market Open (IST)";
    badgeText = "NSE LIVE";
    chartBadge = "LIVE STREAM • IST";
    const minsLeft = regularClose - currentMinutes;
    const hrs = Math.floor(minsLeft / 60);
    const mins = minsLeft % 60;
    nextOpenMessage = `Closes in ${hrs > 0 ? `${hrs}h ` : ""}${mins}m (at 03:30 PM IST)`;
  } else if (isPreMarket) {
    session = "PRE_MARKET";
    statusText = "Pre-Market Session (IST)";
    badgeText = "NSE PRE-OPEN";
    chartBadge = "PRE-OPEN SESSION • IST";
    nextOpenMessage = "Regular trading starts at 09:15 AM IST";
  } else {
    session = "CLOSED";
    statusText = "Market Closed";
    badgeText = "NSE CLOSED";
    chartBadge = "MARKET CLOSED • CLOSING PRICE";

    if (dayOfWeek === 5 && currentMinutes >= regularClose) {
      nextOpenMessage = "Opens Monday at 09:15 AM IST";
    } else if (dayOfWeek === 6) {
      nextOpenMessage = "Opens Monday at 09:15 AM IST";
    } else if (dayOfWeek === 0) {
      nextOpenMessage = "Opens Tomorrow at 09:15 AM IST";
    } else if (isWeekday && currentMinutes < regularOpen) {
      nextOpenMessage = "Opens Today at 09:15 AM IST";
    } else {
      nextOpenMessage = "Opens Tomorrow at 09:15 AM IST";
    }
  }

  const istFormatted = ist.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return {
    isOpen,
    session,
    statusText,
    badgeText,
    chartBadge,
    nextOpenMessage,
    dayName: dayNames[dayOfWeek],
    isWeekday,
    istTime: `${istFormatted} IST`,
    marketHours: "Monday - Friday: 09:15 AM to 03:30 PM IST",
  };
}
