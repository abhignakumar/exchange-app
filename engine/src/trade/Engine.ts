import { RedisManager } from "../RedisManager";
import {
  CANCEL_ORDER,
  CREATE_ORDER,
  DEPTH,
  GET_DEPTH,
  GET_OPEN_ORDERS,
  MessageFromApi,
  OPEN_ORDERS,
  ORDER_CANCELLED,
  ORDER_PLACED,
} from "../types";
import { Fill, Order, Orderbook } from "./Orderbook";

export const BASE_CURRENCY = "INR";

interface UserBalance {
  [key: string]: {
    available: number;
    locked: number;
  };
}

export class Engine {
  private orderbook: Orderbook[] = [];
  private balances: Map<string, UserBalance> = new Map();

  constructor() {
    this.orderbook.push(new Orderbook([], [], "SOL", 0, 0));
    this.balances.set("abcd", {
      [BASE_CURRENCY]: {
        available: 1000000,
        locked: 0,
      },
      SOL: {
        available: 1000000,
        locked: 0,
      },
    });
    this.balances.set("efgh", {
      [BASE_CURRENCY]: {
        available: 1000000,
        locked: 0,
      },
      SOL: {
        available: 1000000,
        locked: 0,
      },
    });
  }

  process({
    message,
    clientId,
  }: {
    message: MessageFromApi;
    clientId: string;
  }) {
    switch (message.type) {
      case CREATE_ORDER:
        try {
          const { orderId, executedQuantity, fills } = this.createOrder(
            message.data.market,
            message.data.price,
            message.data.quantity,
            message.data.side,
            message.data.userId
          );

          const correctedFills = fills.map((fill) => ({
            tradeId: fill.tradeId,
            price: fill.price.toString(),
            quantity: fill.quantity.toString(),
          }));

          RedisManager.getInstance().sendToApi(clientId, {
            type: ORDER_PLACED,
            payload: {
              orderId,
              executedQuantity: executedQuantity.toString(),
              fills: correctedFills,
            },
          });
        } catch (e) {
          console.log(e);
        }

        break;
      case CANCEL_ORDER:
        try {
          const orderId = message.data.orderId;
          const cancelMarket = message.data.market;
          const cancelOrderbook = this.orderbook.find(
            (ob) => ob.getTicker() === cancelMarket
          );
          if (!cancelOrderbook) throw new Error("No Orderbook found.");
          const cancelOrder =
            cancelOrderbook?.asks.find((o) => o.orderId === orderId) ||
            cancelOrderbook?.bids.find((o) => o.orderId === orderId);
          if (!cancelOrder) throw new Error("No Order found.");
          const baseAsset = cancelMarket.split("_")[0];
          if (cancelOrder.side === "buy") {
            const price = cancelOrderbook.cancelBid(cancelOrder);
            const leftPrice =
              (cancelOrder.quantity - cancelOrder.filled) * cancelOrder.price;
            //@ts-ignore
            this.balances.get(cancelOrder.userId)[BASE_CURRENCY].available +=
              leftPrice;
            //@ts-ignore
            this.balances.get(cancelOrder.userId)[BASE_CURRENCY].locked -=
              leftPrice;
            this.sendUpdatedDepthAt(price.toString(), cancelMarket);
          } else {
            const price = cancelOrderbook.cancelAsk(cancelOrder);
            const leftQuantity = cancelOrder.quantity - cancelOrder.filled;
            //@ts-ignore
            this.balances.get(cancelOrder.userId)[baseAsset].available +=
              leftQuantity;
            //@ts-ignore
            this.balances.get(cancelOrder.userId)[baseAsset].locked -=
              leftQuantity;
            this.sendUpdatedDepthAt(price.toString(), cancelMarket);
          }
          RedisManager.getInstance().sendToApi(clientId, {
            type: ORDER_CANCELLED,
            payload: {
              orderId,
              executedQuantity: 0,
              remainingQuantity: 0,
            },
          });
        } catch (e) {
          console.log(e);
        }
        break;
      case GET_OPEN_ORDERS:
        try {
          const openOrderbook = this.orderbook.find(
            (ob) => ob.getTicker() === message.data.market
          );
          if (!openOrderbook) throw new Error("No Orderbook found.");
          const openOrders = openOrderbook.getOpenOrders(message.data.userId);
          RedisManager.getInstance().sendToApi(clientId, {
            type: OPEN_ORDERS,
            payload: openOrders,
          });
        } catch (e) {
          console.log(e);
        }
        break;
      case GET_DEPTH:
        try {
          const orderbook = this.orderbook.find(
            (ob) => ob.getTicker() === message.data.market
          );
          if (!orderbook) throw new Error("No Orderbook found.");
          const depth = orderbook.getDepth();

          RedisManager.getInstance().sendToApi(clientId, {
            type: DEPTH,
            payload: {
              market: message.data.market,
              asks: depth.asks,
              bids: depth.bids,
              currentPrice: orderbook.currentPrice.toString(),
            },
          });
        } catch (e) {
          console.log(e);
        }
        break;
    }
    // console.log("OrderBook");
    // console.log(this.orderbook);
    // console.log("Balances");
    // console.log(this.balances);
    // console.log("Bids");
    // console.log(this.orderbook[0].bids);
    // console.log("Asks");
    // console.log(this.orderbook[0].asks);
  }

