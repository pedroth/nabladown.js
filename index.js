const { parse, render } = NablaDown;

//========================================================================================
/*                                                                                      *
 *                                          UI                                          *
 *                                                                                      */
//========================================================================================

function onResize() {
  const style = document.getElementById("composer").style;
  if (window.innerWidth >= window.innerHeight) {
    style["flex-direction"] = "row";
    document.getElementById("inputContainer").style.width = `${
      window.innerWidth / 2
    }px`;
    document.getElementById("outputContainer").style.width = `${
      window.innerWidth / 2
    }px`;
  } else {
    style["flex-direction"] = "column";
    document.getElementById("inputContainer").style.width = `${100}%`;
    document.getElementById("outputContainer").style.width = `${100}%`;
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
