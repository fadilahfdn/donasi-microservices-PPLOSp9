const amqp = require('amqplib');
require('dotenv').config();

let channel;

const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue('donation_notifications', { durable: true });
        console.log("Donation Service connected to RabbitMQ");
        return channel;
    } catch (error) {
        console.error("RabbitMQ Connection Error:", error);
    }
};

const getChannel = () => channel;

module.exports = { connectRabbitMQ, getChannel };