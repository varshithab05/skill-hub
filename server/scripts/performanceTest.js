/**
 * SkillHub Performance Testing Script
 *
 * This script tests the performance improvement from:
 * 1. Database indexing
 * 2. Redis caching
 *
 * It runs various API endpoints both with and without caching enabled,
 * and compares the response times.
 */

const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_BASE_URL = "http://localhost:3000";
const TEST_ITERATIONS = 100; // Number of requests to make for each endpoint
const TEST_ENDPOINTS = [
  "/jobs/marketplace",
  "/user/profile",
  "/notifications",
  "/project/recent-projects",
  "/chat",
];

// Auth token for protected routes (replace with valid token)
const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MTY1ZDFiMDgzNzVhOWJkMTMyZWM2MCIsInJvbGUiOiJoeWJyaWQiLCJpYXQiOjE3NDYzMDA4MTEsImV4cCI6MTc0NjM4NzIxMX0.lQz82xs5kqjW1bf6JAvm_nLojwrOal2QjS5V5EtN4zQ";

/**
 * Enable/Disable Redis caching via API endpoint
 * @param {boolean} enable - True to enable, false to disable
 * @returns {Promise<void>}
 */
async function toggleRedis(enable) {
  const action = enable ? "enable" : "disable";
  const endpoint = `${API_BASE_URL}/system/redis/${action}`;
  try {
    console.log(`⚙️ Sending request to ${action} Redis...`);
    const response = await axios.post(endpoint);
    console.log(`✅ Redis successfully ${action}d: ${response.data.message}`);
    // Add a small delay to ensure the server state updates
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    console.error(
      `❌ Failed to ${action} Redis:`,
      error.response?.data || error.message
    );
    throw error; // Critical failure
  }
}

/**
 * Run a performance test against an endpoint
 * @param {string} endpoint - API endpoint to test
 * @param {number} iterations - Number of test iterations
 * @returns {Promise<Object>} - Results including average response time
 */
async function runEndpointTest(endpoint, iterations) {
  const results = {
    endpoint,
    responseTimes: [],
    avgResponseTime: 0,
    minResponseTime: Number.MAX_SAFE_INTEGER,
    maxResponseTime: 0,
    successRate: 0,
  };

  const headers = {
    Authorization: `Bearer ${AUTH_TOKEN}`,
  };

  let successCount = 0;

  for (let i = 0; i < iterations; i++) {
    try {
      const startTime = process.hrtime();

      const response = await axios({
        method: "get",
        url: `${API_BASE_URL}${endpoint}`,
        headers,
      });

      const endTime = process.hrtime(startTime);
      const responseTimeMs = endTime[0] * 1000 + endTime[1] / 1000000;

      results.responseTimes.push(responseTimeMs);
      results.minResponseTime = Math.min(
        results.minResponseTime,
        responseTimeMs
      );
      results.maxResponseTime = Math.max(
        results.maxResponseTime,
        responseTimeMs
      );

      if (response.status === 200) {
        successCount++;
      }

      // Add a small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`Error on ${endpoint}: ${error.message}`);
    }
  }

  results.successRate = (successCount / iterations) * 100;

  // Calculate average response time
  if (results.responseTimes.length > 0) {
    results.avgResponseTime =
      results.responseTimes.reduce((sum, time) => sum + time, 0) /
      results.responseTimes.length;
  }

  return results;
}

/**
 * Make a single request to prime the cache
 * @param {string} endpoint - API endpoint to prime
 * @returns {Promise<void>}
 */
async function primeCache(endpoint) {
  try {
    console.log(`🔄 Priming cache for ${endpoint}...`);
    await axios.get(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });
    console.log(`✅ Cache primed for ${endpoint}`);
    // Small delay to ensure caching completes
    await new Promise((resolve) => setTimeout(resolve, 200));
  } catch (error) {
    console.error(`❌ Error priming cache for ${endpoint}: ${error.message}`);
    throw error; // Critical failure - propagate the error
  }
}

/**
 * Run tests on all endpoints
 */
