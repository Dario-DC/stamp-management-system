# Node.js Backend for Stamp Management System

This directory contains the Node.js Express.js backend API for the Stamp Management System.

## Architecture

- **Express.js**: Web framework for REST API
- **better-sqlite3**: High-performance SQLite database driver
- **Input Validation**: Express-validator for request validation
- **Security**: Helmet for security headers, CORS for cross-origin requests
- **Rate Limiting**: Express-rate-limit for API protection

## API Endpoints

### Stamp Collection

- `GET /api/stamps/collection` - Get all stamps
- `GET /api/stamps/collection/:id` - Get specific stamp
- `POST /api/stamps/collection` - Add new stamp
- `PUT /api/stamps/collection/:id` - Update stamp quantity
- `PATCH /api/stamps/collection/:id` - Update entire stamp
- `DELETE /api/stamps/collection/:id` - Delete stamp

### Postage Rates

- `GET /api/stamps/postage-rates` - Get all postage rates
- `GET /api/stamps/postage-rates/:name` - Get specific rate
- `POST /api/stamps/postage-rates` - Add/update postage rate
- `PUT /api/stamps/postage-rates/:name` - Update postage rate
- `DELETE /api/stamps/postage-rates/:name` - Delete postage rate

### System

- `GET /health` - Health check endpoint

## Data Models

### Stamp Collection
```json
{
  "id": 1,
  "name": "Standard Letter Stamp",
  "val": 120,  // Value in cents
  "n": 50,     // Quantity
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### Postage Rate
```json
{
  "id": 1,
  "name": "Standard Letter",
  "rate": 120,  // Rate in cents
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

## Configuration

The backend uses environment variables for configuration:

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `DB_PATH`: SQLite database path
- `ALLOWED_ORIGINS`: CORS allowed origins

## Error Handling

- **400**: Bad Request (validation errors)
- **404**: Not Found (resource doesn't exist)
- **429**: Too Many Requests (rate limiting)
- **500**: Internal Server Error

All errors return JSON with an `error` field describing the issue.

## Performance Features

- **Database**: Prepared statements for optimal SQL performance
- **Connection Pool**: SQLite WAL mode for concurrent reads
- **Validation**: Input validation at the API layer
- **Rate Limiting**: Protects against abuse

## Development

The backend automatically loads sample data when running in development mode with an empty database.
