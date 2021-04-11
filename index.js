const { render } = Render;
const { render: codeRender } = CodeRender;
const { parse } = Parser;
// Global selected render
let selectedRender = ast => {};

//========================================================================================
/*                                                                                      *
 *                                NABLADOWN LOCAL STORAGE                               *
 *                                                                                      */
//========================================================================================

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

/**
 *
 * @param {*} selectedRender global selected render
 * @returns parser worker
 */
function getParseWorker() {
  let parseWorker = undefined;
  if (window.Worker) {
    parseWorker =
      location.port === ""
        ? new Worker("/nabladown.js/worker.js")
        : new Worker("/worker.js");
  }
  if (!!parseWorker) {
    parseWorker.onmessage = e => {
      console.log("Message received from worker", e);
      selectedRender(e.data);
    };
  }
  return parseWorker;
}

function getSelectedRenderName() {
  return nablaLocalStorage().getItem("selectedRender") || "Code Syntax";
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

function renderFactory(selectedRender) {
  // render function
  return tree => {
    const output = document.getElementById("output");
    removeAllChildNodes(output);
    output.appendChild(selectedRender(tree));
    const exportButton = document.getElementById("exportIcon");
    exportButton.href = downloadNablaDownURL(output);
  };
}

/**
 *
 * @param {*} renderTypes
 * @param {*} selectedRender pointer to selectedRender
 */
function setRenderSelect(renderTypes) {
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
    selectedRender = renderFactory(renderTypes[renderName]);
    nablaLocalStorage().setItem("selectedRender", renderName);
    selectedRender(parse(editor.getValue()));
  });
}

function getEditor() {
  const editor = ace.edit("input");
  editor.setValue(getInput());
  return editor;
}

function getInput() {
  return (
    nablaLocalStorage().getItem("input") ||
    getURLData() ||
    "#$\\nabla$ Nabladown`.js`\n Check it out [here](https://www.github.com/pedroth/nabladown.js)\n"
  );
}

function getURLData() {
  const url = window.location.href;
  const split = url.split("?text=");
  if (split.length <= 1) return undefined;
  return decodeURI(split[1]);
}

function setPermalinkButton(editor) {
  const permalink = document.getElementById("permalink");
  permalink.addEventListener("click", evt => {
    const url = window.location.href;
    const baseUrl = url.split("?text=")[0];
    window.location.href = baseUrl + "?text=" + encodeURI(editor.getValue());
  });
}

(() => {
  const renderTypes = {
    Vanilla: render,
    "Code Syntax": codeRender,
    AST: ast => {
      const container = document.createElement("pre");
      container.innerText = JSON.stringify(ast, null, 3);
      return container;
    }
  };
  selectedRender = renderFactory(renderTypes[getSelectedRenderName()]);
  setRenderSelect(renderTypes);
  // resize
  onResize();
  window.addEventListener("resize", onResize);
  // editor
  const editor = getEditor();
  // set permalink
  setPermalinkButton(editor);
  // setup parse worker
  const parseWorker = getParseWorker();
  // first render when worker exists
  !!parseWorker && selectedRender(parse(editor.getValue()));

  // set up editor
  let timer = null;
  editor.getSession().on("change", () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      const newInput = editor.getValue();
      nablaLocalStorage().setItem("input", newInput);
      if (!parseWorker) {
        selectedRender(parse(newInput));
      } else {
        parseWorker.postMessage(newInput);
      }
    }, 500);
  });
})();
