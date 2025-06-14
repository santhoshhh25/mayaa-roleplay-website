-- User Profiles Table for Persistent Duty Data
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    discord_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    character_name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    rank VARCHAR(255) NOT NULL,
    call_sign VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Promotion Logs Table for Tracking Rank Changes
CREATE TABLE IF NOT EXISTS promotion_logs (
    id SERIAL PRIMARY KEY,
    discord_id VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    character_name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    old_rank VARCHAR(255) NOT NULL,
    new_rank VARCHAR(255) NOT NULL,
    promoted_by VARCHAR(255) NOT NULL,
    promoted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (discord_id) REFERENCES user_profiles(discord_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_discord_id ON user_profiles(discord_id);
CREATE INDEX IF NOT EXISTS idx_promotion_logs_discord_id ON promotion_logs(discord_id);
CREATE INDEX IF NOT EXISTS idx_promotion_logs_department ON promotion_logs(department);

-- Insert default departments and ranks (optional reference data)
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    abbreviation VARCHAR(10) NOT NULL,
    emoji VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS ranks (
    id SERIAL PRIMARY KEY,
    department_id INTEGER REFERENCES departments(id),
    name VARCHAR(255) NOT NULL,
    hierarchy_level INTEGER NOT NULL,
    UNIQUE(department_id, name)
);

-- Insert department data
INSERT INTO departments (name, abbreviation, emoji) VALUES
('Police Department', 'PD', '🚔'),
('Emergency Medical Services', 'EMS', '🚑'),
('Mechanic', 'MECH', '🔧'),
('Merry Weather', 'MW', '🛡️')
ON CONFLICT (name) DO NOTHING;

-- Insert rank hierarchies
WITH dept_ids AS (
    SELECT id as pd_id FROM departments WHERE name = 'Police Department'
), pd_ranks AS (
    SELECT unnest(ARRAY[
        'Cadet', 'Officer I', 'Officer II', 'Officer III', 'Senior Officer',
        'Corporal', 'Sergeant', 'Lieutenant', 'Captain', 'Deputy Chief', 'Chief of Police'
    ]) as rank_name,
    unnest(ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) as level
)
INSERT INTO ranks (department_id, name, hierarchy_level)
SELECT (SELECT pd_id FROM dept_ids), rank_name, level FROM pd_ranks
ON CONFLICT (department_id, name) DO NOTHING;

WITH dept_ids AS (
    SELECT id as ems_id FROM departments WHERE name = 'Emergency Medical Services'
), ems_ranks AS (
    SELECT unnest(ARRAY[
        'EMT Basic', 'EMT Advanced', 'Paramedic', 'Senior Paramedic',
        'Field Supervisor', 'Operations Manager', 'Assistant Chief', 'EMS Chief'
    ]) as rank_name,
    unnest(ARRAY[1, 2, 3, 4, 5, 6, 7, 8]) as level
)
INSERT INTO ranks (department_id, name, hierarchy_level)
SELECT (SELECT ems_id FROM dept_ids), rank_name, level FROM ems_ranks
ON CONFLICT (department_id, name) DO NOTHING;

WITH dept_ids AS (
    SELECT id as mech_id FROM departments WHERE name = 'Mechanic'
), mech_ranks AS (
    SELECT unnest(ARRAY[
        'Apprentice', 'Mechanic I', 'Mechanic II', 'Senior Mechanic',
        'Lead Mechanic', 'Shop Supervisor', 'Service Manager'
    ]) as rank_name,
    unnest(ARRAY[1, 2, 3, 4, 5, 6, 7]) as level
)
INSERT INTO ranks (department_id, name, hierarchy_level)
SELECT (SELECT mech_id FROM dept_ids), rank_name, level FROM mech_ranks
ON CONFLICT (department_id, name) DO NOTHING;

WITH dept_ids AS (
    SELECT id as mw_id FROM departments WHERE name = 'Merry Weather'
), mw_ranks AS (
    SELECT unnest(ARRAY[
        'Recruit', 'Security Officer', 'Senior Officer', 'Team Leader',
        'Supervisor', 'Operations Manager', 'Regional Director'
    ]) as rank_name,
    unnest(ARRAY[1, 2, 3, 4, 5, 6, 7]) as level
)
INSERT INTO ranks (department_id, name, hierarchy_level)
SELECT (SELECT mw_id FROM dept_ids), rank_name, level FROM mw_ranks
ON CONFLICT (department_id, name) DO NOTHING;

-- Elite Players Table for FiveM Sync
CREATE TABLE IF NOT EXISTS elite_players (
    id SERIAL PRIMARY KEY,
    rank INTEGER NOT NULL,
    identifier VARCHAR(255) NOT NULL,
    character_name VARCHAR(255) NOT NULL,
    bank_money BIGINT NOT NULL DEFAULT 0,
    cash_money BIGINT NOT NULL DEFAULT 0,
    total_money BIGINT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Server Info Table for FiveM Server Status
CREATE TABLE IF NOT EXISTS server_info (
    id INTEGER PRIMARY KEY DEFAULT 1,
    server_name VARCHAR(255) NOT NULL,
    max_players INTEGER NOT NULL DEFAULT 64,
    last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_timestamp BIGINT NOT NULL DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_elite_players_rank ON elite_players(rank);
CREATE INDEX IF NOT EXISTS idx_elite_players_total_money ON elite_players(total_money);
CREATE INDEX IF NOT EXISTS idx_elite_players_sync_timestamp ON elite_players(sync_timestamp); 