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

// Make `loggedIn` and `user` available in all templates
app.use(async function(req, res, next) {
    // default to false
    res.locals.loggedIn = req.session.loggedIn || false;

    if (req.session.uid) {
        try {
            // load full user record
            const user = await User.findById(req.session.uid);
            if (user) {
                res.locals.user = user;
            }
        } catch (err) {
            console.error("Error loading user for navbar:", err.message);
        }
    }

    next();
});

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

    try {
        // First, look up the ID
        const userLookup = new User(email);
        const uId = await userLookup.getIdFromEmail();
        if (!uId) {
            return res.status(401).send('Invalid email');
        }

        // Check password
        const isMatch = await userLookup.authenticate(password);
        if (!isMatch) {
            return res.status(401).send('Invalid password');
        }

        // Load full user (to get role, name, etc.)
        const fullUser = await User.findById(uId);
        if (!fullUser) {
            return res.status(500).send('User record not found.');
        }

        // Save to session
        req.session.uid      = uId;
        req.session.loggedIn = true;
        req.session.role     = fullUser.role;

        // Redirect based on role
        if (fullUser.role === 'employer') {
            return res.redirect('/dashboard');
        } else {  // assume job_seeker
            return res.redirect('/jobs');
        }

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

// Route: Dashboard (jobs created by this user)
app.get('/dashboard', async function (req, res) {
    // must be logged in
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }

    // only employers create jobs
    if (req.session.role !== 'employer') {
        // for job seekers, redirect to applications page
        return res.redirect('/jobs');
    }

    try {
        // fetch jobs where this user is the employer
        const sql  = "SELECT * FROM jobs WHERE employer_id = ? ORDER BY posted_at DESC";
        const jobs = await db.query(sql, [req.session.uid]);
        res.render('dashboard', { jobs });
    } catch (err) {
        console.error("Error fetching dashboard jobs:", err.message);
        res.status(500).send('Internal Server Error');
    }
});

// --- Create Job ---

