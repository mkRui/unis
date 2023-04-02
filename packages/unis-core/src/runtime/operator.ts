import { Fiber, findEls, isPortal, isText, Operator } from "../fiber";
import { getEventName, isEvent, isNullish } from "../utils";

type FiberDomEl = Element | DocumentFragment | SVGAElement | Text | ParentNode;

interface FiberDom extends Fiber {
  el?: FiberDomEl;
}

export const createOperator = (): Operator => {
  const createDomElement = (fiber: FiberDom) => {
    const { tag: type, isSvg } = fiber;
    return isText(fiber)
      ? document.createTextNode(fiber.props.nodeValue + "")
      : isSvg
      ? document.createElementNS("http://www.w3.org/2000/svg", type as string)
      : document.createElement(type as string);
  };

  const findNextDomElement = (fiber: FiberDom) => {
    let el = fiber.el as FiberDomEl | null;
    while (el) {
      if (el.firstChild) return el.firstChild;
      if (el.nextSibling) return el.nextSibling;
      while ((el = el.parentNode)) {
        if (el.nextSibling) return el.nextSibling;
      }
    }
    return null;
  };

  const insertBefore = (
    containerFiber: FiberDom,
    insertElement: FiberDomEl,
    targetElement: FiberDomEl | null
  ) => {
    (
      (isPortal(containerFiber)
        ? containerFiber.to
        : containerFiber.el)! as FiberDomEl
    ).insertBefore(insertElement, targetElement);
  };

  const nextSibling = (fiber: FiberDom) => fiber.el!.nextSibling;

  const firstChild = (fiber: FiberDom) => fiber.el!.firstChild;

  const remove = (fiber: FiberDom) => {
    const [first, ...rest] = findEls(fiber) as FiberDomEl[];
    const parentNode = first?.parentNode;
    if (parentNode) {
      for (const el of [first, ...rest]) {
        parentNode.removeChild(el);
      }
    }
  };

  const updateTextProperties = (fiber: FiberDom) => {
    (fiber.el! as Text).nodeValue = fiber.props.nodeValue + "";
  };

  const setAttr = (
    el: SVGAElement | HTMLElement,
    isSvg: boolean,
    key: string,
    value: string
  ) =>
    isSvg
      ? (el as SVGAElement).setAttributeNS(null, key, value)
      : (el as HTMLElement).setAttribute(key, value);

  const removeAttr = (
    el: SVGAElement | HTMLElement,
    isSvg: boolean,
    key: string
  ) =>
    isSvg
      ? (el as SVGAElement).removeAttributeNS(null, key)
      : (el as HTMLElement).removeAttribute(key);

  const updateElementProperties = (fiber: FiberDom) => {
    let { el, isSvg, attrDiff } = fiber;

    for (const [key, newValue, oldValue] of attrDiff || []) {
      const newExist = !isNullish(newValue);
      const oldExist = !isNullish(oldValue);
      if (key === "ref") {
        oldExist && (oldValue.current = undefined);
        newExist && (newValue.current = el);
      } else if (isEvent(key)) {
        const [eventName, capture] = getEventName(key);
        oldExist && el!.removeEventListener(eventName, oldValue);
        newExist && el!.addEventListener(eventName, newValue, capture);
      } else {
        newExist
          ? setAttr(el as SVGAElement | HTMLElement, isSvg!, key, newValue)
          : removeAttr(el as SVGAElement | HTMLElement, isSvg!, key);
      }
    }
  };

  return {
    createDomElement,
    findNextDomElement,
    insertBefore,
    nextSibling,
    firstChild,
    remove,
    updateTextProperties,
    updateElementProperties,
  };
};
