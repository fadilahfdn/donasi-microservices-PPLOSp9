const db = require('../config/db');

const createDonation = async (userId, campaignId, nominal, pesan) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // simpan data donasi
        const [result] = await connection.execute(
            'INSERT INTO donations (user_id, campaign_id, nominal, pesan_dukungan, status_pembayaran) VALUES (?, ?, ?, ?, ?)',
            [userId, campaignId, nominal, pesan, 'berhasil']
        );

        // update dana terkumpul
        await connection.execute(
            'UPDATE campaigns SET dana_terkumpul = dana_terkumpul + ? WHERE id = ?',
            [nominal, campaignId]
        );

        await connection.commit();
        return result.insertId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = { createDonation };