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
const hoy =  moment().format("YYYY-MM-DD HH:MM:SS")

const dotenv = require("dotenv");
dotenv.config();

let conn = {};

const actualizarInventario = async () => {
  let productosActualizados = 0;
  let productosAgregados = 0;
  const { recordset } = await obtenerProductosCompaq();

  for (const producto of recordset) {
    const { CCODALTERN } = producto;

    const id = await obtenerIDProductoPrestashop(CCODALTERN);
    

    if (id) {
      await actualizarProductoPrestashop(id, producto);
      productosActualizados++;
      console.log('Actualizando :: ', producto.CNOMBREPRODUCTO);
    } else {
      console.log('Agregando :: ', producto.CNOMBREPRODUCTO);
      const product_id = await agregarDatosProductoPrestashop(producto);
      await agregarLangProductoPrestashop(product_id ,producto);
      await agregarTiendaProductoPrestashop(product_id ,producto);
      await actualizarCantidadProductoPrestashop(product_id ,producto);
      await actualizarCategoriaProductoPrestashop(product_id);
      productosAgregados++;
    }
  }
  console.log("_______________");
  console.log("Productos  | ", productosActualizados);
  console.log("Agregados  | ", productosAgregados);
  console.log("_______________");

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

const crearURLAmigable = (producto) => {
  let url = producto;
  
  // Eliminamos textos diacríticos
  url = url.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Eliminamos carácteres especiales
  url = url.replace(/[^a-zA-Z ]/g, "")

  // Cambiamos el producto a minusculas;
  url = url.toLowerCase();

  // Cambiamos caracteres especiales
  url = url.replace(/"/g, "");

  url = url.replace(/\s/g, "-");

  url = url.replace(/\//g, "-");

  url =  url.replace(/,/g, "");

  return url;
};

const convertirProductos = ({
  CNOMBREPRODUCTO,
  CCODALTERN,
  CPRECIO5,
}) => {
  return {
    id_product: null,
    id_supplier: 1,
    id_manufacturer: 1,
    id_category_default: 2,
    id_shop_default: 1,
    id_tax_rules_group: 1,
    on_sale: 0,
    online_only: 0,
    ean13: CCODALTERN,
    isbn: null,
    upc: null,
    ecotax: 0.0,
    quantity: 0,
    minimal_quantity: 1,
    price: CPRECIO5, /// ⚠️
    wholesale_price: 1.0, /// ⚠️
    unity: null,
    unit_price_ratio: 0.0,
    additional_shipping_cost: 0.0,
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
    available_date: '0000-00-00',
    show_condition: 1,
    condition: "new", // 'new','used','refurbished'
    show_price: 1,
    indexed: 1,
    visibility: "both",
    cache_is_pack: 0,
    cache_has_attachments: 0,
    is_virtual: 0,
    cache_default_attribute: 0,
    date_add: hoy,
    date_upd: hoy,
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

const agregarDatosProductoPrestashop = async (producto) => {
  const insertarProducto = `INSERT INTO pr_product SET ?`;

  let datos = convertirProductos(producto);

  try {
    const [rows] = await conn.query(insertarProducto, datos);
    return rows.insertId;
  } catch (error) {
    console.log('ERROR:::: agregarDatosProductoPrestashop ->', error);
    return error;
  }
};

const agregarLangProductoPrestashop = async (id_product, producto) => {
  const insertarProducto = `INSERT INTO pr_product_lang SET ?`;

  let productoLang = {
    id_product,
    id_shop: 1,
    id_lang: 1,
    description: producto.CDESCRIPCIONPRODUCTO,
    description_short: producto.CDESCRIPCIONPRODUCTO,
    link_rewrite: crearURLAmigable(producto.CNOMBREPRODUCTO),
    meta_description: null,
    meta_keywords: null,
    meta_title: null,
    name: producto.CNOMBREPRODUCTO,
    available_now: "En stock",
    available_later: null,
  };

  try {
    await conn.query(insertarProducto, productoLang);
  
    productoLang.id_lang = 2;

    await conn.query(insertarProducto, productoLang);

  } catch (error) {
    console.log('ERROR:::: agregarLangProductoPrestashop ->', error);
    return error;
  }
};

const agregarTiendaProductoPrestashop = async (id_product, producto) => {
  const sentenciaSql = `INSERT INTO pr_product_shop SET ?`;

  let datos = {
    id_product,
    id_shop: 1,
    id_category_default: 2,
    id_tax_rules_group: 1,
    on_sale: 0,
    online_only: 0,
    ecotax: 0.0,
    minimal_quantity: 1,
    price: producto.CPRECIO5,
    wholesale_price:1.0,
    unity: null,
    unit_price_ratio: 0.0,
    additional_shipping_cost: 0.0,
    customizable: 0,
    uploadable_files: 0,
    text_fields: 0,
    active: 1,
    redirect_type: "404",
    id_type_redirected: 0,
    available_for_order: 1,
    available_date: hoy,
    show_condition: 1,
    condition: "new",
    show_price: 1,
    indexed: 1,
    visibility: "both",
    cache_default_attribute: 1,
    advanced_stock_management: 0,
    date_add: hoy,
    date_upd: hoy,
    pack_stock_type: 3,
  };

  try {
    const [rows] = await conn.query(sentenciaSql, datos);
    return rows;
  } catch (error) {
    console.log('ERROR:::: agregarTiendaProductoPrestashop ->', error);
    return error;
  }
};


const actualizarCategoriaProductoPrestashop = async (id_product) => {
  const sentenciaSql = `INSERT INTO pr_category_product SET ?`;
  const datos = {
    id_product,
    id_category : 2,
    position : 1,
  }
  try {
    const [rows] =await conn.query(sentenciaSql, datos);
    return rows;
  } catch (error) {
    console.log('ERROR:::: actualizarCategoriaProductoPrestashop ->', error);
    return error;
  }
}


const actualizarCantidadProductoPrestashop = async (id, cantidad) => {

  let quantity = cantidad > 0 ? cantidad : 0;
  const sentenciaCantidad = `UPDATE pr_stock_available SET quantity = "${quantity}" WHERE id_product = ${id};`;
  try {
    const [rows] =await conn.execute(sentenciaCantidad);
    return rows;
  } catch (error) {
    console.log('ERROR:::: actualizarCantidadProductoPrestashop ->', error);
    return error;
  }
}




const actualizarProductoPrestashop = async (id, producto) => {
  let quantity = producto.CANTIDAD > 0 ? producto.CANTIDAD : 0;

  let nombre =  producto.CNOMBREPRODUCTO ? producto.CNOMBREPRODUCTO.replace(/"/g, '\\"') : "";

  let descripcion = producto.CDESCRIPCIONPRODUCTO ? producto.CDESCRIPCIONPRODUCTO.replace(/"/g, '\\"') : "";

  // PRECIO SIN IVA
  let precio = producto.CPRECIO5 || 0;

  const sentenciaCantidad = `UPDATE pr_stock_available SET quantity = "${quantity}" WHERE id_product = ${id};`;

  const sentenciaNombreDescripcion = `UPDATE pr_product_lang SET name = "${nombre}", description = "${descripcion}" WHERE id_product = ${id};`;

  const sentenciaPrecio = `UPDATE pr_product_shop SET price = "${precio}" WHERE id_product = ${id};`;

  try {
    await conn.execute(sentenciaNombreDescripcion);
    await conn.execute(sentenciaCantidad);
    await conn.execute(sentenciaPrecio);
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
  console.log("Terminamos ...");
});
