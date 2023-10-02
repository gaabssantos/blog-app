const dotenv = require("dotenv").config();

if (process.env.NODE_ENV == "production") {
  module.exports = {
    mongoURI: process.env.MONGO_URI_GLOBAL,
  };
} else {
  module.exports = {
    mongoURI: process.env.MONGO_URI_LOCAL,
  };
}
