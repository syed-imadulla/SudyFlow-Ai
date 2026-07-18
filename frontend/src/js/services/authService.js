/**
 * StudyFlow AI – Authentication Service
 * -----------------------------------------
 * Owns user authentication operations: login, register, logout, session restoration,
 * and automatic token refresh locking.
 *
 * Public API:
 *   authService.login(email, password)        → Promise<{ user, accessToken }>
 *   authService.register(name, email, pass)   → Promise<{ user, accessToken }>
 *   authService.logout()                      → Promise<boolean>
 *   authService.restoreSession()              → Promise<user|null>
 *   authService.refresh()                     → Promise<{ accessToken }>
 *   authService.isAuthenticated()             → boolean
 */

window.authService = (function () {
  let _refreshPromise = null;

  const LS_USER_KEY = 'studyflow_user';

  /**
   * Helper to update sidebar UI elements when user profile is loaded or restored.
   */
  function _updateSidebarUI(user) {
    if (!user) return;
    setTimeout(() => {
      const aside = document.querySelector('aside');
      if (!aside) return;
      const avatarImg = aside.querySelector('img');
      const nameElem = aside.querySelector('h4');
      if (avatarImg && user.avatar) avatarImg.src = user.avatar;
      if (nameElem && user.name) nameElem.textContent = user.name;
    }, 50);
  }

  /**
   * Check if user currently has an access token stored.
   */
  function isAuthenticated() {
    if (window.SF_HTTP && typeof window.SF_HTTP.getAuthToken === 'function') {
      return !!window.SF_HTTP.getAuthToken();
    }
    const key = window.SF_CONFIG?.AUTH_TOKEN_KEY || 'accessToken';
    return !!localStorage.getItem(key);
  }

  /**
   * Login user with email and password.
   */
  async function login(email, password) {
    if (window.SF_CONFIG?.USE_MOCK_API) {
      const mockToken = 'mock-jwt-token-12345';
      if (window.SF_HTTP) window.SF_HTTP.setAuthToken(mockToken);
      const mockUser = {
        name: 'Imadulla',
        email: email || 'imadulla@university.edu',
        avatar: 'https://ui-avatars.com/api/?name=Imadulla&background=A855F7&color=fff&rounded=true',
        plan: 'Student Plan'
      };
      localStorage.setItem(LS_USER_KEY, JSON.stringify(mockUser));
      _updateSidebarUI(mockUser);
      return { user: mockUser, accessToken: mockToken };
    }

    const data = await window.SF_HTTP.apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    const user = data?.user || data;
    const accessToken = data?.accessToken || (data?.tokens && data.tokens.access);

    if (accessToken && window.SF_HTTP) {
      window.SF_HTTP.setAuthToken(accessToken);
    }
    if (user) {
      localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
      _updateSidebarUI(user);
    }
    return { user, accessToken };
  }

  /**
   * Register new user account.
   */
  async function register(nameOrPayload, email, password) {
    let name = nameOrPayload;
    if (typeof nameOrPayload === 'object' && nameOrPayload !== null) {
      name = nameOrPayload.name;
      email = nameOrPayload.email;
      password = nameOrPayload.password;
    }

    if (window.SF_CONFIG?.USE_MOCK_API) {
      const mockToken = 'mock-jwt-token-12345';
      if (window.SF_HTTP) window.SF_HTTP.setAuthToken(mockToken);
      const mockUser = {
        name: name || 'Student',
        email: email || 'student@university.edu',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Student')}&background=A855F7&color=fff&rounded=true`,
        plan: 'Student Plan'
      };
      localStorage.setItem(LS_USER_KEY, JSON.stringify(mockUser));
      _updateSidebarUI(mockUser);
      return { user: mockUser, accessToken: mockToken };
    }

    const data = await window.SF_HTTP.apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });

    const user = data?.user || data;
    const accessToken = data?.accessToken || (data?.tokens && data.tokens.access);

    if (accessToken && window.SF_HTTP) {
      window.SF_HTTP.setAuthToken(accessToken);
    }
    if (user) {
      localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
      _updateSidebarUI(user);
    }
    return { user, accessToken };
  }

  /**
   * Refresh access token via HttpOnly refresh cookie using singleton promise lock.
   */
  async function refresh() {
    if (_refreshPromise) return _refreshPromise;

    _refreshPromise = (async () => {
      try {
        if (window.SF_CONFIG?.USE_MOCK_API) {
          const mockToken = window.SF_HTTP?.getAuthToken() || 'mock-jwt-token-12345';
          return { accessToken: mockToken };
        }

        const data = await window.SF_HTTP.apiRequest('/auth/refresh', {
          method: 'POST'
        });

        const accessToken = data?.accessToken || (data?.tokens && data.tokens.access);
        if (accessToken && window.SF_HTTP) {
          window.SF_HTTP.setAuthToken(accessToken);
          return { accessToken };
        }
        throw new Error('No access token returned from refresh endpoint');
      } finally {
        _refreshPromise = null;
      }
    })();

    return _refreshPromise;
  }

  /**
   * Restore current session on protected pages.
   */
  async function restoreSession() {
    if (window.SF_CONFIG?.USE_MOCK_API) {
      let storedUser = null;
      try {
        storedUser = JSON.parse(localStorage.getItem(LS_USER_KEY) || 'null');
      } catch (e) {}
      if (!storedUser) {
        storedUser = {
          name: 'Imadulla',
          email: 'imadulla@university.edu',
          avatar: 'https://ui-avatars.com/api/?name=Imadulla&background=A855F7&color=fff&rounded=true',
          plan: 'Student Plan'
        };
      }
      _updateSidebarUI(storedUser);
      return storedUser;
    }

    if (!isAuthenticated()) return null;

    try {
      const data = await window.SF_HTTP.apiRequest('/auth/me', { method: 'GET' });
      const user = data?.user || data;
      if (user) {
        localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
        _updateSidebarUI(user);
        return user;
      }
      return null;
    } catch (err) {
      // If /auth/me fails (e.g. token expired and automatic refresh also failed), clear session
      if (window.SF_HTTP) window.SF_HTTP.clearAuthToken();
      localStorage.removeItem(LS_USER_KEY);
      return null;
    }
  }

  /**
   * Logout user by clearing tokens and backend session.
   */
  async function logout() {
    if (!window.SF_CONFIG?.USE_MOCK_API && isAuthenticated()) {
      try {
        await window.SF_HTTP.apiRequest('/auth/logout', { method: 'POST' });
      } catch (err) {
        console.warn('[authService] Network error during logout ignored:', err);
      }
    }

    if (window.SF_HTTP) {
      window.SF_HTTP.clearAuthToken();
    } else {
      const key = window.SF_CONFIG?.AUTH_TOKEN_KEY || 'accessToken';
      localStorage.removeItem(key);
    }
    localStorage.removeItem(LS_USER_KEY);
    try { localStorage.removeItem('sf_planner_ui_state'); } catch(e) {}
    window.location.href = 'login.html';
    return true;
  }

  // Register refresh hook with SF_HTTP when loaded
  if (window.SF_HTTP && typeof window.SF_HTTP.onRefreshToken === 'function') {
    window.SF_HTTP.onRefreshToken(async () => {
      return await refresh();
    });
  }

  return {
    login,
    register,
    logout,
    restoreSession,
    refresh,
    isAuthenticated
  };
})();
