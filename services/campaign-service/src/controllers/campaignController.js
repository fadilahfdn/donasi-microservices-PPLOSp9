const campaignService = require('../services/campaignService');

const getAll = async (req, res) => {
    try {
        const campaigns = await campaignService.fetchAllCampaigns();
        res.status(200).json(campaigns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const create = async (req, res) => {
    try {
        const id = await campaignService.createNewCampaign(req.body);
        res.status(201).json({ message: 'Program berhasil dibuat', id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const update = async (req, res) => {
    try {
        await campaignService.updateCampaign(req.params.id, req.body);
        res.status(200).json({ message: 'Program berhasil diperbarui' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const remove = async (req, res) => {
    try {
        await campaignService.deleteCampaign(req.params.id);
        res.status(200).json({ message: 'Program berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAll, create, update, remove };