/**
 * Script to index all users and jobs to Solr
 * Run with: node scripts/indexSolr.js
 */

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const solrService = require('../services/solrService');
require('dotenv').config();

async function indexData() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Index all users
    console.log('Indexing users...');
    const usersResult = await solrService.indexAllUsers();
    console.log('Users indexing result:', usersResult ? 'Success' : 'Failed');

    // Index all jobs
    console.log('Indexing jobs...');
    const jobsResult = await solrService.indexAllJobs();
    console.log('Jobs indexing result:', jobsResult ? 'Success' : 'Failed');

    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    console.log('Indexing complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error indexing data to Solr:', error);
    process.exit(1);
  }
}

// Run the function
indexData();