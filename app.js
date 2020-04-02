const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const keys = require("./config/keys");

require("./models/Article");
require("./utils/redis");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

mongoose
  .connect(keys.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log(`Mongoose connected`);
  })
  .catch((err) => console.error(err));

require("./routes/articles")(app);

app.listen(port, () => {
  console.log(`app is listening on port: ${port}!`);
});
