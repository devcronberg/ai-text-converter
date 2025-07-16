import { html, css, LitElement } from 'lit';
class SettingsPanel extends LitElement {
  static styles = css`
    :host { 
      display: block; 
      padding: 24px; 
      background: var(--md-sys-color-surface-container-low); 
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    }
    
    .title {
      font-size: 22px;
      font-weight: 400;
      color: var(--md-sys-color-on-surface);
      margin: 0 0 24px 0;
    }
    
    .form-field {
      margin-bottom: 24px;
    }
    
    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface);
      margin-bottom: 8px;
    }
    
    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 8px;
      font-size: 14px;
      color: var(--md-sys-color-on-surface);
      background: var(--md-sys-color-surface);
      font-family: 'Roboto', sans-serif;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }
    
    .form-input:focus {
      outline: none;
      border-color: var(--md-sys-color-primary);
      box-shadow: 0 0 0 2px rgba(103, 80, 164, 0.2);
    }
    
    .form-input[type="password"] {
      font-family: 'Roboto Mono', monospace;
    }
  `;
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