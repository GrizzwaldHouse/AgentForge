# Universal Artifact Viewer & Sync Manager

A project-agnostic workspace for managing repository documentation and synchronization.

## Features
- **Mobile-Modular JSX Viewer**: Fully responsive UI for iOS, Android, and Windows Phone.
- **Python Sync Manager**: Automated Git hooks to mirror content across repositories.
- **Standards-Driven**: Logic is decoupled from configuration following the 95/5 rule.

## Getting Started

### Local Development
1. Install dependencies: `npm install`
2. Run the viewer: `npm run dev`

### Python Sync Hook
1. Navigate to `/hooks`.
2. Run `python sync_manager.py`. 
3. This script validates boundaries and file integrity before performing a sync.

### Deploying to Apple Store (iOS)
This project is pre-configured for **Capacitor**. 
1. Build the React project: `npm run build`
2. Add iOS platform: `npx cap add ios`
3. Open in Xcode for submission: `npx cap open ios`

## Reusability Strategy
To adapt this for a new repository, update `/config/sync_config.json`. The core logic in `/src` and `/hooks` is designed to be immutable.
