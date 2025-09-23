# Development Roadmap

This document outlines the planned development phases for the Stamp Management System.

## MVP (Minimum Viable Product) 🎯 **CURRENT FOCUS**

**Goal**: Single-user Italian stamp collection management with ITL/EUR conversion support

### MVP Scope
- [ ] **Single User**: No authentication, one collection per installation
- [ ] **Italy Focus**: Poste Italiane rates and Italian stamp denominations
- [ ] **Dual Currency Support**: Handle both ITL (pre-2002) and EUR stamps
- [ ] **Currency Conversion**: Automatic ITL to EUR conversion (1 EUR = 1936.27 ITL)
- [ ] **Flexible Values**: Accept any stamp value (not just standard denominations)
- [ ] **Basic CRUD**: Add, view, edit, delete stamps in collection
- [ ] **Simple Calculations**: Generate stamp combinations for target postage amounts
- [ ] **Current Rates Only**: No advance rate planning or historical tracking

### MVP Features
- [ ] **Frontend**: Stamp collection interface with basic calculator
- [ ] **Backend**: Simple Node.js API with SQLite database
- [ ] **Database**: Basic stamp_collection table
- [ ] **Algorithm**: Fast combination generation (client-side)
- [ ] **Testing**: Core functionality tested and working

---

## Phase 1: Backend API Development 🎯 **NEXT**

### 1.1 Node.js Express/Fastify Backend
- [ ] Set up Node.js backend directory structure
- [ ] Choose framework (Express.js or Fastify)
- [ ] Create basic server structure
- [ ] Database connection and ORM setup (Prisma, TypeORM, or Sequelize)
- [ ] Environment configuration (.env support)
- [ ] CORS setup for frontend integration

### 1.2 MVP API Endpoints
- [ ] **Italian Stamps Management**
  - [ ] `GET /api/stamps` - List all stamps with converted EUR values
  - [ ] `POST /api/stamps` - Add new stamp (ITL or EUR)
  - [ ] `PUT /api/stamps/{id}` - Update stamp (name, value, currency, quantity)
  - [ ] `DELETE /api/stamps/{id}` - Remove stamp from collection
- [ ] **Currency Conversion**
  - [ ] `GET /api/conversion/itl-to-eur/{amount}` - Convert ITL to EUR
  - [ ] `GET /api/conversion/eur-to-itl/{amount}` - Convert EUR to ITL  
  - [ ] Built-in conversion: 1 EUR = 1936.27 ITL (fixed rate)
- [ ] **Italian Postage Calculator**
  - [ ] `POST /api/calculate` - Calculate combinations for target EUR amount
  - [ ] Input: target postage amount in EUR cents (e.g., 120 = €1.20)
  - [ ] Output: top 10 combinations using converted stamp values
- [ ] **Health Check**
  - [ ] `GET /api/health` - API status check

### 1.3 MVP Database Schema
```sql
-- Italian stamp collection with dual currency support
CREATE TABLE stamps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,              -- "Castello 100L", "Europa €0.65"
    value DECIMAL(10,4) NOT NULL,    -- Original value (100.0000 for ITL, 0.6500 for EUR)
    currency TEXT NOT NULL,          -- 'ITL' or 'EUR'
    value_eur_cents INTEGER NOT NULL, -- Always store EUR equivalent in cents for calculations
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_stamps_value_eur ON stamps(value_eur_cents);
CREATE INDEX idx_stamps_currency ON stamps(currency);

-- Update timestamp trigger
CREATE TRIGGER update_stamps_timestamp 
    AFTER UPDATE ON stamps
BEGIN
    UPDATE stamps SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Currency conversion constants table
CREATE TABLE currency_rates (
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    rate DECIMAL(10,4) NOT NULL,     -- 1936.2700 for ITL to EUR
    is_fixed BOOLEAN DEFAULT TRUE,   -- ITL/EUR conversion is fixed
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (from_currency, to_currency)
);

-- Insert the fixed ITL/EUR conversion rate
INSERT INTO currency_rates (from_currency, to_currency, rate) VALUES 
('ITL', 'EUR', 0.0005164),  -- 1 ITL = 0.0005164 EUR
('EUR', 'ITL', 1936.27);    -- 1 EUR = 1936.27 ITL
```

### 1.4 API Documentation & Testing
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Unit tests for all endpoints
- [ ] Integration tests
- [ ] Error handling and validation

---

## Future: Multi-Country & Multi-User Support 🌍 **LONG TERM**

