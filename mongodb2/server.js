const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const port = 5501; // Server port

const app = express();
app.use(express.static(__dirname)); // Serve static files
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.set('view engine', 'ejs'); // Set EJS as the templating engine
app.set('views', path.join(__dirname, 'views')); // Set views directory

// Connect to MongoDB
mongoose.connect('mongodb+srv://root:root@cluster0.0elah.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log("MongoDB connection successful");
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

// Define Donor Schema for donors (phno removed, password added)
const donorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Password added for donor
});

// Define Request Schema for requests
const requestSchema = new mongoose.Schema({
    org_name: { type: String, required: true },
    category: { type: String, required: true, enum: ['Medicines', 'Groceries', 'Stationery', 'Others'] }, // Enum for category
    item: { type: String, required: true },
    description: { type: String, required: true }, // Add description field
    quantity: { type: Number, required: true, min: 1 }, // Quantity must be at least 1
    cost: { type: Number, required: true, min: 0 }, // Cost must be at least 0
});

// Define Feedback Schema for feedback submissions
const feedbackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true }, // Message field for feedback
});

// Define Volunteer Schema for volunteer registrations
const volunteerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Ensure emails are unique
    phone: { type: String, required: true }, // Phone number
    activity: { 
        type: String, 
        required: true,
        enum: ['food distribution', 'event organization', 'community cleanup', 'mentorship', 'other'] // Restrict to predefined options
    },
    additionalInfo: { type: String } // Optional additional information
});

// Define Institute Schema for institute registrations
const instituteSchema = new mongoose.Schema({
    institute_id: { type: String, required: true, unique: true }, // Unique institute ID
    institute_name: { type: String, required: true }, // Name of the institute
    password: { type: String, required: true }, // Password for institute login
});

const shopkeeperSchema = new mongoose.Schema({
    shopkeeper_id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

// Create models for Users, Donors, Requests, Feedback, Volunteers, Institutes, and Shop Keepers
const Donors = mongoose.model("Donors", donorSchema);
const Requests = mongoose.model("Requests", requestSchema);
const Feedback = mongoose.model("Feedback", feedbackSchema);
const Volunteers = mongoose.model("Volunteers", volunteerSchema);
const Institutes = mongoose.model("Institutes", instituteSchema); // Add Institutes model
const Shopkeeper = mongoose.model('Shopkeeper', shopkeeperSchema);

// Serve the requests data
app.get('/requests', async (req, res) => {
    try {
        const requests = await Requests.find(); // Fetch all requests from the database
        res.render('requests', { requests }); // Render the requests HTML with the data
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).send("An error occurred while fetching requests.");
    }
});

// Serve the form for Users
app.get('/form', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});

// Serve the request form
app.get('/request-form', (req, res) => {
    res.sendFile(path.join(__dirname, 'request.html')); // Serve the new request form HTML
});

// Serve the form for Donors registration
app.get('/donor-form', (req, res) => {
    res.sendFile(path.join(__dirname, 'donor.html'));
});

// Serve the login form for Donors
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve the feedback form
app.get('/feedback-form', (req, res) => {
    res.sendFile(path.join(__dirname, 'feedback.html')); // Serve the feedback form HTML
});

// Serve the volunteer form
app.get('/volunteer-form', (req, res) => {
    res.sendFile(path.join(__dirname, 'volunteer.html')); // Serve the volunteer form HTML
});

// Serve the registration form for Institutes
app.get('/institute-registration', (req, res) => {
    res.sendFile(path.join(__dirname, 'institute_registration.html')); // Serve the institute registration form HTML
});

// Handle Institute registration form submission
app.post('/institute-registration', async (req, res) => {
    const { institute_id, institute_name, password } = req.body; // Capture form data
    console.log("Institute Registration Data:", req.body); // Debugging line

    const institute = new Institutes({
        institute_id,
        institute_name,
        password, // Save password in the database
    });

    try {
        await institute.save(); // Save institute data
        console.log("Saved Institute:", institute);
        res.send("Institute Registration Successful");
    } catch (error) {
        console.error("Error saving institute:", error);
        if (error.code === 11000) {
            res.status(400).send("Duplicate institute ID. Please try again.");
        } else {
            res.status(500).send("An error occurred during registration.");
        }
    }
});

