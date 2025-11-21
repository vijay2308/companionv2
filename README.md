# AI Companion Mobile App

A stunning Perplexity-inspired AI companion mobile application built with React Native and Expo.

## Features

- 🎨 **Beautiful UI**: Perplexity-inspired dark theme with animated gradients
- ✨ **Smooth Animations**: Premium micro-interactions and transitions
- 🎙️ **Voice Input**: Integrated speech recognition
- 💬 **Conversational AI**: Natural language interaction
- 📱 **Cross-Platform**: Works on iOS, Android, and Web

## Tech Stack

- React Native 0.81
- Expo SDK 54
- React Navigation 7
- React Native Reanimated 4
- TypeScript
- Lucide Icons

## Deployment

### Installation

```bash
npm install
```

This will automatically install all dependencies including the mobile app dependencies.

### Development

```bash
npm start
# or
npm run dev
```

The app will be available at `http://localhost:8080`

### Build

```bash
npm run build
```

### Platform-Specific Development

```bash
# iOS
cd mobile && npm run ios

# Android
cd mobile && npm run android

# Web
npm run web
```

## Project Structure

```
.
├── mobile/              # React Native mobile app
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── screens/     # App screens
│   │   ├── navigation/  # Navigation setup
│   │   ├── services/    # API and services
│   │   └── constants/   # Theme and constants
│   └── package.json
├── backend/             # Backend services
├── packages/            # Shared packages
└── package.json         # Root package config
```

## Environment

- Node.js >= 18.0.0
- npm >= 9.0.0

## Design System

The app uses a Perplexity-inspired design system with:
- Dark mode color palette
- 8px spacing system
- Consistent border radius scale
- Glassmorphic effects
- Smooth animations (300-600ms)

## License

Private
