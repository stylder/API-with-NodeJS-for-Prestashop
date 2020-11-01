var Stock = require('../models/stock');

/* Stock routes */
module.exports = function(app) {

   
    /* Get all orders */
    app.get('/stock', function(req, res){
        Stock.getStock(function(error, data) {
            res.json(200,data);
        });
    });

}