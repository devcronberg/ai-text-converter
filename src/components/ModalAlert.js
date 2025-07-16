import { html, LitElement, css } from 'lit';

class ModalAlert extends LitElement {
    static styles = css`
        :host {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        :host([open]) {
            display: flex;
        }

        .modal {
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }

        .icon {
            font-size: 24px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .icon.info {
            background: #2196F3;
        }

        .icon.warning {
            background: #FF9800;
        }

        .icon.error {
            background: #F44336;
        }

        .modal-title {
            margin: 0;
            font-size: 20px;
            font-weight: 500;
            color: #1d1b20;
        }

        .modal-message {
            margin: 0;
            line-height: 1.6;
            color: #49454f;
            white-space: pre-line;
        }

        .modal-message a {
            color: #6750a4;
            text-decoration: underline;
        }

        .modal-message a:hover {
            color: #5a4594;
        }

        .modal-footer {
            display: flex;
            justify-content: flex-end;
            margin-top: 24px;
        }

        .close-button {
            background: #6750a4;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        }

        .close-button:hover {
            background: #5a4594;
        }

        .close-button.error {
            background: #F44336;
        }

        .close-button.warning {
            background: #FF9800;
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
        this.callback = null;
        this.allowBackdropClick = false;
    }

    show(title, message, callback = null, allowBackdropClick = false) {
        this.title = title;
        this.message = message;
        this.callback = callback;
        this.allowBackdropClick = allowBackdropClick;
        this.isOpen = true;
        this.requestUpdate();
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
        if (this.callback) {
            this.callback();
        }
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
        if (e.target === this && this.allowBackdropClick) {
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
        return html`
            <div class="modal" @click="${e => e.stopPropagation()}">
                <div class="modal-header">
                    <div class="icon ${this.type}">
                        ${this.getIcon()}
                    </div>
                    <h3 class="modal-title">${this.getTitle()}</h3>
                </div>
                <div class="modal-body">
                    <div class="modal-message" .innerHTML="${this.message}"></div>
                </div>
                <div class="modal-footer">
                    <button class="close-button ${this.type}" @click="${this.close}">
                        OK
                    </button>
                </div>
            </div>
        `;
    }

    // Add backdrop click event listener
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('click', this.handleBackdropClick.bind(this));
    }
}

customElements.define('modal-alert', ModalAlert);
