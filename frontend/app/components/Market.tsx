"use client";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export const Market = () => {
  const markets: Map<string, string> = new Map();
  markets.set("Solana", "SOL_INR");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 flex items-center gap-2">
          <Sparkles className="text-yellow-400" />
          Markets
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from(markets.keys()).map((m, index) => (
            <div
              key={index}
              className="bg-zinc-800 hover:bg-zinc-700 transition-all p-5 rounded-lg shadow-md cursor-pointer group border border-zinc-700 hover:border-yellow-400"
              onClick={() => {
                router.push(`/trade/${markets.get(m)}`);
              }}
            >
              <div className="text-xl font-semibold group-hover:text-yellow-400">
                {m}
              </div>
              <div className="text-sm text-zinc-400 mt-1">
                Pair: {markets.get(m)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
