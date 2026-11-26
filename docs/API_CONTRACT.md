# AMMAN REAL ESTATE – API Contract Specification

## 1. Overview & Protocol Guidelines

- **Base URL:** `/api/v1`
- **Content-Type:** `application/json`
- **Protocol:** HTTPS (RESTful API)
- **Authentication:** Bearer JWT in `Authorization: Bearer <token>` header for `/api/v1/admin/**` endpoints.
- **Publishing Constraint:** Public endpoints **only** return properties with `status = 'PUBLISHED'`. Listings in `DRAFT`, `UNPUBLISHED`, or `SOLD` status are inaccessible to public callers.

---

## 2. Standard Response Envelopes

### Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully.",
  "timestamp": "2026-11-25T18:30:00Z"
}
```

### Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Plot size is required for Land category.",
    "details": [
      { "field": "plotSizeValue", "issue": "Must be greater than 0" }
    ]
  },
  "timestamp": "2026-11-25T18:30:00Z"
}
```

---

## 3. Public API Endpoints (No Authentication Required)

### 3.1. Health Check
`GET /api/v1/health`
- **Description:** Verifies service availability.
- **Response `200 OK`:**
```json
{
  "status": "UP",
  "service": "AMMAN REAL ESTATE Backend API",
  "version": "1.0.0",
  "timestamp": "2026-11-25T18:30:00Z"
}
```

---

### 3.2. List Published Properties
`GET /api/v1/properties`
- **Query Parameters:**
  - `category` (optional): `RESIDENTIAL`, `LAND`, `COMMERCIAL`
  - `page` (optional, default `0`): Page index
  - `size` (optional, default `12`): Items per page
  - `sort` (optional, default `publishedAt,desc`): Sort order
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "c1f7b8a2-...",
        "title": "Contemporary Independent House near Medical College Road",
        "slug": "contemporary-independent-house-medical-college-road",
        "category": "RESIDENTIAL",
        "categoryDisplay": "Residential House",
        "location": "Medical College Road, Thanjavur",
        "areaSector": "Medical College Residential Sector",
        "plotSize": { "value": 1500, "unit": "sq.ft" },
        "buildingSize": { "value": 1850, "unit": "sq.ft" },
        "borewell": true,
        "numberOfRooms": 4,
        "numberOfToilets": 3,
        "totalPrice": 6500000,
        "coverImageUrl": "https://cdn.ammanrealestate.com/properties/house-01/cover.webp",
        "publishedAt": "2026-11-25T12:00:00Z"
      }
    ],
    "page": 0,
    "size": 12,
    "totalElements": 6,
    "totalPages": 1
  }
}
```

---

### 3.3. Get Published Property by Slug
`GET /api/v1/properties/{slug}`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "c1f7b8a2-...",
    "title": "Contemporary Independent House near Medical College Road",
    "slug": "contemporary-independent-house-medical-college-road",
    "description": "Representative residential house in Thanjavur...",
    "category": "RESIDENTIAL",
    "location": "Medical College Road, Thanjavur",
    "areaSector": "Medical College Residential Sector",
    "plotSize": { "value": 1500, "unit": "sq.ft" },
    "buildingSize": { "value": 1850, "unit": "sq.ft" },
    "borewell": true,
    "numberOfRooms": 4,
    "numberOfToilets": 3,
    "totalPrice": 6500000,
    "images": [
      {
        "id": "img-01",
        "imageUrl": "https://cdn.ammanrealestate.com/properties/house-01/cover.webp",
        "isCover": true,
        "displayOrder": 0
      }
    ],
    "publishedAt": "2026-11-25T12:00:00Z"
  }
}
```
- **Response `404 Not Found`:** Returned if the property does not exist or its status is not `PUBLISHED`.

---

