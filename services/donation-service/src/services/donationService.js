const donationModel = require('../models/donationModel');
const { getChannel } = require('../config/rabbit');

const processDonation = async (donationData) => {
    const { userId, userName, campaignId, nominal, pesan } = donationData;

    if (nominal <= 0) throw new Error('Nominal donasi harus lebih dari 0');

    const donationId = await donationModel.createDonation(userId, campaignId, nominal, pesan);

    const channel = getChannel();
    const message = JSON.stringify({ donationId, userId, userName, nominal, timestamp: new Date() });
    
    channel.sendToQueue('donation_notifications', Buffer.from(message), { persistent: true });

    return donationId;
};

module.exports = { processDonation };