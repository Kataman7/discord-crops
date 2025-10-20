class Seed {
    constructor(type, name, growthTime, buyPrice, sellPrice, requiredLevel, growthStages = 3) {
        this.type = type; // ex: 'carrot'
        this.name = name; // ex: 'Carotte'
        this.growthTime = growthTime; // en ms
        this.buyPrice = buyPrice;
        this.sellPrice = sellPrice;
        this.requiredLevel = requiredLevel;
        this.growthStages = growthStages; // Nombre d'étapes de croissance pour les images
    }

    getGrowthStage(plantedAt) {
        if (!plantedAt) return 0; // Si pas planté, retourner l'étape 0
        
        const elapsed = Date.now() - plantedAt;
        const progress = Math.min(elapsed / this.growthTime, 1);
        const stageIndex = Math.floor(progress * (this.growthStages - 1));
        return Math.max(0, Math.min(stageIndex, this.growthStages - 1)); // S'assurer que c'est dans les limites
    }

    isReady(plantedAt) {
        return Date.now() - plantedAt >= this.growthTime;
    }
}

module.exports = Seed;