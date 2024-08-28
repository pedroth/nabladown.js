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
    let type = nodeType;
    const attrs = {};
    const events = [];
    let children = [];
    const lazyActions = [];
    let innerHtml = "";
    let innerText = "";
    let ref = null;

    domNode.setType = (newType) => {
        type = newType;
        return domNode;
    }
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

    domNode.innerText = (content) => {
        innerText = content;
        return domNode;
    }

    domNode.attr = (attribute, value) => {
        attrs[attribute] = value;
        return domNode;
    }

    domNode.style = (value) => {
        return domNode.attr("style", value);
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
        const dom = SVG_TAGS.includes(type) ?
            document.createElementNS(SVG_URL, type) :
            document.createElement(type);
        Object.entries(attrs).forEach(([attr, value]) => dom.setAttribute(attr, value));
        events.forEach(event => dom.addEventListener(event.eventType, event.lambda));
        innerHtml ? dom.innerHTML = innerHtml : dom.innerText = innerText;
        if (children.length > 0) {
            children.forEach(child => {
                if (child.isEmpty()) return;
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
        domArray.push(...startTagToString({ nodeType: type, attrs, isFormatted }));
        domArray.push(...childrenToString({
            n,
            children,
            isFormatted,
            parentNode: domNode,
            innerHtml: innerHtml ? innerHtml : innerText,
        }));
        domArray.push(...endTagToString({ nodeType: type, isFormatted, n }))
        const result = domArray.join('');
        return result;
    }

    domNode.isEmpty = () => (
        !type &&
        children.length === 0 &&
        Object.values(attrs).length === 0 &&
        events.length === 0 &&
        innerHtml === "" &&
        innerText === ""
    );
    domNode.getChildren = () => children;
    domNode.getInner = () => innerHtml;
    domNode.getAttrs = () => attrs;
    domNode.getEvents = () => events;
    domNode.getLazyActions = () => lazyActions;
    domNode.getType = () => type;
    domNode.getRef = () => f => f(
        maybe(ref)
    );

    domNode.log = () => {
        return `
            type: ${type},
            children: ${children.map(c => c.getType()).join()}
            attrs: ${Object.values(attrs).join()}
            hasEvents: ${events.length > 0}
            innerHtml: ${innerHtml}
            innerText: ${innerText}
        `
    }

    return domNode;
}


//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================


function childrenToString({
    n,
    children,
    innerHtml,
    parentNode,
    isFormatted,
}) {
    const result = [];
    const indentation = Array(n + 1).fill("  ").join("")
    if (children.length > 0) {
        result.push(...children
            .filter(child => !child.isEmpty())
            .map(
                child => {
                    return `${isFormatted ? indentation : ""}${child.toString({ isFormatted, n: n + 1 })}${isFormatted ? "\n" : ""}`
                }
            )
        );
    } else {
        if (isFormatted) result.push(indentation);
        result.push(innerHtml);
        if (isFormatted) result.push("\n");
    }
    return result;
}

function startTagToString({ nodeType, attrs, isFormatted }) {
    const result = [];
    if (!nodeType) return "";
    result.push(`<${nodeType}`);
    result.push(...Object.entries(attrs).map(([attr, value]) => ` ${attr}="${value}" `));
    result.push(`>`);
    if (isFormatted) result.push("\n");
    return result;
}

function endTagToString({ nodeType, isFormatted, n }) {
    if (!nodeType) return "";
    const indentation = Array(n).fill("  ").join("")
    const result = [];
    if (isFormatted) result.push(indentation);
    result.push(`</${nodeType}>`);
    return result;
}