# Database Module

This directory contains the database setup and management files for the Stamp Management System.

## Files

- `schema.sql` - Database schema with table definitions
- `sample_data.sql` - Sample data for testing
- `database.py` - Python database interface and utilities
- `stamps.db` - SQLite database file (created automatically)

## Database Schema

### stamp_collection table
Stores information about stamps in your collection:
- `id` - Primary key (auto-increment)
- `name` - Name of the stamp (TEXT)
- `val` - Stamp value in cents of euros (INTEGER)
- `n` - Number of stamps (INTEGER)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### postage_rates table
Stores current postage rates for stamps:
- `id` - Primary key (auto-increment)
- `name` - Name of the stamp type (TEXT, UNIQUE)
- `rate` - Postage rate in cents of euros (INTEGER)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Usage

```python
from database.database import db

# Add a stamp to collection
db.add_stamp_to_collection("New Stamp", 150, 10)

# Get all stamps in collection
stamps = db.get_stamp_collection()

# Add/update a postage rate
db.add_postage_rate("Standard Letter", 120)

# Get all postage rates
rates = db.get_postage_rates()
```

## Initialize Database

Run the database.py file directly to initialize the database with sample data:

```bash
python database/database.py
```
