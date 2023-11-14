import { maybe } from "./Monads";

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
     * (lazyAction: DOM => ()) => DomBuilder
     * 
     * Add lazy action to be run when domNode is built
     */
    domNode.lazy = (lazyAction) => {
        lazyActions.push(lazyAction);
        return domNode;
    }

    /**
     * () => DOM
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
                if (!child.build || child.isEmpty()) return;
                dom.appendChild(child.build())
            });
        }
        lazyActions.forEach(lazyAction => lazyAction(dom));
        ref = dom;
        return dom;
    };

    domNode.toString = (options = {}) => {
        const { isFormatted = false, n = 0 } = options;
        const domArray = [];
        domArray.push(...startTagToString({ nodeType, attrs, isFormatted }));
        domArray.push(...childrenToString({
            children,
            innerHtml,
            isFormatted,
            n
        }));
        domArray.push(...endTagToString({ nodeType, isFormatted, n }))
        const result = domArray.join('');
        return result;
    }

    domNode.isEmpty = () => children.length === 0 && innerHtml === "";

    domNode.getChildren = () => children;
    domNode.getInner = () => innerHtml;
    domNode.getAttrs = () => attrs;
    domNode.getEvents = () => events;
    domNode.getLazyActions = () => lazyActions;
    domNode.getType = () => nodeType;
    domNode.getRef = () => f => f(
        maybe(ref)
    );
    domNode.isEmpty = () => !nodeType;

    return domNode;
}


//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================


function childrenToString({
    children,
    innerHtml,
    isFormatted,
    n
}) {
    const result = [];
    const indentation = Array(n + 1).fill("  ").join("")
    if (children.length > 0) {
        result.push(...children.map(child => 
            `${isFormatted ? indentation : ""}${child.toString({ isFormatted, n: n + 1 })}${isFormatted ? "\n" : ""}`
        ));
    } else {
        if (isFormatted) result.push(indentation);
        result.push(innerHtml);
        if (isFormatted) result.push("\n");
    }
    return result;
}

function startTagToString({ nodeType, attrs, isFormatted }) {
    const result = [];
    if(!nodeType) return "";
    result.push(`<${nodeType}`);
    result.push(...Object.entries(attrs).map(([attr, value]) => ` ${attr}="${value}" `));
    result.push(`>`);
    if (isFormatted) result.push("\n");
    return result;
}

function endTagToString({ nodeType, isFormatted, n }) {
    if(!nodeType) return "";
    const indentation = Array(n).fill("  ").join("")
    const result = [];
    if (isFormatted) result.push(indentation);
    result.push(`</${nodeType}>`);
    return result;
}