### Multi-Country Features
- [ ] **Country Selection & Localization**
  - [ ] Country/postal service selection (USPS, Royal Mail, Canada Post, etc.)
  - [ ] Currency support (USD, GBP, CAD, EUR, etc.)
  - [ ] Localized number formatting and display
  - [ ] Country-specific stamp denominations and formats

- [ ] **Postal Service Integration**
  - [ ] Country-specific rate APIs where available
  - [ ] Different stamp types per country (Forever stamps vs standard)
  - [ ] Service level support (First Class, Priority, Express per country)
  - [ ] International postage calculations

- [ ] **User-Submitted Data Management**
  - [ ] Community-driven rate updates
  - [ ] User verification system for rate changes
  - [ ] Admin approval workflow for rate modifications
  - [ ] Historical rate data crowdsourcing

### Multi-User Architecture
- [ ] **User Management**
  - [ ] Authentication system (email/password, OAuth)
  - [ ] Personal stamp collections per user
  - [ ] User preferences (country, currency, default views)
  - [ ] Collection privacy settings

- [ ] **Advanced Features**
  - [ ] Collection sharing and comparison
  - [ ] Stamp trading marketplace
  - [ ] Community rate verification
  - [ ] Export/import between users

### Technical Infrastructure
- [ ] **Database Changes**
  - [ ] User accounts and authentication
  - [ ] Multi-tenant data isolation
  - [ ] Country/currency reference tables
  - [ ] User-submitted content moderation

- [ ] **API Evolution**
  - [ ] Multi-country endpoint structure
  - [ ] User authentication middleware
  - [ ] Rate limiting per user
  - [ ] Internationalization support

---

## Phase 1: MVP Backend Development 🏗️

## Immediate MVP Implementation (Week 1-2) 🚀

### Step 1: Basic Backend Setup
```bash
mkdir backend
cd backend
npm init -y
npm install express cors sqlite3 dotenv
npm install -D nodemon
```

### Step 2: Italian-Focused Backend Structure
```
backend/
├── server.js          # Express app entry point
├── database.js        # SQLite connection and setup
├── routes/
│   └── stamps.js      # CRUD endpoints for stamps
├── utils/
│   ├── calculator.js  # Combination calculation logic
│   └── currency.js    # ITL/EUR conversion utilities
└── package.json
```

### Step 3: Frontend Integration
- [ ] Update frontend for dual currency input (ITL/EUR)
- [ ] Display stamps with original value and EUR equivalent
- [ ] Currency conversion helper functions
- [ ] Italian postage rate context (current Poste Italiane rates)

### Step 4: MVP Testing with Italian Examples
```javascript
// Example Italian stamps in collection
const italianStamps = [
  { name: "Castello 50L", value: 50, currency: "ITL", eurCents: 3 },    // ~€0.026
  { name: "Castello 100L", value: 100, currency: "ITL", eurCents: 5 },   // ~€0.052  
  { name: "Castello 200L", value: 200, currency: "ITL", eurCents: 10 },  // ~€0.103
  { name: "Europa €0.65", value: 0.65, currency: "EUR", eurCents: 65 },
  { name: "Prioritaria €1.10", value: 1.10, currency: "EUR", eurCents: 110 }
];

// Calculate postage for €1.20 (120 EUR cents)
// Could use: 1×€1.10 + 1×€0.65 = €1.75 (overpayment)
// Or mix of ITL stamps: many combinations possible
```

**MVP Success Criteria:**
- ✅ Add stamps in either ITL or EUR with automatic conversion
- ✅ View all stamps with both original and EUR equivalent values  
- ✅ Edit and delete stamps with currency awareness
- ✅ Calculate combinations for EUR target amounts using mixed ITL/EUR stamps
- ✅ Handle any stamp value (not limited to standard denominations)
- ✅ Display Italian context (Poste Italiane rates)
- ✅ Client-server architecture working with currency conversion
- ✅ Basic error handling and validation for both currencies

---

## Phase 2: Enhanced Features 🔄
- [ ] Create API service layer in frontend
- [ ] HTTP client configuration (fetch or axios)
- [ ] Error handling for API calls
- [ ] Loading states management

### 2.2 Stamp Collection UI
- [ ] Stamp list view with search and filtering
- [ ] **Smart Sorting Options**:
  - [ ] By value: highest to lowest / lowest to highest
  - [ ] By quantity: most owned to least / least to most owned
  - [ ] Alphabetical by name (A-Z / Z-A)
  - [ ] By stamp type: Fixed value vs Variable value (Forever, A, B, etc.)
