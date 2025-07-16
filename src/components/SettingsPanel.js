import { html, LitElement } from 'lit';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/button/filled-button.js';

class SettingsPanel extends LitElement {
    // Disable shadow DOM to allow external CSS styling
    createRenderRoot() {
        return this;
    }

    constructor() {
        super();
        this.apiKey = localStorage.getItem('api_key') || '';
        this.savedMessage = false;
    }

    saveSettings() {
        localStorage.setItem('api_key', this.apiKey);
        this.savedMessage = true;
        this.requestUpdate();

        // Hide the saved message after 3 seconds
        setTimeout(() => {
            this.savedMessage = false;
            this.requestUpdate();
        }, 3000);
    }

    render() {
        return html`
      <div style="padding: 24px; background: #f7f2fa; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);">
        <h2 style="font-size: 22px; font-weight: 400; margin: 0 0 24px 0; color: #1d1b20;">Settings</h2>
        <div style="margin-bottom: 24px;">
          <md-filled-text-field 
            label="OpenRouter API Key" 
            type="password" 
            .value="${this.apiKey}"
            @input="${(e) => this.apiKey = e.target.value}"
            style="width: 100%;">
          </md-filled-text-field>
          <div style="margin-top: 8px; font-size: 14px; color: #49454f;">
            Get your API key from <a href="https://openrouter.ai/keys" target="_blank" style="color: #6750a4;">OpenRouter</a>
          </div>
        </div>
        
        <div style="display: flex; align-items: center; gap: 16px;">
          <md-filled-button @click="${this.saveSettings}">
            Save Settings
          </md-filled-button>
          
          ${this.savedMessage ? html`
            <div style="color: #4caf50; font-size: 14px; font-weight: 500;">
              ✓ Settings saved successfully!
            </div>
          ` : ''}
        </div>
      </div>
    `;
    }
}
customElements.define('settings-panel', SettingsPanel);