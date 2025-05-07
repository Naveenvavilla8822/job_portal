// Get the functions in the db.js file to use
const db = require('../services/db');
const bcrypt = require("bcryptjs");

class User {

    // Id of the user
    user_id;

    // Name of the user
    name;

    // Email of the user
    email;

    // Role of the user (job_seeker or employer)
    role;

    // Hashed password
    password_hash;

    // Profile picture URL
    profile_picture;

    // Location of the user
    location;

    // Bio text
    bio;

    // Timestamp when account was created
    created_at;

    constructor(email) {
        this.email = email;
    }
    static async findById(id) {
        var sql = "SELECT user_id, name, email, role, profile_picture, location, bio FROM users WHERE user_id = ?";
        const rows = await db.query(sql, [id]);
        if (rows.length === 0) {
            return null;
        }
        const row = rows[0];
        const user = new User(row.email);
        user.user_id        = row.user_id;
        user.name           = row.name;
        user.role           = row.role;
        user.profile_picture= row.profile_picture;
        user.location       = row.location;
        user.bio            = row.bio;
        return user;
    }

    // Look up user_id by email
    async getIdFromEmail() {
        var sql    = "SELECT user_id FROM users WHERE email = ?";
        const result = await db.query(sql, [this.email]);
        // TODO LOTS OF ERROR CHECKS HERE..
        if (JSON.stringify(result) != '[]') {
            this.user_id = result[0].user_id;
            return this.user_id;
        } else {
            return false;
        }
    }

    // Update this user's password
    async setUserPassword(password) {
        const pw = await bcrypt.hash(password, 10);
        var sql    = "UPDATE users SET password_hash = ? WHERE user_id = ?";
        await db.query(sql, [pw, this.user_id]);
        return true;
    }

    // Create a new user record (must pass name and password; role defaults to job_seeker)
    async addUser(name, password, role = 'job_seeker') {
        const pw = await bcrypt.hash(password, 10);
        var sql    = "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)";
        const result = await db.query(sql, [name, this.email, pw, role]);
        console.log(result.insertId);
        this.user_id = result.insertId;
        return true;
    }

    // Verify a submitted password against the stored hash
    async authenticate(submitted) {
        // Get the stored, hashed password for the user
        var sql    = "SELECT password_hash FROM users WHERE user_id = ?";
        const result = await db.query(sql, [this.user_id]);
        const match = await bcrypt.compare(submitted, result[0].password_hash);
        return match === true;
    }

}

module.exports = {
    User,
};
