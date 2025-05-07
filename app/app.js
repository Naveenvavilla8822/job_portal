// Import express.js to create the web application
const express = require("express");

// Import User model from models
const { User } = require("./models/user");

// Get the Contact model
const { Contact } = require("./models/contact");

// Create an instance of an Express app
var app = express();

// Serve static files from the "static" directory
app.use(express.static("static"));

// Import database utility functions
const db = require('./services/db');

// Import and configure cookie parser middleware
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Import and configure session middleware
const session = require('express-session');
const oneDay = 1000 * 60 * 60 * 24;
const sessionMiddleware = session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767", // Secret used to sign session ID cookie
    saveUninitialized: true,
    cookie: { maxAge: oneDay }, // Session expires in one day
    resave: false
});
app.use(sessionMiddleware);

// Import and configure body parser middleware to parse request bodies
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set Pug as the templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Route: Homepage
app.get("/", function (req, res) {
    res.render("Homepage");
});

// Route: About page
app.get("/about", function (req, res) {
    res.render("Aboutpage");
});

// Route: Contact page
app.get("/contact", function (req, res) {
    res.render("contact");
});

// Route: Display job listings with optional search filters
app.get("/jobs", function (req, res) {
    let sql = "SELECT * FROM jobs WHERE 1=1";
    let filters = [];

    // Add title filter if present
    if (req.query.title) {
        sql += " AND title LIKE ?";
        filters.push(`%${req.query.title}%`);
    }

    // Add location filter if present
    if (req.query.location) {
        sql += " AND location LIKE ?";
        filters.push(`%${req.query.location}%`);
    }

    // Add job type filter if present
    if (req.query.job_type) {
        sql += " AND job_type = ?";
        filters.push(req.query.job_type);
    }

    // Execute the SQL query and render jobs view
    db.query(sql, filters).then(results => {
        res.render("jobs", { jobs: results, searchParams: req.query });
    });
});

// Route: Job detail page by job_id
app.get("/job/:id", function (req, res) {
    const jobId = req.params.id;  // Get job ID from the URL
    const sql = "SELECT * FROM jobs WHERE job_id = ?";  // SQL to fetch job by ID

    db.query(sql, [jobId]).then(results => {
        if (results.length === 0) {
            return res.status(404).send("Job not found");
        }

        const job = results[0];  // Get the job data
        res.render("view", { job: job });  // Render job detail view
    }).catch(err => {
        console.error("Error fetching job details:", err);
        res.status(500).send("Error retrieving job details.");
    });
});

// Route: Simple DB test to fetch all data from test_table
app.get("/db_test", function (req, res) {
    const sql = 'SELECT * FROM test_table';
    db.query(sql).then(results => {
        console.log(results);
        res.send(results);
    });
});

// Route: Goodbye page
app.get("/goodbye", function (req, res) {
    res.send("Goodbye world!");
});

// Route: Dynamic hello with name parameter
app.get("/hello/:name", function (req, res) {
    console.log(req.params);
    res.send("Hello " + req.params.name);
});

// Route: Render login page
app.get('/login', function (req, res) {
    res.render('login');
});

// Route: Render signup page
app.get('/signup', function (req, res) {
    res.render('signup');
});

// Route: Authenticate login credentials
app.post('/authenticate', async function (req, res) {
    const email    = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    const user = new User(email);
    try {
        const uId = await user.getIdFromEmail();
        if (!uId) {
            return res.status(401).send('Invalid email');
        }

        const match = await user.authenticate(password);
        if (!match) {
            return res.status(401).send('Invalid password');
        }

        // Store user ID (and you could store role if you fetch it later) in session
        req.session.uid      = uId;
        req.session.loggedIn = true;

        console.log(`User ${uId} logged in, session ${req.session.id}`);
        res.redirect('/');  // or wherever you want logged-in users to land
    } catch (err) {
        console.error('Error in /authenticate:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route: Register a new user or reset password
app.post('/set-password', async function (req, res) {
    const name     = req.body.name;       // for new user
    const email    = req.body.email;
    const password = req.body.password;
    const role     = req.body.role;       // e.g. 'job_seeker' or 'employer'

    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    const user = new User(email);
    try {
        const existingId = await user.getIdFromEmail();

        if (existingId) {
            // user exists → just change their password
            await user.setUserPassword(password);
            res.send('Password updated successfully.');
        } else {
            // new user → name is required
            if (!name) {
                return res.status(400).send('Name is required for registration.');
            }
            // role defaults to job_seeker if not provided
            await user.addUser(name, password, role || 'job_seeker');
            res.send('Registration successful.');
        }
    } catch (err) {
        console.error('Error in /set-password:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route: Logout user and destroy session
app.get('/logout', function (req, res) {
    try {
        req.session.destroy();
        res.redirect('/login');
    } catch (err) {
        console.error("Error logging out:", err);
        res.status(500).send('Internal Server Error');
    }
});

// Contacts API: list all messages
app.get("/contacts", async function (req, res) {
    try {
        const rows = await Contact.getAll();
        res.json(rows);
    } catch (err) {
        console.error("Error fetching contacts:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Contacts API: create a new message
app.post("/contacts", async function (req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "name, email, subject and message are required" });
    }

    try {
        const contact = new Contact(name, email, subject, message);
        const id = await contact.save();
        res.status(201).json({
            id: id,
            name: name,
            email: email,
            subject: subject,
            message: message,
            submitted_at: new Date().toISOString()
        });
    } catch (err) {
        console.error("Error saving contact message:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start the server and listen on port 3000
app.listen(3000, function () {
    console.log(`Server running at http://127.0.0.1:3000/`);
});
