export function DomBuilder() {
    const domNode = {};
    let nodeType = ""
    const attrs = [];
    const events = [];
    domNode.append = (node) => {
        return domNode;
    }

    domNode.attr = (attribute, value) => {
        return domNode;
    }

    domNode.event = (eventType, lambda) => {

    }
}