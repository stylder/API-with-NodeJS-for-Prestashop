var connection = require('./connection');

/* Customers object */
var Customer = {};

/* Get all customers */
Customer.getCustomers = function(callback) {
    if (connection) {
        connection.query('SELECT * FROM pr_customer ORDER BY id_customer', function(error, rows) {
            if(error) {
                throw error;
            }
            else {
                callback(null, rows);
            }
        });
    }
}

/* Get customer by Id */
Customer.getCustomer = function(id, callback) {
    if (connection) {
        var sql = 'SELECT * FROM pr_customer WHERE id_customer = ' + connection.escape(id);
        connection.query(sql, function(error, row) {
            if(error) {
                throw error;
            }
            else {
                callback(null, row);
            }
        });
    }
}

/* Insert a new customer */
Customer.insertCustomer = function(customerData, callback) {
    if (connection) {
        connection.query('INSERT INTO pr_customer SET ?', customerData, function(error, result) {
            if(error) {
                throw error;
            }
            else {
                /* Return last insert ID */
                callback(null,{"insertId" : result.insertId});
            }
        });
    }
}

/* Update a customer */
Customer.updateCustomer = function(customerData, callback) {
    if(connection) {

        connection.query('SELECT id_customer FROM pr_customer WHERE id_customer = ' + connection.escape(customerData.id_customer), function(error, row) {
            if (row == ''){
                callback(null,{"insertId" : 0});
            }else{
                connection.query('UPDATE pr_customer SET ? WHERE id_customer = ' + parseInt(customerData.id_customer), customerData, function(error, result) {
                    if(error) {
                        throw error;
                    }
                    else {
                        callback(null,{"insertId" : customerData.id_customer});
                    }
                });
            }
        });

    }
}

/* Update a customer */
Customer.deleteCustomer = function(id, callback) {
    if(connection) {
        var sqlExists = 'SELECT * FROM pr_customer WHERE id_customer = ' + connection.escape(id);
        connection.query(sqlExists, function(err, row) {
            /* If customer ID exists */
            if(row != '') {
                var sql = 'DELETE FROM pr_customer WHERE id_customer = ' + connection.escape(id);
                connection.query(sql, function(error, result) {
                    if(error) {
                        throw error;
                    }
                    else {
                        callback(null,{"msg" : "Cliente eliminado"});
                    }
                });
            }
            else {
                callback(null,{"msg" : "ERROR: No existe un cliente con id = " + id});
            }
        });
    }
}

module.exports = Customer;