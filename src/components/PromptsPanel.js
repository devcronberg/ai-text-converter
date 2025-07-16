import { html, css, LitElement } from 'lit';
class PromptsPanel extends LitElement {
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
    
    .form-container {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    
    .form-input {
      padding: 12px 16px;
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 8px;
      font-size: 14px;
      color: var(--md-sys-color-on-surface);
      background: var(--md-sys-color-surface);
      font-family: 'Roboto', sans-serif;
      transition: border-color 0.2s ease;
      min-width: 200px;
    }
    
    .form-input:focus {
      outline: none;
      border-color: var(--md-sys-color-primary);
      box-shadow: 0 0 0 2px rgba(103, 80, 164, 0.2);
    }
    
    .add-button {
      background: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      border: none;
      border-radius: 20px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Roboto', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    }
    
    .add-button:hover {
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
      transform: translateY(-1px);
    }
    
    .add-button:active {
      transform: translateY(0);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    }
    
    .prompt-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .prompt-item {
      padding: 16px;
      margin-bottom: 8px;
      background: var(--md-sys-color-surface-container-highest);
      border-radius: 8px;
      border: 1px solid var(--md-sys-color-outline-variant);
      color: var(--md-sys-color-on-surface);
    }
    
    .prompt-name {
      font-weight: 500;
      margin-bottom: 4px;
      color: var(--md-sys-color-primary);
    }
    
    .prompt-template {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
      font-family: 'Roboto Mono', monospace;
    }
  `;
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
      <h2 class='title'>Prompts</h2>
      <div class='form-container'>
        <input class='form-input' placeholder='Prompt Name' .value='${this.newName}'
          @input='${e => this.newName = e.target.value}'>
        <input class='form-input' placeholder='Template' .value='${this.newTemplate}'
          @input='${e => this.newTemplate = e.target.value}'>
        <button class='add-button' @click='${() => this.savePrompt()}'>Add Prompt</button>
      </div>
      <ul class='prompt-list'>
        ${this.prompts.map(p => html`
          <li class='prompt-item'>
            <div class='prompt-name'>${p.name}</div>
            <div class='prompt-template'>${p.template}</div>
          </li>
        `)}
      </ul>
    `;
  }
}
customElements.define('prompts-panel', PromptsPanel);