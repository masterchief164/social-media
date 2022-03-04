require("dotenv").config();
const { Pool } = require('pg')

const pool = new Pool({
    user: process.env.user,
    database: process.env.database,
    password: process.env.password,
    port: 5432,
    host: process.env.host,
})

module.exports = { pool };