import { WebSocket } from "ws";
import {
  IncomingMessage,
  OutgoingMessage,
  SUBSCRIBE,
  UNSUBSCRIBE,
} from "./types";
import { SubscriptionManager } from "./SubcriptionManager";

export class User {
  private id: string;
  private ws: WebSocket;
  private subscriptions: string[] = [];

  constructor(id: string, ws: WebSocket) {
    this.id = id;
    this.ws = ws;
    this.addListeners();
  }

  public emit(message: OutgoingMessage) {
    this.ws.send(JSON.stringify(message));
  }

  public subscribe(subscription: string) {
    this.subscriptions.push(subscription);
  }

  public unsubscribe(subscription: string) {
    this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
  }

  private addListeners() {
    this.ws.on("message", (message: string) => {
      const parsedMessage: IncomingMessage = JSON.parse(message);
      if (parsedMessage.method === SUBSCRIBE)
        parsedMessage.params.forEach((s) =>
          SubscriptionManager.getInstance().subcribe(this.id, s)
        );
      if (parsedMessage.method === UNSUBSCRIBE)
        parsedMessage.params.forEach((s) =>
          SubscriptionManager.getInstance().unsubcribe(this.id, s)
        );
    });
  }
}
