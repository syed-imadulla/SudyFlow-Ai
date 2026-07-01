/**
 * StudyFlow AI – Planner Service
 * --------------------------------
 * Owns Daily, Weekly, and Monthly schedule data.
 *
 * Public API:
 *   plannerService.getDailyBlocks()        → Promise<Block[]>
 *   plannerService.getWeeklyStats()        → Promise<WeeklyStats>
 *   plannerService.getMonthlyCalendar()    → Promise<MonthlyCalendar>
 *   plannerService.getUpcomingDeadlines()  → Promise<Deadline[]>
 *   plannerService.createBlock(data)       → Promise<Block>
 *   plannerService.updateBlock(id, patch)  → Promise<Block>
 *   plannerService.deleteBlock(id)         → Promise<void>
 */

window.plannerService = (function () {

  async function _getMocks() {
    if (!window.SF_CONFIG?.USE_MOCK_API) return {};
    return await window.SF_HTTP.loadMock('planner.mock.js');
  }

  // ─── Service Methods ──────────────────────────────────────────────────────

  async function getDailyBlocks(dateStr) {
    const query = dateStr ? `?date=${encodeURIComponent(dateStr)}` : '';
    const { MOCK_DAILY_BLOCKS = null } = await _getMocks();
    return window.SF_HTTP.request(`/planner/daily${query}`, MOCK_DAILY_BLOCKS);
  }

  async function getUpcomingDeadlines() {
    const { MOCK_UPCOMING_DEADLINES = null } = await _getMocks();
    return window.SF_HTTP.request('/planner/deadlines', MOCK_UPCOMING_DEADLINES);
  }

  async function getWeeklyStats() {
    const { MOCK_WEEKLY_STATS = null } = await _getMocks();
    return window.SF_HTTP.request('/planner/weekly-stats', MOCK_WEEKLY_STATS);
  }

  async function getMonthlyCalendar() {
    const { MOCK_MONTHLY_CALENDAR = null } = await _getMocks();
    return window.SF_HTTP.request('/planner/monthly', MOCK_MONTHLY_CALENDAR);
  }

  async function createBlock(payload) {
    const newBlock = {
      id: 'blk-' + Date.now(),
      completed: false,
      color: '#A855F7',
      ...payload
    };
    return window.SF_HTTP.request('/planner', newBlock, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async function updateBlock(id, patch) {
    let updatedMock = { id, ...patch };
    if (window.SF_CONFIG?.USE_MOCK_API) {
      const currentBlocks = window.SF_STORE?.getSlice('planner')?.dailyBlocks || [];
      const existing = currentBlocks.find(b => b.id === id || b._id === id);
      if (existing) {
        updatedMock = { ...existing, ...patch };
      }
    }
    return window.SF_HTTP.request(`/planner/${id}`, updatedMock, {
      method: 'PATCH',
      body: JSON.stringify(patch)
    });
  }

  async function deleteBlock(id) {
    return window.SF_HTTP.request(`/planner/${id}`, null, { method: 'DELETE' });
  }

  return {
    getDailyBlocks,
    getUpcomingDeadlines,
    getWeeklyStats,
    getMonthlyCalendar,
    createBlock,
    updateBlock,
    deleteBlock
  };
})();