### 3.4. Get Property Categories Metadata
`GET /api/v1/properties/categories`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    { "id": "RESIDENTIAL", "title": "Residential Houses", "slug": "residential-houses" },
    { "id": "LAND", "title": "Land & Plots", "slug": "land-plots" },
    { "id": "COMMERCIAL", "title": "Commercial Properties", "slug": "commercial" }
  ]
}
```

---

## 4. Admin API Endpoints (JWT Authentication Required)

### 4.1. Admin Login
`POST /api/v1/auth/login`
- **Authentication:** None (Public login endpoint).
- **Request Body:**
```json
{
  "email": "dad@ammanrealestate.com",
  "password": "SecurePassword123"
}
```
- **Validation Rules:**
  - `email`: Required, valid email format, max 150 characters.
  - `password`: Required, max 100 characters.

- **Response `200 OK` (Successful Authentication):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "admin": {
      "id": "c1f7b8a2-7201-49b8-bc85-9cb1bfb4ef01",
      "fullName": "Amman Real Estate Founder",
      "email": "dad@ammanrealestate.com",
      "role": "ROLE_ADMIN"
    }
  }
}
```

- **Response `401 Unauthorized` (Invalid Credentials or Disabled Account):**
```json
{
  "success": false,
  "message": "Invalid email or password.",
  "timestamp": "2026-11-26T00:00:00Z"
}
```
*Note:* The exact same message is returned for non-existent emails, mismatched passwords, and deactivated accounts to eliminate email enumeration vulnerabilities.

- **Response `400 Bad Request` (Validation Failure):**
```json
{
  "success": false,
  "message": "Validation failed for request payload.",
  "errors": {
    "email": "Please provide a valid email address",
    "password": "Password is required"
  },
  "timestamp": "2026-11-26T00:00:00Z"
}
```

- **Production Brute-Force Rate Limiting Requirement:**
  - Login attempts must be throttled at the infrastructure / gateway level (e.g., Cloudflare WAF rate limiting rules or reverse proxy token-bucket filter).
  - Recommended threshold: 5 failed login attempts per IP / email per 15-minute window before triggering HTTP 429 (Too Many Requests).
  - Avoid fragile in-memory rate limiters that desynchronize across multiple production container instances.

- **Security Rule:** Public registration is disabled. Admin accounts are seeded or provisioned through secure backend administration commands.

---

### 4.2. Admin Dashboard Overview
`GET /api/v1/admin/dashboard`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "totalProperties": 18,
    "publishedCount": 12,
    "draftCount": 4,
    "soldCount": 2,
    "categoryBreakdown": {
      "RESIDENTIAL": 8,
      "LAND": 6,
      "COMMERCIAL": 4
    }
  }
}
```

---

### 4.3. List All Admin Properties (With Filter by Status)
`GET /api/v1/admin/properties?status=ALL&page=0&size=20`
- **Response `200 OK`:** Lists all properties regardless of status, including draft and sold items.

---

### 4.4. Create Property
`POST /api/v1/admin/properties`
- **Request Body:**
```json
{
  "title": "Prime Villa Plot in Vallam Corridor",
  "description": "Surveyed plot located in developing residential sector...",
  "category": "LAND",
  "location": "Vallam, Thanjavur",
  "areaSector": "Vallam - Trichy Highway Corridor",
  "plotSizeValue": 2400,
  "plotSizeUnit": "sq.ft",
  "borewell": false,
  "totalPrice": 2800000,
  "publishImmediately": false
}
```
- **Response `201 Created`:** Returns created property object with status `DRAFT` (or `PUBLISHED` if flagged).

---

### 4.5. Status Management Actions
- **Publish:** `POST /api/v1/admin/properties/{id}/publish` → Sets status to `PUBLISHED`, updates `published_at = NOW()`.
- **Unpublish:** `POST /api/v1/admin/properties/{id}/unpublish` → Sets status to `UNPUBLISHED` (immediately removes from public catalog).
- **Mark Sold:** `POST /api/v1/admin/properties/{id}/mark-sold` → Sets status to `SOLD` (removes from public active inventory).
