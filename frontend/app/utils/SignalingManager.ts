export const BASE_URL_WS = "wss://websocketexchange.abhigna.online";

export class SignalingManager {
  private static instance: SignalingManager;
  private ws: WebSocket;
  private bufferedMessages: any[] = [];
  private callbacks: any = {};
  private id: number;
  private isInitialized: boolean = false;

  private constructor() {
    this.ws = new WebSocket(BASE_URL_WS);
    this.id = 1;
    this.init();
  }

  public static getInstance() {
    if (!this.instance) this.instance = new SignalingManager();
    return this.instance;
  }

  init() {
    this.ws.onopen = () => {
      this.isInitialized = true;
      this.bufferedMessages.forEach((m) => {
        this.ws.send(JSON.stringify(m));
      });
      this.bufferedMessages = [];
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data as string);
      const type = message.data.e;
      if (this.callbacks[type]) {
        this.callbacks[type].forEach(({ callback }: any) => {
          if (type === "depth") {
            const updatedAsks = message.data.a;
            const updatedBids = message.data.b;
            callback({ asks: updatedAsks, bids: updatedBids });
          }
          if (type === "trade") {
            callback(message.data);
          }
        });
      }
    };
  }

  sendMessage(message: any) {
    const messageToSend = {
      ...message,
      id: this.id++,
    };
    if (!this.isInitialized) this.bufferedMessages.push(messageToSend);
    else this.ws.send(JSON.stringify(messageToSend));
  }

  registerCallback(type: string, id: string, callback: any) {
    this.callbacks[type] = this.callbacks[type] || [];
    this.callbacks[type].push({ callback, id });
  }

  deRegisterCallback(type: string, id: string) {
    if (this.callbacks[type]) {
      const index = this.callbacks[type].findIndex((c: any) => c.id === id);
      if (index !== 1) this.callbacks[type].splice(index, 1);
    }
  }
}
