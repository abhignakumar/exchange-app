import { createClient, RedisClientType } from "redis";
import { UserManager } from "./UserManager";
import dotenv from "dotenv";
dotenv.config();

export class SubscriptionManager {
  private static instance: SubscriptionManager;
  private client: RedisClientType;
  private subscriptions: Map<string, string[]> = new Map();
  private reverseSubscriptions: Map<string, string[]> = new Map();

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
    if (!this.instance) this.instance = new SubscriptionManager();
    return this.instance;
  }

  public subcribe(userId: string, subscription: string) {
    if (this.subscriptions.get(userId)?.includes(subscription)) return;

    this.subscriptions.set(
      userId,
      (this.subscriptions.get(userId) || []).concat([subscription])
    );
    this.reverseSubscriptions.set(
      subscription,
      (this.reverseSubscriptions.get(subscription) || []).concat([userId])
    );
    if (this.reverseSubscriptions.get(subscription)?.length === 1) {
      this.client.subscribe(
        subscription,
        (message: string, channel: string) => {
          const parsedMessage = JSON.parse(message);
          this.reverseSubscriptions
            .get(channel)
            ?.forEach((u) =>
              UserManager.getInstance().getUser(u)?.emit(parsedMessage)
            );
        }
      );
    }
  }

  public unsubcribe(userId: string, subscription: string) {
    if (!this.subscriptions.get(userId)?.includes(subscription)) return;

    const subscriptions = this.subscriptions.get(userId);
    if (subscriptions)
      this.subscriptions.set(
        userId,
        subscriptions.filter((s) => s !== subscription)
      );
    const reverseSubscriptions = this.reverseSubscriptions.get(subscription);
    if (reverseSubscriptions)
      this.reverseSubscriptions.set(
        userId,
        reverseSubscriptions.filter((u) => u !== userId)
      );

    if (reverseSubscriptions?.length === 0) {
      this.client.unsubscribe(subscription);
      this.reverseSubscriptions.delete(subscription);
    }
  }

  public userLeft(userId: string) {
    this.subscriptions.get(userId)?.forEach((s) => this.unsubcribe(userId, s));
    this.subscriptions.delete(userId);
  }
}
