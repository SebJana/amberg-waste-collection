# Amberg Waste Collection

A full-stack web application for looking up waste collection schedules in Amberg, Germany. The system extracts data from the official PDF calendars using OCR and serves it through a modern web interface.

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
- **Backend**: FastAPI + Python + EasyOCR + Redis
- **Deployment**: Docker + nginx + Multi-container setup

## ✨ Features

### User Features
- 🗓️ **Schedule Lookup**: Enter zone code to view pickup dates
- 📱 **Mobile Optimized**: Touch-friendly responsive design  
- 🌍 **Multilingual**: German and English support
- 🎨 **Dark/Light Theme**: Automatic system preference detection
- ♻️ **Color-coded Types**: Easy waste type identification

### Technical Features
- 📄 **PDF OCR Extraction**: Automated calendar data extraction
- 🧠 **Smart Data Processing**: Holiday filtering and cleanup
- ⚡ **High Performance**: Redis caching and optimized frontend
- 🔄 **Real-time API**: Fast waste collection data access
- 🐳 **Docker Ready**: Complete containerized deployment

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- (Optional) Node.js 18+ for frontend development
- (Optional) Python 3.12+ for backend development

### Run the Complete Application

```bash
# Clone repository
git clone https://github.com/SebJana/amberg-waste-collection.git
cd amberg-waste-collection

# Start all services
docker-compose up

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8000
```

### Development Setup

For detailed development instructions, see the component READMEs:

- **[Frontend Development](./frontend/README.md)** - React app setup, components, styling
- **[Backend Development](./backend/README.md)** - Python setup, OCR pipeline, API

## 📋 Usage

1. **Access the web app** at `http://localhost`
2. **Enter your zone code** (4-digit number)
3. **View pickup schedule** with next dates and full calendar
4. **Switch languages** using the flag icon
5. **Toggle theme** using the theme switcher


### Custom PDF Calendars
To process new PDF calendars:

1. **Place PDFs** in `backend/resources/pdf_waste_collection_plans/`
2. **Update bounding box** coordinates in `backend/src/data_extraction/main.py`
3. **Run extraction**: `python backend/src/data_extraction/main.py`

See [backend README](./backend/README.md) for detailed OCR configuration.

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
