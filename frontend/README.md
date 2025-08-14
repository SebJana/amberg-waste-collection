# Amberg Waste Collection Frontend

A modern, responsive React application that allows residents of Amberg to easily search and view their waste collection schedules on any device

## Disclaimer

This project is an independent initiative and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Stadt Amberg or any of its subsidiaries, departments, or services. The schedule data provided is extracted via optical character recognition (OCR) from publicly available calendars. While greatest efforts have been made to ensure accuracy, no guarantee or warranty, express or implied, is given as to the completeness, accuracy, or reliability of the data. For the official and most up-to-date schedule, please refer to the Stadt Amberg website https://amberg.de/abfallberatung

## Features

* 🗓️ Real-time waste collection schedule lookup by zone code
* 📱 Responsive design with desktop optimization and mobile
* 🌍 Multi-language support (German & English)
* 🎨 Dark/light theme switching with persistence
* 🔄 Loading states and error handling with Lottie animations
* ♻️ Color-coded waste types for easy identification

## Project Structure

```
frontend/
├── src/
│   ├── api/                   # Axios configuration & API client
│   ├── components/            # Reusable UI components
│   │   ├── ZoneCodeInput/     # 2-digit zone code input
│   │   ├── NextPickupCard/    # Next pickup display
│   │   ├── SchedulePickupCard/# Schedule grid item
│   │   ├── LanguageSwitcher/  # i18n language toggle
│   │   ├── ThemeSwitcher/     # Dark/light mode toggle
│   │   └── LoadingSpinner/    # Lottie loading animation
│   ├── pages/                 # Route components
│   │   ├── HomePage/          # Landing page with zone input
│   │   └── SchedulePage/      # Schedule display page
│   ├── i18n/                  # Internationalization resources
│   ├── interfaces/            # TypeScript type definitions
│   ├── utilities/             # Helper functions
│   └── assets/                # Static assets & Lottie files
├── public/                    # Static public assets
├── nginx.conf                 # Production nginx configuration
└── Dockerfile                 # Multi-stage production build
```

## Installation

```bash
# Install dependencies
npm install
```

## Development

### Prerequisites

* Node.js 18+ 
* npm or yarn package manager

### Environment Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   Access at `http://localhost:5173`

3. **Backend API**: Ensure the backend is running for API calls
   * Development: Backend at `http://localhost:8000`
   * Docker: Configured for nginx proxy at `/api`

### Key Components

#### ZoneCodeInput
2-digit input component with:
* Individual digit focus management
* Backspace navigation between inputs

#### Theme System
CSS custom properties with automatic persistence:
* Light/dark mode toggle
* System preference detection
* Smooth transitions between themes

#### Internationalization
React-i18next configuration:
* German (default) and English support
* HTML lang attribute synchronization
* localStorage persistence

### Mobile Optimization

The app is optimized for mobile devices:
* **No zoom on input focus**: 16px minimum font size
* **Touch-friendly**: 44px minimum touch targets
* **Fast input**: Auto-focus and navigation between digits

### API Integration

Axios client configured for:
* Base URL: `/api` (nginx proxy in production)
* Error handling with typed responses
* Loading states for better UX

## Production Deployment

### Docker Compose (Recommended)

From project root:
```bash
# Start full application stack
docker-compose up

# Build and start in detached mode
docker-compose up -d --build
```

### Nginx Configuration

Production uses nginx with:
* Static file serving with gzip compression
* API proxy to backend at `/api/*`
* Security headers

## API Routes

The frontend expects these backend endpoints:

* `GET /next-pickups/{zone_code}` - Next pickup dates for zone
* `GET /pickups/{zone_code}` - Complete pickup schedule for zone

Error handling for:
* 404: Invalid zone code
* 429: Rate limiting
* 503: Service unavailable

## Internationalization

### Adding Languages

1. Create new JSON file in `src/i18n/`
2. Add language to `LanguageSwitcher` component
3. Update i18next configuration

### Translation Keys

```typescript
// Homepage
t('home.title')
t('home.subtitle')
t('home.zonePlaceholder')

// Schedule page
t('schedule.title')
t('schedule.nextPickups')

// Waste types
t('wasteTypes.restmuell')
t('wasteTypes.papier')
// etc.
```

## Styling

### CSS Architecture

* **CSS Custom Properties**: Theme variables in `:root`
* **Component-scoped**: Each component has its own CSS file
* **Utility classes**: Common patterns in `index.css`

### Theme Variables

```css
:root {
  --color-primary: #2563eb;
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --spacing-xs: 0.5rem;
  --border-radius: 0.5rem;
  /* etc. */
}
```

## Installation

**Install dependencies**:
   ```bash
   npm install
   ```

## Development

**Start development server**:
   ```bash
   npm run dev
   ```
   
   Application will be available at `http://localhost:5173`

## Configuration

### Environment Variables

The frontend expects the backend API to be available at `/api` when running in production (handled by nginx proxy).

For development, the API base URL is configured in `src/api/axios.ts`.

### Internationalization

Add new translations in `src/i18n/`:
- `de.json` - German translations
- `en.json` - English translations

Translation keys follow a hierarchical structure:
```json
{
  "home": {
    "title": "Welcome message",
    "description": "App description"
  },
  "zone_input": {
    "title": "Enter your collection zone:",
    "button": "Search"
  }
}
```

## Docker Deployment

1. **Build container**:
   ```bash
   docker build -t amberg-waste-frontend .
   ```

2. **Run container**:
   ```bash
   docker run -p 80:80 amberg-waste-frontend
   ```

3. **With docker-compose** (recommended):
   ```bash
   # From project root
   docker-compose up
   ```

## API Integration

The frontend communicates with the backend API for:

* **Zone validation** - Checking if entered zone codes exist
* **Schedule data** - Fetching pickup schedules for specific zones
* **Next pickups** - Getting upcoming collection dates

API responses are typed with TypeScript interfaces in `src/interfaces/`.