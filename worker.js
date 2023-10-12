import { parse } from "./dist/web/Parser.js";

onmessage = e => {
  console.log("Worker: Message received from main script", e);
  postMessage(parse(e.data));
};
