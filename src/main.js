import Navigo from 'navigo';
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';
import './components/SettingsPanel.js';
import './components/PromptsPanel.js';
import './components/InputPanel.js';
import './components/ModalAlert.js';

const router = new Navigo(null, { hash: true });
const app = document.getElementById('app');

// Create main layout with Material Design
function createLayout() {
    return `
        <div style="font-family: 'Roboto', sans-serif; margin: 0; padding: 0; background-color: #fef7ff; color: #1d1b20; min-height: 100vh;">
            <div style="background-color: #f3edf7; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 32px;">
                    <h1 style="font-size: 22px; font-weight: 400; margin: 0; color: #1d1b20;">Text Converter</h1>
                    <md-tabs style="flex: 1;">
                        <md-primary-tab id="convert-tab">Convert text</md-primary-tab>
                        <md-primary-tab id="prompts-tab">Prompts</md-primary-tab>
                        <md-primary-tab id="settings-tab">Settings</md-primary-tab>
                    </md-tabs>
                </div>
            </div>
            <div style="max-width: 1200px; margin: 0 auto; padding: 24px 16px;">
                <div id="content"></div>
            </div>
        </div>
    `;
}

// Initialize layout
document.body.innerHTML = createLayout();
const content = document.getElementById('content');

// Tab event handlers
document.getElementById('convert-tab').addEventListener('click', () => router.navigate('/'));
document.getElementById('prompts-tab').addEventListener('click', () => router.navigate('/prompts'));
document.getElementById('settings-tab').addEventListener('click', () => router.navigate('/settings'));

// Function to update active tab
function updateActiveTab(activeRoute) {
    const tabs = document.querySelectorAll('md-primary-tab');
    tabs.forEach(tab => tab.removeAttribute('active'));

    switch (activeRoute) {
        case '/':
            document.getElementById('convert-tab').setAttribute('active', '');
            break;
        case '/prompts':
            document.getElementById('prompts-tab').setAttribute('active', '');
            break;
        case '/settings':
            document.getElementById('settings-tab').setAttribute('active', '');
            break;
    }
}

router.on({
    '/': () => {
        content.innerHTML = '<input-panel></input-panel>';
        updateActiveTab('/');
    },
    '/settings': () => {
        content.innerHTML = '<settings-panel></settings-panel>';
        updateActiveTab('/settings');
    },
    '/prompts': () => {
        content.innerHTML = '<prompts-panel></prompts-panel>';
        updateActiveTab('/prompts');
    }
}).resolve();

// Ensure default route is loaded if no hash
if (!window.location.hash) {
    router.navigate('/');
}

// Add modal alert to body
document.body.appendChild(document.createElement('modal-alert'));
document.body.lastElementChild.id = 'modal-alert';

// Show welcome modal if no API key is set
function showWelcomeModal() {
    const apiKey = localStorage.getItem('api_key');
    console.log('Checking API key:', apiKey);

    if (!apiKey) {
        const modal = document.getElementById('modal-alert');
        console.log('Modal element:', modal);

        if (modal) {
            console.log('Showing welcome modal - no API key found');
            // Use the same approach as other components
            modal.title = 'Welcome to Text Converter! 🎉';
            modal.message = `To get started, you need to:

1. Create a free account at <a href="https://openrouter.ai" target="_blank">OpenRouter.ai</a>
2. Generate an API key in your account settings
3. Add the API key in the Settings tab
4. Import example prompts in the Prompts tab (or create your own)

OpenRouter gives you access to many AI models including free options. The app includes example prompts that you can import to get started quickly!

Once you have your API key and prompts set up, you can start converting text!`;
            modal.type = 'info';
            modal.allowBackdropClick = true;
            modal.isOpen = true;
            modal.requestUpdate();
        } else {
            console.error('Modal alert element not found');
        }
    } else {
        console.log('API key found, skipping welcome modal');
    }
}

// Show welcome modal after components are loaded
setTimeout(showWelcomeModal, 1000);