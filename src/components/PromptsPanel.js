import { html, LitElement } from 'lit';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/button/filled-button.js';

class PromptsPanel extends LitElement {
    // Disable shadow DOM to allow external CSS styling
    createRenderRoot() {
        return this;
    }
    constructor() {
        super();
        this.prompts = JSON.parse(localStorage.getItem('prompts') || '[]');
        this.newName = '';
        this.newTemplate = '';
    }
    savePrompt() {
        if (this.newName.trim() && this.newTemplate.trim()) {
            this.prompts.push({ name: this.newName.trim(), template: this.newTemplate.trim() });
            localStorage.setItem('prompts', JSON.stringify(this.prompts));
            this.newName = this.newTemplate = '';
            this.requestUpdate();
        }
    }
    render() {
        return html`
      <div style="padding: 24px; background: #f7f2fa; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);">
        <h2 style="font-size: 22px; font-weight: 400; margin: 0 0 24px 0; color: #1d1b20;">Prompts</h2>
        <div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
          <md-filled-text-field 
            label="Prompt Name" 
            .value="${this.newName}"
            @input="${e => this.newName = e.target.value}"
            style="min-width: 200px;">
          </md-filled-text-field>
          <md-filled-text-field 
            label="Template" 
            .value="${this.newTemplate}"
            @input="${e => this.newTemplate = e.target.value}"
            style="min-width: 300px;">
          </md-filled-text-field>
          <md-filled-button @click="${() => this.savePrompt()}">Add Prompt</md-filled-button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${this.prompts.map(p => html`
            <div style="padding: 16px; background: #f3edf7; border-radius: 8px; border: 1px solid #cab6cf;">
              <div style="font-weight: 500; margin-bottom: 4px; color: #6750a4;">${p.name}</div>
              <div style="font-size: 14px; color: #49454f; font-family: 'Roboto Mono', monospace;">${p.template}</div>
            </div>
          `)}
        </div>
      </div>
    `;
    }
}
customElements.define('prompts-panel', PromptsPanel);