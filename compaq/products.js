const sql = require("mssql");


log4js.configure({
  appenders: { 
      cheese: { type: "file", filename: `../logs/${filename}.log` } 
  },
  categories: { 
      default: { appenders: ["cheese"], level: "info" } 
  },
});

dotenv.config();

const config = {
  user: process.env.MICROSOFT_SQL_USER,
  password: process.env.MICROSOFT_SQL_PASSWORD,
  server: process.env.MICROSOFT_SQL_SERVER,
  database: process.env.MICROSOFT_SQL_DATABASE,
  enableArithAbort: true,
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
};

sql
  .connect(config)
  .then(() => {
    return sql.query`SELECT admExistenciaCosto.CENTRADASPERIODO12 - admExistenciaCosto.CSALIDASPERIODO12 as CANTIDAD, admProductos.*
    FROM admProductos
    
    INNER JOIN admExistenciaCosto
    ON admExistenciaCosto.CIDPRODUCTO  = admProductos.CIDPRODUCTO
    
    WHERE CIDEJERCICIO = 1 AND CIDALMACEN =1;`;
  })
  .then(({ recordset }) => {
    const logger = log4js.getLogger("products");

    for (const index in recordset) {
      let product = recordset[index];

      // Se agrega un archivo de logs de la petición
      product = JSON.stringify(product);
      logger.info(product);
    }
  })
  .catch((err) => {
    logger.error(err);
  });

sql.on("error", (err) => {
  console.log("error on", err);
});