  createOrder(
    market: string,
    price: string,
    quantity: string,
    side: "buy" | "sell",
    userId: string
  ) {
    const orderbook = this.orderbook.find((o) => o.getTicker() === market);

    if (!orderbook) throw new Error("No orderbook found.");

    const baseAsset = market.split("_")[0];
    const quoteAsset = market.split("_")[1];

    this.checkAndLockFunds(
      userId,
      baseAsset,
      quoteAsset,
      side,
      price,
      quantity
    );

    const order: Order = {
      orderId: Math.random().toString(36).substring(2, 15),
      price: Number(price),
      quantity: Number(quantity),
      filled: 0,
      side,
      userId,
    };

    const { executedQuantity, fills } = orderbook.addOrder(order);

    this.updateBalances(
      userId,
      baseAsset,
      quoteAsset,
      side,
      executedQuantity,
      fills
    );
    this.publishWsDepthUpdates(market, fills, price, side);
    this.publishWsTrades(fills, userId, market);
    orderbook.removeFilledOrders();
    return { orderId: order.orderId, executedQuantity, fills };
  }

  checkAndLockFunds(
    userId: string,
    baseAsset: string,
    quoteAsset: string,
    side: "buy" | "sell",
    price: string,
    quantity: string
  ) {
    if (side === "buy") {
      if (
        (this.balances.get(userId)?.[quoteAsset].available || 0) <
        Number(price) * Number(quantity)
      )
        throw new Error("Insufficient Funds.");

      //@ts-ignore
      this.balances.get(userId)[quoteAsset].available =
        //@ts-ignore
        this.balances.get(userId)?.[quoteAsset].available -
        Number(price) * Number(quantity);

      //@ts-ignore
      this.balances.get(userId)[quoteAsset].locked =
        //@ts-ignore
        this.balances.get(userId)?.[quoteAsset].locked +
        Number(price) * Number(quantity);
    } else {
      if (
        (this.balances.get(userId)?.[baseAsset].available || 0) <
        Number(quantity)
      )
        throw new Error("Insufficient Funds.");

      //@ts-ignore
      this.balances.get(userId)[baseAsset].available =
        //@ts-ignore
        this.balances.get(userId)?.[baseAsset].available - Number(quantity);

      //@ts-ignore
      this.balances.get(userId)[baseAsset].locked =
        //@ts-ignore
        this.balances.get(userId)?.[baseAsset].locked + Number(quantity);
    }
  }

