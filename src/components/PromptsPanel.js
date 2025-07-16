import { html, LitElement } from 'lit';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/text-button.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import systemPromptData from '../data/system-prompt.json';

class PromptsPanel extends LitElement {
    // Disable shadow DOM to allow external CSS styling
    createRenderRoot() {
        return this;
    }

    constructor() {
        super();
        this.prompts = [];
        this.showModal = false;
        this.showImportModal = false;
        this.modalType = 'create'; // 'create' or 'edit'
        this.editingIndex = -1;
        this.formData = { name: '', template: '' };
        this.errors = { name: '', template: '' };
        this.draggedIndex = -1;
        this.importUrl = 'system-prompt.json';
        this.importError = '';
        this.loadPrompts().then(prompts => {
            this.prompts = prompts;
            this.requestUpdate();
        });
    }

    async loadPrompts() {
        const stored = localStorage.getItem('prompts');
        let prompts = [];

        if (stored) {
            const oldPrompts = JSON.parse(stored);
            prompts = oldPrompts.map((prompt, index) => ({
                id: prompt.id || this.generateId(),
                name: prompt.name,
                template: prompt.template,
                sortOrder: prompt.sortOrder || index,
                isSystem: prompt.isSystem || false
            })).sort((a, b) => a.sortOrder - b.sortOrder);
        }

        return prompts;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    savePrompts() {
        localStorage.setItem('prompts', JSON.stringify(this.prompts));
    }

    openCreateModal() {
        this.modalType = 'create';
        this.formData = { name: '', template: '' };
        this.errors = { name: '', template: '' };
        this.showModal = true;
        this.requestUpdate();
    }

    openEditModal(index) {
        const prompt = this.prompts[index];

        // Prevent editing of system prompt
        if (prompt.isSystem) {
            const modalAlert = document.getElementById('modal-alert');
            if (modalAlert) {
                modalAlert.show(
                    'Cannot Edit System Prompt',
                    'The system prompt cannot be edited. Please create your own prompts instead.',
                    () => { } // Empty callback - just close the modal
                );
            }
            return;
        }

        this.modalType = 'edit';
        this.editingIndex = index;
        this.formData = {
            name: this.prompts[index].name,
            template: this.prompts[index].template
        };
        this.errors = { name: '', template: '' };
        this.showModal = true;
        this.requestUpdate();
    }

    closeModal() {
        this.showModal = false;
        this.requestUpdate();
    }

    validateForm() {
        this.errors = { name: '', template: '' };

        if (!this.formData.name.trim()) {
            this.errors.name = 'Name is required';
        } else if (this.formData.name.trim().length > 50) {
            this.errors.name = 'Name must be 50 characters or less';
        }

        if (!this.formData.template.trim()) {
            this.errors.template = 'Template is required';
        } else if (this.formData.template.trim().length > 10000) {
            this.errors.template = 'Template must be 10000 characters or less';
        }

        return !this.errors.name && !this.errors.template;
    }

    savePrompt() {
        if (!this.validateForm()) {
            this.requestUpdate();
            return;
        }

        if (this.modalType === 'create') {
            const newPrompt = {
                id: this.generateId(),
                name: this.formData.name.trim(),
                template: this.formData.template.trim(),
                sortOrder: this.prompts.length
            };
            this.prompts.push(newPrompt);
        } else {
            this.prompts[this.editingIndex] = {
                ...this.prompts[this.editingIndex],
                name: this.formData.name.trim(),
                template: this.formData.template.trim()
            };
        }

        this.savePrompts();
        this.closeModal();
        this.requestUpdate();
    }

    deletePrompt(index) {
        const prompt = this.prompts[index];

        // Prevent deletion of system prompt
        if (prompt.isSystem) {
            const modalAlert = document.getElementById('modal-alert');
            if (modalAlert) {
                modalAlert.show(
                    'Cannot Delete System Prompt',
                    'The system prompt cannot be deleted. Please create your own prompts first.',
                    () => { } // Empty callback - just close the modal
                );
            }
            return;
        }

        const modalAlert = document.getElementById('modal-alert');
        if (modalAlert) {
            modalAlert.show(
                'Delete Prompt',
                `Are you sure you want to delete "${prompt.name}"?`,
                () => {
                    this.prompts.splice(index, 1);
                    // Update sort orders
                    this.prompts.forEach((p, i) => p.sortOrder = i);
                    this.savePrompts();
                    this.requestUpdate();
                }
            );
        }
    }

    openImportModal() {
        this.showImportModal = true;
        this.importUrl = 'system-prompt.json';
        this.importError = '';
        this.requestUpdate();
    }

    closeImportModal() {
        this.showImportModal = false;
        this.importError = '';
        this.requestUpdate();
    }

    async importPrompts() {
        try {
            this.importError = '';
            let response;

            // Check if it's a relative path to system-prompt.json
            if (this.importUrl.includes('system-prompt.json')) {
                const systemPrompts = await import('../data/system-prompt.json');
                response = { ok: true, json: () => Promise.resolve(systemPrompts.default) };
            } else {
                response = await fetch(this.importUrl);
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const importedPrompts = await response.json();

            // Ensure it's an array
            const promptsArray = Array.isArray(importedPrompts) ? importedPrompts : [importedPrompts];

            // Import prompts - overwrite if same name exists, otherwise add
            promptsArray.forEach(importedPrompt => {
                if (!importedPrompt.name || !importedPrompt.template) {
                    console.warn('Skipping invalid prompt:', importedPrompt);
                    return;
                }

                // Find existing prompt with same name
                const existingIndex = this.prompts.findIndex(p => p.name === importedPrompt.name);

                const prompt = {
                    id: importedPrompt.id || this.generateId(),
                    name: importedPrompt.name,
                    template: importedPrompt.template,
                    sortOrder: existingIndex >= 0 ? this.prompts[existingIndex].sortOrder : this.prompts.length,
                    isSystem: false // Imported prompts are not protected
                };

                if (existingIndex >= 0) {
                    // Overwrite existing prompt
                    this.prompts[existingIndex] = prompt;
                } else {
                    // Add new prompt
                    this.prompts.push(prompt);
                }
            });

            // Re-sort prompts
            this.prompts.sort((a, b) => a.sortOrder - b.sortOrder);

            this.savePrompts();
            this.closeImportModal();
            this.requestUpdate();

            // Show success message
            const modalAlert = document.getElementById('modal-alert');
            if (modalAlert) {
                modalAlert.show(
                    'Import Successful',
                    `Successfully imported ${promptsArray.length} prompt(s). Existing prompts with the same name have been overwritten.`,
                    () => { }
                );
            }

        } catch (error) {
            console.error('Failed to import prompts:', error);
            this.importError = `Failed to import prompts: ${error.message}`;
            this.requestUpdate();
        }
    }

    // Drag and drop functionality
    handleDragStart(e, index) {
        // Prevent dragging system prompts
        if (this.prompts[index].isSystem) {
            e.preventDefault();
            return false;
        }

        this.draggedIndex = index;
        e.dataTransfer.effectAllowed = 'move';
        e.target.style.opacity = '0.5';
        e.target.style.transform = 'scale(0.95)';
    }

    handleDragEnd(e) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'scale(1)';
        this.draggedIndex = -1;
        // Remove drag-over styling from all items
        const items = this.querySelectorAll('[draggable="true"]');
        items.forEach(item => {
            item.style.borderTop = '1px solid #cab6cf';
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e, index) {
        if (this.draggedIndex !== index) {
            e.target.closest('[draggable="true"]').style.borderTop = '3px solid #6750a4';
        }
    }

    handleDragLeave(e) {
        e.target.closest('[draggable="true"]').style.borderTop = '1px solid #cab6cf';
    }

    handleDrop(e, dropIndex) {
        e.preventDefault();
        e.target.closest('[draggable="true"]').style.borderTop = '1px solid #cab6cf';

        if (this.draggedIndex === dropIndex) return;

        // Reorder the array
        const draggedPrompt = this.prompts[this.draggedIndex];
        this.prompts.splice(this.draggedIndex, 1);
        this.prompts.splice(dropIndex, 0, draggedPrompt);

        // Update sort orders
        this.prompts.forEach((prompt, index) => {
            prompt.sortOrder = index;
        });

        this.savePrompts();
        this.requestUpdate();
    }

    render() {
        return html`
            <div style="padding: 24px; background: #f7f2fa; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24); max-width: 800px; margin: 0 auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h2 style="font-size: 22px; font-weight: 400; margin: 0; color: #1d1b20;">Prompts</h2>
                    <div style="display: flex; gap: 8px;">
                        <md-filled-button @click="${this.openImportModal}">
                            Import
                        </md-filled-button>
                        <md-filled-button @click="${this.openCreateModal}">
                            Create
                        </md-filled-button>
                    </div>
                </div>

                ${this.prompts.length === 0 ? html`
                    <div style="text-align: center; padding: 48px 24px; color: #49454f;">
                        <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">📝</div>
                        <h3>No prompts yet</h3>
                        <p>Create your first prompt to get started</p>
                    </div>
                ` : html`
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${this.prompts.map((prompt, index) => html`
                            <div 
                                style="display: flex; align-items: center; gap: 16px; padding: 16px; background: #f3edf7; border-radius: 8px; border: 1px solid #cab6cf; cursor: ${prompt.isSystem ? 'default' : 'move'}; transition: all 0.2s ease;"
                                draggable="${!prompt.isSystem}"
                                @dragstart="${(e) => this.handleDragStart(e, index)}"
                                @dragend="${this.handleDragEnd}"
                                @dragover="${this.handleDragOver}"
                                @dragenter="${(e) => this.handleDragEnter(e, index)}"
                                @dragleave="${this.handleDragLeave}"
                                @drop="${(e) => this.handleDrop(e, index)}"
                                @mouseover="${(e) => e.currentTarget.style.background = '#e8def8'}"
                                @mouseout="${(e) => e.currentTarget.style.background = '#f3edf7'}"
                            >
                                <span style="color: #666; cursor: ${prompt.isSystem ? 'default' : 'move'}; font-size: 16px; user-select: none;">
                                    ${prompt.isSystem ? '🔒' : '⋮⋮'}
                                </span>
                                <div style="flex: 1;">
                                    <div style="font-weight: 500; margin-bottom: 4px; color: #6750a4;">
                                        ${prompt.name}${prompt.isSystem ? ' (System)' : ''}
                                    </div>
                                    <div style="font-size: 14px; color: #49454f; font-family: 'Roboto Mono', monospace; max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${prompt.template}</div>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    ${prompt.isSystem ? html`
                                        <span style="background: #e8def8; color: #6750a4; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">
                                            Protected
                                        </span>
                                    ` : html`
                                        <button style="background: #4caf50; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;" @click="${() => this.openEditModal(index)}">
                                            Edit
                                        </button>
                                        <button style="background: #f44336; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;" @click="${() => this.deletePrompt(index)}">
                                            Delete
                                        </button>
                                    `}
                                </div>
                            </div>
                        `)}
                    </div>
                `}

                <!-- Modal -->
                <div style="display: ${this.showModal ? 'flex' : 'none'}; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 1000; align-items: center; justify-content: center;">
                    <div style="background: white; border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                            <h3 style="font-size: 20px; font-weight: 500; color: #1d1b20; margin: 0;">
                                ${this.modalType === 'create' ? 'Create Prompt' : 'Edit Prompt'}
                            </h3>
                            <button style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666; padding: 4px;" @click="${this.closeModal}">
                                ×
                            </button>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
                            <div>
                                <md-filled-text-field 
                                    label="Prompt Name" 
                                    .value="${this.formData.name}"
                                    @input="${(e) => this.formData.name = e.target.value}"
                                    style="width: 100%;"
                                    maxlength="50">
                                </md-filled-text-field>
                                ${this.errors.name ? html`<div style="color: #ba1a1a; font-size: 12px; margin-top: 4px;">${this.errors.name}</div>` : ''}
                            </div>

                            <div>
                                <md-filled-text-field 
                                    label="Template" 
                                    .value="${this.formData.template}"
                                    @input="${(e) => this.formData.template = e.target.value}"
                                    style="width: 100%;"
                                    type="textarea"
                                    rows="4"
                                    maxlength="10000">
                                </md-filled-text-field>
                                ${this.errors.template ? html`<div style="color: #ba1a1a; font-size: 12px; margin-top: 4px;">${this.errors.template}</div>` : ''}
                            </div>
                        </div>

                        <div style="display: flex; gap: 8px; justify-content: flex-end;">
                            <md-text-button @click="${this.closeModal}">Cancel</md-text-button>
                            <md-filled-button @click="${this.savePrompt}">
                                ${this.modalType === 'create' ? 'Create' : 'Save'}
                            </md-filled-button>
                        </div>
                    </div>
                </div>

                <!-- Import Modal -->
                <div style="display: ${this.showImportModal ? 'flex' : 'none'}; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 1000; align-items: center; justify-content: center;">
                    <div style="background: white; border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                            <h3 style="font-size: 20px; font-weight: 500; color: #1d1b20; margin: 0;">
                                Import Prompts
                            </h3>
                            <button style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666; padding: 4px;" @click="${this.closeImportModal}">
                                ×
                            </button>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
                            <div>
                                <md-filled-text-field 
                                    label="Import URL" 
                                    .value="${this.importUrl}"
                                    @input="${(e) => this.importUrl = e.target.value}"
                                    style="width: 100%;"
                                    maxlength="200">
                                </md-filled-text-field>
                                ${this.importError ? html`<div style="color: #ba1a1a; font-size: 12px; margin-top: 4px;">${this.importError}</div>` : ''}
                            </div>
                            <div style="font-size: 14px; color: #666; line-height: 1.4;">
                                <p>Enter a URL to import prompts from a JSON file. The file should contain either:</p>
                                <ul style="margin: 8px 0; padding-left: 20px;">
                                    <li>A single prompt object with "name" and "template" properties</li>
                                    <li>An array of prompt objects</li>
                                </ul>
                                <p>If a prompt with the same name already exists, it will be overwritten.</p>
                            </div>
                        </div>

                        <div style="display: flex; gap: 8px; justify-content: flex-end;">
                            <md-text-button @click="${this.closeImportModal}">Cancel</md-text-button>
                            <md-filled-button @click="${this.importPrompts}">
                                Import
                            </md-filled-button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('prompts-panel', PromptsPanel);