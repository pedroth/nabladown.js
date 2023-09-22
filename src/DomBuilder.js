export function buildDom(nodeType) {
    const domNode = {};
    const attrs = [];
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
        attrs.push({ attribute, value });
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
        const dom = document.createElement(nodeType);
        attrs.forEach(attr => dom.setAttribute(attr.attribute, attr.value));
        events.forEach(event => dom.addEventListener(event.eventType, event.lambda));
        if (children.length > 0) {
            children.forEach(child => dom.appendChild(child.build()));
        } else {
            dom.innerHTML = innerHtml;
        }
        lazyActions.forEach(lazyAction => lazyAction(dom));
        return dom;
    };

    domNode.toString = () => {
        const domArray = [];
        domArray.push(`<${nodeType} `);
        domArray.push(...attrs.map(attr => `${attr.attribute}="${attr.value}"`));
        domArray.push(`>`);
        if (children.length > 0) {
            domArray.push(...children.map(child => child.toString()));
        } else {
            domArray.push(innerHtml);
        }
        domArray.push(`</${nodeType}>`);
        return domArray.join('');
    };

    domNode.getChildren = () => children;

    domNode.isEmpty = () => children.length === 0 && innerHtml === "";

    return domNode;
}