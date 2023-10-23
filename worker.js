const isGithub = location.host === "pedroth.github.io";
const NABLA_WORD = isGithub ? "/nabladown.js" : ""

const { parse } = await import(NABLA_WORD + "/dist/web/Parser.js");

function getTimedValue(lambda) {
  const t = performance.now();
  const value = lambda()
  return [value, 1e-3 * (performance.now() - t)];
}

onmessage = e => {
  console.log("Worker: Message received from main script", e);
  const [ast, time] = getTimedValue(() => parse(e.data));
  postMessage({ast, time});
};
