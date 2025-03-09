"use client";
import { usePathname, useRouter } from "next/navigation";

export const AppBar = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="bg-[#0f1117] shadow-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2 text-white font-bold text-2xl cursor-pointer hover:opacity-90 transition"
          onClick={() => router.push("/")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="w-7 h-7 text-sky-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Centralized Exchange
        </div>

        <nav className="flex gap-8 text-md font-medium">
          <div
            className={`cursor-pointer transition hover:text-sky-300 ${
              pathname === "/" ? "text-sky-400" : "text-neutral-400"
            }`}
            onClick={() => router.push("/")}
          >
            Markets
          </div>
          <div
            className={`cursor-pointer transition hover:text-sky-300 ${
              pathname.startsWith("/trade")
                ? "text-sky-400"
                : "text-neutral-400"
            }`}
            onClick={() => router.push("/trade/SOL_INR")}
          >
            Trade
          </div>
        </nav>
      </div>
    </header>
  );
};
