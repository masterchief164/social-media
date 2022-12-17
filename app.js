require("dotenv").config();
const cors = require("cors");
const express = require("express")
const app = express();
const contestRouter = require("./routers/routes");
const morgan = require("morgan");

app.use(express.urlencoded({extended: true}));
app.use(express.json());
if(process.env.MODE !== 'test') app.use(morgan("dev"));
app.use(cors('*'));
app.use("/api", contestRouter);

module.exports = app;
