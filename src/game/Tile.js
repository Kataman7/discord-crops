class Tile {
    constructor(x, y, state = 'empty', seedType = null, plantedAt = null) {
        this.x = x;
        this.y = y;
        this.state = state; // 'empty', 'planted', 'ready'
        this.seedType = seedType;
        this.plantedAt = plantedAt;
    }

    plant(seedType) {
        this.state = 'planted';
        this.seedType = seedType;
        this.plantedAt = Date.now();
    }

    harvest() {
        this.state = 'empty';
        this.seedType = null;
        this.plantedAt = null;
    }

    updateState(seeds) {
        if (this.state === 'planted' && this.seedType) {
            const seed = seeds[this.seedType];
            if (seed && seed.isReady(this.plantedAt)) {
                this.state = 'ready';
            }
        }
    }
}

module.exports = Tile;