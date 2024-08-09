"use client";
import { useRouter } from "next/navigation";

export const Market = () => {
  const markets: Map<string, string> = new Map();
  markets.set("Solana", "SOL_INR");
  const router = useRouter();

  return (
    <div className="px-5">
      <div className="font-bold text-3xl mb-5 text-gray-300">Markets</div>
      <div>
        {Array.from(markets.keys()).map((m, index) => (
          <div
            key={index}
            className="mt-2 text-xl text-gray-300 bg-zinc-800 p-3 rounded-md cursor-pointer hover:bg-zinc-700 transition-all"
            onClick={() => {
              router.push(`/trade/${markets.get(m)}`);
            }}
          >
            {m}
          </div>
        ))}
      </div>
    </div>
  );
};
