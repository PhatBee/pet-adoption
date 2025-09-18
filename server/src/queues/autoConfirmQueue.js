const Queue = require('bull');

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  // password: process.env.REDIS_PASSWORD, // nếu có
};

const autoConfirmQueue = new Queue('autoConfirm', { redis: redisConfig });

// Optional: log queue errors
autoConfirmQueue.on('error', (err) => {
  console.error('autoConfirmQueue error', err);
});

module.exports = autoConfirmQueue;