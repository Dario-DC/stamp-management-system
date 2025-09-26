# Database Module

This directory contains the database setup and management files for the Stamp Management System.

## Files

- `schema.sql` - Database schema with table definitions, triggers, and indexes
- `init_data.sql` - Initial postage rates data (loaded once on first run)
- `sample_data.sql` - Sample data for development/demo purposes  
- `test_init.sql` - Clean test initialization script
- `database.py` - Python database interface and utilities
- `stamps.db` - SQLite database file (created automatically)

## Database Schema

### stamps table
Stores information about stamps in your collection:
- `id` - Primary key (auto-increment)
- `name` - Name of the stamp (TEXT)
- `value` - Original stamp value (DECIMAL) 
- `currency` - Currency type (TEXT): 'EUR' or 'ITL'
- `euro_cents` - Current value in euro cents (INTEGER) - calculated automatically
- `n` - Number of stamps (INTEGER)
- `postage_rate_id` - Reference to postage_rates table (INTEGER, nullable)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### postage_rates table
Stores current postage rates for stamps:
- `id` - Primary key (auto-increment)
- `name` - Name of the stamp type (TEXT, UNIQUE)
- `value` - Postage rate value in euros (DECIMAL) - e.g., 3.00 = €3.00
- `max_weight` - Maximum weight in grams (INTEGER)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Usage

```python
from database.database import db

# Add a stamp to collection (150 cents = €1.50)
db.add_stamp_to_collection("New Stamp", 150, 10)

# Get all stamps in collection
stamps = db.get_stamp_collection()

# Add/update a postage rate (120 cents = €1.20)
db.add_postage_rate("Standard Letter", 120)

# Get all postage rates
rates = db.get_postage_rates()
```

## Initialize Database

The database is automatically initialized when first accessed. It includes:
- **Postage rates**: Pre-loaded with standard rates (A, B, A1, B1, etc.)
- **Stamp collection**: Starts empty - users add their own stamps

Run the database.py file directly to initialize and view the database:

```bash
python database/database.py
```

## Database Initialization Behavior

- **First run**: Creates tables and loads default postage rates
- **Subsequent runs**: Uses existing data
- **Stamp collection**: Always starts empty for new users
- **Postage rates**: Persistent across sessions
