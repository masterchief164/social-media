require("dotenv").config();
const cors = require("cors");
const express = require("express")
const app = express();
const contestRouter = require("./routers/routes");

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());
app.use("/api", contestRouter);

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started on port 3000");
});
