const dotenv = require("dotenv");
dotenv.config();

const sql = require('mssql')

const config = {
    user: process.env.MICROSOFT_SQL_USER,
    password: process.env.MICROSOFT_SQL_PASSWORD,
    server: process.env.MICROSOFT_SQL_SERVER,
    database: process.env.MICROSOFT_SQL_DATABASE
}

sql.connect(config).then(() => {
    return sql.query`select * from mytable where id = ${value}`
}).then(result => {
    console.dir(result)
}).catch(err => {
    console.log(err)
})
 
sql.on('error', err => {
    // ... error handler
    console.log('error on', err)
})