  updateBalances(
    userId: string,
    baseAsset: string,
    quoteAsset: string,
    side: "buy" | "sell",
    executedQuantity: number,
    fills: Fill[]
  ) {
    if (side === "buy") {
      fills.forEach((fill) => {
        //@ts-ignore
        this.balances.get(fill.otherUserId)[quoteAsset].available =
          //@ts-ignore
          this.balances.get(fill.otherUserId)[quoteAsset].available +
          Number(fill.price) * fill.quantity;
        //@ts-ignore
        this.balances.get(userId)[quoteAsset].locked =
          //@ts-ignore
          this.balances.get(userId)[quoteAsset].locked -
          Number(fill.price) * fill.quantity;

        //@ts-ignore
        this.balances.get(fill.otherUserId)[baseAsset].locked =
          //@ts-ignore
          this.balances.get(fill.otherUserId)[baseAsset].locked - fill.quantity;
        //@ts-ignore
        this.balances.get(userId)[baseAsset].available =
          //@ts-ignore
          this.balances.get(userId)[baseAsset].available + fill.quantity;
      });
    } else {
      fills.forEach((fill) => {
        //@ts-ignore
        this.balances.get(fill.otherUserId)[quoteAsset].locked =
          //@ts-ignore
          this.balances.get(fill.otherUserId)[quoteAsset].locked -
          Number(fill.price) * fill.quantity;
        //@ts-ignore
        this.balances.get(userId)[quoteAsset].available =
          //@ts-ignore
          this.balances.get(userId)[quoteAsset].available +
          Number(fill.price) * fill.quantity;

        //@ts-ignore
        this.balances.get(fill.otherUserId)[baseAsset].available =
          //@ts-ignore
          this.balances.get(fill.otherUserId)[baseAsset].available +
          fill.quantity;
        //@ts-ignore
        this.balances.get(userId)[baseAsset].locked =
          //@ts-ignore
          this.balances.get(userId)[baseAsset].locked - fill.quantity;
      });
    }
  }

  publishWsDepthUpdates(
    market: string,
    fills: Fill[],
    price: string,
    side: "buy" | "sell"
  ) {
    const orderbook = this.orderbook.find((o) => o.getTicker() === market);
    if (!orderbook) return;
    const depth = orderbook.getDepth();
    if (side === "buy") {
      const updatedAsks = depth.asks.filter((a) =>
        fills.map((f) => f.price).includes(a[0])
      );
      const updatedBids = depth.bids.filter(
        (b) => b[0] === Number(price).toString()
      );
      RedisManager.getInstance().publishMessage(`depth@${market}`, {
        stream: `depth@${market}`,
        data: {
          a: updatedAsks,
          b: updatedBids,
          e: "depth",
        },
      });
    } else {
      const updatedBids = depth.bids.filter((b) =>
        fills.map((f) => f.price).includes(b[0])
      );
      const updatedAsks = depth.asks.filter(
        (a) => a[0] === Number(price).toString()
      );
      RedisManager.getInstance().publishMessage(`depth@${market}`, {
        stream: `depth@${market}`,
        data: {
          a: updatedAsks,
          b: updatedBids,
          e: "depth",
        },
      });
    }
  }

  publishWsTrades(fills: Fill[], userId: string, market: string) {
    fills.forEach((fill) => {
      RedisManager.getInstance().publishMessage(`trade@${market}`, {
        stream: `trade@${market}`,
        data: {
          t: fill.tradeId,
          m: fill.otherUserId === userId,
          p: fill.price,
          q: fill.quantity.toString(),
          s: market,
          e: "trade",
        },
      });
    });
  }

  sendUpdatedDepthAt(price: string, market: string) {
    const orderbook = this.orderbook.find((o) => o.getTicker() === market);
    if (!orderbook) return;
    const depth = orderbook.getDepth();
    const updatedAsks = depth.asks.filter((a) => a[0] === price);
    const updatedBids = depth.bids.filter((b) => b[0] === price);
    RedisManager.getInstance().publishMessage(`depth@${market}`, {
      stream: `depth@${market}`,
      data: {
        a: updatedAsks.length ? updatedAsks : [[price, "0"]],
        b: updatedBids.length ? updatedBids : [[price, "0"]],
        e: "depth",
      },
    });
  }
}
