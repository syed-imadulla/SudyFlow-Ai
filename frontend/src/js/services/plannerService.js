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

  function getBlockForMilestone(milestoneId) {
    if (!window.SF_STORE) return null;
    const plannerSlice = window.SF_STORE.getSlice('planner');
    if (!plannerSlice) return null;
    const blocks = plannerSlice.allBlocks || plannerSlice.plannerEvents || plannerSlice.dailyBlocks || [];
    return blocks.find(b => b.milestoneId === milestoneId) || null;
  }

  function getUpcomingScheduledMilestones(limit = 4) {
    if (!window.SF_STORE) return [];
    const plannerSlice = window.SF_STORE.getSlice('planner');
    const goalsSlice = window.SF_STORE.getSlice('goals');
    if (!plannerSlice || !goalsSlice) return [];

    const blocks = plannerSlice.allBlocks || plannerSlice.plannerEvents || plannerSlice.dailyBlocks || [];
    const goals = goalsSlice.items || [];

    let scheduledBlocks = blocks
      .filter(b => b.milestoneId && b.status !== 'completed' && !b.completed)
      .sort((a, b) => new Date(a.startTime || 0) - new Date(b.startTime || 0));

    // Enrich with milestoneTitle
    scheduledBlocks = scheduledBlocks.map(block => {
      let milestoneTitle = 'Task';
      let goalTitle = 'Goal';
      goals.forEach(g => {
        if (g.id === block.goalId || g._id === block.goalId) {
          goalTitle = g.title;
          const sub = (g.subtasks || []).find(s => s.id === block.milestoneId || s._id === block.milestoneId);
          if (sub) milestoneTitle = sub.title || sub.text;
        }
      });
      return { ...block, milestoneTitle, goalTitle };
    });

    return scheduledBlocks.slice(0, limit);
  }

  /**
   * Returns all planner blocks scheduled for today's local date, sorted by start time.
   * Includes completed blocks so the Dashboard shows a full picture of the day.
   * Uses local date comparison to avoid UTC/timezone boundary bugs.
   * @returns {Block[]}
   */
  function getTodaySchedule() {
    if (!window.SF_STORE) return [];
    const plannerSlice = window.SF_STORE.getSlice('planner');
    const goalsSlice = window.SF_STORE.getSlice('goals');
    if (!plannerSlice || !goalsSlice) return [];

    const blocks = plannerSlice.allBlocks || plannerSlice.plannerEvents || plannerSlice.dailyBlocks || [];
    const goals = goalsSlice.items || [];

    // Build a local YYYY-MM-DD string for today to avoid UTC midnight mismatch
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // [TRACE-S2] Log inputs
    console.log('[TRACE-S2] getTodaySchedule input allBlocks length:', blocks.length);
    console.log('[TRACE-S2] getTodaySchedule input allBlocks:', blocks);
    console.log('[TRACE-S2] todayStr (local):', todayStr);
    if (blocks.length > 0) {
      console.log('[TRACE-S2] First block dateStr:', blocks[0].dateStr, '| startTime:', blocks[0].startTime);
    }

    let todayBlocks = blocks.filter(b => {
      if (!b.startTime) return false;
      // Prefer backend-derived dateStr field (avoids parse cost)
      if (b.dateStr) return b.dateStr === todayStr;
      // Fallback: parse ISO and compare local date components
      const dt = new Date(b.startTime);
      if (isNaN(dt.getTime())) return false;
      const blockStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      return blockStr === todayStr;
    });

    // [TRACE-S2] Log filtered result
    console.log('[TRACE-S2] todayBlocks after filter length:', todayBlocks.length, '| data:', todayBlocks);

    // Sort by start time
    todayBlocks = todayBlocks.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    // Enrich with goal/milestone titles
    return todayBlocks.map(block => {
      let milestoneTitle = block.title || 'Task';
      let goalTitle = '';
      goals.forEach(g => {
        if (g.id === block.goalId || g._id === block.goalId) {
          goalTitle = g.title;
          const sub = (g.subtasks || []).find(s => s.id === block.milestoneId || s._id === block.milestoneId);
          if (sub) milestoneTitle = sub.title || sub.text;
        }
      });
      return { ...block, milestoneTitle, goalTitle };
    });
  }

  async function getDailyBlocks(dateStr) {
    console.log('[AUDIT: plannerService.js] getDailyBlocks called for date:', dateStr);
    
    // Derive absolute UTC bounds for the user's local day to bypass the backend's flawed UTC-based date query
    let targetDate = new Date();
    if (dateStr && typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split('-').map(Number);
      targetDate = new Date(parts[0], parts[1] - 1, parts[2]);
    }
    
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
    
    return await getEventsByRange(startOfDay.toISOString(), endOfDay.toISOString());
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
    
    // Dynamically compute endTime if duration is provided but endTime is missing
    let computedEndTime = payload.endTime;
    if (!computedEndTime && payload.startTime && payload.duration) {
      const startMs = new Date(payload.startTime).getTime();
      const endMs = startMs + (payload.duration * 60000);
      computedEndTime = new Date(endMs).toISOString();
    }

    const newBlock = {
      completed: false,
      color: '#A855F7',
      ...payload,
      endTime: computedEndTime || payload.endTime,
      id: genId,
      _id: genId
    };
    if (window.SF_CONFIG?.USE_MOCK_API) {
      const mocks = await _getMocks();
      if (mocks.MOCK_DAILY_BLOCKS && !mocks.MOCK_DAILY_BLOCKS.some(b => b.id === genId || b._id === genId)) {
        mocks.MOCK_DAILY_BLOCKS.push(newBlock);
      }
    }
    // Strip the frontend-generated blk-... id/_id before sending to the real API.
    // MongoDB/Mongoose must auto-generate its own ObjectId _id.
    // Sending "blk-1234" causes: CastError: Cast to ObjectId failed for value "blk-1234" at path "_id".
    const { id: _sid, _id: _smid, ...apiPayload } = newBlock;
    return window.SF_HTTP.request('/planner', newBlock, {
      method: 'POST',
      body: JSON.stringify(apiPayload)
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
    deleteBlock,
    getBlockForMilestone,
    getUpcomingScheduledMilestones,
    getTodaySchedule
  };
})();
