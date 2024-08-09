import { Order } from "../trade/Orderbook";

export const CREATE_ORDER = "CREATE_ORDER";
export const ORDER_PLACED = "ORDER_PLACED";

export const CANCEL_ORDER = "CANCEL_ORDER";
export const ORDER_CANCELLED = "ORDER_CANCELLED";

export const GET_OPEN_ORDERS = "GET_OPEN_ORDERS";
export const OPEN_ORDERS = "OPEN_ORDERS";

export const GET_DEPTH = "GET_DEPTH";
export const DEPTH = "DEPTH";

export type MessageToApi =
  | {
      type: typeof ORDER_PLACED;
      payload: {
        orderId: string;
        executedQuantity: string;
        fills: {
          tradeId: number;
          price: string;
          quantity: string;
        }[];
      };
    }
  | {
      type: typeof ORDER_CANCELLED;
      payload: {
        orderId: string;
        executedQuantity: number;
        remainingQuantity: number;
      };
    }
  | {
      type: typeof OPEN_ORDERS;
      payload: Order[];
    }
  | {
      type: typeof DEPTH;
      payload: {
        market: string;
        asks: [string, string][];
        bids: [string, string][];
        currentPrice: string;
      };
    };

export type MessageFromApi =
  | {
      type: typeof CREATE_ORDER;
      data: {
        market: string;
        price: string;
        quantity: string;
        side: "buy" | "sell";
        userId: string;
      };
    }
  | {
      type: typeof CANCEL_ORDER;
      data: {
        orderId: string;
        market: string;
      };
    }
  | {
      type: typeof GET_OPEN_ORDERS;
      data: {
        userId: string;
        market: string;
      };
    }
  | {
      type: typeof GET_DEPTH;
      data: {
        market: string;
      };
    };

export type DepthUpdateMessage = {
  stream: string;
  data: {
    b?: [string, string][];
    a?: [string, string][];
    e: "depth";
  };
};

export type TickerUpdateMessage = {
  stream: string;
  data: {
    c?: string;
    h?: string;
    l?: string;
    v?: string;
    V?: string;
    s?: string;
    e: "ticker";
  };
};

export type TradeUpdateMessage = {
  stream: string;
  data: {
    t: number;
    m: boolean;
    p: string;
    q: string;
    s: string;
    e: "trade";
  };
};

export type WsMessage =
  | DepthUpdateMessage
  | TickerUpdateMessage
  | TradeUpdateMessage;
