const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

class ImageFarmDisplay {
    constructor() {
        this.tileSize = 32; // Taille des tiles source en pixels
        this.scaleFactor = 1.5; // Facteur d'agrandissement (2 = 64x64 pixels affichés)
        this.displayTileSize = this.tileSize * this.scaleFactor; // Taille affichée
        this.resourcesPath = path.join(__dirname, '../../ressources');

        // Mapping des types de sol vers les noms de fichiers
        this.soilTiles = {
            cornerTopLeft: 'tile001.png',
            cornerTopRight: 'tile003.png',
            cornerBottomLeft: 'tile07.png',
            cornerBottomRight: 'tile09.png',
            edgeTop: 'tile002.png',
            edgeBottom: 'tile08.png',
            edgeLeft: 'tile004.png',
            edgeRight: 'tile06.png',
            center: 'tile05.png',
            empty: 'tile05.png'
        };

        // Cache pour les images chargées
        this.imageCache = new Map();
    }

    /**
     * Charge une image depuis le cache ou le disque
     * @param {string} filename - Nom du fichier image
     * @returns {Promise<Image>} L'image chargée
     */
    async loadTileImage(filename) {
        if (this.imageCache.has(filename)) {
            return this.imageCache.get(filename);
        }

        const imagePath = path.join(this.resourcesPath, filename);
        try {
            // Vérifier si le fichier existe
            if (!fs.existsSync(imagePath)) {
                throw new Error(`Image file not found: ${filename}`);
            }

            const image = await loadImage(imagePath);
            this.imageCache.set(filename, image);
            return image;
        } catch (error) {
            console.warn(`Erreur lors du chargement de l'image: ${filename}`, error);

            // Fallback simple: créer une image avec un rectangle gris
            const fallbackCanvas = createCanvas(this.tileSize, this.tileSize);
            const fallbackCtx = fallbackCanvas.getContext('2d');
            fallbackCtx.fillStyle = '#666666';
            fallbackCtx.fillRect(0, 0, this.tileSize, this.tileSize);
            fallbackCtx.fillStyle = '#FFFFFF';
            fallbackCtx.font = '6px Arial';
            fallbackCtx.fillText(filename.split('.')[0], 1, 8);
            
            // Convertir le canvas en image
            const fallbackImage = await loadImage(fallbackCanvas.toBuffer());
            this.imageCache.set(filename, fallbackImage);
            return fallbackImage;
        }
    }

