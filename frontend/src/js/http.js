/**
 * StudyFlow AI – HTTP Utility Layer
 * -----------------------------------
 * Provides a unified fetch() wrapper used by all services.
 *
 * When SF_CONFIG.USE_MOCK_API === true  → `mockRequest()` resolves with local data immediately.
 * When SF_CONFIG.USE_MOCK_API === false → `apiRequest()` calls the real REST endpoint.
 *
 * Services never call fetch() directly – they always go through this module.
 */

window.SF_HTTP = (function () {

  /** Artificial delay to simulate realistic network latency in mock mode (ms) */
  const MOCK_DELAY = 120;

  /**
   * Simulate an async API response with mock data.
   * @param {*} data – the mock payload to resolve with
   * @returns {Promise<*>}
   */
  function mockRequest(data) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(structuredClone(data)), MOCK_DELAY);
    });
  }

  /**
   * Make a real HTTP request to the backend API.
   * @param {string} endpoint – path relative to SF_CONFIG.API_BASE_URL  e.g. '/goals'
   * @param {RequestInit} [options] – standard fetch options
   * @returns {Promise<*>}
   */
  async function apiRequest(endpoint, options = {}) {
    const url = `${window.SF_CONFIG.API_BASE_URL}${endpoint}`;
    const defaultHeaders = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('accessToken') || window.SF_AUTH_TOKEN;
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    try {
      const response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers: { ...defaultHeaders, ...(options.headers || {}) }
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`[SF_HTTP] ${response.status} ${response.statusText}: ${error}`);
      }
      const json = await response.json();
      return (json && json.status === 'success' && json.data !== undefined) ? json.data : json;
    } catch (err) {
      if (window.SF_COMPONENTS && window.SF_COMPONENTS.showToast) {
        window.SF_COMPONENTS.showToast(err.message || 'Network Request Failed', 'error');
      }
      throw err;
    }
  }

  /**
   * Primary dispatch used by every service.
   * @param {string} endpoint
   * @param {*} mockData
   * @param {RequestInit} [options]
   */
  function request(endpoint, mockData, options = {}) {
    if (window.SF_CONFIG.USE_MOCK_API) {
      return mockRequest(mockData);
    }
    return apiRequest(endpoint, options);
  }

  return { request, mockRequest, apiRequest };
})();
