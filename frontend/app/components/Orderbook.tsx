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
  const relevantAsks = depth?.asks.slice(0, 15);
  relevantAsks?.reverse();
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
    <div className="bg-zinc-800 w-3/4 my-5 rounded-md overflow-scroll text-gray-300 text-sm">
      <div className="flex justify-between font-bold py-2">
        <div className="w-1/3 text-left pl-3">{`Price (${
          depth?.market.split("_")[1]
        })`}</div>
        <div className="w-1/3 text-center">{`Quantity (${
          depth?.market.split("_")[0]
        })`}</div>
        <div className="w-1/3 text-right pr-3">Total</div>
      </div>
      <div>
        {asksWithTotal?.map((a, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              position: "relative",
              width: "100%",
              backgroundColor: "transparent",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${(100 * Number(a[2])) / (maxTotalAsks || 1)}%`,
                height: "100%",
                background: "rgba(228, 75, 68, 0.325)",
                border: "rgba(228, 75, 68, 0.325) solid 1px",
                transition: "all 0.3s ease-in-out",
              }}
            ></div>
            <div className="flex justify-between w-full">
              <div className="w-1/3 text-left pl-3 text-red-700 font-semibold">
                {a[0]}
              </div>
              <div className="w-1/3 text-center">{a[1]}</div>
              <div className="w-1/3 text-right pr-3">{a[2]}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="py-2 pl-3 font-bold bg-zinc-700">
        {depth?.currentPrice}
      </div>
      <div>
        {bidsWithTotal?.map((b, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              position: "relative",
              width: "100%",
              backgroundColor: "transparent",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${(100 * Number(b[2])) / (maxTotalBids || 1)}%`,
                height: "100%",
                background: "rgba(1, 167, 129, 0.325)",
                transition: "all 0.3s ease-in-out",
                border: "rgba(1, 167, 129, 0.325) solid 1px",
              }}
            ></div>
            <div className="flex justify-between w-full">
              <div className="w-1/3 text-left pl-3 text-green-700 font-semibold">
                {b[0]}
              </div>
              <div className="w-1/3 text-center">{b[1]}</div>
              <div className="w-1/3 text-right pr-3">{b[2]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
