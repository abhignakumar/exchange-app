import { Router } from "express";
import { RedisManager } from "../RedisManager";
import { CANCEL_ORDER, CREATE_ORDER, GET_OPEN_ORDERS } from "../types";

const orderRouter = Router();

orderRouter.post("/", async (req, res) => {
  try {
    const orderData: {
      market: string;
      price: string;
      quantity: string;
      side: "buy" | "sell";
      userId: string;
    } = req.body;

    const messageFromOB = await RedisManager.getInstance().sendAndAwait({
      type: CREATE_ORDER,
      data: orderData,
    });

    res.json({
      message: "Request Processed.",
      responseData: messageFromOB.payload,
    });
  } catch (e) {
    console.log(e);
    res.json({ message: "Error." });
  }
});

orderRouter.delete("/", async (req, res) => {
  try {
    const { orderId, market } = req.body;
    const response = await RedisManager.getInstance().sendAndAwait({
      type: CANCEL_ORDER,
      data: {
        orderId,
        market,
      },
    });
    res.json({
      message: "Request Processed.",
      responseData: response.payload,
    });
  } catch (e) {
    console.log(e);
    res.json({ message: "Error." });
  }
});

orderRouter.get("/open", async (req, res) => {
  try {
    const response = await RedisManager.getInstance().sendAndAwait({
      type: GET_OPEN_ORDERS,
      data: {
        userId: req.query.userId as string,
        market: req.query.market as string,
      },
    });
    res.json({
      message: "Request Processed.",
      responseData: response.payload,
    });
  } catch (e) {
    console.log(e);
    res.json({ message: "Error." });
  }
});

export default orderRouter;
