import { html, LitElement } from 'lit';
import '@material/web/textfield/filled-text-field.js';

class SettingsPanel extends LitElement {
    // Disable shadow DOM to allow external CSS styling
    createRenderRoot() {
        return this;
    }

    render() {
        return html`
      <div style="padding: 24px; background: #f7f2fa; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);">
        <h2 style="font-size: 22px; font-weight: 400; margin: 0 0 24px 0; color: #1d1b20;">Settings</h2>
        <div style="margin-bottom: 24px;">
          <md-filled-text-field 
            label="API Key" 
            type="password" 
            .value="${localStorage.getItem('api_key') || ''}"
            @input="${(e) => localStorage.setItem('api_key', e.target.value)}"
            style="width: 100%;">
          </md-filled-text-field>
        </div>
      </div>
    `;
    }
}
customElements.define('settings-panel', SettingsPanel);