import { html, css, LitElement } from 'lit';
class InputPanel extends LitElement {
    static styles = css`
    :host { 
      display: block; 
      width: 100%;
      padding: 1rem; 
      background: white; 
      border-radius: 0.5rem; 
      box-sizing: border-box;
    }
    .textarea-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      width: 100%;
    }
    @media (min-width: 768px) {
      .textarea-container {
        flex-direction: row;
      }
      .textarea-wrapper {
        position: relative;
        flex: 1;
      }

      .textarea-icon {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        width: 1.5rem;
        height: 1.5rem;
        cursor: pointer;
        color: #6b7280;
        transition: color 0.2s ease;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 0.25rem;
        padding: 0.25rem;
        backdrop-filter: blur(4px);
      }

      .textarea-icon:hover {
        color: #3b82f6;
        background: rgba(255, 255, 255, 1);
      }

      .textarea-icon svg {
        width: 100%;
        height: 100%;
        stroke: currentColor;
        fill: none;
        stroke-width: 2;
      }
    }
    textarea {
      width: 100%;
      min-height: 200px;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 0.25rem;
      resize: vertical;
      box-sizing: border-box;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .prompt-select, .model-select {
      appearance: none;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 200px;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 0.75rem center;
      background-repeat: no-repeat;
      background-size: 1.25rem;
      padding-right: 2.5rem;
    }

    .prompt-select:hover, .model-select:hover {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .prompt-select:focus, .model-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    .prompt-select:disabled, .model-select:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: #f9fafb;
    }
    .loading {
      opacity: 0.6;
      pointer-events: none;
    }
    .spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #22c55e;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 0.5rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .execute-button {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border: none;
      border-radius: 0.75rem;
      padding: 0.75rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
    }
    .execute-button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
    }
    .execute-button:active:not(:disabled) {
      transform: translateY(0);
    }
    .execute-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      background: #9ca3af;
    }
  `;
    constructor() {
        super();
        this.textIn = '';
        this.textOut = '';
        this.prompts = JSON.parse(localStorage.getItem('prompts') || '[]');
        this.selectedPrompt = localStorage.getItem('lastSelectedPrompt') || '';
        this.models = [];
        this.selectedModel = localStorage.getItem('lastSelectedModel') || '';
        this.isLoading = false;
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
            this.prompts = JSON.parse(localStorage.getItem('prompts') || '[]');

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
      <div class='controls ${this.isLoading ? 'loading' : ''}'>
        <select class='prompt-select' ?disabled='${this.isLoading}' @change='${e => { this.selectedPrompt = e.target.value; localStorage.setItem("lastSelectedPrompt", e.target.value); }}'>
          <option value=''>Select prompt</option>
          ${this.prompts.map(p => html`<option value='${p.name}' ?selected='${p.name === this.selectedPrompt}'>${p.name}</option>`)}
        </select>
        <select class='model-select' ?disabled='${this.isLoading}' @change='${e => { this.selectedModel = e.target.value; localStorage.setItem("lastSelectedModel", e.target.value); }}'>
          ${this.models.map(model => html`
            <option value='${model.id}' ?selected='${model.id === this.selectedModel}'>
              ${model.name || model.id}
            </option>
          `)}
        </select>
        <button class='execute-button' ?disabled='${this.isLoading}' @click='${() => this.runConversion()}'>
          ${this.isLoading ? html`<span class='spinner'></span>Processing...` : 'Convert'}
        </button>
      </div>
      <div class='textarea-container ${this.isLoading ? 'loading' : ''}'>
        <div class='textarea-wrapper'>
          <textarea 
            placeholder="Input text..." 
            .value='${this.textIn}'
            ?disabled='${this.isLoading}'
            @input='${e => this.textIn = e.target.value}'>
          </textarea>
          <div class='textarea-icon' @click='${() => this.pasteFromClipboard()}' title='Paste from clipboard'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.42 2.42 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c0 .621.504 1.125 1.125 1.125H18a2.25 2.25 0 0 0 2.25-2.25M8.25 8.25l13.5 0" />
            </svg>
          </div>
        </div>
        <div class='textarea-wrapper'>
          <textarea 
            placeholder="Output text..." 
            .value='${this.textOut}' 
            readonly>
          </textarea>
          <div class='textarea-icon' @click='${() => this.copyToClipboard()}' title='Copy to clipboard'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
            </svg>
          </div>
        </div>
      </div>
    `;
    }
}
customElements.define('input-panel', InputPanel);