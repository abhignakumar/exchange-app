import { createClient, RedisClientType } from "redis";
import { MessageFromOrderBook, MessageToEngine } from "./types";
import dotenv from "dotenv";
dotenv.config();

export class RedisManager {
  private static instance: RedisManager;
  private pushToQueue: RedisClientType;
  private subscriber: RedisClientType;

  private constructor() {
    this.pushToQueue = createClient({
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    });
    this.pushToQueue.connect();
    this.subscriber = createClient({
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    });
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
