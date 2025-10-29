const isGithub = location.host === "pedroth.github.io";
const NABLA_WORD = isGithub ? "/nabladown.js" : ""

const { parse } = await import(NABLA_WORD + "/dist/web/Parser.js");

function getTimedValue(lambda) {
  const t = performance.now();
  const value = lambda()
  return [value, 1e-3 * (performance.now() - t)];
}

onmessage = e => {
  const decoder = new TextDecoder();
  const text = decoder.decode(e.data);
  console.log("Worker: Message received from main script", text);
  const [ast, time] = getTimedValue(() => parse(text));
  postMessage({ ast, time, inputText: text });
};
