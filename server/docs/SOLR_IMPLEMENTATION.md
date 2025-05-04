# Solr Implementation Guide for SkillHub

## Overview

This document provides detailed information about the Apache Solr implementation in the SkillHub platform. Solr is used to power the search functionality for users and jobs, providing fast, scalable, and feature-rich search capabilities.

## Architecture

### Solr Setup

- **Version**: Solr 9.x (latest)
- **Deployment**: Docker container
- **Cores**: 
  - `users_core`: Stores user data for searching
  - `jobs_core`: Stores job listings for searching

### Integration with Node.js

The application uses the `solr-client` npm package to interact with Solr from the Node.js backend. The integration is implemented in the `server/services/solrService.js` file.

## Core Configuration

### Users Core Schema

The `users_core` schema includes the following fields:

```xml
<field name="id" type="string" indexed="true" stored="true" required="true" multiValued="false" />
<field name="name" type="text_general" indexed="true" stored="true" />
<field name="username" type="text_general" indexed="true" stored="true" />
<field name="email" type="text_general" indexed="true" stored="true" />
<field name="role" type="string" indexed="true" stored="true" />
<field name="bio" type="text_general" indexed="true" stored="true" />
<field name="skills" type="text_general" indexed="true" stored="true" multiValued="true" />
```

### Jobs Core Schema

The `jobs_core` schema includes the following fields:

```xml
<field name="id" type="string" indexed="true" stored="true" required="true" multiValued="false" />
<field name="title" type="text_general" indexed="true" stored="true" />
<field name="description" type="text_general" indexed="true" stored="true" />
<field name="employer" type="string" indexed="true" stored="true" />
<field name="status" type="string" indexed="true" stored="true" />
<field name="categories" type="text_general" indexed="true" stored="true" multiValued="true" />
<field name="skillsRequired" type="text_general" indexed="true" stored="true" multiValued="true" />
<field name="budget_min" type="pint" indexed="true" stored="true" />
<field name="budget_max" type="pint" indexed="true" stored="true" />
```

## Data Indexing

### Automatic Indexing

The application automatically indexes data to Solr when:

1. A new user is created (via Mongoose post-save hook)
2. A user is updated (via Mongoose post-findOneAndUpdate hook)
3. A new job is created (via Mongoose post-save hook)
4. A job is updated (via Mongoose post-findOneAndUpdate hook)

### Manual Indexing

For initial data loading or reindexing, use the script at `server/scripts/indexSolr.js`:

```bash
node server/scripts/indexSolr.js
```

This script will:
1. Connect to the MongoDB database
2. Fetch all users and jobs
3. Index them to their respective Solr cores
4. Log the results

## Search API

### User Search

**Endpoint**: `GET /search/users`

**Parameters**:
- `query`: Search query (default: `*:*` to match all)
- `role`: Filter by user role (e.g., "freelancer", "employer")
- `skills`: Comma-separated list of skills to filter by
- `limit`: Number of results per page (default: 10)
- `page`: Page number for pagination

**Example Request**:
```
GET /search/users?query=developer&role=freelancer&skills=javascript,react&limit=20&page=1
```

### Job Search

**Endpoint**: `GET /search/jobs`

**Parameters**:
- `query`: Search query (default: `*:*` to match all)
- `status`: Filter by job status (e.g., "open", "in-progress", "completed")
- `categories`: Comma-separated list of categories to filter by
- `skills`: Comma-separated list of required skills to filter by
- `minBudget`: Minimum budget amount
- `maxBudget`: Maximum budget amount
- `limit`: Number of results per page (default: 10)
- `page`: Page number for pagination

**Example Request**:
```
GET /search/jobs?query=web&status=open&categories=development&skills=javascript&minBudget=500&maxBudget=2000&limit=20&page=1
```

## Implementation Details

### Solr Service

The `solrService.js` file provides the following functions:

1. `indexUser(user)`: Indexes a single user document
2. `indexJob(job)`: Indexes a single job document
3. `indexAllUsers()`: Indexes all users from the database
4. `indexAllJobs()`: Indexes all jobs from the database
5. `searchUsers(query, options)`: Searches for users with filtering and pagination
6. `searchJobs(query, options)`: Searches for jobs with filtering and pagination

### Search Controllers

The search functionality is implemented in:
- `userController.js`: Contains the `searchUsersSolr` function
- `jobController.js`: Contains the `searchJobsSolr` function

These controllers handle the HTTP requests, extract query parameters, and call the appropriate Solr service functions.

## Docker Configuration

The Solr instance is configured in the `docker-compose.yml` file:

```yaml
solr:
  image: solr:latest
  container_name: skillhub-solr
  ports:
    - "8983:8983"
  volumes:
    - solr_data:/var/solr
  command:
    - solr-precreate
    - users_core
```

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure Solr is running and accessible at the configured host and port
2. **Core Not Found**: Verify that the cores have been created correctly
3. **Indexing Failures**: Check the server logs for detailed error messages
4. **No Search Results**: Verify that data has been indexed properly

### Solr Admin UI

The Solr Admin UI is available at `http://localhost:8983/solr/` and provides tools for:
- Querying data
- Viewing core configuration
- Checking core status
- Viewing schema information

## Best Practices

1. **Optimize Indexing**: Batch index operations when possible
2. **Use Filter Queries**: For better performance, use filter queries (fq) for fixed constraints
3. **Limit Fields**: Only request the fields you need using the `fl` parameter
4. **Use Faceting**: For category counts and filtering options
5. **Monitor Performance**: Regularly check Solr query times and optimize as needed