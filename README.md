# NablaDown.js

A parser for the nabladown.js language.

It is a Js library able to parse a pseudo markdown language into HTML. One should be able to configure the html output using this library.

## Usage

nabladown.js provides two functions:

```javascript
// from <script src="https://pedroth.github.io/nabladown.js/dist/index.js">
const { parse, render } = NablaDown;
```

Or using npm

```javascript
// from npm i @pedroth/nabladown.js
import { parse, render } from "@pedroth/nabladown.js";

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

## Cheatsheet

### Headers

```javascript
# Title1
## SubTitle
```

### Style

```javascript
**bold**
_italics_
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

### Quote

```javascript
// same quote
> lorem ipsum
> lorem ipsum
> lorem ipsum

// different quote
> lorem impsum
```

### Math

```javascript
// inline
Lorem ipsum $1+1 = 2$
// paragraph
$$1+1 = 2$$
```

### Code

```javascript
===java
class Main {
public static void main(String[] args) {
		System.out.println("Hello")
	}
}
===
```

### Text Block

```javascript
===red
red background lorem ipsum
===
```

### Links

```javascript
[google](https://www.google.com)
```

### Images/Videos

```javascript
![Fig1](https://www.picsum.photo/image)
```

### Iframes

```javascript
+[""](https://www.youtube.com/?v=ejnksjf)
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
^[$$1+1 = 2$$]("eq1")

Goto [equation 1]("eq1")
```
