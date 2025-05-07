// Get the functions in the db.js file to use
const db = require('../services/db');

class Contact {

    // Id of the contact message
    id;

    // Name of the sender
    name;

    // Email of the sender
    email;

    // Subject of the message
    subject;

    // Message content
    message;

    // Timestamp when submitted
    submitted_at;

    constructor(name, email, subject, message) {
        this.name       = name;
        this.email      = email;
        this.subject    = subject;
        this.message    = message;
    }

    // Save a new contact message
    async save() {
        var sql    = "INSERT INTO contact_us (name, email, subject, message) VALUES (?, ?, ?, ?)";
        const result = await db.query(sql, [
            this.name,
            this.email,
            this.subject,
            this.message
        ]);
        this.id = result.insertId;
        return this.id;
    }

    // Fetch all contact messages
    static async getAll() {
        var sql = `
            SELECT 
                contact_id AS id,
                name,
                email,
                subject,
                message,
                submitted_at
            FROM contact_us
            ORDER BY submitted_at DESC
        `;
        const rows = await db.query(sql);
        return rows;
    }

}

module.exports = {
    Contact,
};
