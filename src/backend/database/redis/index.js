const redis = require("ioredis");
const redisConfig = require( './redisConfig');
const redisClient = new redis(redisConfig);

redisClient.on('connect', () => {
  console.log('APP --> Redis connect...')
});
redisClient.on('ready', () => {
  console.log('APP --> Redis ready ✔️')
});
redisClient.on('reconnecting', () => {
  console.log('APP --> Redis reconnecting...')
});
redisClient.on('error', (error) => {
  console.log('APP --> Redis error ❌', error)
});
redisClient.on('end', () => {
  console.log('APP --> Redis end ❌')
});

module.exports = { redisClient };

/*redisClient.select(process.env.REDIS_DB, function(error,res){
    // you'll want to check that the select was successful here
    // if(error) return error;
    if(res) console.log(`APP --> Resdis Select DB${process.env.REDIS_DB}`, res)
    //redisClient.set('key', 'string'); // this will be posted to database 1 rather than db 0
  });
*/
