const ImageFarmDisplay = require('./ImageFarmDisplay');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

const imageFarmDisplay = new ImageFarmDisplay();

class UIManager {
    /**
     * Génère l'affichage de la ferme avec boutons
     */
    static async generateFarmUI(player, farm, seeds) {
        const imagePath = await imageFarmDisplay.generateFarmImage(farm, seeds);
        const attachment = new AttachmentBuilder(imagePath, { name: 'farm.png' });

        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('Ferme de ' + player.username)
            .setImage('attachment://farm.png')
            .addFields(
                { name: 'Taille', value: `${player.farmSize}x${player.farmSize}`, inline: true },
                { name: 'Argent', value: `${player.money}$`, inline: true },
                { name: 'Niveau', value: `${player.level}`, inline: true }
            )

        return {
            embeds: [embed],
            files: [attachment],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 3, // Success (vert)
                            label: 'Planter',
                            custom_id: 'plant'
                        },
                        {
                            type: 2,
                            style: 4, // Danger (rouge)
                            label: 'Récolter',
                            custom_id: 'harvest'
                        },
                        {
                            type: 2,
                            style: 1, // Primary (bleu)
                            label: 'Shop',
                            custom_id: 'shop_view'
                        }
                    ]
                }
            ]
        };
    }

    /**
     * Génère l'affichage du shop
     */
    static async generateShopUI(player, farm, seeds) {
        const imagePath = await imageFarmDisplay.generateFarmImage(farm, seeds);
        const attachment = new AttachmentBuilder(imagePath, { name: 'farm.png' });

        let seedsList = '**Graines disponibles:**\n';
        
        for (const [type, seed] of Object.entries(seeds)) {
            const canBuy = player.level >= seed.requiredLevel;
            const status = canBuy ? '✅' : '❌';
            const inInventory = player.inventory[type] || 0;
            seedsList += `${status} **${seed.name}** - Achat: ${seed.buyPrice}$ | Vente: ${seed.sellPrice}$ (Vous avez: ${inInventory})\n`;
        }

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('Shop')
            .setDescription(seedsList)
            .setImage('attachment://farm.png')
            .addFields(
                { name: 'Votre argent', value: `${player.money}$`, inline: true },
                { name: 'Votre niveau', value: `${player.level}`, inline: true }
            )

        return {
            embeds: [embed],
            files: [attachment],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 3, // Success
                            label: 'Acheter',
                            custom_id: 'shop_buy'
                        },
                        {
                            type: 2,
                            style: 2, // Secondary (gris)
                            label: 'Vendre',
                            custom_id: 'shop_sell'
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 2,
                            label: 'Agrandir ferme',
                            custom_id: 'shop_expand'
                        },
                        {
                            type: 2,
                            style: 2,
                            label: 'Monter de niveau',
                            custom_id: 'shop_levelup'
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 4, // Danger
                            label: '← Retour à la ferme',
                            custom_id: 'back_to_farm'
                        }
                    ]
                }
            ]
        };
    }

    /**
     * Affiche un message temporaire
     */
    static async showSuccessMessage(interaction, message) {
        const reply = await interaction.followUp({
            content: message,
            ephemeral: true
        });
        setTimeout(() => reply.delete().catch(() => {}), 5000);
    }

    /**
     * Met à jour le message avec la ferme
     */
    static async updateFarmMessage(interaction, player, farm, seeds, successMessage = null) {
        const ui = await this.generateFarmUI(player, farm, seeds);

        await interaction.update(ui);

        if (successMessage) {
            await this.showSuccessMessage(interaction, successMessage);
        }
    }

    /**
     * Met à jour le message avec le shop
     */
    static async updateShopMessage(interaction, player, farm, seeds, successMessage = null) {
        const ui = await this.generateShopUI(player, farm, seeds);
        
        await interaction.update(ui);
        
        if (successMessage) {
            await this.showSuccessMessage(interaction, successMessage);
        }
    }

    /**
     * Retour à la ferme depuis n'importe où
     */
    static async backToFarm(interaction, player, farm, seeds) {
        const ui = await this.generateFarmUI(player, farm, seeds);
        await interaction.update(ui);
    }
}

module.exports = UIManager;