    /**
     * Génère une image PNG de la ferme
     * @param {Farm} farm - La ferme à afficher
     * @param {Object} seeds - Les données des graines
     * @returns {Promise<string>} Le chemin vers l'image générée
     */
    async generateFarmImage(farm, seeds) {
        const border = 1;
        const totalSize = farm.size + 2 * border;
        const baseTileSize = this.displayTileSize;
        
        // Ajouter de l'espace pour les plantes qui dépassent vers le haut
        const topOverflow = baseTileSize; // Espace pour les plantes hautes
        const canvasWidth = totalSize * baseTileSize;
        const canvasHeight = totalSize * baseTileSize + topOverflow;

        // Créer le canvas
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        // Désactiver l'anti-aliasing pour garder les pixels nets (pixel art)
        ctx.imageSmoothingEnabled = false;

        // Parcourir chaque position
        for (let y = 0; y < totalSize; y++) {
            for (let x = 0; x < totalSize; x++) {
                // Déterminer le type de sol pour la bordure
                let soilType = 'center';
                const isTop = y === 0;
                const isBottom = y === totalSize - 1;
                const isLeft = x === 0;
                const isRight = x === totalSize - 1;

                if (isTop && isLeft) soilType = 'cornerTopLeft';
                else if (isTop && isRight) soilType = 'cornerTopRight';
                else if (isBottom && isLeft) soilType = 'cornerBottomLeft';
                else if (isBottom && isRight) soilType = 'cornerBottomRight';
                else if (isTop) soilType = 'edgeTop';
                else if (isBottom) soilType = 'edgeBottom';
                else if (isLeft) soilType = 'edgeLeft';
                else if (isRight) soilType = 'edgeRight';
                else soilType = 'center';

                // Toujours dessiner le sol d'abord
                let soilFilename = this.soilTiles[soilType];
                
                // Si c'est une tile de ferme (pas bordure), ajuster le sol si nécessaire
                const farmX = x - border;
                const farmY = y - border;
                let plantFilename = null;
                
                if (farmX >= 0 && farmX < farm.size && farmY >= 0 && farmY < farm.size) {
                    const tile = farm.getTile(farmX, farmY);

                    if (tile.state === 'empty') {
                        soilFilename = this.soilTiles.empty;
                    } else if (tile.seedType && seeds[tile.seedType]) {
                        const seed = seeds[tile.seedType];
                        const growthStage = seed.getGrowthStage(tile.plantedAt);
                        
                        // Pour l'étape 0, toutes les plantes utilisent planted_seed.png
                        if (growthStage === 0) {
                            plantFilename = 'planted_seed.png';
                        } else {
                            plantFilename = `${tile.seedType}_${growthStage}.png`;
                        }

                        // Vérifier si l'image de la plante existe
                        const plantImagePath = path.join(this.resourcesPath, plantFilename);
                        if (!fs.existsSync(plantImagePath)) {
                            plantFilename = null; // Pas de plante si l'image n'existe pas
                        }
                    }
                }

                // Dessiner le sol
                try {
                    const soilImage = await this.loadTileImage(soilFilename);
                    ctx.drawImage(
                        soilImage,
                        x * this.displayTileSize,
                        y * this.displayTileSize + topOverflow,
                        this.displayTileSize,
                        this.displayTileSize
                    );
                } catch (error) {
                    // En cas d'erreur, dessiner un rectangle rouge
                    ctx.fillStyle = '#ff0000';
                    ctx.fillRect(
                        x * this.displayTileSize,
                        y * this.displayTileSize + topOverflow,
                        this.displayTileSize,
                        this.displayTileSize
                    );
                }

                // Dessiner la plante par-dessus si elle existe
                if (plantFilename) {
                    try {
                        const plantImage = await this.loadTileImage(plantFilename);

                        // Calculer les dimensions d'affichage pour la plante
                        // Les plantes peuvent dépasser vers le haut
                        const sourceWidth = plantImage.width || this.tileSize;
                        const sourceHeight = plantImage.height || this.tileSize;
                        
                        const displayWidth = sourceWidth * this.scaleFactor;
                        const displayHeight = sourceHeight * this.scaleFactor;
                        
                        // Centrer horizontalement
                        const xOffset = (this.displayTileSize - displayWidth) / 2;
                        // Pour les plantes hautes, permettre de dépasser vers le haut
                        const yOffset = this.displayTileSize - displayHeight;

                        ctx.drawImage(
                            plantImage,
                            x * this.displayTileSize + xOffset,
                            y * this.displayTileSize + topOverflow + yOffset,
                            displayWidth,
                            displayHeight
                        );
                    } catch (error) {
                        // Erreur de chargement de la plante - on l'ignore, le sol reste visible
                    }
                }
            }
        }

        // Sauvegarder l'image
        const imagePath = path.join(__dirname, '../../temp', `farm_${Date.now()}.png`);
        
        // Recadrer l'image pour enlever l'espace vide en haut
        const croppedCanvas = createCanvas(canvasWidth, canvasHeight - topOverflow);
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCtx.drawImage(canvas, 0, topOverflow, canvasWidth, canvasHeight - topOverflow, 0, 0, canvasWidth, canvasHeight - topOverflow);
        
        const buffer = croppedCanvas.toBuffer('image/png');

        // Créer le dossier temp s'il n'existe pas
        const tempDir = path.dirname(imagePath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        fs.writeFileSync(imagePath, buffer);
        return imagePath;
    }

    /**
     * Nettoie les images temporaires (à appeler périodiquement)
     */
    cleanupTempImages() {
        const tempDir = path.join(__dirname, '../../temp');
        if (fs.existsSync(tempDir)) {
            const files = fs.readdirSync(tempDir);
            const now = Date.now();
            const maxAge = 1000 * 60 * 60; // 1 heure

            files.forEach(file => {
                if (file.startsWith('farm_') && file.endsWith('.png')) {
                    const filePath = path.join(tempDir, file);
                    const stats = fs.statSync(filePath);
                    if (now - stats.mtime.getTime() > maxAge) {
                        fs.unlinkSync(filePath);
                    }
                }
            });
        }
    }
}

module.exports = ImageFarmDisplay;