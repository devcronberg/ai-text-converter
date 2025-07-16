import { html, LitElement, css } from 'lit';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/text-button.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';

class PromptsPanel extends LitElement {
    static styles = css`
        .prompts-panel {
            padding: 24px;
            background: #f7f2fa;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
            max-width: 800px;
            margin: 0 auto;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        .title {
            font-size: 22px;
            font-weight: 400;
            margin: 0;
            color: #1d1b20;
        }

        .prompts-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .prompt-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            background: #f3edf7;
            border-radius: 8px;
            border: 1px solid #cab6cf;
            cursor: move;
            transition: all 0.2s ease;
        }

        .prompt-item:hover {
            background: #e8def8;
            border-color: #6750a4;
        }

        .prompt-item.dragging {
            opacity: 0.5;
            transform: scale(0.95);
        }

        .prompt-item.drag-over {
            border-top: 3px solid #6750a4;
        }

        .drag-handle {
            color: #666;
            cursor: move;
            font-size: 20px;
        }

        .prompt-content {
            flex: 1;
        }

        .prompt-name {
            font-weight: 500;
            margin-bottom: 4px;
            color: #6750a4;
        }

        .prompt-template {
            font-size: 14px;
            color: #49454f;
            font-family: 'Roboto Mono', monospace;
            max-width: 400px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .prompt-actions {
            display: flex;
            gap: 8px;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }

        .modal.show {
            display: flex;
        }

        .modal-content {
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        .modal-title {
            font-size: 20px;
            font-weight: 500;
            color: #1d1b20;
            margin: 0;
        }

        .form-fields {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-bottom: 24px;
        }

        .form-actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }

        .error-message {
            color: #ba1a1a;
            font-size: 12px;
            margin-top: 4px;
        }

        .empty-state {
            text-align: center;
            padding: 48px 24px;
            color: #49454f;
        }

        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
        }
    `;

    // Disable shadow DOM to allow external CSS styling
    createRenderRoot() {
        return this;
    }

    constructor() {
        super();
        this.prompts = this.loadPrompts();
        this.showModal = false;
        this.modalType = 'create'; // 'create' or 'edit'
        this.editingIndex = -1;
        this.formData = { name: '', template: '' };
        this.errors = { name: '', template: '' };
        this.draggedIndex = -1;
    }

    loadPrompts() {
        const stored = localStorage.getItem('prompts');
        if (stored) {
            const oldPrompts = JSON.parse(stored);
            // Convert old format to new format if needed
            return oldPrompts.map((prompt, index) => ({
                id: prompt.id || this.generateId(),
                name: prompt.name,
                template: prompt.template,
                sortOrder: prompt.sortOrder || index
            })).sort((a, b) => a.sortOrder - b.sortOrder);
        }
        return [];
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
        } else if (this.formData.template.trim().length > 1000) {
            this.errors.template = 'Template must be 1000 characters or less';
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

    // Drag and drop functionality
    handleDragStart(e, index) {
        this.draggedIndex = index;
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('dragging');
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedIndex = -1;
        // Remove drag-over class from all items
        this.querySelectorAll('.prompt-item').forEach(item => {
            item.classList.remove('drag-over');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e, index) {
        if (this.draggedIndex !== index) {
            e.target.closest('.prompt-item').classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        e.target.closest('.prompt-item').classList.remove('drag-over');
    }

    handleDrop(e, dropIndex) {
        e.preventDefault();
        e.target.closest('.prompt-item').classList.remove('drag-over');
        
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
            <div class="prompts-panel">
                <div class="header">
                    <h2 class="title">Prompts</h2>
                    <md-filled-button @click="${this.openCreateModal}">
                        <md-icon slot="icon">add</md-icon>
                        Create
                    </md-filled-button>
                </div>

                ${this.prompts.length === 0 ? html`
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <h3>No prompts yet</h3>
                        <p>Create your first prompt to get started</p>
                    </div>
                ` : html`
                    <div class="prompts-list">
                        ${this.prompts.map((prompt, index) => html`
                            <div 
                                class="prompt-item"
                                draggable="true"
                                @dragstart="${(e) => this.handleDragStart(e, index)}"
                                @dragend="${this.handleDragEnd}"
                                @dragover="${this.handleDragOver}"
                                @dragenter="${(e) => this.handleDragEnter(e, index)}"
                                @dragleave="${this.handleDragLeave}"
                                @drop="${(e) => this.handleDrop(e, index)}"
                            >
                                <md-icon class="drag-handle">drag_indicator</md-icon>
                                <div class="prompt-content">
                                    <div class="prompt-name">${prompt.name}</div>
                                    <div class="prompt-template">${prompt.template}</div>
                                </div>
                                <div class="prompt-actions">
                                    <md-icon-button @click="${() => this.openEditModal(index)}">
                                        <md-icon>edit</md-icon>
                                    </md-icon-button>
                                    <md-icon-button @click="${() => this.deletePrompt(index)}">
                                        <md-icon>delete</md-icon>
                                    </md-icon-button>
                                </div>
                            </div>
                        `)}
                    </div>
                `}

                <!-- Modal -->
                <div class="modal ${this.showModal ? 'show' : ''}" @click="${(e) => e.target === e.currentTarget ? this.closeModal() : null}">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 class="modal-title">
                                ${this.modalType === 'create' ? 'Create Prompt' : 'Edit Prompt'}
                            </h3>
                            <md-icon-button @click="${this.closeModal}">
                                <md-icon>close</md-icon>
                            </md-icon-button>
                        </div>

                        <div class="form-fields">
                            <div>
                                <md-filled-text-field 
                                    label="Prompt Name" 
                                    .value="${this.formData.name}"
                                    @input="${(e) => this.formData.name = e.target.value}"
                                    style="width: 100%;"
                                    maxlength="50">
                                </md-filled-text-field>
                                ${this.errors.name ? html`<div class="error-message">${this.errors.name}</div>` : ''}
                            </div>

                            <div>
                                <md-filled-text-field 
                                    label="Template" 
                                    .value="${this.formData.template}"
                                    @input="${(e) => this.formData.template = e.target.value}"
                                    style="width: 100%;"
                                    type="textarea"
                                    rows="4"
                                    maxlength="1000">
                                </md-filled-text-field>
                                ${this.errors.template ? html`<div class="error-message">${this.errors.template}</div>` : ''}
                            </div>
                        </div>

                        <div class="form-actions">
                            <md-text-button @click="${this.closeModal}">Cancel</md-text-button>
                            <md-filled-button @click="${this.savePrompt}">
                                ${this.modalType === 'create' ? 'Create' : 'Save'}
                            </md-filled-button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('prompts-panel', PromptsPanel);