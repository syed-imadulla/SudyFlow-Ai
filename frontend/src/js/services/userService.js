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
    const merged = await _merge(_read());
    return window.SF_HTTP.request('/user/settings', merged);
  }

  async function getProfile() {
    const saved = _read();
    const { DEFAULT_PROFILE = {} } = await _getMockDefaults();
    const profile = {
      name:   saved?.name   || DEFAULT_PROFILE.name || 'User',
      email:  saved?.email  || DEFAULT_PROFILE.email || '',
      avatar: saved?.avatar || DEFAULT_PROFILE.avatar || '',
      plan:   DEFAULT_PROFILE.plan || 'Student Plan'
    };
    return window.SF_HTTP.request('/user/profile', profile);
  }

  async function saveSettings(data) {
    const current  = await _merge(_read());
    const updated  = { ...current, ...data };
    if (window.SF_CONFIG?.USE_MOCK_API) {
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
    }
    return window.SF_HTTP.request('/user/settings', updated, {
      method: 'PUT',
      body: JSON.stringify(updated)
    });
  }

  return { getProfile, getSettings, saveSettings };
})();
