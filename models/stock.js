var connection = require('./connection');

/* Orders object */
var Stock = {};

const prefix = 'pr_'
/* Get all orders */
Stock.getStock = function(callback) {
    if (connection) {
        connection.query(`SELECT * FROM ${prefix}stock_available ORDER BY id_product`, function(error, rows) {
            if(error) {
                throw error;
            }
            else {
                callback(null, rows);
            }
        });
    }
}

module.exports = Stock;