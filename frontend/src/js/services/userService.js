/**
 * StudyFlow AI – User Service
 * --------------------------------
 * Owns user profile and application settings.
 *
 * Public API:
 *   userService.getProfile()         → Promise<Profile>
 *   userService.getSettings()        → Promise<Settings>
 *   userService.saveSettings(data)   → Promise<Settings>
 */

window.userService = (function () {

  const LS_KEY = 'studyflow_settings';

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function _read() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch { return null; }
  }

  async function _getMockDefaults() {
    if (!window.SF_CONFIG?.USE_MOCK_API) return { DEFAULT_PROFILE: {}, DEFAULT_SETTINGS: {} };
    return await window.SF_HTTP.loadMock('user.mock.js');
  }

  async function _merge(saved) {
    const { DEFAULT_SETTINGS = {} } = await _getMockDefaults();
    return { ...DEFAULT_SETTINGS, ...(saved || {}) };
  }

  // ─── Service Methods ──────────────────────────────────────────────────────

  async function getSettings() {
    return await _merge(_read());
  }

  async function getProfile() {
    if (window.authService && typeof window.authService.restoreSession === 'function') {
      const user = await window.authService.restoreSession();
      if (user) return user;
      if (window.SF_CONFIG && !window.SF_CONFIG.USE_MOCK_API) return null;
    }
    const saved = _read();
    const { DEFAULT_PROFILE = {} } = await _getMockDefaults();
    return {
      name:   saved?.name   || DEFAULT_PROFILE.name || 'User',
      email:  saved?.email  || DEFAULT_PROFILE.email || '',
      avatar: saved?.avatar || DEFAULT_PROFILE.avatar || '',
      plan:   DEFAULT_PROFILE.plan || 'Student Plan'
    };
  }

  async function saveSettings(data) {
    const current  = await _merge(_read());
    const updated  = { ...current, ...data };
    localStorage.setItem(LS_KEY, JSON.stringify(updated));

    if (window.SF_CONFIG?.USE_MOCK_API) {
      return window.SF_HTTP.mockRequest(updated);
    }

    if (data.name || data.avatar) {
      const patchPayload = {};
      if (data.name) patchPayload.name = data.name;
      if (data.avatar) patchPayload.avatar = data.avatar;
      await window.SF_HTTP.apiRequest('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(patchPayload)
      });
    } else {
      await window.SF_HTTP.apiRequest('/auth/me', { method: 'GET' });
    }

    return updated;
  }

  return { getProfile, getSettings, saveSettings };
})();
