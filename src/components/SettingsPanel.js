import { html, LitElement } from 'lit';
class SettingsPanel extends LitElement {
  // Disable shadow DOM to allow external CSS styling
  createRenderRoot() {
    return this;
  }
  
  render() {
    return html`
      <h2 class='title'>Settings</h2>
      <div class='form-field'>
        <label class='form-label'>API Key:</label>
        <input class='form-input' type='password' value='${localStorage.getItem('api_key') || ''}'
          @input='${(e) => localStorage.setItem('api_key', e.target.value)}'>
      </div>
    `;
  }
}
customElements.define('settings-panel', SettingsPanel);