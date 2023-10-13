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
     * () => DOM
     */
    domNode.build = () => {
        if (typeof window === "undefined") return new Error("Not able to build DOM in non web environment");
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
        lazyActions.forEach(lazyAction =>
            lazyAction(
                right(dom)
            ));
        ref = dom;
        return dom;
    };

    domNode.toString = (options = {}) => {
        const { isFormated = false, n = 0 } = options;
        const domArray = [];
        lazyActions.forEach(lazyAction => lazyAction(
            left(domNode)
        ));
        domArray.push(...startTagToString({ nodeType, attrs, isFormated }));
        domArray.push(...childrenToString({
            children,
            innerHtml,
            isFormated,
            n
        }));
        domArray.push(...endTagToString({ nodeType, isFormated, n }))
        const result = domArray.join('');
        return result;
    }

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


//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================


function childrenToString({
    children,
    innerHtml,
    isFormated,
    n
}) {
    const result = [];
    const indentation = Array(n + 1).fill("  ").join("")
    if (children.length > 0) {
        result.push(...children.map(child =>
            `${isFormated ? indentation : ""}${child.toString({ isFormated, n: n + 1 })}${isFormated ? "\n" : ""}`)
        );
    } else {
        if (isFormated) result.push(indentation);
        result.push(innerHtml);
        if (isFormated) result.push("\n");
    }
    return result;
}

function startTagToString({ nodeType, attrs, isFormated }) {
    const result = [];
    result.push(`<${nodeType}`);
    result.push(...Object.entries(attrs).map(([attr, value]) => ` ${attr}="${value}" `));
    result.push(`>`);
    if (isFormated) result.push("\n");
    return result;
}

function endTagToString({ nodeType, isFormated, n }) {
    const indentation = Array(n).fill("  ").join("")
    const result = [];
    if (isFormated) result.push(indentation);
    result.push(`</${nodeType}>`);
    return result;
}