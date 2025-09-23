# Stamp Management System

A full-stack web application for managing Italian stamp collections and calculating optimal stamp combinations for postage requirements with support for both Lira (ITL) and Euro (EUR) stamps.

## Features

### MVP Features (Current Development) ✅
- **Italian Stamp Collection**: Add, edit, and remove stamps with support for ITL and EUR currencies
- **Currency Conversion**: Automatic conversion between Italian Lira and Euro (1 EUR = 1936.27 ITL)
- **Mixed Currency Calculator**: Generate optimal combinations using both ITL and EUR stamps
- **Flexible Values**: Accept any stamp denomination (not limited to standard values)
- **Poste Italiane Context**: Italian postal service rates and terminology
- **Single User**: One collection per installation (no authentication needed)

### Planned Features 🚧
- **Advanced Italian Features**: Francobolli commemorativi, priority mail, express services
- **Historical ITL Tracking**: Purchase date context for pre-Euro stamps
- **Enhanced UX**: Smart sorting, stamp selection, and advanced filtering
- **Multi-User Support**: Personal accounts and collections
- **Multi-Country Support**: Other European postal services and currencies
- **Community Features**: User-submitted rate updates and collection sharing

## Project Structure

```
├── database/           # Database files and schema
│   ├── schema.sql     # Database schema definition
│   ├── sample_data.sql # Sample data for testing
│   ├── database.py    # Python database utilities
│   └── stamps.db      # SQLite database file
├── src/               # Frontend source code
│   ├── main.js        # Application entry point
│   ├── combRep.js     # Combination generation algorithm
│   ├── api/           # API integration modules
│   └── test/          # Test files
├── public/            # Static assets
└── package.json       # Node.js dependencies and scripts
```

## Technology Stack

- **Frontend**: Vanilla JavaScript, Vite, CSS3
- **Backend**: Node.js, Express.js (MVP)
- **Database**: SQLite with dual currency support (ITL/EUR)
- **Testing**: Vitest, jsdom
- **Build Tool**: Vite
- **Currency**: Italian Lira (ITL) and Euro (EUR) with fixed conversion rates

*Future: Multi-country currency support, user authentication, advanced rate management*

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Dario-DC/stamp-management-system.git
   cd stamp-management-system
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm run dev
   ```

### Development Commands

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run test` - Run tests in watch mode
- `pnpm run test:run` - Run tests once
- `pnpm run test:coverage` - Run tests with coverage report

## Database Schema

### MVP Schema (Simple & Focused)
The MVP uses a single table for maximum simplicity:

**`stamps` table**
- Stores individual stamps with name, value (in cents), and quantity
- Simple CRUD operations with automatic timestamps
- Indexed by value for fast calculations

*Future versions will add support for variable-value stamps, multiple countries, user accounts, and advanced rate management.*

## Algorithm: Stamp Combinations

The system uses a **two-tier calculation approach** to balance speed and completeness:

### Fast Algorithm (Client-side)
Greedy algorithms that provide instant results for common use cases:
- **Largest First**: Uses highest-value stamps first (minimizes stamp count)
- **Exact Match**: Prioritizes combinations with no overpayment
- **Preserve Valuable**: Uses lower-value stamps first to save rare ones
- **Performance**: O(n log n), returns results in < 100ms

### Comprehensive Algorithm (Server-side)
Complete combinatorial analysis using the `combRep.js` algorithm:
- **All Possibilities**: Finds every possible combination
- **Full Ranking**: Sorts by multiple efficiency metrics
- **Advanced Filtering**: Complex optimization criteria
- **Performance**: O(n^k), processes in background with progress updates

### User Experience Flow
1. **Instant Preview**: Fast algorithm shows top 3-5 combinations immediately
2. **Optional Deep Dive**: "Show all combinations" button for complete analysis
3. **Progressive Enhancement**: Users get quick answers but can explore all options

### Efficiency Metrics

The system can optimize stamp combinations based on different criteria:

1. **Fewest Stamps**: Uses the minimum number of physical stamps
   - Best for: Reducing bulk, faster application
   - Example: 7¢ → 1×5¢ + 1×2¢ (2 stamps) vs 7×1¢ (7 stamps)

2. **Exact Match**: Prioritizes combinations with no overpayment
   - Best for: Avoiding waste, precise postage
   - Example: 8¢ → 4×2¢ (exact) vs 1×10¢ (2¢ overpayment)

3. **Preserve Rare**: Uses common stamps first, saves high-value/limited stamps
   - Best for: Managing limited quantities, keeping flexibility
   - Example: If you have few 5¢ stamps, prefer 3×2¢ + 2×1¢ over 1×5¢ + 2×1¢

4. **Balanced Usage**: Distributes usage across different stamp types
   - Best for: Long-term collection management
   - Example: Alternates between using different denominations

### Example Scenarios

For stamps [1¢, 2¢, 5¢] and postage requirement of 7¢:
- **Fewest stamps**: 1×5¢ + 1×2¢ (2 stamps total)
- **Alternative options**: 1×5¢ + 2×1¢ (3 stamps) or 3×2¢ + 1×1¢ (4 stamps)
- **Most stamps**: 7×1¢ (7 stamps total)

## Contributing

1. Fork the repository
2. Create a feature branch (`git switch -c feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for detailed development plans and milestones.