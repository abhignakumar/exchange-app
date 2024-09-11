import { createClient } from "redis";
import { Engine } from "./trade/Engine";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const engine = new Engine();
  const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  });
  client.connect();
  console.log("Engine running ...");

  while (true) {
    const response = await client.rPop("mainQueue");
    if (response) engine.process(JSON.parse(response));
  }
}

main();
