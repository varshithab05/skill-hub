/**
 * Script to create a superuser account
 * Run with: node scripts/createSuperuser.js
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");
const connectDB = require("../config/db");

// Default superuser credentials
const superuser = {
  name: "Super Admin",
  email: "superadmin@skillhub.com",
  password: "SuperAdmin@123",
  role: "superuser",
  permissions: [
    "manageUsers",
    "manageJobs",
    "manageBids",
    "manageTransactions",
    "viewReports",
    "manageAdmins",
    "manageSettings",
  ],
};

async function createSuperuser() {
  try {
    // Connect to database
    await connectDB();
    console.log("Connected to database");

    // Check if superuser already exists
    const existingSuperuser = await Admin.findOne({ email: superuser.email });

    if (existingSuperuser) {
      console.log("Superuser already exists. Updating permissions...");

      // Update permissions to ensure superuser has all permissions
      existingSuperuser.permissions = superuser.permissions;
      existingSuperuser.role = "superuser";

      await existingSuperuser.save();
      console.log("Superuser permissions updated successfully");
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(superuser.password, 12);

      // Create new superuser
      const newSuperuser = new Admin({
        name: superuser.name,
        email: superuser.email,
        password: hashedPassword,
        role: superuser.role,
        permissions: superuser.permissions,
        status: "active",
      });

      await newSuperuser.save();
      console.log("Superuser created successfully");
    }

    console.log("Superuser details:");
    console.log(`Email: ${superuser.email}`);
    console.log(`Password: ${superuser.password}`);
    console.log("Please change the password after first login");

    // Close database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error creating superuser:", error);
    process.exit(1);
  }
}

// Run the function
createSuperuser();
