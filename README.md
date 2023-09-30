# Nabladown.js

A parser and renderer for the `Nabladown` language.

NablaDown.js is a `JS` library able to `parse: String -> Abstract Syntax Tree` a pseudo/flavored **Markdown** language and `render: Abstract Syntax Tree -> HTML` it into `HTML`.

The purpose of this library is to render beautiful documents in `HTML`, using a simple language as **Markdown**, with the focus of rendering `code`,`equations`,`html` and `custom behavior`.

The library is written in a way, that is possible to create and compose multiple renderers together. This way is possible to add feature on top of a basic renderer. More on that below.

# Contents

1. [Language cheat sheet](#language-cheat-sheet)
2. [Import](#import)
3. [Usage](#usage)
4. [Extending basic renderer](#extending-basic-renderer)
5. [Building yourself](#building-yourself)
6. [TODO](#todo)

# Language cheat sheet

This language follows the basic [markdown syntax](https://www.markdownguide.org/cheat-sheet/) but adds some extras like formulas, code, and HTML.

## Headers

```javascript
# H1
## H2
### H3
```

## Style

```javascript
_italics_


**bold**
```

## Paragraph

```javascript
lorem ipsum lorem ipsum // paragraph

lorem ipsum lorem ipsum. lorem ipsum lorem ipsum.
lorem ipsum lorem ipsum lorem ipsum lorem ipsum // paragraph

lorem ipsum lorem ipsum. lorem ipsum lorem ipsum. lorem ipsum lorem ipsum
lorem ipsum lorem ipsum. lorem ipsum lorem ipsum.
lorem ipsum lorem ipsum. // paragraph
```

## Lists

### Unordered

```javascript
-Parent
    -Child
        -GrandChild
        -GrandChild
    - Child
```

### Ordered

```javascript
// numbers don't really matter,
// they just need to be numbers
1. Parent
    2. Child
        3. GrandChild
        3. GrandChild
    8. Child
```

## Links

```javascript
// simple link
[nabladown.js](https://pedroth.github.io/nabladown.js/)

// link with title
[brave](https://search.brave.com/)

// link using reference
[brave][ref]

Some optional text...

[ref]: https://search.brave.com/
```

It is also possible to link to headers

```markdown
[Go to title](#a-title)
```

## Footnotes

```js
Some optional text [^1]
blablabla [^foot] blablabla

...

[^1]: Text with **nabladown** syntax
[^foot]: You can use any identifier
```

## Images/Videos

```js
// simple image
![Image legend](https://picsum.photos/200)

// image with title
![Image _legend_  and **title**](https://picsum.photos/200)

// Image with link to it
[![Image reference + Link][link_variable]][link_variable]

[link_variable]: some link to image

// image with size =widthxheight
![](https://picsum.photos/200/300 =200x300)

// image using reference
![][ref]

Some optional text...

[ref]: some_url 


// youtube video with legend
![**Gradient** youtube video](https://www.youtube.com/watch?v=tIpKfDc295M)

// video with size =widthxheight
![](https://www.youtube.com/watch?v=tIpKfDc295M =200x300)

// video
![Free **video**](https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4)

// sound
![Free *sound*](https://www.bensound.com/bensound-music/bensound-ukulele.mp3)
```

When embedding youtube videos, it uses the private option in [`youtube-nocookie.com`](https://support.google.com/youtube/answer/171780?hl=en#zippy=%2Cturn-on-privacy-enhanced-mode).

## Math

```js
// inline
Lorem ipsum $1+1 = 2$
// paragraph
$$1+1 = 2$$

// paragraph
$$
1 + 1 = 2
$$
```

## Code

### Inline code

```js
lorem ipsum `inline code here` lorem ipsum
```

### Block code

````
```java
class Main {
  public static void main(String[] args) {
    System.out.println("Hello")
  }
}
```
````
In the abstract

````
```<language>

block code...

```
````

Syntax [here](https://www.markdownguide.org/extended-syntax/#fenced-code-blocks).
Name of the available languages according to [highlight.js](https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md)

## HTML

```html
# Normal markdown with <span style="color: red"> red text </span> inline

A paragraph with html and nabladown inside:
<div>
<a href="https://pedroth.github.io/nabladown.js">
    $1 + 1 = 2$
</a>
<button onClick="alert('hello world')">
  hello **world**
</button>
</div>
```

## Custom

```
[quote]:::

lorem *ipsum* $\dot x = -\nabla V $!

:::

// generates div with class=quote while rendering nabladown inside
```

Plugins could be added here in a custom render, check [custom render](#extending-basic-renderer) section.

## Line Separation

```js
lorem ipsum 

---

lorem ipsum

```


# Import

This library exports:

- Parser.js
- Render.js (vanilla render)
- MathRender.js (vanilla + math)
- CodeRender.js (vanilla + code)
- NablaRender.js (vanilla + math + code)

And you can import these via:

## Via [HTML](https://jsfiddle.net/a0qponvt/)

```html
<html>
  <head>
    <script src="https://pedroth.github.io/nabladown.js/dist/Parser.js"></script>
    <script src="https://pedroth.github.io/nabladown.js/dist/Render.js"></script>
    <script src="https://pedroth.github.io/nabladown.js/dist/MathRender.js"></script>
    <script src="https://pedroth.github.io/nabladown.js/dist/CodeRender.js"></script>
    <script src="https://pedroth.github.io/nabladown.js/dist/NabladownRender.js"></script>
  </head>
  <body style="color:black"></body>
  <script>
    const { parse } = Parser;
    const { render } = Render;
    const { render: mathRender } = MathRender;
    const { render: codeRender } = CodeRender;
    const { render: nablaRender } = NabladownRender;
    // append basic rendering
    document.body.appendChild(render(parse("# $ \\nabla $ Nabladown`.js` \n")));
    // append code rendering
    document.body.appendChild(
      codeRender(parse("# $ \\nabla $ Nabladown`.js` \n"))
    );
    // append math rendering
    document.body.appendChild(
      mathRender(parse("# $ \\nabla $ Nabladown`.js` \n"))
    );
    // append nabladown rendering
    document.body.appendChild(
      nablaRender(parse("# $\\nabla$ Nabladown`.js` \n"))
    );
  </script>
</html>
```

## Using Bundlers(Webpack, ...)

```js
 npm i --save pedroth/nabladown.js

 // index.js
import { parse } from "nabladown.js/dist/Parser"
import { render } from "nabladown.js/dist/Render"
import { render as codeRender } from "nabladown.js/dist/CodeRender"
import { render as mathRender } from "nabladown.js/dist/MathRender"
import { render as nabladownRender } from "nabladown.js/dist/NabladownRender"
```

## Via npm to node [unstable]

```js
 npm i --save pedroth/nabladown.js

// index.js
const { parse } = require("nabladown.js/dist/Parser.node")
const { render } = require("nabladown.js/dist/Render.node")
const { render: nabladownRender } = require("nabladown.js/dist/NabladownRender.node")
```

# Usage

Nabladown.js provides two functions:

- `parse: String -> Tree`
- `render: Tree -> HTML`

The `parser` will produce a [Abstract Synatx Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) from a `string`, and `render` will create `HTML nodes` from the parsing tree.

## Usage with Bundlers

```js

import { parse } from "nabladown.js/dist/Parser"
import { render } from "nabladown.js/dist/Render"

document.body.appendChild(render(parse("#$\\nabla$Nabladown\`.js\`\n"))
```

## Usage with HTML

Check [this jsfiddle](https://jsfiddle.net/a0qponvt/) code snippet.
Or simply check out the [index.js](https://github.com/pedroth/nabladown.js/blob/main/index.js) of nabladown.js webpage.

# Extending basic renderer

It is possible to extend the basic renderer, to build a custom one. There are a few ways of doing this:

- Adding style to HTML components using regular CSS.
- Extending `Render class` from [Render.js](https://github.com/pedroth/nabladown.js/blob/main/src/Render.js)

The [CodeRender class](https://github.com/pedroth/nabladown.js/blob/main/src/CodeRender.js) is an example of extending the `Render class`, where code highlight was implemented.

The [MathRender class](https://github.com/pedroth/nabladown.js/blob/main/src/MathRender.js) is an example of extending the `Render class`, where code highlight was implemented.

You can also combine multiple renderers together using `composeRender` function. Check[NabladownRender class](https://github.com/pedroth/nabladown.js/blob/main/src/NabladownRender.js) for an example of that.

## Changing CSS

```html
<html>
  <head>
    <script src="https://pedroth.github.io/nabladown.js/dist/Parser.js"></script>
    <script src="https://pedroth.github.io/nabladown.js/dist/Render.js"></script>
    <script src="https://pedroth.github.io/nabladown.js/dist/NabladownRender.js"></script>
    <style>
      body {
        background-color: #212121;
        color: white;
      }

      body h1 {
        text-decoration: underline;
      }

      body code {
        border-style: solid;
        border-width: thin;
        border-radius: 6px;
        box-sizing: border-box;
        background-color: #000000;
        border: hidden;
        font-size: 85%;
        padding: 0.2em 0.4em;
        color: orange;
      }
    </style>
  </head>
  <body></body>
  <script>
    const { parse } = Parser;
    const { render } = NabladownRender;
    // append basic rendering
    document.body.appendChild(render(parse("# $ \\nabla $ Nabladown`.js` \n")));
  </script>
</html>
```

Code snippet [here](https://jsfiddle.net/max0q15y/1/)

## Extending NabladownRender class

Let's change color of the header elements based on their level:

```html
<html>
  <head>
    <script src="https://pedroth.github.io/nabladown.js/dist/Parser.js"></script>
    <script src="https://pedroth.github.io/nabladown.js/dist/NabladownRender.js"></script>
  </head>
  <body></body>
  <script>
    const { parse } = Parser;
    const { Render } = NabladownRender;
    class CustomRender extends Render {
      /**
       * title => HTML
       * @param {*} title
       */
      renderTitle(title) {
        const colors = ["red", "orange", "yellow", "green", "blue", "purple"];
        const { level, Seq } = title;
        const header = super.renderTitle(title);
        header.setAttribute("style", `color:${colors[level - 1]}`);
        return header;
      }
    }

    const render = syntaxTree => new CustomRender().render(syntaxTree);
    const text = `# $ \\nabla$Nabladown.js \n#### $ \\nabla$Nabladown.js \n#####$ \\nabla$Nabladown.js \n`;
    // append custom rendering
    document.body.appendChild(render(parse(text)));
  </script>
</html>
```

Code snippet [here](https://jsfiddle.net/wd5bvey8/1/). For more details, you need to dig the source code :D

# Building yourself

Clone or fork repo, then run:

- `npm ci`
- `npm run build`
