# NablaDown.js

A parser and renderer for the nabladown.js language.

It is a Js library able to `parse(String -> Abstract Tree)` a pseudo/flavoured markdown language and `render(Abstract Tree -> HTML)` it into HTML.
One should be able to use the [output](https://en.wikipedia.org/wiki/Abstract_syntax_tree) of the parse with different renders.

## Import

### Via [HTML](https://jsfiddle.net/Luzsbqe3/4/),

```html
<html>
  <head>
    <script src="https://pedroth.github.io/nabladown.js/dist/Parser.js"></script>
    <script src="https://pedroth.github.io/nabladown.js/dist/Render.js"></script>
    <!-- katex style -->
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

```bash
 npm i --save pedroth/nabladown.js

 // index.js
 import {parse, render} from "nabladown.js"
```

Via npm to node

```bash
 npm i --save pedroth/nabladown.js

 // index.js
 const {parse, render} = require("nabladown.js/dist/index.node.js")
```

## Usage

nabladown.js provides two functions:

```javascript
import { parse, render } from "nabladown.js";

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

The render function will produce a parsing tree (aka json object) and render will create a html tree.

- `parse: String -> Tree`
- `render: Tree -> HTML`

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

### List

```javascript
 - Parent 
  - Child 
    - GrandChild 
    - GrandChild 
  - Child;
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

### Quote

```javascript
> # lorem ipsum
> $$ 1 + 1 =2 $$
>
>> quote inside a quote!!
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

### Links

```javascript
[google](https://www.google.com)
```

### Images/Videos

```javascript
![Fig1](https://www.picsum.photo/image)
![Video](https://something.com/video)
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

### References

```javascript
# Formula {#myTitle}

$$1+1 = 2$$ {#eq1}

Goto [equation 1](#eq1)

Goto [Title](#myTitle)
```

## TODO

### Iframes

```javascript
?[""](https://www.youtube.com/?v=ejnksjf)
```

### Collapse

```
<>
collapse background lorem ipsum
<>
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