async function runAllTests() {
  const allResults = {
    timestamp: new Date().toISOString(),
    endpoints: [],
  };

  // Ensure Redis is initially enabled for priming if needed later
  await toggleRedis(true);

  // Run tests for each endpoint
  for (const endpoint of TEST_ENDPOINTS) {
    console.log(`\n📊 Testing endpoint: ${endpoint}`);

    // TEST 1: Measure database performance (Redis Disabled)
    console.log(`\n🔄 Testing ${endpoint} WITHOUT cache (Redis Disabled)...`);

    // Disable Redis caching via API
    await toggleRedis(false);

    // Run test while Redis is disabled - should hit database
    const withoutCachingResult = await runEndpointTest(
      endpoint,
      TEST_ITERATIONS
    );
    withoutCachingResult.withCaching = false; // Mark as without caching
    allResults.endpoints.push(withoutCachingResult);
    console.log(
      `✅ Without cache (Redis Disabled): Avg response time: ${withoutCachingResult.avgResponseTime.toFixed(
        2
      )}ms`
    );

    // Short pause between tests
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // TEST 2: Measure cached performance (Redis Enabled)
    console.log(`\n🔄 Testing ${endpoint} WITH cache (Redis Enabled)...`);

    // Enable Redis caching via API
    await toggleRedis(true);

    // Prime the cache with a single request (now that Redis is enabled)
    await primeCache(endpoint);

    // Now run test with Redis enabled and primed cache
    const withCachingResult = await runEndpointTest(endpoint, TEST_ITERATIONS);
    withCachingResult.withCaching = true; // Mark as with caching
    allResults.endpoints.push(withCachingResult);
    console.log(
      `✅ With cache (Redis Enabled): Avg response time: ${withCachingResult.avgResponseTime.toFixed(
        2
      )}ms`
    );

    // Short pause before next endpoint
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Re-enable Redis at the end just in case
  await toggleRedis(true);

  // Process results
  processResults(allResults);
}

/**
 * Process and save test results
 * @param {Object} allResults - All test results
 */
function processResults(allResults) {
  // Calculate improvements
  const improvements = [];

  for (let i = 0; i < TEST_ENDPOINTS.length; i++) {
    const endpoint = TEST_ENDPOINTS[i];
    const withoutCaching = allResults.endpoints.find(
      (r) => r.endpoint === endpoint && !r.withCaching
    );
    const withCaching = allResults.endpoints.find(
      (r) => r.endpoint === endpoint && r.withCaching
    );

    if (withoutCaching && withCaching) {
      const improvement = {
        endpoint,
        withoutCachingAvg: withoutCaching.avgResponseTime,
        withCachingAvg: withCaching.avgResponseTime,
        improvementMs:
          withoutCaching.avgResponseTime - withCaching.avgResponseTime,
        improvementPercent:
          ((withoutCaching.avgResponseTime - withCaching.avgResponseTime) /
            withoutCaching.avgResponseTime) *
          100,
      };

      improvements.push(improvement);
    }
  }

  // Generate report
  const report = {
    timestamp: allResults.timestamp,
    improvements,
    rawResults: allResults,
  };

  // Save report to file
  const reportJson = JSON.stringify(report, null, 2);
  const reportPath = path.join(__dirname, "../log/performance-report.json");

  // Ensure directory exists
  const logDir = path.join(__dirname, "../log");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, reportJson);

  // Print summary
  console.log("\n📊 PERFORMANCE IMPROVEMENT SUMMARY");
  console.log("================================");

  for (const imp of improvements) {
    console.log(`\n${imp.endpoint}`);
    console.log(`Without caching: ${imp.withoutCachingAvg.toFixed(2)}ms`);
    console.log(`With caching: ${imp.withCachingAvg.toFixed(2)}ms`);

    if (imp.improvementMs > 0) {
      console.log(
        `Improvement: ${imp.improvementMs.toFixed(
          2
        )}ms (${imp.improvementPercent.toFixed(2)}%)`
      );
    } else {
      console.log(
        `Degradation: ${Math.abs(imp.improvementMs).toFixed(2)}ms (${Math.abs(
          imp.improvementPercent
        ).toFixed(2)}%)`
      );
    }
  }

  console.log(`\n✅ Full report saved to: ${reportPath}`);
}

// Run the tests
runAllTests().catch(async (error) => {
  console.error("\n❌ An error occurred during the test run:", error);
  // Attempt to re-enable Redis if an error occurred
  console.log("Attempting to re-enable Redis after error...");
  try {
    await toggleRedis(true);
  } catch (enableError) {
    console.error("Failed to re-enable Redis after error:", enableError);
  }
});
