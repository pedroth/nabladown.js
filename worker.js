const isGithub = location.host === "pedroth.github.io";
const NABLA_WORD = isGithub ? "/nabladown.js" : ""

const { parse } = await import(NABLA_WORD + "/dist/web/Parser.js");

onmessage = e => {
  console.log("Worker: Message received from main script", e);
  postMessage(parse(e.data));
};
