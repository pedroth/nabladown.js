function randomImage(input, args) {
  //console.log("Generating random image with args:", args);
  return `<img src="https://picsum.photos/${args[0]}/${args[1]}" alt="Random Image"/>\n`
}

MACROS = { randomImage }