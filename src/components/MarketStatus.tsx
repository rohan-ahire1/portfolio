"use client";

import { useEffect, useState } from "react";

type Status = { open: boolean; time: string };

// NSE regular session: Mon–Fri 09:15–15:30 IST. Holidays not handled.
function nseStatus(): Status {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday");
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));
  const mins = hour * 60 + minute;
  const isWeekday = !["Sat", "Sun"].includes(weekday);
  return {
    open: isWeekday && mins >= 9 * 60 + 15 && mins <= 15 * 60 + 30,
    time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  };
}

export function MarketStatus() {
  const [status, setStatus] = useState<Status>(() => nseStatus());

  useEffect(() => {
    const tick = setInterval(() => setStatus(nseStatus()), 30_000);
    return () => clearInterval(tick);
  }, []);

  return (
    <span className="flex items-center gap-2" title="NSE regular session, IST clock">
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          status.open ? "bg-signal animate-pulse" : "bg-muted"
        }`}
      />
      NSE {status.open ? "OPEN" : "CLOSED"} · {status.time} IST
    </span>
  );
}
