import { html, LitElement } from 'lit';
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