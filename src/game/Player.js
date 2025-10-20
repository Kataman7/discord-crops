class Player {
    constructor(userId, guildId, money = 100, level = 1, farmSize = 2) {
        this.userId = userId;
        this.guildId = guildId;
        this.money = money;
        this.level = level;
        this.farmSize = farmSize; // côté de la grille
        this.inventory = {}; // { seedType: quantity }
    }

    canAfford(amount) {
        return this.money >= amount;
    }

    spend(amount) {
        if (this.canAfford(amount)) {
            this.money -= amount;
            return true;
        }
        return false;
    }

    earn(amount) {
        this.money += amount;
    }

    addToInventory(seedType, quantity) {
        this.inventory[seedType] = (this.inventory[seedType] || 0) + quantity;
    }

    removeFromInventory(seedType, quantity) {
        if (this.inventory[seedType] >= quantity) {
            this.inventory[seedType] -= quantity;
            return true;
        }
        return false;
    }

    hasInInventory(seedType, quantity = 1) {
        return (this.inventory[seedType] || 0) >= quantity;
    }

    getAvailableSeeds(seeds) {
        return Object.keys(seeds).filter(type => seeds[type].requiredLevel <= this.level);
    }

    levelUp() {
        this.level++;
        this.farmSize = 2; // reset à 2x2
        // inventaire conservé ?
    }

    // Pour DB
    toDB() {
        return {
            user_id: this.userId,
            guild_id: this.guildId,
            money: this.money,
            level: this.level,
            farm_size: this.farmSize
        };
    }

    static fromDB(row) {
        const player = new Player(row.user_id, row.guild_id, row.money, row.level, row.farm_size);
        // inventaire chargé séparément
        return player;
    }
}

module.exports = Player;