import { html, LitElement } from 'lit';

class ModalAlert extends LitElement {
    // Disable shadow DOM to allow external CSS styling
    createRenderRoot() {
        return this;
    }

    static properties = {
        type: { type: String }, // 'error', 'warning', 'info'
        title: { type: String },
        message: { type: String },
        isOpen: { type: Boolean }
    };

    constructor() {
        super();
        this.type = 'info';
        this.title = '';
        this.message = '';
        this.isOpen = false;
    }

    getIcon() {
        switch (this.type) {
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
            default:
                return 'ℹ';
        }
    }

    getTitle() {
        if (this.title) return this.title;

        switch (this.type) {
            case 'error':
                return 'Error';
            case 'warning':
                return 'Warning';
            case 'info':
            default:
                return 'Information';
        }
    }

    close() {
        this.isOpen = false;
        this.removeAttribute('open');
        this.dispatchEvent(new CustomEvent('modal-close'));
    }

    updated(changedProperties) {
        if (changedProperties.has('isOpen')) {
            if (this.isOpen) {
                this.setAttribute('open', '');
                document.addEventListener('keydown', this.handleKeyDown.bind(this));
            } else {
                this.removeAttribute('open');
                document.removeEventListener('keydown', this.handleKeyDown.bind(this));
            }
        }
    }

    handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            this.close();
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Escape') {
            this.close();
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }

    render() {
        if (!this.isOpen) return html``;

        return html`
      <div @click="${this.handleBackdropClick}">
        <div class="modal">
          <div class="modal-header">
            <div class="icon ${this.type}">
              ${this.getIcon()}
            </div>
            <h3 class="modal-title">${this.getTitle()}</h3>
          </div>
          <div class="modal-body">
            <p class="modal-message">${this.message}</p>
          </div>
          <div class="modal-footer">
            <button class="close-button ${this.type}" @click="${this.close}">
              OK
            </button>
          </div>
        </div>
      </div>
    `;
    }
}

customElements.define('modal-alert', ModalAlert);
