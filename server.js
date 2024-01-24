const dotenv = require('dotenv');
dotenv.config({ path: './config.env' })


const app = require('./app');
const mongoose = require('mongoose');



const DB = process.env.DATABASE_URL.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false
}).then(() => console.log('DB connection established'))

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
