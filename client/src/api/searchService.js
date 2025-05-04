import axiosInstance from './axiosInstance';

// Search for users with various filters
export const searchUsers = async (params) => {
  try {
    // Log the params being sent to the API
    console.log('Sending search params to API:', params);
    
    // Make sure we're using the correct endpoint
    const response = await axiosInstance.get('/search/users', { 
      params,
      // Add timeout to prevent long-hanging requests
      timeout: 10000
    });
    
    // Log the response for debugging
    console.log('Search API response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error.response || error);
    // Return a structured error object instead of throwing
    return {
      success: false,
      message: error.response?.data?.message || 'Error searching users',
      error: error.message
    };
  }
};

// Search for jobs with various filters
export const searchJobs = async (params) => {
  try {
    // Create a copy of params to avoid modifying the original
    const searchParams = { ...params };
    
    // Fix the query format for Solr
    // If query is "*:*", leave it as is, otherwise format it properly
    if (searchParams.query && searchParams.query !== "*:*") {
      // Remove special characters that might cause parsing issues
      const sanitizedQuery = searchParams.query.replace(/:/g, " ");
      searchParams.query = sanitizedQuery;
    }
    
    // Log the params being sent to the API for debugging
    console.log('Sending job search params to API:', searchParams);
    
    const response = await axiosInstance.get('/search/jobs', { 
      params: searchParams,
      timeout: 10000 // Add timeout to prevent long-hanging requests
    });
    
    console.log('Search jobs API response:', response.data);
    
    return {
      success: true,
      jobs: response.data.jobs || [],
      total: response.data.total || 0,
      ...response.data
    };
  } catch (error) {
    console.error('Error searching jobs:', error.response || error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error searching jobs',
      error: error.message,
      jobs: []
    };
  }
};


