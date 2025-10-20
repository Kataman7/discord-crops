const Seed = require('./Seed');
const Player = require('./Player');
const Farm = require('./Farm');
const seedsData = require('./seeds.json');

class GameManager {
    constructor(database) {
        this.database = database;
        this.seeds = {};
        this.loadSeeds();
    }

    loadSeeds() {
        for (const [type, data] of Object.entries(seedsData)) {
            const growthStages = data.growthStages || 3; // Nombre d'étapes de croissance
            this.seeds[type] = new Seed(type, data.name, data.growthTime, data.buyPrice, data.sellPrice, data.requiredLevel, growthStages);
        }
    }

    async getPlayer(userId, guildId) {
        const res = await this.database.query('SELECT * FROM players WHERE user_id = $1 AND guild_id = $2', [userId, guildId]);
        if (res.rows.length === 0) {
            const newPlayer = new Player(userId, guildId);
            await this.savePlayer(newPlayer);
            return newPlayer;
        }
        const player = Player.fromDB(res.rows[0]);
        await this.loadInventory(player);
        return player;
    }

    async savePlayer(player) {
        await this.database.query(`
            INSERT INTO players (user_id, guild_id, money, level, farm_size)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id, guild_id) DO UPDATE SET
                money = EXCLUDED.money,
                level = EXCLUDED.level,
                farm_size = EXCLUDED.farm_size
        `, [player.userId, player.guildId, player.money, player.level, player.farmSize]);
    }

    async loadInventory(player) {
        const res = await this.database.query('SELECT * FROM inventories WHERE user_id = $1 AND guild_id = $2', [player.userId, player.guildId]);
        res.rows.forEach(row => {
            player.inventory[row.seed_type] = row.quantity;
        });
    }

    async saveInventory(player) {
        for (const [seedType, quantity] of Object.entries(player.inventory)) {
            await this.database.query(`
                INSERT INTO inventories (user_id, guild_id, seed_type, quantity)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (user_id, guild_id, seed_type) DO UPDATE SET quantity = EXCLUDED.quantity
            `, [player.userId, player.guildId, seedType, quantity]);
        }
    }

    async getFarm(userId, guildId, size) {
        const res = await this.database.query('SELECT * FROM farms WHERE user_id = $1 AND guild_id = $2', [userId, guildId]);
        if (res.rows.length === 0) {
            const newFarm = new Farm(userId, guildId, size);
            await this.saveFarm(newFarm);
            return newFarm;
        }
        return Farm.fromDB(res.rows, size);
    }

    async saveFarm(farm) {
        const data = farm.toDB();
        for (const tile of data) {
            await this.database.query(`
                INSERT INTO farms (user_id, guild_id, x, y, seed_type, planted_at, state)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (user_id, guild_id, x, y) DO UPDATE SET
                    seed_type = EXCLUDED.seed_type,
                    planted_at = EXCLUDED.planted_at,
                    state = EXCLUDED.state
            `, [tile.user_id, tile.guild_id, tile.x, tile.y, tile.seed_type, tile.planted_at ? new Date(tile.planted_at) : null, tile.state]);
        }
    }
}

module.exports = GameManager;