// Render “New Job” form
app.get('/jobs/new', async function(req, res) {
    // only employers can post
    if (!req.session.loggedIn || req.session.role !== 'employer') {
        return res.redirect('/login');
    }

    try {
        // load every company
        const companies = await db.query(
            'SELECT company_id, name FROM companies ORDER BY name'
        );
        console.log('companies loaded:', companies.length);  // debug

        res.render('new-job', {
            companies,          
            activePage: 'post-job'
        });
    } catch (err) {
        console.error("Error loading new-job form:", err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Handle “New Job” submission
app.post('/jobs/new', async function(req, res) {
    if (!req.session.loggedIn || req.session.role !== 'employer') {
        return res.redirect('/login');
    }

    const title        = req.body.title;
    const description  = req.body.description;
    const salary_range = req.body.salary_range;
    const job_type     = req.body.job_type;
    const location     = req.body.location;
    const company_id   = req.body.company_id;
    const employer_id  = req.session.uid;

    // basic validation
    if (!title || !description || !job_type || !company_id) {
        return res.status(400).send('Title, description, job type and company are required.');
    }

    try {
        const sql = `
            INSERT INTO jobs
              (employer_id, company_id, title, description, salary_range, job_type, location)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            employer_id,
            company_id,
            title,
            description,
            salary_range,
            job_type,
            location
        ]);
        res.redirect('/dashboard');
    } catch (err) {
        console.error("Error creating job:", err.message);
        res.status(500).send('Internal Server Error');
    }
});

// --- Update Job ---

// Render “Edit Job” form
app.get('/jobs/:id/edit', async function(req, res) {
    // only employers can edit
    if (!req.session.loggedIn || req.session.role !== 'employer') {
        return res.redirect('/login');
    }

    const jobId = req.params.id;
    try {
        // 1) load the job (ensure it belongs to this employer)
        const rows = await db.query(
            'SELECT * FROM jobs WHERE job_id = ? AND employer_id = ?',
            [jobId, req.session.uid]
        );
        if (rows.length === 0) {
            return res.status(404).send('Job not found');
        }
        const job = rows[0];

        // 2) load ALL companies (so dropdown always has options)
        const companies = await db.query(
            'SELECT company_id, name FROM companies ORDER BY name'
        );
        console.log('edit-job companies loaded:', companies.length);

        // 3) render
        res.render('edit-job', {
            job,
            companies,
            activePage: 'dashboard'
        });
    } catch (err) {
        console.error("Error loading edit-job form:", err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Handle “Edit Job” submission
app.post('/jobs/:id/edit', async function(req, res) {
    if (!req.session.loggedIn || req.session.role !== 'employer') {
        return res.redirect('/login');
    }

    const jobId        = req.params.id;
    const title        = req.body.title;
    const description  = req.body.description;
    const salary_range = req.body.salary_range;
    const job_type     = req.body.job_type;
    const location     = req.body.location;
    const company_id   = req.body.company_id;

    if (!title || !description || !job_type || !company_id) {
        return res.status(400).send('Title, description, job type and company are required.');
    }

    try {
        const sql = `
            UPDATE jobs
            SET company_id   = ?,
                title        = ?,
                description  = ?,
                salary_range = ?,
                job_type     = ?,
                location     = ?
            WHERE job_id = ? AND employer_id = ?
        `;
        await db.query(sql, [
            company_id,
            title,
            description,
            salary_range,
            job_type,
            location,
            jobId,
            req.session.uid
        ]);
        res.redirect('/dashboard');
    } catch (err) {
        console.error("Error updating job:", err.message);
        res.status(500).send('Internal Server Error');
    }
});

// --- Delete Job ---

// Handle “Delete Job”
app.post('/jobs/:id/delete', async function(req, res) {
    if (!req.session.loggedIn || req.session.role !== 'employer') {
        return res.redirect('/login');
    }

    const jobId = req.params.id;
    try {
        await db.query(
            'DELETE FROM jobs WHERE job_id = ? AND employer_id = ?',
            [jobId, req.session.uid]
        );
        res.redirect('/dashboard');
    } catch (err) {
        console.error("Error deleting job:", err.message);
        res.status(500).send('Internal Server Error');
    }
});


// List all applications for the currently logged-in job seeker
app.get('/applications', async function (req, res) {
    if (!req.session.loggedIn) {
        return res.status(401).json({ error: 'Login required' });
    }
    if (req.session.role !== 'job_seeker') {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const sql = `
            SELECT
              a.application_id,
              a.job_id,
              j.title            AS job_title,
              a.name,
              a.email,
              a.linkedin_url,
              a.status,
              a.applied_at
            FROM applications a
            JOIN jobs j
              ON a.job_id = j.job_id
            WHERE a.job_seeker_id = ?
            ORDER BY a.applied_at DESC
        `;
        const apps = await db.query(sql, [req.session.uid]);
        res.json(apps);
    } catch (err) {
        console.error('Error fetching applications:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Fetch a single application by ID (job seeker only)
app.get('/applications/:id', async function (req, res) {
    if (!req.session.loggedIn) {
        return res.status(401).json({ error: 'Login required' });
    }
    if (req.session.role !== 'job_seeker') {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const sql = `
            SELECT
              application_id,
              job_id,
              name,
              email,
              linkedin_url,
              status,
              applied_at
            FROM applications
            WHERE application_id = ? AND job_seeker_id = ?
        `;
        const rows = await db.query(sql, [req.params.id, req.session.uid]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching application:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Handle inline application submission
app.post('/jobs/:id/apply', async function(req, res) {
    // only logged-in job seekers may apply
    if (!req.session.loggedIn || req.session.role !== 'job_seeker') {
        return res.status(401).json({ error: 'Login required' });
    }

    const jobId       = req.params.id;
    const userId      = req.session.uid;
    const name        = (req.body.name || '').trim();
    const email       = (req.body.email || '').trim();
    const linkedinUrl = (req.body.linkedin || '').trim();

    if (!name || !email || !linkedinUrl) {
        return res.status(400).json({ error: 'Name, email and LinkedIn URL are required.' });
    }

    try {
        const sql = `
            INSERT INTO applications
              (job_id, job_seeker_id, name, email, linkedin_url)
            VALUES (?, ?, ?, ?, ?)
        `;
        const result = await db.query(sql, [
            jobId,
            userId,
            name,
            email,
            linkedinUrl
        ]);

        return res.status(201).send("Applied successfully");
    } catch (err) {
        console.error('Error saving application:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Employer: view all applications to this employer's jobs
app.get('/employer/applications', async function(req, res) {
    if (!req.session.loggedIn || req.session.role !== 'employer') {
        return res.redirect('/login');
    }

    try {
        const sql = `
            SELECT
              a.application_id,
              a.job_id,
              j.title      AS job_title,
              a.name       AS applicant_name,
              a.email      AS applicant_email,
              a.linkedin_url,
              a.status,
              a.applied_at
            FROM applications a
            JOIN jobs j
              ON a.job_id = j.job_id
            WHERE j.employer_id = ?
            ORDER BY a.applied_at DESC
        `;
        const apps = await db.query(sql, [req.session.uid]);
        res.render('employer-applications', {
            apps,
            activePage: 'employer-applications'
        });
    } catch (err) {
        console.error("Error fetching employer applications:", err.message);
        res.status(500).send('Internal Server Error');
    }
});


// Start the server and listen on port 3000
app.listen(3000, function () {
    console.log(`Server running at http://127.0.0.1:3000/`);
});
