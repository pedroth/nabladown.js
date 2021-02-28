const { render } = Render;
const { render: pedroRender } = PRender;
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
    nablaLocalStorage().getItem("input") ||
    "#$\\nabla$ Nabladown`.js`\n Check it out [here](https://www.github.com/pedroth/nabladown.js)\n"
  );
}

function getSelectedRenderName() {
  return nablaLocalStorage().getItem("selectedRender") || "customRender";
}

function downloadNablaDownURL(output) {
  const file = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>NablaDown Output</title>
      <!-- katex style -->
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.css"
        integrity="sha384-qCEsSYDSH0x5I45nNW4oXemORUZnYFtPy/FqB/OjqxabTMW5HVaaH9USK4fN3goV"
        crossorigin="anonymous"
      />
    </head>
    <body>
    ${output.innerHTML}
    </body>
  </html>`;
  return URL.createObjectURL(
    new Blob([file], { type: "text/plain;charset=utf-8" })
  );
}

const nablaLocalStorage = () => {
  const namespace = "nabladown";
  return {
    getItem: key => {
      const ls = localStorage.getItem(namespace) || "{}";
      return JSON.parse(ls)[key];
    },
    setItem: (key, value) => {
      const ls = JSON.parse(localStorage.getItem(namespace)) || {};
      ls[key] = value;
      localStorage.setItem(namespace, JSON.stringify(ls));
      return this;
    }
  };
};

(() => {
  // global vars
  const renderTypes = { baseRender: render, customRender: pedroRender };
  let parseWorker = getParseWorker();
  let timer = null;
  //export button
  exportButton = document.getElementById("exportIcon");
  // editor init
  const editor = ace.edit("input");
  const input = getInput();
  editor.setValue(input);
  const output = document.getElementById("output");

  // render function
  function renderOutput(tree) {
    removeAllChildNodes(output);
    output.appendChild(selectedRender(tree));
    exportButton.href = downloadNablaDownURL(output);
  }
  // resize
  onResize();
  window.addEventListener("resize", onResize);

  // render selector
  let selectedRender = renderTypes[getSelectedRenderName()];
  function prepareSelector() {
    selector = document.getElementById("renderSelector");
    Object.keys(renderTypes).forEach(name => {
      option = document.createElement("option");
      option.setAttribute("value", name);
      if (getSelectedRenderName() === name) option.setAttribute("selected", "");
      option.innerText = name;
      selector.appendChild(option);
    });
    selector.addEventListener("change", e => {
      const renderName = e.target.value;
      selectedRender = renderTypes[renderName];
      nablaLocalStorage().setItem("selectedRender", renderName);
      renderOutput(parse(editor.getValue()));
    });
  }
  prepareSelector(selectedRender);

  // setup parse worker
  if (!!parseWorker) {
    parseWorker.onmessage = e => {
      console.log("Message received from worker", e);
      renderOutput(e.data);
    };
    // first render when worker exists
    renderOutput(parse(editor.getValue()));
  }

  // set up editor
  editor.getSession().on("change", () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      const newInput = editor.getValue();
      nablaLocalStorage().setItem("input", newInput);
      if (!parseWorker) {
        renderOutput(parse(newInput));
      } else {
        parseWorker.postMessage(newInput);
      }
    }, 500);
  });
})();
