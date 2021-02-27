# NablaDown.js

A parser and renderer for the nabladown.js language.

It is a Js library able to `parse(String -> Abstract Tree)` a pseudo/flavoured markdown language and `render(Abstract Tree -> HTML)` it into HTML.
One should be able to use the [output](https://en.wikipedia.org/wiki/Abstract_syntax_tree) of the parse with different renders.

## Import

### Via [HTML](https://jsfiddle.net/Luzsbqe3/4/)

```html
<html>
  <head>
    <script src="https://pedroth.github.io/nabladown.js/dist/Parser.js"></script>
    <script src="https://pedroth.github.io/nabladown.js/dist/Render.js"></script>
    <!-- IMPORTANT WHEN USING FORMULAS. KATEX STYLE -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.css"
      integrity="sha384-qCEsSYDSH0x5I45nNW4oXemORUZnYFtPy/FqB/OjqxabTMW5HVaaH9USK4fN3goV"
      crossorigin="anonymous"
    />
  </head>
  <body style="color:black"></body>
  <script>
    const { parse } = Parser;
    const { render } = Render;
    document.body.appendChild(render(parse("#Title\n")));
  </script>
</html>
```

### Using Bundlers(Webpack, ...)

```javascript
 npm i --save pedroth/nabladown.js

 // index.js
import { parse } from "nabladown.js/dist/Parser"
import { render } from "nabladown.js/dist/Render"
```

Via npm to node

```javascript
 npm i --save pedroth/nabladown.js

// index.js
const { parse } = require("nabladown.js/dist/Parser.node")
const { render } = require("nabladown.js/dist/Render.node")
```

## Usage

Nabladown.js provides two functions:

- `parse: String -> Tree`
- `render: Tree -> HTML`

The `parser` will produce a parsing tree (aka json object) from a string, and `render` will create html nodes from a parsing tree.

### Usage with Bundlers

```javascript
import { parse } from "nabladown.js/dist/Parser"
import { render } from "nabladown.js/dist/Render"

document.body.appendChild(render(parse(`
# Text document
	* title
		* subtitle
		* subtitle
			* sub subtitle

> Some Math
 $$f(w) = \oint_\gamma \frac{f(z)}{z-w} dz$$

This is the end!!
`))
```

### Usage with Html

Check [here](https://jsfiddle.net/Luzsbqe3/4/)

## Language cheat sheet

This language follows the basic [markdown syntax](https://www.markdownguide.org/cheat-sheet/), but add some extras like formulas and html.

### Headers

```javascript
# H1
## H2
### H3
```

### Style

```javascript

*italics*

**bold**
```

### Paragraph

```javascript
lorem ipsum lorem ipsum

lorem ipsum lorem ipsum. lorem ipsum lorem ipsum.
lorem ipsum lorem ipsum lorem ipsum lorem ipsum

lorem ipsum lorem ipsum. lorem ipsum lorem ipsum. lorem ipsum lorem ipsum
lorem ipsum lorem ipsum. lorem ipsum lorem ipsum.
lorem ipsum lorem ipsum.
```

### Math

```javascript
// inline
Lorem ipsum $1+1 = 2$
// paragraph
$$1+1 = 2$$
```

### Code

````
```java
class Main {
  public static void main(String[] args) {
    System.out.println("Hello")
  }
}
```
````

Syntax [here](https://www.markdownguide.org/extended-syntax/#fenced-code-blocks).
Name of the available languages according to [highlight.js](https://highlightjs.org/)

### Links

```javascript
[google](https://www.google.com)
```

### Images/Videos

```javascript
![**Nabla** image](https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Del.svg/220px-Del.svg.png)
![**Gradient** youtube video](https://www.youtube.com/watch?v=tIpKfDc295M)
![Free **video**](https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4)
![Free *sound*](https://www.bensound.com/bensound-music/bensound-ukulele.mp3)
```

### Html

```javascript
+++
<html>
<a href="https://">blabla</a>
</html>
+++

// also works inline
+++ <button onClick="alert('hello world')"> hello </button> +++ world!!
```

## TODO

### List

```
- Parent
  - Child
    - GrandChild
    - GrandChild
  - Child

```

### References

```javascript
# Formula {#myTitle}

$$1+1 = 2$$ {#eq1}

Goto [equation 1](#eq1)

Goto [Title](#myTitle)
```

### Styled Block

```
{"background-color": "red"}>>
red background lorem ipsum
>>
```

```
// inline
{"background-color": "red"}>> red background lorem ipsum >> lorem ipsum!!
```

### Quote

```javascript
> # lorem ipsum
> $$ 1 + 1 =2 $$
>
>> quote inside a quote!!
```

### Collapse

```
<>
collapse background lorem ipsum
<>
```
