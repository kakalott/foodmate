-- ============================================================
-- FoodMate v3.1 - Supabase Database Schema
-- route_logs, search_logs, system_configs
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: route_logs (Lưu lộ trình khi khách bấm "Tìm đường tới đây")
CREATE TABLE IF NOT EXISTS public.route_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    place_id TEXT NOT NULL,
    restaurant_name TEXT NOT NULL,
    restaurant_address TEXT,
    origin_lat DOUBLE PRECISION NOT NULL,
    origin_lng DOUBLE PRECISION NOT NULL,
    dest_lat DOUBLE PRECISION NOT NULL,
    dest_lng DOUBLE PRECISION NOT NULL,
    distance_meters INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    route_polyline TEXT NOT NULL,
    filter_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_route_logs_created_at ON public.route_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_route_logs_place_id ON public.route_logs (place_id);

ALTER TABLE public.route_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read route_logs" ON public.route_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert route_logs" ON public.route_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete route_logs" ON public.route_logs FOR DELETE USING (true);

-- 2. Table: search_logs (Thống kê ngữ cảnh tìm kiếm và món ăn gợi ý)
CREATE TABLE IF NOT EXISTS public.search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weather_context TEXT,
    budget TEXT,
    suggested_dishes TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read search_logs" ON public.search_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert search_logs" ON public.search_logs FOR INSERT WITH CHECK (true);

-- 3. Table: system_configs (Lưu trữ API Keys động: Google Maps Key, Gemini Key)
CREATE TABLE IF NOT EXISTS public.system_configs (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read system_configs" ON public.system_configs FOR SELECT USING (true);
CREATE POLICY "Allow public write system_configs" ON public.system_configs FOR ALL USING (true);

-- 4. Table: user_start_locations (Lưu tọa độ khởi đầu của người dùng khi bấm "Hôm nay ăn gì?")
CREATE TABLE IF NOT EXISTS public.user_start_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    query TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_start_locations_created ON public.user_start_locations (created_at DESC);

ALTER TABLE public.user_start_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read user_start_locations" ON public.user_start_locations FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_start_locations" ON public.user_start_locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete user_start_locations" ON public.user_start_locations FOR DELETE USING (true);
