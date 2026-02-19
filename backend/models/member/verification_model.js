const jwt = require('jsonwebtoken');
require('dotenv').config();
const prisma = require('../prisma_client');

module.exports = function verifyToken(token) {
    let tokenResult = "";
    const time = Math.floor(Date.now() / 1000);

    return new Promise(async (resolve, reject) => {
        if (!token) {
            tokenResult = false;
            resolve(tokenResult);
            return;
        }
        
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
                if (err) {
                    tokenResult = false;
                    resolve(tokenResult);
                } else if (decoded.exp <= time) {
                    tokenResult = false;
                    resolve(tokenResult);
                } else {
                    tokenResult = decoded.data;
                    resolve(tokenResult);
                }
            })
    })
}