const mysql = require('mysql');

/* Database connection */
const connection = mysql.createConnection({
    host:       process.env.MYSQL_PRESTASHOP_HOST || '',
    user:       process.env.MYSQL_PRESTASHOP_USER || '',
    password:   process.env.MYSQL_PRESTASHOP_PASSWORD || '',
    database:   process.env.MYSQL_PRESTASHOP_DATABASE || ''
});

/* Check database variables */
if (!connection.config.host || !connection.config.user || !connection.config.password  || !connection.config.database) {
    console.error("WARNING: Some database connection variables are not defined. File: models/connection.js.");
}

module.exports = connection;