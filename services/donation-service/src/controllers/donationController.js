const donationService = require('../services/donationService');

const create = async (req, res) => {
    try {
       
        const donationData = {
            userId: req.user.id,
            userName: req.user.nama,
            campaignId: req.body.campaign_id,
            nominal: req.body.nominal,
            pesan: req.body.pesan_dukungan
        };

        const donationId = await donationService.processDonation(donationData);

        res.status(201).json({
            message: 'Donasi berhasil! Notifikasi sedang diproses.',
            donationId
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { create };