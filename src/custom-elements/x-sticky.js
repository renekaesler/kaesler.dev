class XSticky extends HTMLElement {
  constructor() {
    super();

    this.stickyObserver = new IntersectionObserver(([e]) => {
      const action = e.boundingClientRect.top < 0
        ? 'setAttribute'
        : 'removeAttribute';

      this[action]('stuck', '');
    }, { threshold: [1] });

    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = /* html */`
      <style>
        :host {
          --top: 0px;
          display: block;
          position: sticky;
          top: var(--top);
          align-self: start;
        }

        .sticky-point {
          position: absolute;
          top: calc(-1 * var(--top) - 1px);
        }
      </style>

      <div class="sticky-point"></div>
      <slot></slot>
    `;
  }

  connectedCallback() {
    const stickyPoint = this.shadowRoot.querySelector('.sticky-point');
    this.stickyObserver.observe(stickyPoint)
  }
}

customElements.define('x-sticky', XSticky);
