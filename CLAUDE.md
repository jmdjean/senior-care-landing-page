# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Senior Care landing page - a single-page website for an elderly care home in Brazil. Built with Angular 21 using standalone components and an HTML template with custom CSS/JS.

## Commands

```bash
npm start          # Start dev server (http://localhost:4200)
npm run build      # Production build (outputs to dist/)
npm test           # Run unit tests with Vitest
npm run watch      # Dev build with watch mode
```

## Architecture

### Template Integration Pattern

The project integrates a static HTML template into Angular through a specific pattern:

1. **Static assets** are in `src/template/` and copied to `template/` in the build output via `angular.json` asset configuration
2. **CSS files** (`vendor.css`, `styles.css`) are loaded globally through `angular.json` styles array
3. **JS scripts** (`plugins.js`, `main.js`) are loaded dynamically at runtime via `App.loadScript()` in `ngAfterViewInit`

### Component Structure

- Single standalone `App` component (`src/app/app.ts`) with inline template in `app.html`
- No routing currently configured (empty `routes` array in `app.routes.ts`)
- All page content is in `app.html` as a single-page landing

### Key Files

- `src/app/app.ts` - Main component with dynamic script loading
- `src/app/app.html` - Full landing page HTML (header, sections, footer)
- `src/template/js/main.js` - Template interactivity (smooth scroll, preloader, etc.)
- `angular.json` - Build configuration including template asset copying

### Styling

Global styles loaded in order:
1. `src/template/css/vendor.css` - Third-party CSS
2. `src/template/css/styles.css` - Template styles
3. `src/styles.css` - Angular global styles

### Configuration

- Prettier configured in `package.json` with Angular HTML parser
- Component prefix: `app`
- TypeScript 5.9, Angular 21
