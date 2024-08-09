import { createClient, RedisClientType } from "redis";
import { MessageFromOrderBook, MessageToEngine } from "./types";

export class RedisManager {
  private static instance: RedisManager;
  private pushToQueue: RedisClientType;
  private subscriber: RedisClientType;

  private constructor() {
    this.pushToQueue = createClient();
    this.pushToQueue.connect();
    this.subscriber = createClient();
    this.subscriber.connect();
  }

  public static getInstance() {
    if (!this.instance) this.instance = new RedisManager();
    return this.instance;
  }

  public sendAndAwait(message: MessageToEngine) {
    return new Promise<MessageFromOrderBook>((resolve) => {
      const clientId = this.getRandomClientId();
      this.subscriber.subscribe(clientId, (messageFromOB) => {
        this.subscriber.unsubscribe(clientId);
        resolve(JSON.parse(messageFromOB));
      });
      this.pushToQueue.lPush(
        "mainQueue",
        JSON.stringify({ clientId, message })
      );
    });
  }

  private getRandomClientId() {
    return Math.random().toString(36).substring(2, 15);
  }
}
