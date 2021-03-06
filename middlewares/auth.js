const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token||!token.startsWith('Bearer ')) {
        return res.status(401).send({
            auth: false,
            message: 'No token provided.'
        });
    }
    const jwtToken = token.split(' ')[1];
    jwt.verify(jwtToken, process.env.TOKEN_SECRET, {}, (err, user) => {
        if (err) {
            return res.sendStatus(403)
        }
        req.user = user
        next()
    })
}

module.exports = verifyToken;