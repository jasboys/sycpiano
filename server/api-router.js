const express = require('express');
const models = require('./models');

const apiRouter = express.Router();

apiRouter.get('/acclaims', (req, res) => {
    const attributes = ['short', 'quote', 'author', 'shortAuthor'];

    // TODO: add order-by http://docs.sequelizejs.com/en/v3/docs/querying/
    const params = { attributes: attributes };
    if (req.query.hasOwnProperty('count')) {
        params.limit = req.params.count;
    }
    models.Acclaim.findAll(params).then(object => {
        return res.json(object);
    });
});

module.exports = apiRouter;