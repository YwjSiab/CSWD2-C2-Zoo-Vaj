// @ts-nocheck
class ZHoverHighlight extends HTMLElement {
  static get observedAttributes() { return ["selector"]; }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._activeEl = null;

    this.shadowRoot.innerHTML = `
      <slot></slot>
      <span part="hl" class="hl" aria-hidden="true"></span>
    `;

    this.hl = this.shadowRoot.querySelector(".hl");

    // bind handlers once
    this._onEnter = e => this._setActive(e.currentTarget);
    this._onFocus = e => this._setActive(e.currentTarget);
    this._onLeave = () => this._clearActive();
    this._reposition = () => this._activeEl && this._positionTo(this._activeEl);
  }

  get selector() { return this.getAttribute("selector") || "a"; }

  connectedCallback()  { this._bind(); }
  disconnectedCallback(){ this._unbind(); }
  attributeChangedCallback() { this._unbind(); this._bind(); }

  _bind() {
    this.links = this.querySelectorAll(this.selector);
    this.links.forEach(el => {
      el.addEventListener("mouseenter", this._onEnter);
      el.addEventListener("mouseleave", this._onLeave);
      el.addEventListener("focus", this._onFocus);
      el.addEventListener("blur", this._onLeave);
    });
    window.addEventListener("scroll", this._reposition, { passive:true });
    window.addEventListener("resize", this._reposition);
  }

  _unbind() {
    if (this.links) {
      this.links.forEach(el => {
        el.removeEventListener("mouseenter", this._onEnter);
        el.removeEventListener("mouseleave", this._onLeave);
        el.removeEventListener("focus", this._onFocus);
        el.removeEventListener("blur", this._onLeave);
      });
    }
    window.removeEventListener("scroll", this._reposition);
    window.removeEventListener("resize", this._reposition);
  }

  _setActive(el) {
    this._activeEl = el;
    this._positionTo(el);
    this.hl.style.opacity = "1";
  }
  _clearActive() {
    this._activeEl = null;
    this.hl.style.opacity = "0";
  }

  _positionTo(el) {
    const r = el.getBoundingClientRect();
    const host = this.getBoundingClientRect();

    // Convert document coords → host coords
    const left = (r.left + window.scrollX) - (host.left + window.scrollX);
    const top  = (r.top  + window.scrollY) - (host.top  + window.scrollY);

    this.hl.style.width  = `${r.width}px`;
    this.hl.style.height = `${r.height}px`;
    this.hl.style.transform = `translate(${left}px, ${top}px)`;
  }
}
customElements.define("z-hover-highlight", ZHoverHighlight);
