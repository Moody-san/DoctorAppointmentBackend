import { createClient, RedisClientType } from "redis";
var client: RedisClientType;
var ready = false;
(() => {
  try {
    client = createClient();
    client.connect().then(() => {
      console.log("redis connected");
      ready = true;
    });
    client.FLUSHDB();
  } catch (error) {
    console.log("unable to connect redis");
  }
})();
export { client, ready };
