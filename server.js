const mongoose = require('mongoose');
const app = require('./app');

const {MONGO_DATABASE_DEV} = require("./config/config");

//db
mongoose.set('strictQuery', false);

mongoose.connect(
    MONGO_DATABASE_DEV,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)
    .then(() => console.log('DB Connected...'))
    .catch(err => console.log(err));

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

module.exports = app;
