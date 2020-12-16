# NablaDown.js

A parser and renderer for the nabladown.js language.

It is a Js library able to parse(String -> Abstract Tree) a pseudo markdown language and rendering(Abstract Tree -> HTML) it into HTML. One should be able to use the [output](https://en.wikipedia.org/wiki/Abstract_syntax_tree) of the parse with different renders.

## Import

Via HTML,

```html
<html>
	<head>
		<script src="https://pedroth.github.io/nabladown.js/dist/index.js">
		<!-- katex style -->
		<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.css"
		integrity="sha384-qCEsSYDSH0x5I45nNW4oXemORUZnYFtPy/FqB/OjqxabTMW5HVaaH9USK4fN3goV"
		crossorigin="anonymous"
		/>
	</head>
	<body>
	</body>
	<script>
		const { parse, render } = NablaDown;
		document.body.appendChild(render(parse("#Title")))
	</script>
</html>
```

Via npm to web

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

## Usage web

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

The render function will produce a parsing tree (aka json object) and render will create html tree.

> parse: String -> Tree

> render: Tree -> HTML

## Language cheat sheet

### Headers

```javascript
# Title1
## SubTitle
```

### Style

```javascript

*italics*

**bold**
```

### List

```javascript
* Parent
	* Child
		* GrandChild
		* GrandChild
	* Child
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

### Links

```javascript
[google](https://www.google.com)
```

### Images/Videos

```javascript
![Fig1](https://www.picsum.photo/image)
```

### Html

```javascript
+++
<html>
<a href="https://">blabla</a>
</html>
+++
```

### References

```javascript
$$1+1 = 2$$^["eq1"]

Goto [equation 1]("#eq1")
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

### Quote

```javascript
>>
# lorem ipsum
$$ 1 + 1 =2$$

lorem impsum
>>
```

### Text Block

```
>>red
red background lorem ipsum
>>
```

```
>>rgb(255, 0, 0, 255)
red background lorem ipsum
>>
```
