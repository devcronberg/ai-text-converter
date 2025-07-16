import { html, css, LitElement } from 'lit';
class SettingsPanel extends LitElement {
  static styles = css`:host { display: block; padding: 1rem; background: white; border-radius: 0.5rem; }`;
  render() {
    return html`<h2 class='text-xl font-bold mb-4'>Settings</h2>
    <label class='block mb-2'>API Key:</label>
    <input class='border p-2 w-full' type='text' value='${localStorage.getItem('api_key') || ''}'
      @input='${(e) => localStorage.setItem('api_key', e.target.value)}'>`;
  }
}
customElements.define('settings-panel', SettingsPanel);