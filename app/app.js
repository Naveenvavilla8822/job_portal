// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Get the functions in the db.js file to use
const db = require('./services/db');

// Create a route for root - /
app.get("/", function(req, res) {
    res.render("Homepage");
});

// Create a route for root - /
app.get("/about", function(req, res) {
    res.render("Aboutpage");
});

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Create a route for testing the db
app.get("/db_test", function(req, res) {
    // Assumes a table called test_table exists in your database
    sql = 'select * from test_table';
    db.query(sql).then(results => {
        console.log(results);
        res.send(results)
    });
});

app.get("/jobs", function(req, res) {
    let sql = "SELECT * FROM jobs WHERE 1=1";
    let filters = [];
    
    if (req.query.title) {
        sql += " AND title LIKE ?";
        filters.push(`%${req.query.title}%`);
    }
    
    if (req.query.location) {
        sql += " AND location LIKE ?";
        filters.push(`%${req.query.location}%`);
    }

    if (req.query.job_type) {
        sql += " AND job_type = ?";
        filters.push(req.query.job_type);
    }

    db.query(sql, filters).then(results => {
        res.render("jobs", { jobs: results, searchParams: req.query });
    });
});

app.get("/job/:id", function(req, res) {
    const jobId = req.params.id;  // Get the job ID from the URL parameter
    const sql = "SELECT * FROM jobs WHERE job_id = ?";

    db.query(sql, [jobId]).then(results => {
        if (results.length === 0) {
            return res.status(404).send("Job not found");
        }

        const job = results[0];  // Assuming the job exists
        res.render("view", { job: job });  // Render the job detail page with the job data
    }).catch(err => {
        console.error("Error fetching job details:", err);
        res.status(500).send("Error retrieving job details.");
    });
});


// Create a route for /goodbye
// Responds to a 'GET' request
app.get("/goodbye", function(req, res) {
    res.send("Goodbye world!");
});

// Create a dynamic route for /hello/<name>, where name is any value provided by user
// At the end of the URL
// Responds to a 'GET' request
app.get("/hello/:name", function(req, res) {
    // req.params contains any parameters in the request
    // We can examine it in the console for debugging purposes
    console.log(req.params);
    //  Retrieve the 'name' parameter and use it in a dynamically generated page
    res.send("Hello " + req.params.name);
});

// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});