const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const keys = require("../config/keys");

const client = redis.createClient(keys.REDIS_URI);

client.hget = util.promisify(client.hget);

// Create reference for .exec
const exec = mongoose.Query.prototype.exec;

// create new cache function on prototype
mongoose.Query.prototype.cache = function (options = { expire: 60 }) {
  this.useCache = true;
  this.expire = options.expire;
  this.hashKey = JSON.stringify(options.key || this.mongooseCollection.name);

  return this;
};

// Change exec to first check for cache
mongoose.Query.prototype.exec = async function () {
  if (!this.cache) {
    return await exec.apply(this, arguments);
  }

  const key = JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name,
  });

  const cacheVal = await client.hget(this.hashKey, key);

  if (!cacheVal) {
    const result = await exec.apply(this, arguments);
    client.hset(this.hashKey, key, JSON.stringify(result));

    client.expire(this.hashKey, this.expire);
    console.log("Return data from MongoDB");
    return result;
  }

  const doc = JSON.parse(cacheVal);
  console.log("Return data from Redis");
  return Array.isArray(doc)
    ? doc.map((d) => new this.model(d))
    : new this.model(doc);
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};
