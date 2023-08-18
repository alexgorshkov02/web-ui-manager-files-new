const mongoose = require('mongoose');
mongoose.set('debug', true);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/webuimanagerfilesnew', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

module.exports = mongoose.connection;