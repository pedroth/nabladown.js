const { parse, render } = NablaDown;

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

onResize();
window.addEventListener("resize", onResize);

(() => {
  let timer = null;
  const editor = ace.edit("input");
  const input =
    localStorage.getItem("input") ||
    "#Nabladown.js\n Checkout it [here](https://www.github.com/pedroth/nabladown.js)\n";
  editor.setValue(input);
  const output = document.getElementById("output");
  output.appendChild(render(parse(input)));
  editor.getSession().on("change", () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      removeAllChildNodes(output);
      const newInput = editor.getValue();
      localStorage.setItem("input", newInput);
      output.appendChild(render(parse(newInput)));
    }, 250);
  });
})();
