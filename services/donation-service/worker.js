const amqp = require('amqplib');
require('dotenv').config();

async function startWorker() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = 'donation_notifications';

        await channel.assertQueue(queue, { durable: true });
        console.log(`[*] Menunggu pesan di antrean ${queue}.`);

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const data = JSON.parse(msg.content.toString());
                
                // memproses notifikasi
                console.log(`[v] Mengirim Notifikasi: Terima kasih Saudara/i ${data.userName} (ID: ${data.userId}) atas donasi Rp${data.nominal}!`);
                
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error("Worker error:", error);
    }
}

startWorker();