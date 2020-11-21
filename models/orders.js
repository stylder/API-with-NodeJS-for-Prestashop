let connection = require("./connection");
const mysql = require("mysql2/promise");

/* Orders object */
var Order = {};

const prefix = "pr_";
/* Get all orders */
Order.getOrders = function (callback) {
  if (connection) {
    connection.query("SELECT * FROM pr_orders ORDER BY id_order", function (
      error,
      rows
    ) {
      if (error) {
        throw error;
      } else {
        callback(null, rows);
      }
    });
  }
};

Order.getProducts = async () => {
  const query = `
        
    SELECT SQL_CALC_FOUND_ROWS a.id_order, reference, total_paid_tax_incl, payment, a.date_add AS date_add
, 
    a.id_currency,
    a.id_order AS id_pdf,
    CONCAT(LEFT(c.firstname, 1), '. ', c.lastname) AS customer,
    osl.name AS osname,
    os.color,
    IF((SELECT so.id_order FROM pr_orders so WHERE so.id_customer = a.id_customer AND so.id_order < a.id_order LIMIT 1) > 0, 0, 1) as new,
    country_lang.name as cname,
    IF(a.valid, 1, 0) badge_success, shop.name as shop_name 
FROM pr_orders a 


    LEFT JOIN pr_customer c ON (c.id_customer = a.id_customer)
    INNER JOIN pr_address address ON address.id_address = a.id_address_delivery
    INNER JOIN pr_country country ON address.id_country = country.id_country
    INNER JOIN pr_country_lang country_lang ON (country.id_country = country_lang.id_country AND country_lang.id_lang = 2)
    LEFT JOIN pr_order_state os ON (os.id_order_state = a.current_state)
    LEFT JOIN pr_order_state_lang osl ON (os.id_order_state = osl.id_order_state AND osl.id_lang = 2) 
LEFT JOIN pr_shop shop
                        ON a.id_shop = shop.id_shop WHERE 1  AND a.id_shop IN (1) 

ORDER BY a.id_order DESC

    `;

  try {
    const conn = await mysql.createConnection({
      host: process.env.MYSQL_PRESTASHOP_HOST || "",
      user: process.env.MYSQL_PRESTASHOP_USER || "",
      password: process.env.MYSQL_PRESTASHOP_PASSWORD || "",
      database: process.env.MYSQL_PRESTASHOP_DATABASE || "",
    });

    let [orders] = await conn.execute(query);

    await Promise.all(
      orders.map(async ({ id_order }, index) => {
        const queryListProducts = `SELECT  * FROM pr_order_detail WHERE id_order = ${id_order}`;
        const [products] = await conn.execute(queryListProducts);
        orders[index]["products"] = products;
      })
    );

    return { orders };
  } catch (err) {
    console.log("error", err);
  }
};

Order.getProductsAAAAA = async () => {
  if (connection) {
    const query = `
        
    SELECT SQL_CALC_FOUND_ROWS a.id_order, reference, total_paid_tax_incl, payment, a.date_add AS date_add
, 
    a.id_currency,
    a.id_order AS id_pdf,
    CONCAT(LEFT(c.firstname, 1), '. ', c.lastname) AS customer,
    osl.name AS osname,
    os.color,
    IF((SELECT so.id_order FROM pr_orders so WHERE so.id_customer = a.id_customer AND so.id_order < a.id_order LIMIT 1) > 0, 0, 1) as new,
    country_lang.name as cname,
    IF(a.valid, 1, 0) badge_success, shop.name as shop_name 
FROM pr_orders a 


    LEFT JOIN pr_customer c ON (c.id_customer = a.id_customer)
    INNER JOIN pr_address address ON address.id_address = a.id_address_delivery
    INNER JOIN pr_country country ON address.id_country = country.id_country
    INNER JOIN pr_country_lang country_lang ON (country.id_country = country_lang.id_country AND country_lang.id_lang = 2)
    LEFT JOIN pr_order_state os ON (os.id_order_state = a.current_state)
    LEFT JOIN pr_order_state_lang osl ON (os.id_order_state = osl.id_order_state AND osl.id_lang = 2) 
LEFT JOIN pr_shop shop
                        ON a.id_shop = shop.id_shop WHERE 1  AND a.id_shop IN (1) 

ORDER BY a.id_order DESC

    `;
    try {
      const rows = await connection.query(query);

      //const string2 = await connection.query(query);
      //const string3 = await connection.query(query);
      //const string4 = await connection.query(query);

      console.log(">", rows);
      return rows;
    } catch (err) {
      //console.log("error", err);
    }
  }
};

/* Get order by Id */
Order.getOrder = function (id, callback) {
  if (connection) {
    var sql =
      "SELECT * FROM pr_orders WHERE id_order = " + connection.escape(id);
    connection.query(sql, function (error, row) {
      if (error) {
        throw error;
      } else {
        callback(null, row);
      }
    });
  }
};

/* Insert a new order */
Order.insertOrder = function (orderData, callback) {
  if (connection) {
    connection.query("INSERT INTO pr_orders SET ?", orderData, function (
      error,
      result
    ) {
      if (error) {
        throw error;
      } else {
        /* Return last insert ID */
        callback(null, { insertId: result.insertId });
      }
    });
  }
};

/* Update an Order */
Order.updateOrder = function (orderData, callback) {
  if (connection) {
    connection.query(
      "SELECT pr_orders FROM pr_orders WHERE id_order = " +
        connection.escape(orderData.id_order),
      function (error, row) {
        if (row == "") {
          callback(null, { insertId: 0 });
        } else {
          connection.query(
            "UPDATE pr_orders SET ? WHERE id_order = " +
              parseInt(orderData.id_order),
            orderData,
            function (error, result) {
              if (error) {
                throw error;
              } else {
                callback(null, { insertId: orderData.id_order });
              }
            }
          );
        }
      }
    );
  }
};

/* Update an Order */
Order.deleteOrder = function (id, callback) {
  if (connection) {
    var sqlExists =
      "SELECT * FROM pr_orders WHERE id_order = " + connection.escape(id);
    connection.query(sqlExists, function (err, row) {
      /* If order ID exists */
      if (row != "") {
        var sql =
          "DELETE FROM pr_orders WHERE id_order = " + connection.escape(id);
        connection.query(sql, function (error, result) {
          if (error) {
            throw error;
          } else {
            callback(null, { msg: "Pedido eliminado" });
          }
        });
      } else {
        callback(null, { msg: "ERROR: No existe un pedido con id = " + id });
      }
    });
  }
};

module.exports = Order;
