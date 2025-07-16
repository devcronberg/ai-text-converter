import Navigo from 'navigo';
import './components/SettingsPanel.js';
import './components/PromptsPanel.js';
import './components/InputPanel.js';
import './components/ModalAlert.js';

const router = new Navigo('/', { hash: true });
const app = document.getElementById('app');

// Function to update active navigation state
function updateActiveNav(activeRoute) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('text-blue-600', 'bg-blue-50');
        link.classList.add('text-gray-700');
    });

    const activeLink = document.querySelector(`a[href="#${activeRoute}"]`);
    if (activeLink) {
        activeLink.classList.remove('text-gray-700');
        activeLink.classList.add('text-blue-600', 'bg-blue-50');
    }
}

router.on({
    '/': () => {
        app.innerHTML = '<input-panel></input-panel>';
        updateActiveNav('/');
    },
    '/settings': () => {
        app.innerHTML = '<settings-panel></settings-panel>';
        updateActiveNav('/settings');
    },
    '/prompts': () => {
        app.innerHTML = '<prompts-panel></prompts-panel>';
        updateActiveNav('/prompts');
    }
}).resolve();