- [ ] **Add/Edit stamp form with validation**:
  - [ ] Fixed value stamps: direct value input
  - [ ] Variable value stamps: type selection (Forever, A, B, C, etc.)
  - [ ] Visual indicators for variable-value stamps
  - [ ] Current value display with "last updated" timestamp
- [ ] Quantity management (increment/decrement buttons)
- [ ] **Stamp Selection for Calculations**:
  - [ ] Multi-select stamps with checkboxes
  - [ ] "Use these stamps" - calculate remaining postage needed
  - [ ] "Exclude these stamps" - calculate without selected stamps
  - [ ] Selection summary (total value, total quantity)
  - [ ] Real-time value updates for variable stamps
- [ ] Delete confirmation dialogs
- [ ] **Variable Stamp Management**:
  - [ ] Bulk update values when postal rates change
  - [ ] Historical value tracking per stamp type
  - [ ] Import/export with current and historical values

### 2.3 Postage Calculator Interface
- [ ] **Quick Results** (always shown):
  - [ ] Target postage input with instant feedback
  - [ ] Top 3-5 combinations using fast algorithm
  - [ ] Efficiency badges (🏆 Fewest Stamps, 💰 Exact Match, etc.)
  - [ ] **Rate Context Switching**:
    - [ ] Toggle between "Current Rates" and "Upcoming Rates" (if within 7 days)
    - [ ] Clear visual indication of which rates are being used
    - [ ] Countdown timer showing days until rate change
    - [ ] Side-by-side comparison view (current vs upcoming calculations)
- [ ] **Advanced Selection Options**:
  - [ ] "Use specific stamps" - pre-select certain stamps, calculate remaining
  - [ ] "Exclude stamps" - calculate without certain stamps (save for special use)
  - [ ] "Must use" vs "Available" stamp distinction
  - [ ] Running total display as stamps are selected
- [ ] **Complete Analysis** (on demand):
  - [ ] "Show all combinations" button
  - [ ] Loading indicator for server processing
  - [ ] Paginated results for large result sets
  - [ ] Advanced filtering and sorting options
- [ ] **Visual Enhancements**:
  - [ ] Stamp usage visualization
  - [ ] Selection vs remaining postage breakdown
  - [ ] Performance metrics (calculation time, total combinations found)

## Phase 3: Enhanced Features 🚀

### 3.1 Data Management
- [ ] Import stamps from CSV/Excel
- [ ] Export collection data
- [ ] Backup and restore functionality
- [ ] Data validation and cleanup tools

### 3.2 User Experience Improvements
- [ ] Dark/Light theme toggle
- [ ] Responsive design for mobile devices
- [ ] Keyboard shortcuts for common actions
- [ ] **Smart Stamp Organization**:
  - [ ] Quick sort buttons (Value ↑↓, Quantity ↑↓, Name A-Z)
  - [ ] Sort persistence (remember user preference)
  - [ ] Compact vs detailed view toggle
- [ ] **Enhanced Selection Features**:
  - [ ] "Select all high-value" / "Select all low-value" quick buttons
  - [ ] "Select stamps I have most of" for bulk usage
  - [ ] Selection memory (remember commonly used combinations)
- [ ] **Rate Change Management UX**:
  - [ ] **Advance Preview Mode** (7 days before rate change):
    - [ ] Global toggle: "Show Current Rates" ↔ "Show Upcoming Rates"
    - [ ] Prominent countdown: "New rates in 3 days"
    - [ ] Impact summary: "Your collection value will increase by $4.50"
  - [ ] **Comparison Mode**:
    - [ ] Side-by-side current vs upcoming calculations
    - [ ] "Should I mail now or wait?" recommendations
    - [ ] Cost difference highlights for each combination
  - [ ] **Auto-Switch Notifications**:
    - [ ] Day-of notification: "Rates changed! Your Forever stamps are now worth 68¢"
    - [ ] Collection value update summary
    - [ ] Suggested actions based on new rates
- [ ] Search and filter improvements with instant results

### 3.3 Advanced Calculations
- [ ] Historical postage rate tracking with full timeline
- [ ] Cost analysis (what combinations save money)
- [ ] Stamp usage analytics and recommendations
- [ ] **Variable Value Stamp Features**:
  - [ ] "Value at purchase" vs "Current value" vs "Upcoming value" tracking
  - [ ] ROI analysis for Forever stamps (bought at 45¢, now worth 68¢, will be worth 70¢)
  - [ ] Optimal usage timing (use before/after rate changes?)
  - [ ] Impact analysis when postal rates change
