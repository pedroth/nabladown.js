const window = {};
if (location.port === "") importScripts("/nabladown.js/dist/index.js");
else importScripts("/dist/index.js");

const { parse } = window.NablaDown;

onmessage = e => {
  console.log("Worker: Message received from main script", e);
  postMessage(parse(e.data));
};
