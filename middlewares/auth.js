const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(401).send({
            auth: false,
            message: 'No token provided.'
        });
    }
    jwt.verify(token, process.env.TOKEN_SECRET, {}, (err, user) => {
        if (err) {
            console.log(err)
            return res.sendStatus(403)
        }
        req.user = user
        next()
    })
}

module.exports = verifyToken;