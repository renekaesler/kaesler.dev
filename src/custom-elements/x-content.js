import { difference, remove } from "lodash-es";

import Emitter from "#src/lib/emitter.js";
import { getBounds } from "#src/lib/dom.js";

const instances = new Map();
const subscriptions = new Emitter();

export class XContent extends HTMLElement {
  static observedAttributes = ["name"];

  static subscribe(name, handler) {
    subscriptions.on(name, handler);

    const target = instances.get(name);

    if (target) {
      handler({ target, changes: ['outline', 'visibility'] })
    }
  }

  get name() {
    return this.getAttribute('name');
  }

  get headings() {
    return this.querySelectorAll(':where(h1, h2, h3, h4, h5, h6)[id]');
  }

  get bottom() {
    return window.innerHeight;
  }

  get top() {
    return 0 + 200;
  }

  async activeHeadings() {
    const bounds = await getBounds(...this.headings);
    const crossedBottom = bounds.filter(e => e.bounds.y < this.bottom);
    const crossedTop = crossedBottom.filter(e => e.bounds.y < this.top);

    const visible = new Set([
      crossedTop.slice(-1),
      difference(crossedBottom, crossedTop),
    ].flat());

    return [...visible].map(e => e.target);
  }

  outline() {
    const stack = [{ level: 0, children: [] }];

    this.headings.forEach(section => {
      const prev = stack.at(-1);

      const curr = {
        headline: section,
        level: parseInt(section.nodeName.substring(1)),
        children: [],
      };

      if (curr.level > prev.level) {
        prev.children.push(curr);
      } else {
        remove(stack, node => node.level >= curr.level);
        stack.at(-1).children.push(curr);
      }

      stack.push(curr);
    });

    return stack[0].children;
  }

  constructor() {
    super();

    this.mutationObserver = new MutationObserver(this.#onMutation);
  }

  connectedCallback() {
    this.mutationObserver.observe(this, { 
      childList: true,
      subtree: true
    });

    window.addEventListener('scroll', this.#onScroll)
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch(name) {
      case 'name':
        instances.delete(oldValue);
        instances.set(newValue, this);

        this.#emit('outline', 'visibility');
    }
  }

  #onMutation = () => {
    this.#emit('outlinechange', this.outline());
  }

  #onScroll = async e => {
    this.#emit('visibility');
  }

  #emit(...changes) {
    subscriptions.emit(this.name, { target: this, changes });
  }
}

customElements.define('x-content', XContent);
