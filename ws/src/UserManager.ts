import { WebSocket } from "ws";
import { User } from "./User";
import { SubscriptionManager } from "./SubcriptionManager";

export class UserManager {
  private static instance: UserManager;
  private users: Map<string, User> = new Map();

  private constructor() {}

  public static getInstance() {
    if (!this.instance) this.instance = new UserManager();
    return this.instance;
  }

  public addUser(ws: WebSocket) {
    const id = this.getRandomId();
    const user = new User(id, ws);
    this.users.set(id, user);
    this.registerCloseCallback(id, ws);
    return user;
  }

  public getUser(id: string) {
    return this.users.get(id);
  }

  private registerCloseCallback(id: string, ws: WebSocket) {
    ws.on("close", () => {
      SubscriptionManager.getInstance().userLeft(id);
      this.users.delete(id);
    });
  }

  private getRandomId() {
    return Math.random().toString(36).substring(2, 15);
  }
}
