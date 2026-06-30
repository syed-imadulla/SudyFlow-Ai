/**
 * StudyFlow AI – Planner Service
 * --------------------------------
 * Owns Daily, Weekly, and Monthly schedule data.
 *
 * Public API:
 *   plannerService.getDailyBlocks()      → Promise<Block[]>
 *   plannerService.getWeeklyStats()      → Promise<WeeklyStats>
 *   plannerService.getMonthlyCalendar()  → Promise<MonthlyCalendar>
 *   plannerService.getUpcomingDeadlines()→ Promise<Deadline[]>
 */

window.plannerService = (function () {

  async function _getMocks() {
    if (!window.SF_CONFIG?.USE_MOCK_API) return {};
    return await window.SF_HTTP.loadMock('planner.mock.js');
  }

  // ─── Service Methods ──────────────────────────────────────────────────────

  async function getDailyBlocks() {
    const { MOCK_DAILY_BLOCKS = null } = await _getMocks();
    return window.SF_HTTP.request('/planner/daily', MOCK_DAILY_BLOCKS);
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

  return { getDailyBlocks, getUpcomingDeadlines, getWeeklyStats, getMonthlyCalendar };
})();
