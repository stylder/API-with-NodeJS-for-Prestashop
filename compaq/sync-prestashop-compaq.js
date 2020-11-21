/**
 * PASOS PARA HACER LA SINCRONIZACIÓN DE INVENTARIOS
 *
 *  1) Definir la llave foranea de la base de datos.
 *  2) Insertar o Actualizar los datos de los productos
 *  3) Verificar los cambios
 *
 */

const log4js = require("log4js");
const moment = require("moment");
const filename = moment().format("YYYY-MM-DD - HH_mm_ss");
const sql = require("mssql");
const mysql = require("mysql2/promise");

const dotenv = require("dotenv");
dotenv.config();

let conn = {};

const actualizarInventario = async () => {
  const { recordset } = await obtenerProductosCompaq();

  for (const producto of recordset) {
    const { CNOMBREPRODUCTO, CCODALTERN } = producto;

    const id = await obtenerIDProductoPrestashop(CCODALTERN);

    if (id) {
      await actualizarProductoPrestashop(id, producto);
      console.log('Actualizando :::', CNOMBREPRODUCTO, '(', producto.CANTIDAD, ')')
    } else {
      //const nuevoProducto = await agregarProductoPrestashop(id,producto);
      //console.log(nuevoProducto);
    }
  }
  console.log("Se actualizó el inventario");
};

/**
 * Método que nos permite obtener todos los productos de Compaqi
 *
 * Se tienen los siguientes parámetros que son de utilidad:
 *   CANTIDAD,
 *   CNOMBREPRODUCTO,
 *   CDESCRIPCIONPRODUCTO,
 *   CCODALTERN,
 *   CDESCCORTA,
 *   CPRECIO
 */
const obtenerProductosCompaq = async () => {
  const query = `SELECT admExistenciaCosto.CENTRADASPERIODO12 - admExistenciaCosto.CSALIDASPERIODO12 as CANTIDAD, admProductos.*
  FROM admProductos

  INNER JOIN admExistenciaCosto
  ON admExistenciaCosto.CIDPRODUCTO  = admProductos.CIDPRODUCTO
  
  WHERE CIDEJERCICIO = 1 AND CIDALMACEN =1;`;

  return sql.connect(crearConexionCompaq()).then(() => {
    return sql.query(query);
  });
};

const crearURLAmigable = async () => {
  try {
  } catch (error) {}
};

const convertirProductos = (producto) => {
  return {
    id_product: null,
    id_supplier: 1,
    id_manufacturer: 1,
    id_category_default: 1,
    id_shop_default: 1,
    id_tax_rules_group: 1,
    on_sale: 0,
    online_only: 0,
    ean13: 0,
    isbn: null,
    upc: null,
    ecotax: 0.0,
    quantity: 500,
    minimal_quantity: 1,
    price: producto.precio, /// ⚠️
    wholesale_price: producto.precio, /// ⚠️
    unity: null,
    unit_price_ratio: 0.0,
    additional_shipping_cost: 0.0,
    reference: producto.referencia, /// ⚠️
    supplier_reference: null,
    location: null,
    width: 0.0,
    height: 0.0,
    depth: 0.0,
    weight: 0.0,
    out_of_stock: 2,
    quantity_discount: 0,
    customizable: 0,
    uploadable_files: 0,
    text_fields: 0,
    active: 1,
    redirect_type: "404", // '','404','301-product','302-product','301-category','302-category'
    id_type_redirected: 0,
    available_for_order: 1,
    available_date: 0000 - 00 - 00,
    show_condition: 1,
    condition: "new", // 'new','used','refurbished'
    show_price: 1,
    indexed: 1,
    visibility: "both",
    cache_is_pack: 0,
    cache_has_attachments: 0,
    is_virtual: 0,
    cache_default_attribute: 1,
    date_add: today,
    date_upd: today,
    advanced_stock_management: 0,
    pack_stock_type: 3,
    state: 1,
  };
};

/**
 * Método que nos permite obtener el id de un producto si existe.
 * La llave para comunicar los dos sistemas es por medio del código de barras.
 *
 * @param {*} ean13
 */
const obtenerIDProductoPrestashop = async (ean13) => {
  if (ean13) {
    const query = `SELECT id_product FROM pr_product WHERE ean13 = ${ean13};`;
    try {
      const [rows] = await conn.execute(query);
      if (rows.length) {
        const { id_product } = rows[0];
        return id_product;
      } else {
        return null;
      }
    } catch (error) {
      return error;
    }
  } else {
    return null;
  }
};

const agregarProductoPrestashop = async () => {
  const insertarProducto = `INSERT INTO pr_product SET ?`;
  const insertarTraduccion = `INSERT INTO pr_product_lang SET ?`;
  const insertarTienda = `INSERT INTO pr_product_shop SET ?`;

  /* try {
    const [rows] = await conn.execute(insertarProducto, insertarProducto);
    if (rows.length) {
      const { exist } = rows[0];
      return exist === ean13;
    } else {
      return false;
    }
  } catch (error) {
    return error;
  } */
};

const actualizarProductoPrestashop = async (id, producto) => {
  let quantity = producto.CANTIDAD > 0 ? producto.CANTIDAD : 0;

  let nombre = producto.CNOMBREPRODUCTO || '';

  let decripcion = producto.CDESCRIPCIONPRODUCTO || ''

  const sentenciaCantidad = `UPDATE pr_stock_available SET quantity = ${quantity} WHERE id_product = ${id};`;

  const sentenciaNombreDescripcion = `UPDATE pr_product_lang SET name = ${nombre}, description = ${decripcion}  WHERE id_product = ${id};`;

  try {
    await conn.execute(sentenciaCantidad);
    await conn.execute(sentenciaNombreDescripcion);
  } catch (error) {
    return error;
  }
};

const crearLogger = async () => {
  log4js.configure({
    appenders: {
      cheese: { type: "file", filename: `../logs/${filename}.log` },
    },
    categories: {
      default: { appenders: ["cheese"], level: "info" },
    },
  });
};

const crearConexionPrestashop = async () => {
  conn = await mysql.createConnection({
    host: process.env.MYSQL_PRESTASHOP_HOST || "",
    user: process.env.MYSQL_PRESTASHOP_USER || "",
    password: process.env.MYSQL_PRESTASHOP_PASSWORD || "",
    database: process.env.MYSQL_PRESTASHOP_DATABASE || "",
  });
};

const crearConexionCompaq = () => {
  return {
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
};

crearConexionPrestashop().then(async () => {
  await crearLogger();
  await actualizarInventario();
  console.log("Terminamos");
});
