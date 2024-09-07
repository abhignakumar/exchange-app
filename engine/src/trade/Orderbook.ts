import { BASE_CURRENCY } from "./Engine";

export interface Order {
  orderId: string;
  price: number;
  quantity: number;
  filled: number;
  side: "buy" | "sell";
  userId: string;
}

export interface Fill {
  tradeId: number;
  price: string;
  quantity: number;
  otherUserId: string;
  marketOrderId: string;
}

export class Orderbook {
  bids: Order[];
  asks: Order[];
  baseAsset: string;
  quoteAsset: string = BASE_CURRENCY;
  lastTradeId: number;
  currentPrice: number;
  constructor(
    bids: Order[],
    asks: Order[],
    baseAsset: string,
    lastTradeId: number,
    currentPrice: number
  ) {
    this.bids = bids;
    this.asks = asks;
    this.baseAsset = baseAsset;
    this.lastTradeId = lastTradeId;
    this.currentPrice = currentPrice;
  }

  getTicker() {
    return `${this.baseAsset}_${this.quoteAsset}`;
  }

  addOrder(order: Order) {
    if (order.side === "buy") {
      const { executedQuantity, fills } = this.matchAsk(order);
      order.filled = executedQuantity;
      if (executedQuantity < order.quantity) {
        this.bids.push(order);
        // this.bids.sort((a, b) => b.price - a.price);
      }
      return { executedQuantity, fills };
    } else {
      const { executedQuantity, fills } = this.matchBid(order);
      order.filled = executedQuantity;
      if (executedQuantity < order.quantity) {
        this.asks.push(order);
        // this.asks.sort((a, b) => b.price - a.price);
      }
      return { executedQuantity, fills };
    }
  }

  matchAsk(order: Order): { executedQuantity: number; fills: Fill[] } {
    const fills: Fill[] = [];
    let executedQuantity = 0;
    for (let i = 0; i < this.asks.length; i++) {
      if (order.quantity === executedQuantity) {
        return {
          executedQuantity,
          fills,
        };
      }
      // console.log("------ ");
      // console.log(this.asks[i]);
      // console.log("------");
      // console.log(order);

      if (this.asks[i].price <= order.price) {
        const filledQuantity = Math.min(
          order.quantity - order.filled,
          this.asks[i].quantity - this.asks[i].filled
        );
        executedQuantity += filledQuantity;
        this.asks[i].filled += filledQuantity;
        fills.push({
          tradeId: this.lastTradeId++,
          price: this.asks[i].price.toString(),
          quantity: filledQuantity,
          otherUserId: this.asks[i].userId,
          marketOrderId: this.asks[i].orderId,
        });
        this.currentPrice = this.asks[i].price;
      }
    }
    return { executedQuantity, fills };
  }

  matchBid(order: Order): { executedQuantity: number; fills: Fill[] } {
    const fills: Fill[] = [];
    let executedQuantity = 0;
    for (let i = 0; i < this.bids.length; i++) {
      if (order.quantity === executedQuantity) {
        return {
          executedQuantity,
          fills,
        };
      }

      // console.log("------ ");
      // console.log(this.bids[i]);
      // console.log("------");
      // console.log(order);

      if (this.bids[i].price >= order.price) {
        const filledQuantity = Math.min(
          order.quantity - order.filled,
          this.bids[i].quantity - this.bids[i].filled
        );
        executedQuantity += filledQuantity;
        this.bids[i].filled += filledQuantity;
        fills.push({
          tradeId: this.lastTradeId++,
          price: this.bids[i].price.toString(),
          quantity: filledQuantity,
          otherUserId: this.bids[i].userId,
          marketOrderId: this.bids[i].orderId,
        });
        this.currentPrice = this.bids[i].price;
      }
    }
    return { executedQuantity, fills };
  }

  getDepth() {
    const bids: [string, string][] = [];
    const asks: [string, string][] = [];
    const bidsObj: { [key: string]: number } = {};
    const asksObj: { [key: string]: number } = {};

    for (let i = 0; i < this.bids.length; i++) {
      const order = this.bids[i];
      if (!bidsObj[order.price]) bidsObj[order.price] = 0;
      bidsObj[order.price] += order.quantity - order.filled;
    }

    for (let i = 0; i < this.asks.length; i++) {
      const order = this.asks[i];
      if (!asksObj[order.price]) asksObj[order.price] = 0;
      asksObj[order.price] += order.quantity - order.filled;
    }

    for (const price in bidsObj) bids.push([price, bidsObj[price].toString()]);

    for (const price in asksObj) asks.push([price, asksObj[price].toString()]);

    // console.log("Depth");
    // console.log({ bids, asks });

    return { bids, asks };
  }

  getOpenOrders(userId: string): Order[] {
    const asks = this.asks.filter((o) => o.userId === userId);
    const bids = this.bids.filter((o) => o.userId === userId);
    return [...asks, ...bids];
  }

  cancelBid(order: Order) {
    const index = this.bids.findIndex((o) => o.orderId === order.orderId);
    if (index !== -1) {
      const price = this.bids[index].price;
      this.bids.splice(index, 1);
      return price;
    } else return -1;
  }

  cancelAsk(order: Order) {
    const index = this.asks.findIndex((o) => o.orderId === order.orderId);
    if (index !== -1) {
      const price = this.asks[index].price;
      this.asks.splice(index, 1);
      return price;
    } else return -1;
  }

  removeFilledOrders() {
    for (let i = 0; i < this.asks.length; i++) {
      if (this.asks[i].quantity === this.asks[i].filled) {
        this.asks.splice(i, 1);
        i--;
      }
    }
    for (let i = 0; i < this.bids.length; i++) {
      if (this.bids[i].quantity === this.bids[i].filled) {
        this.bids.splice(i, 1);
        i--;
      }
    }
  }
}
