// Get the functions in the db.js file to use
const db = require('../services/db');
const bcrypt = require("bcryptjs");

class Company {

    // Id of the company
    id;

    // Email of the company
    email;

    constructor(email) {
        this.email = email;
    }
    async getIdFromEmail() {
        var sql = "SELECT id FROM Companies WHERE Companies.email = ?";
        const result = await db.query(sql, [this.email]);
        // TODO LOTS OF ERROR CHECKS HERE..
        if (JSON.stringify(result) != '[]') {
            this.id = result[0].id;
            return this.id;
        }
        else {
            return false;
        }
    }
    async setUserPassword(password) {
        const pw = await bcrypt.hash(password, 10);
        var sql = "UPDATE Companies SET password = ? WHERE Companies.id = ?"
        const result = await db.query(sql, [pw, this.id]);
        return true;
    }
    async addUser(password) {
        const pw = await bcrypt.hash(password, 10);
        var sql = "INSERT INTO Companies (email, password) VALUES (? , ?)";
        const result = await db.query(sql, [this.email, pw]);
        console.log(result.insertId);
        this.id = result.insertId;
        return true;
    }
    async authenticate(submitted) {
        // Get the stored, hashed password for the company
        var sql = "SELECT password FROM Companies WHERE id = ?";
        const result = await db.query(sql, [this.id]);
        const match = await bcrypt.compare(submitted, result[0].password);
        if (match == true) {
            return true;
        }
        else {
            return false;
        }
    }

}
module.exports  = {
    Company,
}