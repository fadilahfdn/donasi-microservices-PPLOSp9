const campaignModel = require('../models/campaignModel');

const fetchAllCampaigns = async () => {
    return await campaignModel.getAll();
};

const createNewCampaign = async (campaignData) => {
    const { judul, deskripsi, target_dana } = campaignData;
    // Di sini Anda bisa menambahkan logika tambahan, misal: validasi angka
    if (target_dana < 10000) throw new Error('Target dana minimal Rp10.000');
    
    return await campaignModel.create(judul, deskripsi, target_dana);
};

const updateCampaign = async (id, campaignData) => {
    return await campaignModel.update(id, campaignData);
};

const deleteCampaign = async (id) => {
    return await campaignModel.remove(id);
};

module.exports = { 
    fetchAllCampaigns, 
    createNewCampaign, 
    updateCampaign, 
    deleteCampaign 
};