# 🏷️ Stamp Management System

A modern web application for managing stamp collections and postage rates, built with **Node.js**, **Express.js**, **SQLite**, and **Vite**.

## 🚀 Features

- **Stamp Collection Management**: Add, edit, delete, and track stamp inventory
- **Postage Rate Management**: Maintain current postage rates for different mail types
- **Real-time API**: RESTful backend with automatic frontend integration
- **Fallback Support**: Graceful fallback to mock data when backend is unavailable
- **Modern UI**: Clean, responsive interface built with vanilla JavaScript
- **Type Safety**: Input validation and error handling
- **Performance**: Optimized SQLite database with prepared statements

## 🏗️ Architecture

### Backend (Node.js + Express)
- **REST API**: Full CRUD operations for stamps and postage rates
- **SQLite Database**: High-performance with better-sqlite3
- **Security**: Helmet, CORS, rate limiting
- **Validation**: Express-validator for input sanitization
- **Error Handling**: Comprehensive error responses

### Frontend (Vite + Vanilla JS)
- **Modern Bundling**: Vite for fast development and optimized builds
- **API Integration**: Automatic backend detection with mock fallback
- **Responsive UI**: Clean, accessible interface
- **Real-time Updates**: Live data synchronization

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stamp-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup** (optional)
   ```bash
   cp .env.example .env
   # Edit .env with your preferences
   ```

## 🎯 Usage

### Development Mode (Recommended)

Start both frontend and backend simultaneously:
```bash
npm start
```

This will run:
- Backend API server on `http://localhost:3001`
- Frontend dev server on `http://localhost:5173`
- Automatic sample data loading
- Hot reload for both frontend and backend

### Manual Mode

**Start Backend Only:**
```bash
npm run server
# or for auto-restart on changes:
npm run server:dev
```

**Start Frontend Only:**
```bash
npm run dev
```

**Build for Production:**
```bash
npm run build
npm run preview
```

## 🧪 Testing

The project uses **Vitest** for testing with separate configurations for frontend and backend. Total coverage: **50 tests** (38 frontend + 12 backend).

### Test Commands

**Frontend Tests (jsdom environment):**
```bash
# Run frontend tests once
npm run test:run

# Run frontend tests in watch mode
npm test

# Run with coverage
npm run test:coverage
```

**Backend Tests (Node.js environment):**
```bash
# Run backend API tests once
npm run test:backend:run

# Run backend tests in watch mode
npm run test:backend
```

**All Tests:**
```bash
# Run both frontend and backend tests
npm run test:all
```

### Test Coverage

**Frontend Tests (38 tests):**
- **main.test.js** (8 tests): Application initialization and setup
- **stamp-manager.test.js** (20 tests): Complete StampManager component integration testing
  - Component initialization and UI structure
  - Data loading with API integration
  - UI rendering for stamps and rates
  - Tab navigation functionality
  - Modal operations (add/edit forms)
  - CRUD operations with form validation
  - Error handling and user feedback
- **combRep.test.js** (10 tests): Mathematical combination algorithms

**Backend Tests (12 tests):**
- **backend.test.js**: Full API endpoint integration testing
  - Health check endpoints
  - Stamp collection CRUD operations
  - Postage rates management
  - Input validation and error handling
  - HTTP status codes and responses

**Manual API Testing:**
```bash
# Quick API verification (server must be running)
node test-api.js
```

## 📚 API Documentation

### Base URL
- Development: `http://localhost:3001/api`
- The frontend automatically proxies `/api/*` requests to the backend

### Endpoints

#### Stamp Collection
- `GET /api/stamps/collection` - List all stamps
- `POST /api/stamps/collection` - Add new stamp
- `GET /api/stamps/collection/:id` - Get specific stamp
- `PUT /api/stamps/collection/:id` - Update stamp quantity
- `PATCH /api/stamps/collection/:id` - Update entire stamp
- `DELETE /api/stamps/collection/:id` - Delete stamp

#### Postage Rates  
- `GET /api/stamps/postage-rates` - List all rates
- `POST /api/stamps/postage-rates` - Add/update rate
- `GET /api/stamps/postage-rates/:name` - Get specific rate
- `PUT /api/stamps/postage-rates/:name` - Update rate
- `DELETE /api/stamps/postage-rates/:name` - Delete rate

#### System
- `GET /health` - Health check

### Data Models

**Stamp:**
```json
{
  "id": 1,
  "name": "Standard Letter Stamp", 
  "val": 120,  // cents
  "n": 50,     // quantity
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**Postage Rate:**
```json
{
  "id": 1,
  "name": "Standard Letter",
  "rate": 120,  // cents  
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
PORT=3001
NODE_ENV=development
DB_PATH=./database/stamps.db
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
```

**Frontend (.env.development):**
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_NODE_ENV=development
```

## 📁 Project Structure

```
stamp-management-system/
├── backend/                 # Node.js Express API
│   ├── server.js           # Main server file
│   ├── database.js         # Database layer
│   ├── routes.js           # API routes
│   └── README.md           # Backend documentation
├── database/               # SQLite database
│   ├── schema.sql          # Database schema
│   ├── sample_data.sql     # Sample data
│   ├── database.py         # Legacy Python interface
│   └── stamps.db           # SQLite database file
├── src/                    # Frontend source
│   ├── main.js            # Application entry point
│   ├── StampManager.js    # Main UI component
│   ├── style.css          # Styles
│   ├── api/
│   │   └── stamps.js      # API client with auto-detection
│   └── test/              # Test files
├── public/                # Static assets
├── test-api.js           # Manual API testing script
├── package.json           # Dependencies and scripts
├── vite.config.js        # Vite configuration  
├── vitest.config.js      # Frontend test configuration
└── vitest.backend.config.js # Backend test configuration
```

## 🌟 Key Features

### Smart API Detection
The frontend automatically detects if the backend is available and falls back to mock data seamlessly.

### Optimized Database
- WAL mode for concurrent access
- Prepared statements for performance
- Automatic schema initialization
- Sample data loading

### Modern Development
- Hot reload for both frontend and backend
- Comprehensive error handling
- Input validation and sanitization
- Rate limiting and security headers

### Responsive Design
- Clean, modern UI
- Mobile-friendly responsive layout
- Accessible components
- Loading states and error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.