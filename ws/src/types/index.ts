export const SUBSCRIBE = "SUBSCRIBE";
export const UNSUBSCRIBE = "UNSUBSCRIBE";

export type SubscribeMessage = {
  method: typeof SUBSCRIBE;
  params: string[];
};

export type UnSubscribeMessage = {
  method: typeof UNSUBSCRIBE;
  params: string[];
};

export type IncomingMessage = SubscribeMessage | UnSubscribeMessage;

export type DepthUpdateMessage = {
  type: "depth";
  data: {
    b?: [string, string][];
    a?: [string, string][];
    id: number;
    e: "depth";
  };
};

export type TickerUpdateMessage = {
  type: "ticker";
  data: {
    c?: string;
    h?: string;
    l?: string;
    v?: string;
    V?: string;
    s?: string;
    id: number;
    e: "ticker";
  };
};

export type OutgoingMessage = DepthUpdateMessage | TickerUpdateMessage;
