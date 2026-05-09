const express = require('express');
const amqp = require('amqplib');
const db = require('./db');
const { verifyToken } = require('../campaign-service/src/middlewares/authMiddleware');
require('dotenv').config();

const app = express();
app.use(express.json());

let channel;

// menghubungkan ke RabbitMQ
async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue('donation_notifications', { durable: true });
        console.log("Connected to RabbitMQ");
    } catch (error) {
        console.error("Gagal konek RabbitMQ:", error);
    }
}
connectRabbitMQ();

// melakukan Donasi
app.post('/', verifyToken, async (req, res) => {
    const { campaign_id, nominal, pesan_dukungan } = req.body;
    const user_id = req.user.id;

    if (!nominal || nominal <= 0) return res.status(400).json({ error: "Nominal tidak valid" });

    try {
        // menyimpan transaksi ke tabel Donasi
        const [result] = await db.execute(
            'INSERT INTO donations (user_id, campaign_id, nominal, pesan_dukungan, status_pembayaran) VALUES (?, ?, ?, ?, ?)',
            [user_id, campaign_id, nominal, pesan_dukungan, 'berhasil']
        );

        // update dana yg terkumpul di tabel Campaigns
        await db.execute(
            'UPDATE campaigns SET dana_terkumpul = dana_terkumpul + ? WHERE id = ?',
            [nominal, campaign_id]
        );

        // kirim Pesan ke RabbitMQ
        const notificationData = {
            donationId: result.insertId,
            userId: user_id,
            nominal: nominal,
            timestamp: new Date()
        };
        
        channel.sendToQueue('donation_notifications', Buffer.from(JSON.stringify(notificationData)), {
            persistent: true
        });

        res.status(201).json({ 
            message: 'Donasi berhasil! Notifikasi sedang diproses.',
            donationId: result.insertId 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gagal memproses donasi" });
    }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Donation Service berjalan di port ${PORT}`));