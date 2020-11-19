const dotenv = require("dotenv");
dotenv.config();

const sql = require('mssql')

const config = {
    user: process.env.MICROSOFT_SQL_USER,
    password: process.env.MICROSOFT_SQL_PASSWORD,
    server: process.env.MICROSOFT_SQL_SERVER,
    database: process.env.MICROSOFT_SQL_DATABASE,
    enableArithAbort: true,
    options: {
        "encrypt": true,
        "enableArithAbort": true
    }
}
console.log(':::', config)

sql.connect(config).then(() => {
    return sql.query`select * from admProductos`
}).then(result => {
    console.log(result)
}).catch(err => {
    console.log(err)
})
 
sql.on('error', err => { console.log('error on', err) })

