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

  /** Module cache for loaded mock datasets */
  const _mockCache = new Map();

  /** Slot for future 401 refresh token handler */
  let _onRefreshToken = null;

  /**
   * Load a canonical mock file without duplicating data inside services.
   * @param {string} mockFileName – e.g. 'goals.mock.js'
   * @returns {Promise<Object>}
   */
  async function loadMock(mockFileName) {
    if (_mockCache.has(mockFileName)) {
      return _mockCache.get(mockFileName);
    }
    try {
      const modulePath = new URL(
        `./src/js/mocks/${mockFileName}`,
        window.location.href
      ).href;
      const mockModule = await import(modulePath);
      _mockCache.set(mockFileName, mockModule);
      return mockModule;
    } catch (err) {
      console.error(`[SF_HTTP] Failed to load canonical mock: ${mockFileName}`, err);
      throw err;
    }
  }

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
   * Get current stored access token.
   * @returns {string|null}
   */
  function getAuthToken() {
    const key = window.SF_CONFIG?.AUTH_TOKEN_KEY || 'accessToken';
    const token = localStorage.getItem(key);
    if (!token) return null;
    if (window.SF_CONFIG && !window.SF_CONFIG.USE_MOCK_API) {
      if (token.startsWith('mock-') || token === 'mock-jwt-token-12345' || token.split('.').length !== 3) {
        localStorage.removeItem(key);
        localStorage.removeItem('studyflow_user');
        return null;
      }
    }
    return token;
  }

  /**
   * Save access token to localStorage.
   * @param {string} token
   */
  function setAuthToken(token) {
    const key = window.SF_CONFIG?.AUTH_TOKEN_KEY || 'accessToken';
    if (token) {
      localStorage.setItem(key, token);
    } else {
      localStorage.removeItem(key);
    }
  }

  /**
   * Clear access token from localStorage.
   */
  function clearAuthToken() {
    const key = window.SF_CONFIG?.AUTH_TOKEN_KEY || 'accessToken';
    localStorage.removeItem(key);
  }

  /**
   * Register callback for 401 Unauthorized handling (cookie refresh).
   * @param {Function} callback
   */
  function onRefreshToken(callback) {
    _onRefreshToken = callback;
  }

  /**
   * Make a real HTTP request to the backend API.
   * @param {string} endpoint – path relative to SF_CONFIG.API_BASE_URL e.g. '/goals'
   * @param {RequestInit} [options] – standard fetch options
   * @returns {Promise<*>}
   */
  async function apiRequest(endpoint, options = {}) {
    const baseUrl = window.SF_CONFIG?.API_BASE_URL || 'http://localhost:5000/api/v1';
    const url = `${baseUrl}${endpoint}`;
    const defaultHeaders = { 'Content-Type': 'application/json' };
    const isPublicAuthRoute = endpoint.includes('/auth/login') || endpoint.includes('/auth/register') || endpoint.includes('/auth/refresh') || endpoint.includes('/health');
    const token = getAuthToken();
    if (token && typeof token === 'string' && token.trim() !== '' && !isPublicAuthRoute) {
      defaultHeaders['Authorization'] = `Bearer ${token.trim()}`;
    }

    const controller = new AbortController();
    const timeoutMs = window.SF_CONFIG?.REQUEST_TIMEOUT || 10000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        credentials: 'include',
        signal: controller.signal,
        ...options,
        headers: { ...defaultHeaders, ...(options.headers || {}) }
      });

      clearTimeout(timeoutId);

      // Handle 401 Refresh Hook if registered
      if (response.status === 401 && _onRefreshToken && !options._retry && !isPublicAuthRoute) {
        try {
          await _onRefreshToken();
          return await apiRequest(endpoint, { ...options, _retry: true });
        } catch (refreshErr) {
          // Refresh failed, fall through to error parsing
        }
      }

      if (!response.ok) {
        let errorMsg = response.statusText;
        try {
          const errJson = await response.json();
          if (errJson && errJson.error && errJson.error.message) {
            errorMsg = errJson.error.message;
          } else if (errJson && errJson.message) {
            errorMsg = errJson.message;
          }
        } catch (parseErr) {
          errorMsg = await response.text();
        }

        let cleanMessage = errorMsg;
        if (response.status === 401) {
          if (endpoint.includes('/auth/login')) {
            cleanMessage = 'Incorrect email or password.';
          } else {
            cleanMessage = errorMsg || 'Authentication required. Please log in again.';
          }
        } else if (response.status === 409) {
          if (endpoint.includes('/auth/register')) {
            cleanMessage = 'Email already registered.';
          } else {
            cleanMessage = errorMsg || 'Resource conflict.';
          }
        } else if (response.status >= 500) {
          cleanMessage = 'Something went wrong.';
        }

        const err = new Error(cleanMessage);
        err.status = response.status;
        err.statusCode = response.status;
        throw err;
      }

      const json = await response.json();
      return (json && json.status === 'success' && json.data !== undefined) ? json.data : json;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        err = new Error(`Request timed out after ${timeoutMs}ms`);
      }
      if (window.SF_COMPONENTS && window.SF_COMPONENTS.showToast && !endpoint.includes('/auth/') && options._silent !== true) {
        window.SF_COMPONENTS.showToast(err.message || 'Network Request Failed', 'error');
      }
      throw err;
    }
  }

  /** Convenience REST helpers */
  function get(endpoint, options = {}) {
    return apiRequest(endpoint, { ...options, method: 'GET' });
  }

  function post(endpoint, body, options = {}) {
    return apiRequest(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  }

  function patch(endpoint, body, options = {}) {
    return apiRequest(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) });
  }

  function del(endpoint, options = {}) {
    return apiRequest(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Primary dispatch used by every service.
   * @param {string} endpoint
   * @param {*} mockData
   * @param {RequestInit} [options]
   */
  function request(endpoint, mockData, options = {}) {
    if (window.SF_CONFIG?.USE_MOCK_API) {
      return mockRequest(mockData);
    }
    return apiRequest(endpoint, options);
  }

  return {
    request, mockRequest, apiRequest, loadMock,
    getAuthToken, setAuthToken, clearAuthToken, onRefreshToken,
    get, post, patch, del
  };
})();