// Serve the registration form for Shop Keepers
app.get('/shopkeeper-registration', (req, res) => {
    res.sendFile(path.join(__dirname, 'shopkeeperreg.html')); // Serve the shop keeper registration form HTML
});

app.post('/shopkeeper-registration', async (req, res) => {
    const { shopkeeper_id, name, email, password } = req.body;

    // Log the extracted data to check if it is correct
    console.log('Shop Keeper Registration Data:', {
        shopkeeper_id,
        name,
        email,
        password
    });

    const newShopkeeper = new Shopkeeper({
        shopkeeper_id,
        name,
        email,
        password
    });

    try {
        await newShopkeeper.save();
        res.send('Shop Keeper registered successfully!');
    } catch (error) {
        console.error('Error saving shop keeper:', error);
        res.status(500).send('Error saving shop keeper');
    }
});

// Serve the login form for Shop Keepers
app.get('/shopkeeper-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'shopkeeperlog.html')); // Serve the shop keeper login form HTML
});

app.post('/shopkeeper-login', async (req, res) => {
    const { shopkeeper_id, password } = req.body;

    try {
        const shopkeeper = await Shopkeeper.findOne({ shopkeeper_id, password });

        if (!shopkeeper) {
            return res.status(401).send('Invalid credentials');
        }

        // Login successful
        res.send('Login successful');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal server error');
    }
});

// Handle Donor registration form submission
app.post('/donor-registration', async (req, res) => {
    const { name, email, password } = req.body; // Capture form data
    console.log("Donor Registration Data:", req.body); // Debugging line

    const donor = new Donors({
        name,
        email,
        password, // Save password in the database
    });

    try {
        await donor.save(); // Save donor data
        console.log("Saved Donor:", donor);
        res.send("Donor Registration Successful");
    } catch (error) {
        console.error("Error saving donor:", error);
        if (error.code === 11000) {
            res.status(400).send("Duplicate email. Please try again.");
        } else {
            res.status(500).send("An error occurred during registration.");
        }
    }
});

// Handle Donor login verification
app.post('/donor-login', async (req, res) => {
    const { email, password } = req.body; // Capture form data
    console.log("Donor Login Data:", req.body); // Debugging line

    try {
        // Find the donor by email and password
        const donor = await Donors.findOne({ email, password });

        if (donor) {
            console.log("Donor found:", donor);
            res.send("Login Successful");
        } else {
            console.log("Donor not found or invalid credentials");
            res.status(400).send("Invalid email or password");
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("An error occurred during login.");
    }
});

// Handle feedback form submission
app.post('/feedback', async (req, res) => {
    const { name, email, message } = req.body; // Capture form data
    console.log("Feedback Data:", req.body); // Debugging line

    const feedback = new Feedback({
        name,
        email,
        message, // Save message in the database
    });

    try {
        await feedback.save(); // Save feedback data
        console.log("Saved Feedback:", feedback);
        res.send("Feedback Submitted Successfully");
    } catch (error) {
        console.error("Error saving feedback:", error);
        res.status(500).send("An error occurred while submitting feedback.");
    }
});

// Handle volunteer registration form submission
app.post('/volunteer-form', async (req, res) => {
    const { name, email, phone, activity, additionalInfo } = req.body; // Capture form data
    console.log("Volunteer Registration Data:", req.body); // Debugging line

    const volunteer = new Volunteers({
        name,
        email,
        phone,
        activity,
        additionalInfo, // Optional additional information
    });

    try {
        await volunteer.save(); // Save volunteer data
        console.log("Saved Volunteer:", volunteer);
        res.send("Volunteer Registration Successful");
    } catch (error) {
        console.error("Error saving volunteer:", error);
        res.status(500).send("An error occurred during volunteer registration.");
    }
});

// Serve the volunteers page
app.get('/volunteers', async (req, res) => {
    try {
        const volunteers = await Volunteers.find(); // Fetch all volunteers from the database
        res.render('volunteers', { volunteers }); // Render the volunteers HTML with the data
    } catch (error) {
        console.error("Error fetching volunteers:", error);
        res.status(500).send("An error occurred while fetching volunteers.");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
