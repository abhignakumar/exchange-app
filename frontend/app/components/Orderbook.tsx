export const Orderbook = ({
  depth,
}: {
  depth?: {
    market: string;
    asks: [string, string][];
    bids: [string, string][];
    currentPrice: string;
  };
}) => {
  let currentTotal = 0;

  const relevantAsks = depth?.asks.slice(0, 15).reverse();
  const asksWithTotal = relevantAsks?.map(([price, quantity]) => [
    price,
    quantity,
    (currentTotal += Number(quantity)),
  ]);
  const maxTotalAsks = relevantAsks?.reduce(
    (acc, [_, quantity]) => acc + Number(quantity),
    0
  );
  asksWithTotal?.reverse();

  currentTotal = 0;
  const relevantBids = depth?.bids.slice(0, 15);
  const bidsWithTotal = relevantBids?.map(([price, quantity]) => [
    price,
    quantity,
    (currentTotal += Number(quantity)),
  ]);
  const maxTotalBids = relevantBids?.reduce(
    (acc, [_, quantity]) => acc + Number(quantity),
    0
  );

  return (
    <div className="bg-zinc-900 w-full md:w-1/2 my-10 rounded-lg overflow-auto text-sm border border-slate-700 shadow-md">
      <div className="flex justify-between font-semibold py-3 px-4 bg-zinc-800 text-slate-300 border-b border-slate-600 text-xs uppercase">
        <div className="w-1/3 text-left">
          Price ({depth?.market.split("_")[1]})
        </div>
        <div className="w-1/3 text-center">
          Quantity ({depth?.market.split("_")[0]})
        </div>
        <div className="w-1/3 text-right">Total</div>
      </div>

      {asksWithTotal?.map(([price, quantity, total], index) => (
        <div key={index} className="relative flex items-center h-7 px-4">
          <div
            className="absolute top-0 left-0 h-full transition-all duration-300 rounded-sm"
            style={{
              width: `${(100 * Number(total)) / (maxTotalAsks || 1)}%`,
              backgroundColor: "rgba(255, 80, 80, 0.15)",
            }}
          />
          <div className="flex justify-between w-full relative z-10">
            <div className="w-1/3 text-left text-red-500 font-medium">
              {price}
            </div>
            <div className="w-1/3 text-center text-gray-200">{quantity}</div>
            <div className="w-1/3 text-right text-gray-400">{total}</div>
          </div>
        </div>
      ))}

      <div className="py-3 px-4 text-center font-bold text-sky-400 bg-zinc-800 border-y border-slate-600">
        {depth?.currentPrice}
      </div>
      {bidsWithTotal?.map(([price, quantity, total], index) => (
        <div key={index} className="relative flex items-center h-7 px-4">
          <div
            className="absolute top-0 left-0 h-full transition-all duration-300 rounded-sm"
            style={{
              width: `${(100 * Number(total)) / (maxTotalBids || 1)}%`,
              backgroundColor: "rgba(34, 197, 94, 0.15)",
            }}
          />
          <div className="flex justify-between w-full relative z-10">
            <div className="w-1/3 text-left text-green-500 font-medium">
              {price}
            </div>
            <div className="w-1/3 text-center text-gray-200">{quantity}</div>
            <div className="w-1/3 text-right text-gray-400">{total}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
