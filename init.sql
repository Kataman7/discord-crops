CREATE TABLE IF NOT EXISTS guild_prefixes (
    guild_id TEXT PRIMARY KEY,
    prefix TEXT
);

CREATE TABLE IF NOT EXISTS players (
    user_id TEXT,
    guild_id TEXT,
    money INTEGER DEFAULT 100,
    level INTEGER DEFAULT 1,
    farm_size INTEGER DEFAULT 2,
    PRIMARY KEY (user_id, guild_id)
);

CREATE TABLE IF NOT EXISTS farms (
    user_id TEXT,
    guild_id TEXT,
    x INTEGER,
    y INTEGER,
    seed_type TEXT,
    planted_at TIMESTAMP,
    state TEXT DEFAULT 'empty',
    PRIMARY KEY (user_id, guild_id, x, y)
);

CREATE TABLE IF NOT EXISTS inventories (
    user_id TEXT,
    guild_id TEXT,
    seed_type TEXT,
    quantity INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, guild_id, seed_type)
);

CREATE TABLE IF NOT EXISTS seeds (
    type TEXT PRIMARY KEY,
    name TEXT,
    growth_time BIGINT,
    buy_price INTEGER,
    sell_price INTEGER,
    required_level INTEGER
);