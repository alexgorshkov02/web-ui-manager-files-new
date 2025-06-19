require("dotenv").config();
const mongoose = require('mongoose');
mongoose.set('debug', true);

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI || 'mongodb://127.0.0.1/webuimanagerfilesnew', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

module.exports = mongoose.connection;