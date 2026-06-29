/**
 * StudyFlow AI – Analytics Service
 * -----------------------------------
 * Owns all KPI, chart, and productivity metric data.
 *
 * Public API:
 *   analyticsService.getKPIs(period)               → Promise<KPIs>
 *   analyticsService.getFocusChartData(period)      → Promise<ChartData>
 *   analyticsService.getVelocityChartData(period)   → Promise<ChartData>
 *   analyticsService.getWeeklyComparisonData()      → Promise<ChartData>
 *   analyticsService.getGoalAllocationData()        → Promise<ChartData>
 */

window.analyticsService = (function () {

  async function _getMocks() {
    if (!window.SF_CONFIG?.USE_MOCK_API) return {};
    return await import('./src/js/mocks/analytics.mock.js');
  }

  // ─── Service Methods ──────────────────────────────────────────────────────

  async function getKPIs(period = 'last7') {
    const { MOCK_KPIS = null } = await _getMocks();
    return window.SF_HTTP.request(`/analytics/kpis?period=${period}`, MOCK_KPIS);
  }

  async function getFocusChartData(period = 'last7') {
    const { MOCK_FOCUS_CHART = null } = await _getMocks();
    return window.SF_HTTP.request(`/analytics/focus?period=${period}`, MOCK_FOCUS_CHART);
  }

  async function getVelocityChartData(period = 'last30') {
    const { MOCK_VELOCITY_CHART = null } = await _getMocks();
    return window.SF_HTTP.request(`/analytics/velocity?period=${period}`, MOCK_VELOCITY_CHART);
  }

  async function getWeeklyComparisonData() {
    const { MOCK_WEEKLY_COMPARISON = null } = await _getMocks();
    return window.SF_HTTP.request('/analytics/weekly-comparison', MOCK_WEEKLY_COMPARISON);
  }

  async function getGoalAllocationData() {
    const { MOCK_GOAL_ALLOCATION = null } = await _getMocks();
    return window.SF_HTTP.request('/analytics/goal-allocation', MOCK_GOAL_ALLOCATION);
  }

  return { getKPIs, getFocusChartData, getVelocityChartData, getWeeklyComparisonData, getGoalAllocationData };
})();