- [ ] **Advanced Rate Change Analysis**:
  - [ ] "Should I mail now or wait?" calculator
  - [ ] Break-even analysis for bulk mailings
  - [ ] Rate change frequency predictions
  - [ ] Historical rate increase patterns
- [ ] Multiple efficiency criteria selection:
  - [ ] User preference settings for default optimization
  - [ ] Comparison view showing different efficiency results
  - [ ] Smart recommendations based on collection composition and upcoming changes
- [ ] Batch calculations for multiple postage amounts
- [ ] "What if" scenarios (e.g., "What if postal rates increase by 5¢ next month?")

## Phase 4: Multi-User & Authentication 👥 **FUTURE**

### 4.1 User System
- [ ] User registration and authentication
- [ ] Personal stamp collections per user
- [ ] User preferences and settings
- [ ] Session management

### 4.2 Sharing & Collaboration
- [ ] Share stamp collections (read-only)
- [ ] Export collection for printing
- [ ] Compare collections between users
- [ ] Stamp trading system (advanced)

## Database Schema Enhancements

### MVP Schema (Simple & Focused)
The MVP uses a single simple table with no complex relationships:

```sql
-- MVP: Simple stamp collection
CREATE TABLE stamps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,           -- "5¢ Liberty Bell", "25¢ Flag"  
    value INTEGER NOT NULL,       -- Value in cents (5, 25, 50, etc.)
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Future Schema (Complex Features)
When ready for advanced features, the schema will expand to support:
- Variable value stamps (Forever stamps)
- Multiple countries and currencies  
- User accounts and collections
- Rate change scheduling and history
- Community-submitted rate updates

**New value_history table:**
```sql
-- Track value changes over time
CREATE TABLE value_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stamp_type_id INTEGER REFERENCES stamp_types(id),
    old_value INTEGER,
    new_value INTEGER NOT NULL,
    effective_date DATE NOT NULL,
    reason TEXT, -- 'postal_rate_increase', 'manual_update', etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Calculation Architecture (Client vs Server)

**Primary: Client-Side Calculations**
- Real-time results as user types
- No network latency or server load
- Works offline after initial data sync
- Suitable for typical stamp collections (< 50 stamp types)

**Fallback: Server-Side Calculations**
- Handles complex scenarios (> 1000 possible combinations)
- Timeout protection (calculations > 2-3 seconds)
- Advanced optimization algorithms
- Caching for repeated calculations

**Implementation Strategy:**
```javascript
// Fast greedy algorithm (client-side)
function calculateFastCombinations(targetAmount, stamps, maxResults = 10) {
  const results = [];
  
  // Strategy 1: Greedy - use largest stamps first (fewest stamps)
  results.push(greedyLargestFirst(targetAmount, stamps));
  
  // Strategy 2: Exact match preference
  results.push(greedyExactMatch(targetAmount, stamps));
  
  // Strategy 3: Preserve high-value stamps
  results.push(greedySmallestFirst(targetAmount, stamps));
  
  return results.filter(r => r).slice(0, maxResults);
}

// Enhanced for partial stamp selection
function calculateWithPreSelected(targetAmount, preSelectedStamps, availableStamps) {
  const usedValue = preSelectedStamps.reduce((sum, stamp) => sum + stamp.value * stamp.quantity, 0);
  const remainingAmount = targetAmount - usedValue;
  
  if (remainingAmount <= 0) {
    return { result: 'complete', overpayment: Math.abs(remainingAmount) };
  }
  
  // Calculate combinations for remaining amount
  return calculateFastCombinations(remainingAmount, availableStamps);
}

// Comprehensive analysis (server-side)
async function calculateAllCombinations(targetAmount, stamps) {
  // Use existing combRep.js for complete analysis
  const allCombinations = combRep(stamps, maxLength);
  return allCombinations
    .filter(combo => sumEquals(combo, targetAmount))
    .sort(byEfficiencyMetrics);
}
```

**Common Use Cases:**
1. **"I want to use up my 1¢ stamps"** - Select all 1¢ stamps, calculate remaining
2. **"Save my commemorative stamps"** - Exclude special stamps, use only regular ones  
3. **"I need exactly 67¢"** - Show all combinations, sorted by efficiency
4. **"Use my most abundant stamps"** - Sort by quantity (highest first), auto-select
5. **"My Forever stamps just increased in value"** - System auto-updates calculations
6. **"Should I use Forever stamps or fixed value?"** - Compare ROI and efficiency
7. **"Should I mail now or wait 3 days for new rates?"** - Compare current vs upcoming costs
8. **"Plan for bulk mailing next week"** - Switch to upcoming rates to see future costs

