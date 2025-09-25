import sqlite3
import os
from pathlib import Path


class Database:
    def __init__(self, db_path='database/stamps.db'):
        """Initialize the database connection and create tables if they don't exist."""
        self.db_path = db_path

        # Create database directory if it doesn't exist
        os.makedirs(os.path.dirname(db_path), exist_ok=True)

        # Initialize the database
        self.init_database()

    def get_connection(self):
        """Get a database connection."""
        return sqlite3.connect(self.db_path)

    def init_database(self):
        """Initialize the database with schema and default data."""
        # Read and execute schema
        schema_path = Path(__file__).parent / 'schema.sql'
        if schema_path.exists():
            with open(schema_path, 'r') as f:
                schema = f.read()

            with self.get_connection() as conn:
                conn.executescript(schema)
                conn.commit()

        # Load initial data (postage rates) on first run
        self._load_initial_data()

    def _load_initial_data(self):
        """Load initial data (postage rates) if not already present."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            # Check if postage rates are already loaded
            cursor.execute("SELECT COUNT(*) FROM postage_rates")
            count = cursor.fetchone()[0]

            # Only load initial data if postage_rates table is empty
            if count == 0:
                init_data_path = Path(__file__).parent / 'init_data.sql'
                if init_data_path.exists():
                    with open(init_data_path, 'r') as f:
                        init_data = f.read()

                    conn.executescript(init_data)
                    conn.commit()
                    print("Initial postage rates loaded successfully!")

    def load_sample_data(self):
        """Load sample data into the database."""
        sample_data_path = Path(__file__).parent / 'sample_data.sql'
        if sample_data_path.exists():
            with open(sample_data_path, 'r') as f:
                sample_data = f.read()

            with self.get_connection() as conn:
                conn.executescript(sample_data)
                conn.commit()

    # Stamp Collection Methods
    def add_stamp_to_collection(self, name, val, n=1):
        """Add a stamp to the collection."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO stamp_collection (name, val, n) VALUES (?, ?, ?)",
                (name, val, n),
            )
            conn.commit()
            return cursor.lastrowid

    def get_stamp_collection(self):
        """Get all stamps from the collection."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM stamp_collection ORDER BY name")
            return cursor.fetchall()

    def update_stamp_quantity(self, stamp_id, new_quantity):
        """Update the quantity of a stamp in the collection."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE stamp_collection SET n = ? WHERE id = ?",
                (new_quantity, stamp_id),
            )
            conn.commit()
            return cursor.rowcount > 0

    def delete_stamp_from_collection(self, stamp_id):
        """Delete a stamp from the collection."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM stamp_collection WHERE id = ?", (stamp_id,))
            conn.commit()
            return cursor.rowcount > 0

    def clear_stamp_collection(self):
        """Clear all stamps from the collection (for fresh start)."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM stamp_collection")
            conn.commit()
            return cursor.rowcount

    # Postage Rates Methods
    def add_postage_rate(self, name, rate):
        """Add or update a postage rate."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR REPLACE INTO postage_rates (name, rate) VALUES (?, ?)",
                (name, rate),
            )
            conn.commit()
            return cursor.lastrowid

    def get_postage_rates(self):
        """Get all postage rates."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM postage_rates ORDER BY name")
            return cursor.fetchall()

    def get_rate_by_name(self, name):
        """Get a specific rate by name."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM postage_rates WHERE name = ?", (name,))
            return cursor.fetchone()

    def update_rate(self, name, new_rate):
        """Update a postage rate."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE postage_rates SET rate = ? WHERE name = ?", (new_rate, name)
            )
            conn.commit()
            return cursor.rowcount > 0

    def delete_rate(self, name):
        """Delete a postage rate."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM postage_rates WHERE name = ?", (name,))
            conn.commit()
            return cursor.rowcount > 0


# Create a global database instance
db = Database()

if __name__ == "__main__":
    # Initialize database
    print("Initializing database...")
    print("Database initialized!")

    # Display current data
    print("\nStamp Collection:")
    stamps = db.get_stamp_collection()
    if stamps:
        for stamp in stamps:
            print(f"  {stamp[1]}: €{stamp[2]/100:.2f} ({stamp[3]} stamps)")
    else:
        print("  No stamps in collection yet.")

    print("\nPostage Rates:")
    for rate in db.get_postage_rates():
        print(f"  {rate[1]}: €{rate[2]/100:.2f}")
