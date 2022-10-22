const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require('mysql');

const con = mysql.createConnection({
    database: 'inventory',
    host: 'localhost',
    user: 'root',
    password: 'password1234',
    multipleStatements: true,
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});


// grn
const grnGetHandler = (req, res) => {
    const sql = `SELECT grn.created_at as grn_created_at, grn_line_item.created_at as li_created_at from grn join grn_line_item on grn.id = grn_line_item.grn_id`
    con.query(sql, function (err, result) {
        res.send(result)
    })
}

const grnPostHandler = (req, res) => {
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const { invoiceNumber, vendorName, vendorFullAddress, grnLineItems, date } = req.body
    const sql = `INSERT INTO grn (created_at,updated_at,status,invoice_number,vendor_name,vendor_full_address,date) VALUES (?,?,?,?,?,?,?)`
    const values = [createdAt, createdAt, 'GENERATED', invoiceNumber, vendorName, vendorFullAddress, date]
    con.query(sql, values, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");

        const lineItemSql = `INSERT INTO grn_line_item (created_at, updated_at, product_name, quantity, stock_price, grn_id) VALUES ?`
        const values = grnLineItems.map((grnLineItem) => {
            const { productName, quantity, stockPrice } = grnLineItem
            return [createdAt, createdAt, productName, quantity, stockPrice, result.insertId]
        })
        con.query(lineItemSql, [values], function (err, result) {
            if (err) throw err;
            console.log("all lineitems inserted");
        })
    });
    res.send();
}

const grnPutHandler = (req, res) => {
    const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const { id, status, invoiceNumber, vendorName, vendorFullAddress, grnLineItems, date } = req.body
    const sql = `UPDATE grn SET updated_at = ?, status = ?, invoice_number = ?, vendor_name = ?, vendor_full_address = ?, date = ? WHERE id = ?`
    const values = [updatedAt, status, invoiceNumber, vendorName, vendorFullAddress, date, id]
    con.query(sql, values, function (err, result) {
        if (err) throw err;
        console.log("1 record updated");

        const lineItemSql = `UPDATE grn_line_item SET updated_at = ?, product_name = ?, quantity = ?, stock_price = ? WHERE id = ?`
        const values = grnLineItems.map((grnLineItem) => {
            const { id, productName, quantity, stockPrice } = grnLineItem
            return `UPDATE grn_line_item SET updated_at = ${JSON.stringify(updatedAt)}, product_name = ${JSON.stringify(productName)}, quantity = ${quantity}, stock_price = ${stockPrice} WHERE id = ${id};`
        }).join('')
        con.query(values, function (err, result) {
            if (err) throw err;
            console.log("all lineitems updated");
        })
    });
    res.send();
}

const grnDeleteHandler = (req, res) => {
    const sql = `UPDATE grn SET deleted = 1 WHERE id = ${req.body.id}`
    con.query(sql, function (err, result) {
        res.send(result)
    })
}

const grnUpdateStatusHandler = (req, res) => {
    const sql = `UPDATE grn SET status = ${JSON.stringify(req.body.status)} WHERE id = ${req.body.id}`
    con.query(sql, function (err, result) {
        res.send(result)
    })
}

// order
const orderGetHandler = (req, res) => {
    const sql = `SELECT order_table.created_at as orderC, order_line_item.created_at as liC from order_table join order_line_item on order_table.id = order_line_item.order_id`
    con.query(sql, function (err, result) {
        res.send(result)
    })
}

const orderPostHandler = (req, res) => {
    console.log(req.body)
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const { invoiceNumber, customerName, customerFullAddress, orderLineItems, date } = req.body
    const sql = `INSERT INTO order_table (created_at,updated_at,status,invoice_number,customer_name,customer_full_address,date) VALUES (?,?,?,?,?,?,?)`
    const values = [createdAt, createdAt, 'GENERATED', invoiceNumber, customerName, customerFullAddress, date]
    con.query(sql, values, function (err, result) {
        if (err) throw new Error(err);
        console.log("1 record inserted");

        const lineItemSql = `INSERT INTO order_line_item (created_at, updated_at, product_name, quantity, sell_price, order_id) VALUES ?`
        const values = orderLineItems.map((orderLineItem) => {
            const { productName, quantity, sellPrice } = orderLineItem
            return [createdAt, createdAt, productName, quantity, sellPrice, result.insertId]
        })
        con.query(lineItemSql, [values], function (err, result) {
            if (err) throw err;
            console.log("all lineitems inserted");
        })
    });
    res.send();
}

const orderPutHandler = (req, res) => {
    const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const { id, status, invoiceNumber, customerName, customerFullAddress, orderLineItems, date } = req.body
    const sql = `UPDATE order_table SET updated_at = ?, status = ?, invoice_number = ?, customer_name = ?, customer_full_address = ?, date = ? WHERE id = ?`
    const values = [updatedAt, status, invoiceNumber, customerName, customerFullAddress, date, id]
    con.query(sql, values, function (err, result) {
        if (err) throw err;
        console.log("1 record updated");

        const values = orderLineItems.map((grnLineItem) => {
            const { id, productName, quantity, sellPrice } = grnLineItem
            return `UPDATE order_line_item SET updated_at = ${JSON.stringify(updatedAt)}, product_name = ${JSON.stringify(productName)}, quantity = ${quantity}, sell_price = ${sellPrice} WHERE id = ${id};`
        }).join('')
        con.query(values, function (err, result) {
            if (err) throw err;
            console.log("all lineitems updated");
        })
    });
    res.send();
}

const orderDeleteHandler = (req, res) => {
    const sql = `UPDATE order_table SET deleted = 1 WHERE id = ${req.body.id}`
    con.query(sql, function (err, result) {
        res.send(result)
    })
}

const orderUpdateStatusHandler = (req, res) => {
    const sql = `UPDATE order_table SET status = ${JSON.stringify(req.body.status)} WHERE id = ${req.body.id}`
    con.query(sql, function (err, result) {
        res.send(result)
    })
}

// item

const itemGetHandler = (req, res) => {
    const sql = `SELECT * from item`
    con.query(sql, function (err, result) {
        res.send(result)
    })
}


app.use(bodyParser.json())
app.get("/", (req, res) => { res.send('hello') });


// grn
app.put("/grn/update-status", grnUpdateStatusHandler);

app.get("/grn", grnGetHandler);
app.post("/grn", grnPostHandler);
app.put("/grn", grnPutHandler);
app.delete("/grn", grnDeleteHandler);


// order
app.put("/order/update-status", orderUpdateStatusHandler);

app.get("/order", orderGetHandler);
app.post("/order", orderPostHandler);
app.put("/order", orderPutHandler);
app.delete("/order", orderDeleteHandler);

// item
app.get("/item", itemGetHandler);


app.use(express.static("public"));

module.exports = { app };