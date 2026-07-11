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
    console.log('[AUDIT: plannerService.js] getDailyBlocks called for date:', dateStr);
    const query = dateStr ? `?date=${encodeURIComponent(dateStr)}` : '';
    const { MOCK_DAILY_BLOCKS = null } = await _getMocks();
    const res = await window.SF_HTTP.request(`/planner/daily${query}`, MOCK_DAILY_BLOCKS);
    console.log('[AUDIT: plannerService.js] getDailyBlocks response received:', res);
    return res;
  }

  async function getEventsByRange(startIso, endIso) {
    console.log('[AUDIT: plannerService.js] getEventsByRange called for range:', startIso, 'to', endIso);
    const query = `?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`;
    const { MOCK_DAILY_BLOCKS = null } = await _getMocks();
    const res = await window.SF_HTTP.request(`/planner/events${query}`, MOCK_DAILY_BLOCKS);
    console.log('[AUDIT: plannerService.js] getEventsByRange response received count:', res ? res.length : 0);
    return res;
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
    const genId = payload?.id || payload?._id || ('blk-' + Date.now() + '-' + Math.floor(Math.random()*1000));
    const newBlock = {
      completed: false,
      color: '#A855F7',
      ...payload,
      id: genId,
      _id: genId
    };
    if (window.SF_CONFIG?.USE_MOCK_API) {
      const mocks = await _getMocks();
      if (mocks.MOCK_DAILY_BLOCKS && !mocks.MOCK_DAILY_BLOCKS.some(b => b.id === genId || b._id === genId)) {
        mocks.MOCK_DAILY_BLOCKS.push(newBlock);
      }
    }
    return window.SF_HTTP.request('/planner', newBlock, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async function updateBlock(id, patch) {
    console.log('[AUDIT: plannerService.updateBlock] Input id:', id, '| patch:', patch);
    if (!id || id === 'null' || id === 'undefined') {
      const err = new Error(`Cannot update block: invalid ID (${id})`);
      console.error('[AUDIT: plannerService.updateBlock] ABORTING PATCH:', err);
      throw err;
    }
    let targetId = id;
    if (typeof id === 'string' && id.includes('::')) {
      const parts = id.split('::');
      targetId = parts[0];
      patch = { ...patch };
      patch.seriesId = patch.seriesId || targetId;
      patch.exDate = patch.exDate || parts[1];
      patch.editScope = patch.editScope || 'SINGLE';
    }
    console.log('[AUDIT: plannerService.updateBlock] Resolved targetId:', targetId, '| seriesId:', patch.seriesId, '| editScope:', patch.editScope, '| exDate:', patch.exDate);
    if (!targetId || targetId === 'null' || targetId === 'undefined') {
      const err = new Error(`Cannot update block: resolved targetId is invalid (${targetId})`);
      console.error('[AUDIT: plannerService.updateBlock] ABORTING PATCH:', err);
      throw err;
    }
    let updatedMock = { id, ...patch };
    if (window.SF_CONFIG?.USE_MOCK_API) {
      const currentBlocks = window.SF_STORE?.getSlice('planner')?.dailyBlocks || [];
      const existing = currentBlocks.find(b => b.id === id || b._id === id);
      if (existing) {
        updatedMock = { ...existing, ...patch };
      }
    }
    return window.SF_HTTP.request(`/planner/${targetId}`, updatedMock, {
      method: 'PATCH',
      body: JSON.stringify(patch)
    });
  }

  async function deleteBlock(id, options = {}) {
    let targetId = id;
    const params = new URLSearchParams();
    if (typeof id === 'string' && id.includes('::')) {
      const parts = id.split('::');
      targetId = parts[0];
      options = { ...options };
      options.seriesId = options.seriesId || targetId;
      options.exDate = options.exDate || parts[1];
      options.editScope = options.editScope || 'SINGLE';
    }
    if (options && typeof options === 'object') {
      if (options.editScope) params.append('editScope', options.editScope);
      if (options.exDate) params.append('exDate', options.exDate);
      if (options.seriesId) params.append('seriesId', options.seriesId);
    }
    const qs = params.toString();
    const url = `/planner/${targetId}${qs ? '?' + qs : ''}`;
    return window.SF_HTTP.request(url, null, { method: 'DELETE' });
  }

  return {
    getDailyBlocks,
    getEventsByRange,
    getUpcomingDeadlines,
    getWeeklyStats,
    getMonthlyCalendar,
    createBlock,
    updateBlock,
    deleteBlock
  };
})();
