# Amberg Waste Collection

A full-stack web application for looking up waste collection schedules in Amberg, Germany. The system extracts data from the official PDF calendars using OCR and serves it through a modern web interface.

## Disclaimer

This project is an independent initiative and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Stadt Amberg or any of its subsidiaries, departments, or services. The schedule data provided is extracted via optical character recognition (OCR) from publicly available calendars. While greatest efforts have been made to ensure accuracy, no guarantee or warranty, express or implied, is given as to the completeness, accuracy, or reliability of the data. For the official and most up-to-date schedule, please refer to the Stadt Amberg website https://amberg.de/abfallberatung

## 🏗️ Architecture

```
amberg-waste-collection/
├── frontend/          # React TypeScript web app
├── backend/           # FastAPI Python service
├── docker-compose.yml # Complete application stack
└── README.md         # This file
```

**Tech Stack:**

- **Frontend**: React 19 + TypeScript + Vite + i18next
- **Backend**: FastAPI + Python + EasyOCR
- **Deployment**: Docker + nginx + Multi-container setup

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- (Optional) Node.js 18+ for frontend development
- (Optional) Python 3.11+ for backend development

### Run the Complete Application

```bash
# Clone repository
git clone https://github.com/SebJana/amberg-waste-collection.git
cd amberg-waste-collection

# Start all services
docker-compose up

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:5000
```

### Development Setup

For detailed development instructions, see the component READMEs:

- **[Frontend Development](./frontend/README.md)** - React app setup, components, styling
- **[Backend Development](./backend/README.md)** - Python setup, OCR and data cleansing pipeline, API

## 📋 Usage

1. **Access the web app** at `http://localhost` or `http://127.0.0.1`
2. **Enter your zone code** (2-digit letter and number combination)
3. **View pickup schedule** with next dates and full calendar
4. **Switch languages** using the flag icon
5. **Toggle theme** using the theme switcher

### Custom PDF Calendars

To process new PDF calendars:

1. **Place PDFs** in `backend/resources/pdf_waste_collection_plans/` and `backend/resources/street_zones_mapping/
2. **Update bounding box** coordinates in `backend/src/data_extraction/main.py`
3. **Update used year** in `backend/src/data_extraction/main.py`
4. **Run extraction**: `python backend/src/data_extraction/main.py`

See [backend README](./backend/README.md) for detailed OCR configuration and data updates.

## 🏭 Production Deployment

### Docker Compose (Recommended)

```bash
# Production build and start
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
