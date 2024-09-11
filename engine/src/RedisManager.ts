import { createClient, RedisClientType } from "redis";
import { MessageToApi, WsMessage } from "./types";
import dotenv from "dotenv";
dotenv.config();

export class RedisManager {
  private static instance: RedisManager;
  private client: RedisClientType;

  private constructor() {
    this.client = createClient({
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    });
    this.client.connect();
  }

  public static getInstance() {
    if (!this.instance) this.instance = new RedisManager();
    return this.instance;
  }

  public sendToApi(clientId: string, message: MessageToApi) {
    this.client.publish(clientId, JSON.stringify(message));
  }

  public publishMessage(channel: string, message: WsMessage) {
    this.client.publish(channel, JSON.stringify(message));
  }
}
