-- ============================================================
-- FoodMate AI — PostgreSQL Database Schema
-- Version: 2.0 (Open Web & Scalable MVP)
-- ============================================================

-- 1. Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    phone VARCHAR(50),
    website VARCHAR(500),
    opening_hours_json JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    place_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status);
CREATE INDEX IF NOT EXISTS idx_restaurants_lat_lng ON restaurants(lat, lng);

-- 2. Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL CHECK (price >= 0),
    currency VARCHAR(10) DEFAULT 'VND',
    portion_label VARCHAR(100),
    availability_status VARCHAR(50) DEFAULT 'available',
    verification_status VARCHAR(50) DEFAULT 'verified' CHECK (verification_status IN ('unverified', 'verified', 'needs_update', 'invalid')),
    source_name VARCHAR(255) DEFAULT 'Admin verified',
    last_verified_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_price ON menu_items(price);

-- 3. Route Logs (No continuous GPS trace, only A-to-B route from API)
CREATE TABLE IF NOT EXISTS route_logs (
    id TEXT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    restaurant_id TEXT REFERENCES restaurants(id) ON DELETE SET NULL,
    origin_lat DOUBLE PRECISION NOT NULL,
    origin_lng DOUBLE PRECISION NOT NULL,
    destination_lat DOUBLE PRECISION NOT NULL,
    destination_lng DOUBLE PRECISION NOT NULL,
    distance_meters INTEGER,
    duration_seconds INTEGER,
    travel_mode VARCHAR(50) DEFAULT 'driving' CHECK (travel_mode IN ('driving', 'walking', 'cycling', 'transit')),
    route_polyline TEXT,
    provider VARCHAR(100) DEFAULT 'Google Routes API',
    consent_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_route_logs_created_at ON route_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_route_logs_restaurant_id ON route_logs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_route_logs_session_id ON route_logs(session_id);

-- 4. Reports (Wrong data reporting)
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT REFERENCES restaurants(id) ON DELETE SET NULL,
    report_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
