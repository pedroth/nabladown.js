export function buildDom(nodeType) {
    const domNode = {};
    const attrs = {};
    const events = [];
    const children = [];
    const lazyActions = [];
    let innerHtml = ""
    /**
     * node: DomBuilder => DomBuilder
     */
    domNode.appendChild = (node) => {
        children.push(node);
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

    domNode.lazy = (lazyAction) => {
        lazyActions.push(lazyAction);
        return domNode;
    }

    domNode.build = () => {
        console.log("debug buildDom")
        const dom = document.createElement(nodeType);
        Object.entries(attrs).forEach(([attr, value]) => dom.setAttribute(attr, value));
        events.forEach(event => dom.addEventListener(event.eventType, event.lambda));
        dom.innerHTML = innerHtml;
        if (children.length > 0) {
            children.forEach(child => dom.appendChild(child.build()));
        }
        lazyActions.forEach(lazyAction => lazyAction(dom));
        return dom;
    };

    domNode.toString = () => {
        const domArray = [];
        domArray.push(`<${nodeType} `);
        domArray.push(...Object.entries(attrs).map(([attr, value]) => `${attribute}="${value}"`));
        domArray.push(`>`);
        if (children.length > 0) {
            domArray.push(...children.map(child => child.toString()));
        } else {
            domArray.push(innerHtml);
        }
        domArray.push(`</${nodeType}>`);
        return domArray.join('');
    };


    domNode.isEmpty = () => children.length === 0 && innerHtml === "";

    domNode.getChildren = () => children;
    domNode.getAttrs = () => attrs;
    domNode.getEvents = () => events;
    domNode.getLazyActions = () => lazyActions;

    return domNode;
}