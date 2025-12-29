# Amberg Waste Collection Frontend

A modern, responsive React application that allows residents of Amberg to easily search and view their waste collection schedules on any device

## Features

- 🗓️ Real-time waste collection schedule lookup by zone code
- 📱 Responsive design with desktop optimization and mobile
- 🌍 Multi-language support (German & English)
- 🎨 Dark/light theme switching with persistence
- 🔄 Loading states and error handling with animations
- ♻️ Color-coded waste types for easy identification

## Project Structure

```
frontend/
├── src/
│   ├── api/                   # API client with cache management
│   │   ├── axios.ts           # Axios instance setup
│   │   ├── wasteAPI.ts        # Barrel file: cache config & re-exports
│   │   ├── pickupsAPI.ts      # Next pickups API & cache
│   │   ├── scheduleAPI.ts     # Schedule API & cache
│   │   └── streetMappingAPI.ts# Street mapping APIs & cache
│   ├── components/            # Reusable UI components
│   │   ├── BinLogo/           # Waste bin logo component
│   │   ├── LanguageSwitcher/  # i18n language toggle
│   │   ├── LoadingSpinner/    # Lottie loading animation
│   │   ├── MapComponent/      # Street map display
│   │   ├── NextPickupCard/    # Next pickup display
│   │   ├── SchedulePickupCard/# Schedule grid item
│   │   ├── StreetInput/       # Street name input component
│   │   ├── ThemeSwitcher/     # Dark/light mode toggle
│   │   └── ZoneCodeInput/     # 2-digit zone code input
│   ├── pages/                 # Route components
│   │   ├── HomePage/          # Landing page with zone/street input
│   │   └── SchedulePage/      # Schedule display page
│   ├── i18n/                  # Internationalization resources
│   │   ├── de.json            # German translations
│   │   └── en.json            # English translations
│   ├── types/                 # TypeScript type definitions
│   │   ├── nextPickups.ts     # Next pickup types
│   │   ├── schedule.ts        # Schedule types
│   │   └── streetZones.ts     # Street and zone types
│   ├── utilities/             # Helper functions
│   │   ├── dateFormatter.ts   # Date formatting utilities
│   │   ├── validZoneCode.ts   # Zone code validation
│   │   └── wasteTypeColors.ts # Waste type color mapping
│   ├── assets/                # Static assets & Lottie files
│   │   ├── 404.json           # 404 error animation
│   │   ├── TooManyRequests.json # Rate limit animation
│   │   └── UnderMaintenance.json # Maintenance animation
│   ├── App.tsx                # Root component
│   ├── App.css                # Root styles
│   ├── main.tsx               # React entry point
│   ├── index.css              # Global styles
│   └── vite-env.d.ts          # Vite environment types
├── public/                    # Static public assets
│   └── bin.svg                # Waste bin SVG icon
├── nginx.conf                 # Production nginx configuration
├── Dockerfile                 # Multi-stage production build
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── tsconfig.app.json          # TypeScript app configuration
├── tsconfig.node.json         # TypeScript node configuration
├── eslint.config.js           # ESLint configuration
├── package.json               # Dependencies and scripts
└── index.html                 # HTML entry point
```

## Installation

```bash
# Install dependencies
npm install
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn package manager

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
   - Development: Backend at `http://localhost:5000`
   - Docker: Configured for nginx proxy at `/api`

### Key Components

#### ZoneCodeInput

2-digit input component with:

- Individual digit focus management
- Backspace navigation between inputs

#### Theme System

CSS custom properties with automatic persistence:

- Light/dark mode toggle
- System preference detection
- Smooth transitions between themes

#### Internationalization

React-i18next configuration:

- German (default) and English support
- HTML lang attribute synchronization
- localStorage persistence

### API Integration

The API layer is organized into focused modules for maintainability:

**API Modules** (`src/api/`):

- `wasteAPI.ts` - Barrel file with cache configuration and re-exports
  - Centralizes `CACHE_MAX_AGE` (5 minutes) and all cache keys
  - Single import point for components
- `pickupsAPI.ts` - Next pickups endpoint with cache management
- `scheduleAPI.ts` - Schedule endpoint with cache management
- `streetMappingAPI.ts` - Street zone and coordinates endpoints with cache management

**Cache Strategy**:

- Separate cache keys for each data type enable independent invalidation
- 5-minute TTL balances freshness with server load (no heavy work on requests)
- Intelligent validation: schedule cache invalidates on zone change or date change
- localStorage persistence with automatic TTL checking

**Axios Configuration**:

- Base URL: `/api` (nginx proxy in production)
- Typed responses with TypeScript
- Error handling for better UX

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

- Static file serving with gzip compression
- API proxy to backend at `/api/*`
- Security headers

## API Routes

The frontend communicates with the backend API at `/api`. All routes support automatic client-side caching with a 5-minute TTL.

### Waste Collection Routes

- `GET /waste-collection/{zone_code}/next` - Get next pickup dates for a specific zone
- `GET /waste-collection/{zone_code}/schedule` - Get complete waste collection schedule for a specific zone
- `GET /waste-collection/street-zone-mapping` - Get mapping of streets to zone codes
- `GET /waste-collection/street-coordinates-mapping` - Get street coordinates with zone information for map display

### Error Handling

The API handles the following error cases:

- `404: Not Found` - Invalid zone code or street name
- `429: Too Many Requests` - Rate limiting exceeded
- `500/503: Service Unavailable` - Backend maintenance or unavailable

## Internationalization

### Adding Languages

1. Create new JSON file in `src/i18n/`
2. Add language to `LanguageSwitcher` component
3. Update i18next configuration

### Translation Keys

```typescript
// Homepage
t("home.title");
t("home.subtitle");
t("home.zonePlaceholder");

// Schedule page
t("schedule.title");
t("schedule.nextPickups");

// Waste types
t("wasteTypes.restmuell");
t("wasteTypes.papier");
// etc.
```

## Styling

### CSS Architecture

- **CSS Custom Properties**: Theme variables in `:root`
- **Component-scoped**: Each component has its own CSS file
- **Utility classes**: Common patterns in `index.css`

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

- **Zone validation** - Checking if entered zone codes exist
- **Schedule data** - Fetching pickup schedules for specific zones
- **Next pickups** - Getting upcoming collection dates
- **Street coordinates** - Fetching street geographic coordinates for map display

### Caching

All API requests use client-side caching in localStorage with intelligent cache invalidation:

- **5-minute TTL**: Cache expires automatically after 5 minutes
- **Validation logic**: Cache is invalidated when zone selection changes or reference date differs
- **Implementation**: Located in `src/api/wasteAPI.ts` with dedicated cache management functions

API responses are typed with TypeScript interfaces in `src/types/`.
