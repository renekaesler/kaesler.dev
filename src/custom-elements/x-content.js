import { difference, remove, memoize } from "lodash-es";

import Emitter from "#src/lib/emitter.js";
import { collect } from "#src/lib/function.js";
import { getBounds } from "#src/lib/dom.js";

const instances = new Map();
const subscriptions = new Emitter();

export class XContent extends HTMLElement {
  static observedAttributes = ["name", "boundary", "universal"];

  static subscribe(name, handler) {
    subscriptions.on(name, handler);

    const target = instances.get(name);

    if (target) {
      handler({ target, changes: ['outline', 'activity'] })
    }
  }

  static unsubscribe(name, handler) {
    subscriptions.off(name, handler);
  }

  top = 0;
  bottom = 1;

  get name() {
    return this.getAttribute('name');
  }

  get boundary() {
    return this.getAttribute('boundary');
  }

  get sections() {
    return this.querySelectorAll(':where(h1, h2, h3, h4, h5, h6)[id]');
  }

  get universal() {
    return this.hasAttribute('universal');
  }

  activeSections = memoize(async () => {
    const bounds = await getBounds(this.sections, {
      root: this.universal ? null: this
    });

    if (!bounds.length) return [];

    const { y, height } = bounds[0].rootBounds;
    const top = y + this.top * height;
    const bottom = y + this.bottom * height;

    const crossedBottom = bounds.filter(b => b.boundingClientRect.y < bottom);
    const crossedTop = crossedBottom.filter(b => b.boundingClientRect.y < top);

    const active = new Set([
      crossedTop.slice(-1),
      difference(crossedBottom, crossedTop),
    ].flat());

    return [...active].map(e => e.target);
  })

  outline = memoize(() => {
    const stack = [{ level: 0, children: [] }];

    this.sections.forEach(section => {
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
  })

  constructor() {
    super();

    this.mutationObserver = new MutationObserver(this.#onMutation);
  }

  connectedCallback() {
    this.mutationObserver.observe(this, { childList: true, subtree: true });
    this.#registerScrollListener();
    addEventListener('resize', this.#onActivity);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch(name) {
      case 'name':
        instances.delete(oldValue);
        instances.set(newValue, this);
        this.#notify('outline', 'activity');
        break;
      case 'boundary':
        this.#parseBoundary();
        break;
      case 'universal':
        this.#registerScrollListener();
        break;
    }
  }

  #onMutation = () => {
    this.outline.cache.clear();
    this.activeSections.cache.clear();
    this.#notify('outline');
  }

  #onActivity = async () => {
    this.activeSections.cache.clear();
    this.#notify('activity');
  }

  #notify = collect(args => {
    subscriptions.emit(this.name, { 
      target: this, 
      changes: [...new Set(args.flat())]
    });
  }, 50)

  #parseBoundary() {
    const boundary = this.boundary.trim().split(/\s+/).map(parseFloat);

    if (boundary.length === 1) {
      this.top = 1
      this.bottom = boundary[0];
    } else if (boundary.length === 2) {
      this.top = boundary[0];
      this.bottom = boundary[1];
    }
  }

  #registerScrollListener() {
    if(this.universal) {
      addEventListener('scroll', this.#onActivity, { passive: true });
      this.removeEventListener('scroll', this.#onActivity)
    } else {
      this.addEventListener('scroll', this.#onActivity, { passive: true });
      removeEventListener('scroll', this.#onActivity)
    }
  }
}

customElements.define('x-content', XContent);
