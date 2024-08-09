import { Router } from "express";
import { RedisManager } from "../RedisManager";
import { GET_DEPTH } from "../types";
const depthRouter = Router();

depthRouter.get("/", async (req, res) => {
  const { market } = req.query;
  const depth = await RedisManager.getInstance().sendAndAwait({
    type: GET_DEPTH,
    data: {
      market: market as string,
    },
  });
  if (depth) res.json(depth.payload);
  else res.json({ message: "Error." });
});

export default depthRouter;
