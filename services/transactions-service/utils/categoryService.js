const axios = require('axios');

const CATEGORY_SERVICE_BASE_URL = process.env.CATEGORY_SERVICE_URL || 'http://localhost:3002';

async function fetchCategory(categoryId) {
  if (!categoryId) {
    return null;
  }

  try {
    const response = await axios.get(`${CATEGORY_SERVICE_BASE_URL}/categories/${encodeURIComponent(categoryId.trim())}`, {
      timeout: 3000
    });

    if (response.data && response.data.category) {
      return response.data.category;
    }
    return null;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw new Error('Unable to verify category. Category service may be unavailable.');
  }
}

module.exports = {
  fetchCategory
};

