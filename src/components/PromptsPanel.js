import { html, css, LitElement } from 'lit';
class PromptsPanel extends LitElement {
  static styles = css`:host { display: block; padding: 1rem; background: white; border-radius: 0.5rem; }`;
  constructor() {
    super();
    this.prompts = JSON.parse(localStorage.getItem('prompts') || '[]');
    this.newName = ''; this.newTemplate = '';
  }
  savePrompt() {
    this.prompts.push({ name: this.newName, template: this.newTemplate });
    localStorage.setItem('prompts', JSON.stringify(this.prompts));
    this.newName = this.newTemplate = ''; this.requestUpdate();
  }
  render() {
    return html`<h2 class='text-xl font-bold mb-4'>Prompts</h2>
    <div class='mb-4'><input class='border p-2 mr-2' placeholder='Name' .value='${this.newName}'
      @input='${e => this.newName = e.target.value}'>
    <input class='border p-2 mr-2' placeholder='Template' .value='${this.newTemplate}'
      @input='${e => this.newTemplate = e.target.value}'>
    <button class='bg-blue-500 text-white px-4 py-2' @click='${() => this.savePrompt()}'>Add</button></div>
    <ul>${this.prompts.map(p => html`<li class='mb-2'>${p.name}: ${p.template}</li>`)}</ul>`;
  }
}
customElements.define('prompts-panel', PromptsPanel);