const { render } = Render;
const { parse } = Parser;
//========================================================================================
/*                                                                                      *
 *                                          UI                                          *
 *                                                                                      */
//========================================================================================

function onResize() {
  const style = document.getElementById("composer").style;
  const input = document.getElementById("inputContainer");
  const output = document.getElementById("outputContainer");
  if (window.innerWidth >= window.innerHeight) {
    style["flex-direction"] = "row";

    input.style.width = `${window.innerWidth / 2}px`;
    input.style.height = `${window.innerHeight * 0.95}px`;

    output.style.width = `${window.innerWidth / 2}px`;
    output.style.height = `${window.innerHeight * 0.95}px`;
  } else {
    style["flex-direction"] = "column";
    input.style.width = `${100}%`;
    input.style.height = `${window.innerHeight / 2}px`;
    output.style.width = `${100}%`;
    output.style.height = `${window.innerHeight / 2}px`;
  }
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function getParseWorker() {
  let parseWorker = undefined;
  if (window.Worker) {
    parseWorker =
      location.port === ""
        ? new Worker("/nabladown.js/worker.js")
        : new Worker("/worker.js");
  }
  return parseWorker;
}

function getInput() {
  return (
    localStorage.getItem("input") ||
    "#Nabladown.js\n Checkout it [here](https://www.github.com/pedroth/nabladown.js)\n"
  );
}

onResize();
window.addEventListener("resize", onResize);

let parseWorker = getParseWorker();

(() => {
  let timer = null;
  const editor = ace.edit("input");
  const input = getInput();
  const output = document.getElementById("output");
  editor.setValue(input);

  if (!!parseWorker) {
    parseWorker.onmessage = e => {
      console.log("Message received from worker", e);
      removeAllChildNodes(output);
      output.appendChild(render(e.data));
    };
    // first render when worker exists
    output.appendChild(render(parse(editor.getValue())));
  }
  editor.getSession().on("change", () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      const newInput = editor.getValue();
      localStorage.setItem("input", newInput);
      if (!parseWorker) {
        removeAllChildNodes(output);
        output.appendChild(render(parse(newInput)));
      } else {
        parseWorker.postMessage(newInput);
      }
    }, 500);
  });
})();
