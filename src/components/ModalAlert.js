import { html, css, LitElement } from 'lit';

class ModalAlert extends LitElement {
    static styles = css`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(2px);
    }
    
    :host(:not([open])) {
      display: none;
    }
    
    .modal {
      background: var(--md-sys-color-surface-container-high);
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    .modal-header {
      padding: 24px 24px 16px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 20px;
    }
    
    .icon.error {
      background: var(--md-sys-color-error-container);
      color: var(--md-sys-color-on-error-container);
    }
    
    .icon.warning {
      background: #fef3c7;
      color: #d97706;
    }
    
    .icon.info {
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }
    
    .modal-title {
      font-size: 18px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface);
      margin: 0;
    }
    
    .modal-body {
      padding: 0 24px 16px 24px;
    }
    
    .modal-message {
      color: var(--md-sys-color-on-surface-variant);
      line-height: 1.5;
      white-space: pre-line;
      margin: 0;
      font-size: 14px;
    }
    
    .modal-footer {
      padding: 0 24px 24px 24px;
      display: flex;
      justify-content: flex-end;
    }
    
    .close-button {
      background: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      border: none;
      border-radius: 20px;
      padding: 10px 24px;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    }
    
    .close-button:hover {
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
      transform: translateY(-1px);
    }
    
    .close-button:active {
      transform: translateY(0);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    }
    
    .close-button.error {
      background: var(--md-sys-color-error);
      color: var(--md-sys-color-on-error);
    }
    
    .close-button.warning {
      background: #d97706;
      color: white;
    }
    
    .close-button.info {
      background: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
    }
  `;

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
