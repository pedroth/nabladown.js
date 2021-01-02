const window = {};
const document = { createElement: () => {}, querySelector: () => {} };
if (location.port === "") importScripts("/nabladown.js/dist/Parser.js");
else importScripts("/dist/Parser.js");

const { parse } = window.Parser;

onmessage = e => {
  console.log("Worker: Message received from main script", e);
  postMessage(parse(e.data));
};
