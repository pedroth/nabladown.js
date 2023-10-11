import { left, maybe, right } from "./Monads";

const SVG_URL = "http://www.w3.org/2000/svg";
const SVG_TAGS = [
    "svg",
    "g",
    "circle",
    "ellipse",
    "line",
    "path",
    "polygon",
    "polyline",
    "rect",
];
export function buildDom(nodeType) {
    const domNode = {};
    const attrs = {};
    const events = [];
    let children = [];
    const lazyActions = [];
    let innerHtml = ""
    let ref = null;
    /**
     * node: DomBuilder => DomBuilder
     */
    domNode.appendChild = (...nodes) => {
        nodes.forEach(node => children.push(node));
        return domNode;
    }

    domNode.appendChildFirst = (...nodes) => {
        children = nodes.concat(children);
        return domNode;
    }

    domNode.inner = (content) => {
        innerHtml = content;
        return domNode;
    }

    domNode.attr = (attribute, value) => {
        attrs[attribute] = value;
        return domNode;
    }

    domNode.event = (eventType, lambda) => {
        events.push({ eventType, lambda });
        return domNode;
    }

    /**
     * (lazyAction: Either<DOM, DomBuilder> => ()) => DomBuilder
     * 
     * Add lazy action to be run when domNode is built
     */
    domNode.lazy = (lazyAction) => {
        lazyActions.push(lazyAction);
        return domNode;
    }

    /**
     * () => DOM || string
     */
    domNode.build = () => {
        if (typeof window === "undefined") return domNode.toString();
        const dom = SVG_TAGS.includes(nodeType) ?
            document.createElementNS(SVG_URL, nodeType) :
            document.createElement(nodeType);
        Object.entries(attrs).forEach(([attr, value]) => dom.setAttribute(attr, value));
        events.forEach(event => dom.addEventListener(event.eventType, event.lambda));
        dom.innerHTML = innerHtml;
        if (children.length > 0) {
            children.forEach(child => {
                if (!child.build) return;
                dom.appendChild(child.build())
            });
        }
        lazyActions.forEach(lazyAction => lazyAction(
            right(dom)
        ));
        ref = dom;
        return dom;
    };

    domNode.toString = () => {
        lazyActions.forEach(lazyAction => lazyAction(
            left(domNode)
        ));
        const domArray = [];
        domArray.push(`<${nodeType} `);
        domArray.push(...Object.entries(attrs).map(([attr, value]) => `${attr}="${value}"`));
        domArray.push(`>`);
        if (children.length > 0) {
            domArray.push(...children.map(child => child.toString()));
        } else {
            domArray.push(innerHtml);
        }
        domArray.push(`</${nodeType}>`);
        const result = domArray.join('');
        return result;
    };


    domNode.isEmpty = () => children.length === 0 && innerHtml === "";

    domNode.getChildren = () => children;
    domNode.getAttrs = () => attrs;
    domNode.getEvents = () => events;
    domNode.getLazyActions = () => lazyActions;
    domNode.getType = () => nodeType;
    domNode.getRef = () => f => f(
        maybe(ref)
    );

    return domNode;
}
