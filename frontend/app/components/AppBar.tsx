"use client";
import { usePathname, useRouter } from "next/navigation";

export const AppBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="flex bg-zinc-800 h-16">
      <div
        className="flex items-center mx-8 font-extrabold text-gray-300 cursor-pointer"
        onClick={() => router.push("/")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6 mr-2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
          />
        </svg>
        Exchange
      </div>
      <div
        className={`flex items-center mx-2 cursor-pointer ${
          pathname === "/" ? "text-gray-300" : "text-zinc-500"
        }`}
        onClick={() => router.push("/")}
      >
        Markets
      </div>
      <div
        className={`flex items-center mx-2 cursor-pointer ${
          pathname.startsWith("/trade") ? "text-gray-300" : "text-zinc-500"
        }`}
        onClick={() => router.push("/trade/SOL_INR")}
      >
        Trade
      </div>
    </div>
  );
};
