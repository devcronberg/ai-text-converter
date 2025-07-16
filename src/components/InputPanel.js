import { html, LitElement } from 'lit';
import '@material/web/button/filled-button.js';
import '@material/web/select/filled-select.js';
import '@material/web/select/select-option.js';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/progress/circular-progress.js';

class InputPanel extends LitElement {
    // Disable shadow DOM to allow external CSS styling
    createRenderRoot() {
        return this;
    }

    constructor() {
        super();
        this.textIn = '';
        this.textOut = '';
        this.prompts = this.loadPrompts();
        this.selectedPrompt = localStorage.getItem('lastSelectedPrompt') || '';
        this.models = [];
        this.selectedModel = localStorage.getItem('lastSelectedModel') || '';
        this.isLoading = false;
    }

    loadPrompts() {
        const stored = localStorage.getItem('prompts');
        if (stored) {
            const prompts = JSON.parse(stored);
            // Handle both old format {name, template} and new format {id, name, template, sortOrder}
            return prompts.map(prompt => ({
                id: prompt.id || prompt.name,
                name: prompt.name,
                template: prompt.template,
                sortOrder: prompt.sortOrder || 0
            })).sort((a, b) => a.sortOrder - b.sortOrder);
        }
        return [];
    }

    firstUpdated() {
        this.loadModels();

        // Add keyboard shortcut for Ctrl+Enter
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.runConversion();
            }
        });
    }

    async loadModels() {
        // Check cache first
        const cachedData = localStorage.getItem('cached_models');
        const cacheTimestamp = localStorage.getItem('models_cache_timestamp');
        const twelveHours = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

        if (cachedData && cacheTimestamp) {
            const cacheAge = Date.now() - parseInt(cacheTimestamp);
            if (cacheAge < twelveHours) {
                console.log('Using cached models');
                this.models = JSON.parse(cachedData);
                // Set first model as default if no model is selected or saved model doesn't exist
                if (!this.selectedModel && this.models.length > 0) {
                    this.selectedModel = this.models[0].id;
                    localStorage.setItem('lastSelectedModel', this.selectedModel);
                } else if (this.selectedModel && !this.models.find(m => m.id === this.selectedModel)) {
                    this.selectedModel = this.models[0].id;
                    localStorage.setItem('lastSelectedModel', this.selectedModel);
                }
                this.requestUpdate();
                return;
            }
        }

        console.log('Fetching fresh models from API');
        try {
            const response = await fetch('https://openrouter.ai/api/v1/models');
            const data = await response.json();

            if (data.data) {
                // Sort models: free first, then by created date (newest first)
                this.models = data.data.sort((a, b) => {
                    const aIsFree = a.pricing?.prompt === "0" || a.pricing?.completion === "0";
                    const bIsFree = b.pricing?.prompt === "0" || b.pricing?.completion === "0";

                    if (aIsFree && !bIsFree) return -1;
                    if (!aIsFree && bIsFree) return 1;

                    // If both are free or both are paid, sort by created date
                    const aCreated = new Date(a.created || 0);
                    const bCreated = new Date(b.created || 0);
                    return bCreated - aCreated;
                });

                // Cache the models
                localStorage.setItem('cached_models', JSON.stringify(this.models));
                localStorage.setItem('models_cache_timestamp', Date.now().toString());

                // Set first model as default if no model is selected or saved model doesn't exist
                if (!this.selectedModel && this.models.length > 0) {
                    this.selectedModel = this.models[0].id;
                    localStorage.setItem('lastSelectedModel', this.selectedModel);
                } else if (this.selectedModel && !this.models.find(m => m.id === this.selectedModel)) {
                    // If saved model doesn't exist in current models, use first available
                    this.selectedModel = this.models[0].id;
                    localStorage.setItem('lastSelectedModel', this.selectedModel);
                }
            } else {
                // Fallback models
                this.models = [
                    { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek Chat V3 (Free)' },
                    { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B (Free)' }
                ];
                // Set first fallback model as default
                if (!this.selectedModel) {
                    this.selectedModel = this.models[0].id;
                    localStorage.setItem('lastSelectedModel', this.selectedModel);
                }
            }
            this.requestUpdate();
        } catch (error) {
            console.error('Failed to load models:', error);
            // Try to use cached data even if expired
            if (cachedData) {
                console.log('Using expired cache due to API error');
                this.models = JSON.parse(cachedData);
            } else {
                // Fallback models
                this.models = [
                    { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek Chat V3 (Free)' },
                    { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B (Free)' }
                ];
            }
            // Set first fallback model as default
            if (!this.selectedModel) {
                this.selectedModel = this.models[0].id;
                localStorage.setItem('lastSelectedModel', this.selectedModel);
            }
            this.requestUpdate();
        }
    }
    showModal(type, title, message) {
        const modal = document.getElementById('modal-alert');
        modal.type = type;
        modal.title = title;
        modal.message = message;
        modal.isOpen = true;
        modal.requestUpdate();
    }

    async runConversion() {
        if (this.isLoading) return; // Prevent multiple simultaneous requests

        const apiKey = localStorage.getItem('api_key');
        if (!apiKey) {
            this.showModal('error', 'API Key Missing', 'Please configure your OpenRouter API key in Settings.');
            return;
        }
        if (!this.selectedModel) {
            this.showModal('warning', 'No Model Selected', 'Please select a model from the dropdown.');
            return;
        }

        // Start loading state
        this.isLoading = true;
        this.requestUpdate();

        try {
            // Reload prompts from localStorage to ensure we have latest
            this.prompts = this.loadPrompts();

            console.log('All prompts:', this.prompts);
            console.log('Selected prompt name:', this.selectedPrompt);

            const prompt = this.prompts.find(p => p.name === this.selectedPrompt)?.template || '';
            console.log('Found prompt template:', prompt);
            console.log('Input text:', this.textIn);

            if (!this.selectedPrompt) {
                console.warn('No prompt selected');
            }

            const input = prompt ? `${prompt}\n\n${this.textIn}` : this.textIn;
            console.log('Final input:', input);

            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Text Converter App',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.selectedModel,
                    messages: [{ role: 'user', content: input }]
                })
            });
            const data = await res.json();
            if (data.error) {
                // Build detailed error message
                let errorMessage = `${data.error.message}`;

                // Add raw error details if available
                if (data.error.metadata?.raw) {
                    errorMessage += `\n\nDetails:\n${data.error.metadata.raw}`;
                }

                // Add provider name if available
                if (data.error.metadata?.provider_name) {
                    errorMessage += `\n\nProvider: ${data.error.metadata.provider_name}`;
                }

                // Add error code if available
                if (data.error.code) {
                    errorMessage += `\n\nError Code: ${data.error.code}`;
                }

                console.error('OpenRouter API Error:', data.error);
                this.showModal('error', 'API Error', errorMessage);
                return;
            }
            this.textOut = data.choices[0].message.content;
        } catch (error) {
            console.error('Request failed:', error);
            this.showModal('error', 'Network Error', 'Failed to connect to the API. Please check your internet connection and try again.');
        } finally {
            // End loading state
            this.isLoading = false;
            this.requestUpdate();
        }
    }
    async pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            this.textIn = text;
            this.requestUpdate();
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            // Fallback - show modal with instruction
            const modal = document.getElementById('modal-alert');
            if (modal) {
                modal.setAttribute('type', 'info');
                modal.setAttribute('title', 'Paste Text');
                modal.setAttribute('message', 'Please use Ctrl+V to paste text into the input field.');
                modal.setAttribute('visible', 'true');
            }
        }
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.textOut);
            // Show success feedback
            const modal = document.getElementById('modal-alert');
            if (modal) {
                modal.setAttribute('type', 'info');
                modal.setAttribute('title', 'Copied');
                modal.setAttribute('message', 'Text copied to clipboard successfully!');
                modal.setAttribute('visible', 'true');
            }
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            // Fallback - show modal with instruction
            const modal = document.getElementById('modal-alert');
            if (modal) {
                modal.setAttribute('type', 'info');
                modal.setAttribute('title', 'Copy Text');
                modal.setAttribute('message', 'Please select the text and use Ctrl+C to copy.');
                modal.setAttribute('visible', 'true');
            }
        }
    }

    render() {
        return html`
      <div style="padding: 24px; background: #f7f2fa; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);">
        <div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
          <md-filled-select label="Select prompt" .value="${this.selectedPrompt}" ?disabled="${this.isLoading}" @change="${e => { this.selectedPrompt = e.target.value; localStorage.setItem('lastSelectedPrompt', e.target.value); }}">
            <md-select-option value="">
              <div slot="headline">No prompt</div>
            </md-select-option>
            ${this.prompts.map(p => html`
              <md-select-option .value="${p.name}" ?selected="${p.name === this.selectedPrompt}">
                <div slot="headline">${p.name}</div>
              </md-select-option>
            `)}
          </md-filled-select>
          
          <md-filled-select label="Select model" .value="${this.selectedModel}" ?disabled="${this.isLoading}" @change="${e => { this.selectedModel = e.target.value; localStorage.setItem('lastSelectedModel', e.target.value); }}">
            ${this.models.map(model => html`
              <md-select-option .value="${model.id}" ?selected="${model.id === this.selectedModel}">
                <div slot="headline">${model.name || model.id}</div>
              </md-select-option>
            `)}
          </md-filled-select>
          
          <md-filled-button ?disabled="${this.isLoading}" @click="${() => this.runConversion()}">
            ${this.isLoading ? html`<md-circular-progress indeterminate></md-circular-progress>Processing...` : 'Convert'}
          </md-filled-button>
        </div>
        
        <div style="display: flex; gap: 24px; ${window.innerWidth < 768 ? 'flex-direction: column;' : 'flex-direction: row;'}">
          <md-filled-text-field 
            type="textarea" 
            label="Input text" 
            .value="${this.textIn}"
            ?disabled="${this.isLoading}"
            @input="${e => this.textIn = e.target.value}"
            rows="8"
            style="flex: 1;">
          </md-filled-text-field>
          
          <md-filled-text-field 
            type="textarea" 
            label="Output text" 
            .value="${this.textOut}"
            readonly
            rows="8"
            style="flex: 1;">
          </md-filled-text-field>
        </div>
      </div>
    `;
    }
}
customElements.define('input-panel', InputPanel);