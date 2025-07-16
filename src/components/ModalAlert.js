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
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      max-width: 28rem;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      animation: slideIn 0.2s ease-out;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    .modal-header {
      padding: 1.5rem 1.5rem 0 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .icon {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .icon.error {
      background: #fee2e2;
      color: #dc2626;
    }
    
    .icon.warning {
      background: #fef3c7;
      color: #d97706;
    }
    
    .icon.info {
      background: #dbeafe;
      color: #2563eb;
    }
    
    .modal-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
    }
    
    .modal-body {
      padding: 1rem 1.5rem;
    }
    
    .modal-message {
      color: #374151;
      line-height: 1.5;
      white-space: pre-line;
    }
    
    .modal-footer {
      padding: 0 1.5rem 1.5rem 1.5rem;
      display: flex;
      justify-content: flex-end;
    }
    
    .close-button {
      background: #f3f4f6;
      border: none;
      border-radius: 0.5rem;
      padding: 0.5rem 1rem;
      font-weight: 500;
      color: #374151;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .close-button:hover {
      background: #e5e7eb;
    }
    
    .close-button.error {
      background: #dc2626;
      color: white;
    }
    
    .close-button.error:hover {
      background: #b91c1c;
    }
    
    .close-button.warning {
      background: #d97706;
      color: white;
    }
    
    .close-button.warning:hover {
      background: #b45309;
    }
    
    .close-button.info {
      background: #2563eb;
      color: white;
    }
    
    .close-button.info:hover {
      background: #1d4ed8;
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
