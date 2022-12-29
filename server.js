const app = require('./app');
const mongoose = require('mongoose');
const config = require('./config');

mongoose.set('strictQuery', true);

mongoose
  .connect(config.MONGO_URI)
  .then(() => {
    console.log('Database connection successful');
    app.listen(config.PORT, () => console.log('Server is running'));
  })
  .catch(error => {
    console.log(error.message);
    process.exit(1);
  });
