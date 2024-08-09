import { createClient } from "redis";
import { Engine } from "./trade/Engine";

async function main() {
  const engine = new Engine();
  const client = createClient();
  client.connect();
  console.log("Engine running ...");

  while (true) {
    const response = await client.rPop("mainQueue");
    if (response) engine.process(JSON.parse(response));
  }
}

main();
