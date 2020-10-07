const { parse, render } = NablaDown;

(() => {
  let timer = null;
  const editor = ace.edit("input");
  const output = document.getElementById("output");
  editor.getSession().on("change", () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(
      () => output.appendChild(render(parse(editor.getValue()))),
      250
    );
  });
})();
