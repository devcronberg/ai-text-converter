# Text Converter App - AI Coding Instructions

## Architecture Overview
This is a Lit-based SPA that provides text conversion via OpenRouter AI models. The app uses a simple hash-based routing system with three main views: input panel (main conversion interface), prompts management, and settings.

**Key Components:**
- `src/main.js` - Entry point with Navigo hash router
- `src/components/InputPanel.js` - Main conversion interface with model selection and dual-textarea layout
- `src/components/PromptsPanel.js` - CRUD for user-defined prompt templates
- `src/components/SettingsPanel.js` - API key management

## Data Storage Patterns
All data persists in localStorage with specific keys:
- `api_key` - OpenRouter API key
- `prompts` - Array of `{name, template}` objects
- `lastSelectedPrompt` - User's last chosen prompt (auto-restored)
- `lastSelectedModel` - User's last chosen model (auto-restored)

**Example prompt structure:**
```json
[{"name": "Translate EN->DA", "template": "Translate this text from english to danish - do not add any other notes or text. Just the translation"}]
```

## OpenRouter Integration
- Models are fetched from `https://openrouter.ai/api/v1/models` on component load
- Free models (pricing.prompt === "0" or pricing.completion === "0") are sorted first
- Required headers: `Authorization: Bearer <key>`, `HTTP-Referer`, `X-Title`, `Content-Type`
- API endpoint: `https://openrouter.ai/api/v1/chat/completions`

## Component Patterns
All components extend LitElement with these conventions:
- Static styles using `css` template literal
- Constructor initializes properties from localStorage
- Use `this.requestUpdate()` after state changes
- Event handlers inline with arrow functions: `@click='${() => this.method()}'`
- Responsive design with media queries in component styles

**InputPanel specific patterns:**
- Dual-textarea layout: flexbox column on mobile, row on desktop (`gap: 2rem`)
- Model dropdown auto-populates and remembers selection
- Prompt construction: `${prompt}\n\n${userInput}` when prompt selected
- Box-sizing: border-box on all textareas and host elements

## Development Workflow
- `npm run dev` - Start Vite dev server with auto-open
- `npm run build` - Production build
- Uses Tailwind CSS via CDN (no build step required)
- No testing setup - manual testing in browser

## Styling Approach
- Tailwind classes for layout and basic styling
- Component-specific CSS-in-JS via Lit's `css` template literal
- Consistent padding: `1rem` on panel components
- White backgrounds with `border-radius: 0.5rem` for panels
- Responsive breakpoint: `768px` for mobile/desktop layouts

## State Management
- No central state management - each component manages its own state
- Cross-component communication via localStorage
- InputPanel reloads prompts from localStorage before each conversion
- User preferences (last selected prompt/model) automatically persist and restore
