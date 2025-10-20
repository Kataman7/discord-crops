const Tile = require('./Tile');

class Farm {
    constructor(userId, guildId, size = 2) { // size = côté, ex: 2 pour 2x2
        this.userId = userId;
        this.guildId = guildId;
        this.size = size;
        this.tiles = [];
        this.initTiles();
    }

    initTiles() {
        this.tiles = [];
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                this.tiles.push(new Tile(x, y));
            }
        }
    }

    getTile(x, y) {
        return this.tiles.find(t => t.x === x && t.y === y);
    }

    getEmptyTiles() {
        return this.tiles.filter(t => t.state === 'empty');
    }

    getReadyTiles() {
        return this.tiles.filter(t => t.state === 'ready');
    }

    plant(seedType, seeds) {
        const emptyTile = this.getEmptyTiles()[0];
        if (!emptyTile) return false;
        emptyTile.plant(seedType);
        return true;
    }

    harvestAll(seeds) {
        const readyTiles = this.getReadyTiles();
        let totalMoney = 0;
        readyTiles.forEach(tile => {
            const seed = seeds[tile.seedType];
            if (seed) {
                totalMoney += seed.sellPrice;
                tile.harvest();
            } else {
                // Seed type n'existe plus, on harvest quand même mais sans récompense
                console.log(`Harvesting unknown seed type ${tile.seedType}, giving no reward`);
                tile.harvest();
            }
        });
        return totalMoney;
    }

    updateStates(seeds) {
        this.tiles.forEach(tile => tile.updateState(seeds));
    }

    // Pour DB
    toDB() {
        return this.tiles.map(tile => ({
            user_id: this.userId,
            guild_id: this.guildId,
            x: tile.x,
            y: tile.y,
            seed_type: tile.seedType,
            planted_at: tile.plantedAt,
            state: tile.state
        }));
    }

    static fromDB(rows, size) {
        const farm = new Farm(rows[0].user_id, rows[0].guild_id, size);
        rows.forEach(row => {
            const tile = farm.getTile(row.x, row.y);
            if (tile) {
                tile.state = row.state;
                tile.seedType = row.seed_type;
                tile.plantedAt = row.planted_at ? new Date(row.planted_at).getTime() : null;
            }
        });
        return farm;
    }
}

module.exports = Farm;