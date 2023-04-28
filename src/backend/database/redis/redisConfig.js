var retryStrategy = require("node-redis-retry-strategy");

module.exports = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: process.env.REDIS_DB,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1, // null for wait forever
  autoResubscribe: true,
  retryStrategy: retryStrategy({
    delay_of_retry_attempts: 60000,
    number_of_retry_attempts: Number.MAX_SAFE_INTEGER, //Number.MAX_SAFE_INTEGER
    wait_time: 100000
  })
}