**Rate Change Scenarios:**

**Scenario A: Rate Increase Announced (7 days before)**
```javascript
// Current: Forever = 68¢, upcoming: Forever = 73¢ (effective Jan 22, 2024)
const rateContext = {
  mode: "upcoming", // User switched to preview upcoming rates
  daysUntilChange: 3,
  currentRates: { forever: 68, letterA: 85 },
  upcomingRates: { forever: 73, letterA: 88 }
};

// Calculator shows:
// "Using upcoming rates (effective in 3 days)"
// Need 73¢: 1 Forever stamp (exact match)
// Current cost would be: 1 Forever + 1×5¢ (73¢ total)
```

**Scenario B: Day of Rate Change**
```javascript
// Automatic switch happens at midnight
const notification = {
  title: "Postal rates updated!",
  message: "Forever stamps now worth 73¢ (+5¢). Collection value increased by $12.50",
  actions: [
    "Update my calculations to use new rates",
    "See impact on my collection",
    "Plan postage with new rates"
  ]
};
```

**Scenario C: User Planning Decision**
```javascript
// Comparison mode for decision making
const comparison = {
  scenario: "Need to mail 25 letters requiring 73¢ each",
  currentRates: {
    cost: "25 Forever stamps (68¢) + 25×5¢ stamps = $18.25",
    recommendation: "Mail now to save money"
  },
  upcomingRates: {
    cost: "25 Forever stamps (73¢) = $18.25",  
    recommendation: "Cleaner solution but same cost"
  }
};
```

**Italian Stamp Examples:**

**Pre-Euro ITL Stamps (still valid):**
- Castello 50L → €0.026 (2.6 EUR cents)
- Castello 100L → €0.052 (5.2 EUR cents)  
- Castello 200L → €0.103 (10.3 EUR cents)
- Castello 500L → €0.258 (25.8 EUR cents)
- Castello 800L → €0.413 (41.3 EUR cents)

**Modern EUR Stamps:**
- Posta Ordinaria €0.95 → 95 EUR cents
- Posta Prioritaria €1.10 → 110 EUR cents
- Europa €1.15 → 115 EUR cents
- Commemorative stamps: Any value accepted

**Calculation Example:**
```
Target: €1.20 (120 EUR cents) for international letter

Possible combinations:
1. 1×€1.10 + 2×Castello 50L = €1.15 (5¢ short, need +€0.05)
2. 1×€0.95 + 5×Castello 50L = €1.08 (12¢ short, need +€0.12)  
3. 1×€1.15 + 1×Castello 50L = €1.18 (2¢ short, need +€0.02)
4. 2×€0.95 = €1.90 (overpayment of €0.70)

System finds optimal: 1×€1.15 + 1×Castello 100L = €1.20 (exact!)
```

### Performance Optimizations
- [ ] Database indexing optimization
- [ ] Caching for frequently calculated combinations
- [ ] Frontend bundling optimization
- [ ] Image optimization for stamp photos

### Security
- [ ] Input sanitization and validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Rate limiting for API endpoints

### Infrastructure
- [ ] Docker containerization
- [ ] CI/CD pipeline setup
- [ ] Production deployment guide
- [ ] Monitoring and logging

## Immediate Next Steps (Week 1-2)

1. **Set up Node.js backend environment**
   ```bash
   mkdir backend
   cd backend
   npm init -y
   npm install express cors sqlite3 dotenv
   npm install -D nodemon
   ```

2. **Create basic Express app structure**
   - `server.js` - Main Express application
   - `models/` - Database models and schema
   - `routes/` - API route handlers
   - `config/` - Configuration management
   - `middleware/` - Custom middleware
   - `utils/` - Utility functions (including combRep)

3. **Implement first API endpoint**
   - Start with `GET /api/stamps` to list stamps
   - Connect to existing SQLite database
   - Test with frontend integration

4. **Update frontend to consume API**
   - Replace mock data with API calls
   - Add loading states
   - Handle API errors gracefully

## Success Metrics

- [ ] All Phase 1 API endpoints functional
- [ ] Frontend successfully integrated with backend
- [ ] Test coverage > 80%
- [ ] API response times < 200ms for basic operations
- [ ] Combination calculations complete in < 1s for typical collections

---

*Last updated: [Current Date]*
*Next review: After Phase 1 completion*