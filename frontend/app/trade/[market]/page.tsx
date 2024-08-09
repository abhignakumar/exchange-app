"use client";

import { Orderbook } from "@/app/components/Orderbook";
import { SignalingManager } from "@/app/utils/SignalingManager";
import axios from "axios";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function () {
  const pathname = usePathname();
  const market = pathname.split("/")[2];
  const [depth, setDepth] = useState<{
    market: string;
    asks: [string, string][];
    bids: [string, string][];
    currentPrice: string;
  }>({
    market: "",
    asks: [],
    bids: [],
    currentPrice: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        `http://localhost:3000/api/v1/depth?market=${market}`
      );
      if (response.data) {
        setDepth(response.data);
        setDepth((prev) => {
          const prevDepth = { ...prev };
          prevDepth.asks.sort((a, b) => Number(b[0]) - Number(a[0]));
          prevDepth.bids.sort((a, b) => Number(b[0]) - Number(a[0]));
          return prevDepth;
        });
      } else {
        setDepth({
          market: market,
          asks: [],
          bids: [],
          currentPrice: "0",
        });
      }
      SignalingManager.getInstance().registerCallback(
        "depth",
        `DEPTH-${market}`,
        (data: any) => {
          setDepth((prev) => {
            const prevDepth = { ...prev };
            data.asks.forEach((a: any) => {
              const index = prevDepth?.asks
                .map((a) => a[0])
                .findIndex((p) => p === a[0]);
              if (index !== -1) prevDepth.asks[index][1] = a[1];
              else prevDepth.asks.push(a);
            });
            data.bids.forEach((b: any) => {
              const index = prevDepth?.bids
                .map((b) => b[0])
                .findIndex((p) => p === b[0]);
              if (index !== -1) prevDepth.bids[index][1] = b[1];
              else prevDepth.bids.push(b);
            });
            for (let i = 0; i < prevDepth.asks.length; i++) {
              if (prevDepth.asks[i][1] === "0") {
                prevDepth.asks.splice(i, 1);
                i--;
              }
            }
            for (let i = 0; i < prevDepth.bids.length; i++) {
              if (prevDepth.bids[i][1] === "0") {
                prevDepth.bids.splice(i, 1);
                i--;
              }
            }
            prevDepth.asks.sort((a, b) => Number(b[0]) - Number(a[0]));
            prevDepth.bids.sort((a, b) => Number(b[0]) - Number(a[0]));
            return prevDepth;
          });
        }
      );
      SignalingManager.getInstance().registerCallback(
        "trade",
        `TRADE-${market}`,
        (data: any) => {
          setDepth((prev) => {
            const prevDepth = { ...prev };
            prevDepth.currentPrice = data.p;
            return prevDepth;
          });
        }
      );

      SignalingManager.getInstance().sendMessage({
        method: "SUBSCRIBE",
        params: [`depth@${market}`],
      });
      SignalingManager.getInstance().sendMessage({
        method: "SUBSCRIBE",
        params: [`trade@${market}`],
      });
    };
    fetchData();

    return () => {
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`depth@${market}`],
      });
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`trade@${market}`],
      });
      SignalingManager.getInstance().deRegisterCallback(
        "depth",
        `DEPTH-${market}`
      );
      SignalingManager.getInstance().deRegisterCallback(
        "trade",
        `TRADE-${market}`
      );
    };
  }, []);

  return (
    <div className="min-h-[95vh] bg-zinc-900">
      <div className="flex text-xl text-gray-300 p-3 bg-zinc-700 font-bold">
        <div className="mx-10">{market}</div>
        <div>{depth?.currentPrice || "..."}</div>
      </div>
      <div className="flex h-screen">
        <div className="flex justify-center w-1/2">
          <Orderbook depth={depth} />
        </div>
      </div>
    </div>
  );
}
