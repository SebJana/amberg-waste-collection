# Amberg Waste Collection API

This document summarizes the backend API endpoints. Interactive docs are available at `/docs` and the OpenAPI spec at `/openapi.json` when the backend is running.

Base path: `/api/waste-collection`

- GET `/api/waste-collection/{zone_code}/next`

  - Summary: Get next pickups for a zone
  - Description: Returns the next upcoming waste collection(s) for the given zone code.
  - Note: The response includes a `reference_date` field in UTC (YYYY-MM-DD).
  - Responses: `200` OK, `404` Zone not found, `500` Server error

- GET `/api/waste-collection/{zone_code}/schedule`

  - Summary: Get future schedule for a zone
  - Description: Returns the upcoming waste collection schedule for the given zone code.
  - Note: The response includes a `reference_date` field in UTC (YYYY-MM-DD).
  - Responses: `200` OK, `404` Zone not found, `500` Server error

- GET `/api/waste-collection/street-zone-mapping`

  - Summary: Get street name → zone mapping
  - Description: Returns a mapping of street names to their waste collection zone codes. Clients should filter/search locally.
  - Responses: `200` OK, `500` Server error

- GET `/api/waste-collection/street-coordinates-mapping`
  - Summary: Get street name → zone → coordinates mapping
  - Description: Returns a full mapping of street names to zone codes and geo-coordinates for client-side map rendering.
  - Responses: `200` OK, `500` Server error

Running locally:

1. Start backend (from repo root):

```powershell
docker compose up --build
```

2. Visit interactive Swagger UI: `http://localhost:<backend-port>/docs`
