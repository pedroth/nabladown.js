const { render } = Render;
const { render: codeRender } = CodeRender;
const { render: mathRender } = MathRender;
const { render: nablaRender } = NabladownRender;
const { parse } = Parser;

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
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================

function debounce(lambda, debounceTimeInMillis = 500) {
  let timerId;
  return function (...vars) {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      lambda(...vars);
    }, debounceTimeInMillis);
    return true;
  };
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

/**
 *
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


function getInput() {
  return (
    getURLData() ||
    nablaLocalStorage().getItem("input") ||
    "#$\\nabla$ Nabladown`.js`\n Check it out [here](https://www.github.com/pedroth/nabladown.js)\n"
  );
}


function getSelectedRenderName() {
  return nablaLocalStorage().getItem("selectedRender") || "Nabla";
}

function downloadNablaDownURL(output) {
  const file = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>NablaDown Output</title>
    </head>
    <body>
    ${output.innerHTML}
    </body>
  </html>`;
  return URL.createObjectURL(
    new Blob([file], { type: "text/plain;charset=utf-8" })
  );
}

function getURLData() {
  const url = window.location.href;
  const split = url.split("?text=");
  if (split.length <= 1) return undefined;
  return decodeURI(split[1]);
}


//========================================================================================
/*                                                                                      *
 *                                          UI                                          *
 *                                                                                      */
//========================================================================================



function renderFactory({ selectedRender, exportHTMLIcon, output }) {
  // render function
  return tree => {
    removeAllChildNodes(output);
    output.appendChild(selectedRender(tree));
    exportHTMLIcon.children[0].href = downloadNablaDownURL(output);
  };
}

function renderEditor(anchor) {
  const editor = monaco.editor.create(anchor, {
    value: "",
    language: "markdown",
    lineNumbers: "on",
    wordWrap: "wordWrapColumn",
    theme: "vs-dark",
    fontSize: "16",
    automaticLayout: true
  });
  return editor;
}

function addEditorEventListener({
  editor,
  parseWorker
}) {
  editor.onDidChangeModelContent(
    debounce(() => {
      const newInput = editor.getValue();
      nablaLocalStorage().setItem("input", newInput);
      if (!parseWorker) {
        selectedRender(parse(newInput));
      } else {
        parseWorker.postMessage(newInput);
      }
    })
  );
}

function renderGithub() {
  const icon = document.createElement("i");
  icon.setAttribute("class", "material-icons");
  const hyperLink = document.createElement("a");
  hyperLink.setAttribute("title", "Github")
  hyperLink.setAttribute("href", "https://www.github.com/pedroth/nabladown.js")
  hyperLink.setAttribute("target", "_blank")
  hyperLink.setAttribute("rel", "noopener")
  hyperLink.innerText = "code";
  icon.appendChild(hyperLink);
  return icon;
}

function renderExportHTML() {
  const icon = document.createElement("i");
  icon.setAttribute("class", "material-icons");
  const hyperLink = document.createElement("a");
  hyperLink.setAttribute("title", "Export html")
  hyperLink.setAttribute("href", "javascript:void(0)")
  hyperLink.setAttribute("rel", "noopener")
  hyperLink.innerText = "download";
  icon.appendChild(hyperLink);
  return icon;
}

function renderPermalink(editor) {
  const icon = document.createElement("i");
  icon.setAttribute("class", "material-icons");
  const hyperLink = document.createElement("a");
  hyperLink.setAttribute("title", "Permalink")
  hyperLink.setAttribute("href", "javascript:void(0)")
  hyperLink.innerText = "link";
  hyperLink.addEventListener("click", _ => {
    const url = window.location.href;
    const baseUrl = url.split("?text=")[0];
    window.location.href = baseUrl + "?text=" + encodeURI(editor.getValue());
  });
  icon.appendChild(hyperLink);
  return icon;
}

function renderOutputSelector(props) {
  let { renderTypes, editor, exportHTMLIcon, output } = props;
  const selector = document.createElement("select");
  selector.setAttribute("class", "selector")
  selector.setAttribute("title", "renders")
  selector.setAttribute("name", "renders")
  Object.keys(renderTypes).forEach(name => {
    option = document.createElement("option");
    option.setAttribute("value", name);
    if (getSelectedRenderName() === name) option.setAttribute("selected", "");
    option.innerText = name;
    selector.appendChild(option);
  });
  selector.addEventListener("change", e => {
    const renderName = e.target.value;
    selectedRender = renderFactory({
      selectedRender: renderTypes[renderName],
      exportHTMLIcon,
      output
    });
    nablaLocalStorage().setItem("selectedRender", renderName);
    selectedRender(parse(editor.getValue()));
  });
  return selector;
}

function renderToolsUI({ renderTypes, editor, output }) {
  const toolsDiv = document.createElement("div");
  toolsDiv.setAttribute("class", "tools");
  toolsDiv.appendChild(renderGithub());
  const exportHTMLIcon = renderExportHTML();
  toolsDiv.appendChild(exportHTMLIcon);
  toolsDiv.appendChild(renderPermalink(editor));
  toolsDiv.appendChild(renderOutputSelector({
    renderTypes,
    editor,
    output,
    exportHTMLIcon,
  }));
  return { tools: toolsDiv, exportHTMLIcon }
}

function renderTitle() {
  const div = document.createElement("div")
  div.setAttribute("class", "title")
  const h1 = document.createElement("h1");
  h1.innerText = `∇Nabladown.js`;
  div.appendChild(h1);
  return div;
}

function onResize(inOut, input, output) {
  const style = inOut.style;
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

function renderInputOutput() {
  const inputOutput = document.createElement("div");
  inputOutput.setAttribute("class", "composer");
  const input = document.createElement("div");
  input.setAttribute("class", "input");
  const output = document.createElement("div");
  output.setAttribute("class", "output");
  inputOutput.appendChild(input)
  inputOutput.appendChild(output)
  onResize(inputOutput, input, output);
  window.addEventListener("resize", () => onResize(inputOutput, input, output));
  const editor = renderEditor(input)
  return { inputOutput, editor, input, output }
}


function renderUI(renderTypes) {
  const title = renderTitle();
  const { inputOutput, editor, output } = renderInputOutput();
  const { tools, exportHTMLIcon } = renderToolsUI({ renderTypes, editor, output });
  return { tools, title, inputOutput, editor, exportHTMLIcon, output }
}


//========================================================================================
/*                                                                                      *
 *                                         MAIN                                         *
 *                                                                                      */
//========================================================================================

// Global selectedRender
let selectedRender = ast => { }

(() => {
  const renderTypes = {
    Vanilla: render,
    Math: mathRender,
    Code: codeRender,
    Nabla: nablaRender,
    AST: ast => {
      const container = document.createElement("pre");
      container.innerText = JSON.stringify(ast, null, 3);
      return container;
    }
  };

  // render UI
  const {
    tools,
    title,
    inputOutput,
    editor,
    exportHTMLIcon,
    output
  } = renderUI(renderTypes);
  const root = document.getElementById("root");
  root.appendChild(tools)
  root.appendChild(title)
  root.appendChild(inputOutput)
  editor.setValue(getInput());

  // setup parse worker
  const parseWorker = getParseWorker();

  // select render
  selectedRender = renderFactory({
    selectedRender: renderTypes[getSelectedRenderName()],
    exportHTMLIcon,
    output
  });
  // first render when worker exists
  !!parseWorker && selectedRender(parse(editor.getValue()));
  addEditorEventListener({ editor, parseWorker });
})();
