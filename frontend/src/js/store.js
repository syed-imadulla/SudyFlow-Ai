/**
 * StudyFlow AI – Centralized Application State Manager
 * =====================================================
 * Single source of truth for the entire application.
 *
 * Architecture
 * ────────────
 *  ┌─────────────────────────────────────────────┐
 *  │               SF_STORE (public)             │
 *  │  .state          – read-only snapshot        │
 *  │  .dispatch(type, payload) – trigger mutation │
 *  │  .subscribe(slice, fn)    – reactive updates │
 *  │  .getSlice(slice)         – get slice copy   │
 *  └────────────────────┬────────────────────────┘
 *                       │ reads/writes via
 *  ┌─────────────────────▼────────────────────────┐
 *  │            Services (SF_HTTP + LS)           │
 *  │  goalsService / userService / analyticsService│
 *  │  focusService / plannerService               │
 *  └─────────────────────────────────────────────┘
 *
 * State Slices
 * ────────────
 *  user       – profile + settings
 *  goals      – goal list + loading/error flags
 *  idealab    – active goal in IdeaLab + chat history
 *  planner    – daily blocks + weekly stats + monthly calendar
 *  analytics  – KPIs + chart datasets
 *  focus      – sprint task + timer state + distraction count
 *  settings   – Pomodoro config + AI persona + UI prefs
 *
 * Usage Examples
 * ──────────────
 *  // Read state (immutable snapshot)
 *  const goals = SF_STORE.getSlice('goals').items;
 *
 *  // Dispatch an action
 *  SF_STORE.dispatch('goals/TOGGLE_SUBTASK', { goalId, subtaskId });
 *
 *  // Subscribe to a slice
 *  SF_STORE.subscribe('goals', (goalsSlice) => renderGoals(goalsSlice.items));
 *
 *  // Bootstrap the store (call once at page load)
 *  await SF_STORE.bootstrap(['user', 'goals']);
 *
 * Pages should NEVER call localStorage directly.
 * Pages should NEVER call services directly — use SF_STORE.dispatch() instead.
 *
 * Persistence
 * ───────────
 *  The store persists slices marked persist:true via localStorage automatically.
 *  Keys used: studyflow_goals, studyflow_settings, studyflow_focus_sessions
 */

window.SF_STORE = (function () {

  // ─── Internal State ─────────────────────────────────────────────────────────

  /**
   * Master state tree. All slices are nested here.
   * @type {Record<string, SliceState>}
   */
  const _state = {
    user: {
      profile:  null,   // { name, email, avatar, plan }
      loading:  false,
      error:    null
    },

    goals: {
      items:    [],     // Goal[]
      loading:  false,
      error:    null,
      lastSync: null
    },

    idealab: {
      activeGoalId:    null,   // currently viewed goal in IdeaLab
      activeGoal:      null,   // full goal object
      chatHistory:     [],     // [{ role: 'ai'|'user', message: string, ts: number }]
      loading:         false,
      error:           null
    },

    planner: {
      dailyBlocks:       [],
      weeklyStats:       null,
      monthlyCalendar:   null,
      upcomingDeadlines: [],
      loading:           false,
      error:             null
    },

    analytics: {
      kpis:               null,
      focusChartData:     null,
      velocityChartData:  null,
      weeklyComparison:   null,
      goalAllocation:     null,
      period:             'last7',
      loading:            false,
      error:              null
    },

    focus: {
      activeTask:         null,   // SprintTask from focusService
      timerConfig:        null,   // { focus, shortBreak, longBreak, sessionsBeforeLong }
      timerRemaining:     null,   // seconds
      timerTotal:         null,   // seconds
      isRunning:          false,
      currentSession:     1,
      distractionCount:   0,
      sessionLog:         [],     // [{ date, duration, taskId }]
      aiSuggestion:       null,
      weeklyDistraction:  null,
      loading:            false,
      error:              null
    },

    settings: {
      focus:    25,
      short:    5,
      long:     15,
      persona:  'Direct & Analytical',
      name:     'Imadulla',
      email:    'imadulla@university.edu',
      avatar:   'https://ui-avatars.com/api/?name=Imadulla&background=A855F7&color=fff&rounded=true',
      loaded:   false
    }
  };

  // ─── Subscriber Registry ───────────────────────────────────────────────────
  // Map<sliceName, Set<callback>>
  const _subscribers = new Map();

  // ─── Internal Helpers ──────────────────────────────────────────────────────

  /** Deep clone to prevent external mutation of internal state */
  function _clone(obj) {
    try { return structuredClone(obj); } catch { return JSON.parse(JSON.stringify(obj)); }
  }

  /** Merge patch into a slice and notify subscribers */
  function _patch(sliceName, patch) {
    Object.assign(_state[sliceName], patch);
    _notify(sliceName);
  }

  /** Fire all subscribers registered for sliceName */
  function _notify(sliceName) {
    const subs = _subscribers.get(sliceName);
    if (!subs) return;
    const snapshot = _clone(_state[sliceName]);
    subs.forEach(fn => {
      try { fn(snapshot, sliceName); }
      catch (e) { console.error(`[SF_STORE] Subscriber error on slice "${sliceName}":`, e); }
    });
  }

  // ─── Action Handlers ────────────────────────────────────────────────────────

  const _handlers = {

    // ── User ────────────────────────────────────────────────────────────────

    async 'user/LOAD'() {
      _patch('user', { loading: true, error: null });
      try {
        const [profile, settings] = await Promise.all([
          window.userService.getProfile(),
          window.userService.getSettings()
        ]);
        _patch('user', { profile, loading: false });
        _patch('settings', { ...settings, loaded: true });
      } catch (e) {
        _patch('user', { loading: false, error: e.message });
        console.error('[SF_STORE] user/LOAD failed:', e);
      }
    },

    async 'user/SAVE_SETTINGS'(payload) {
      try {
        const saved = await window.userService.saveSettings(payload);
        _patch('settings', { ...saved, loaded: true });
        // Keep user profile in sync
        _patch('user', { profile: { ..._state.user.profile, ...payload } });
      } catch (e) {
        console.error('[SF_STORE] user/SAVE_SETTINGS failed:', e);
        throw e;
      }
    },

    // ── Goals ───────────────────────────────────────────────────────────────

    async 'goals/LOAD'() {
      _patch('goals', { loading: true, error: null });
      try {
        const items = await window.goalsService.getGoals();
        _patch('goals', { items, loading: false, lastSync: Date.now() });
      } catch (e) {
        _patch('goals', { loading: false, error: e.message });
        console.error('[SF_STORE] goals/LOAD failed:', e);
      }
    },

    async 'goals/CREATE'(payload) {
      try {
        const newGoal = await window.goalsService.createGoal(payload);
        const items = [newGoal, ..._state.goals.items];
        _patch('goals', { items, lastSync: Date.now() });
        return newGoal;
      } catch (e) {
        console.error('[SF_STORE] goals/CREATE failed:', e);
        throw e;
      }
    },

    async 'goals/CREATE_WITH_SUBTASKS'(payload) {
      const { title, urgency, description, finalDeadlineDaysStr, rawDump } = payload;
      try {
        const newGoal = await window.goalsService.createGoalWithSubtasks(
          title, urgency, description, finalDeadlineDaysStr, rawDump
        );
        // The service already persists; refresh store state from source of truth
        const items = await window.goalsService.getGoals();
        _patch('goals', { items, lastSync: Date.now() });
        return newGoal;
      } catch (e) {
        console.error('[SF_STORE] goals/CREATE_WITH_SUBTASKS failed:', e);
        throw e;
      }
    },

    async 'goals/TOGGLE_SUBTASK'(payload) {
      const { goalId, subtaskId } = payload;
      // Optimistic update: flip in local state immediately
      const items = _clone(_state.goals.items);
      const goal  = items.find(g => g.id === goalId);
      if (goal) {
        const sub = goal.subtasks.find(s => s.id === subtaskId);
        if (sub) {
          sub.completed = !sub.completed;
          const total = goal.subtasks.length;
          const done  = goal.subtasks.filter(s => s.completed).length;
          goal.progress = total > 0 ? Math.round((done / total) * 100) : 0;
          _patch('goals', { items });

          // Also update idealab slice if it's viewing this goal
          if (_state.idealab.activeGoalId === goalId) {
            _patch('idealab', { activeGoal: _clone(goal) });
          }
        }
      }
      // Persist via service (async, non-blocking)
      window.goalsService.toggleSubtask(goalId, subtaskId).catch(e =>
        console.error('[SF_STORE] goals/TOGGLE_SUBTASK persist failed:', e)
      );
    },

    async 'goals/DELETE'(payload) {
      const { goalId } = payload;
      const items = _state.goals.items.filter(g => g.id !== goalId);
      _patch('goals', { items });
      await window.goalsService.deleteGoal(goalId).catch(e =>
        console.error('[SF_STORE] goals/DELETE persist failed:', e)
      );
    },

    // ── IdeaLab ─────────────────────────────────────────────────────────────

    async 'idealab/OPEN_GOAL'(payload) {
      const { goalId } = payload;
      _patch('idealab', { loading: true, error: null, activeGoalId: goalId });
      try {
        let goals = _state.goals.items;
        if (!goals.length) {
          goals = await window.goalsService.getGoals();
          _patch('goals', { items: goals, lastSync: Date.now() });
        }
        const activeGoal = goals.find(g => g.id === goalId) || null;
        _patch('idealab', { activeGoal, loading: false });
      } catch (e) {
        _patch('idealab', { loading: false, error: e.message });
      }
    },

    'idealab/ADD_CHAT'(payload) {
      const { role, message } = payload;
      const entry = { role, message, ts: Date.now() };
      const chatHistory = [..._state.idealab.chatHistory, entry];
      _patch('idealab', { chatHistory });
    },

    'idealab/CLEAR_CHAT'() {
      _patch('idealab', { chatHistory: [] });
    },

    // ── Planner ─────────────────────────────────────────────────────────────

    async 'planner/LOAD'() {
      _patch('planner', { loading: true, error: null });
      try {
        const [dailyBlocks, weeklyStats, monthlyCalendar, upcomingDeadlines] = await Promise.all([
          window.plannerService.getDailyBlocks(),
          window.plannerService.getWeeklyStats(),
          window.plannerService.getMonthlyCalendar(),
          window.plannerService.getUpcomingDeadlines()
        ]);
        _patch('planner', { dailyBlocks, weeklyStats, monthlyCalendar, upcomingDeadlines, loading: false });
      } catch (e) {
        _patch('planner', { loading: false, error: e.message });
        console.error('[SF_STORE] planner/LOAD failed:', e);
      }
    },

    // ── Analytics ───────────────────────────────────────────────────────────

    async 'analytics/LOAD'(payload) {
      const period = payload?.period || _state.analytics.period;
      _patch('analytics', { loading: true, error: null, period });
      try {
        const [kpis, focusChartData, velocityChartData, weeklyComparison, goalAllocation] = await Promise.all([
          window.analyticsService.getKPIs(period),
          window.analyticsService.getFocusChartData(period),
          window.analyticsService.getVelocityChartData(period),
          window.analyticsService.getWeeklyComparisonData(),
          window.analyticsService.getGoalAllocationData()
        ]);
        _patch('analytics', { kpis, focusChartData, velocityChartData, weeklyComparison, goalAllocation, loading: false });
      } catch (e) {
        _patch('analytics', { loading: false, error: e.message });
        console.error('[SF_STORE] analytics/LOAD failed:', e);
      }
    },

    'analytics/SET_PERIOD'(payload) {
      _patch('analytics', { period: payload.period });
      // Re-load analytics data with new period
      _handlers['analytics/LOAD']({ period: payload.period });
    },

    // ── Focus Sessions ────────────────────────────────────────────────────────

    async 'focus/LOAD'() {
      _patch('focus', { loading: true, error: null });
      try {
        const [activeTask, timerConfig, aiSuggestion, weeklyDistraction] = await Promise.all([
          window.focusService.getActiveSprintTask(),
          window.focusService.getTimerConfig(),
          window.focusService.getAISuggestion(),
          window.focusService.getWeeklyDistraction()
        ]);
        _patch('focus', {
          activeTask,
          timerConfig,
          timerTotal:     timerConfig.focus,
          timerRemaining: timerConfig.focus,
          aiSuggestion,
          weeklyDistraction,
          loading: false
        });
      } catch (e) {
        _patch('focus', { loading: false, error: e.message });
        console.error('[SF_STORE] focus/LOAD failed:', e);
      }
    },

    'focus/TIMER_TICK'() {
      const remaining = _state.focus.timerRemaining;
      if (remaining <= 0) return;
      _patch('focus', { timerRemaining: remaining - 1 });
    },

    'focus/TIMER_START'() {
      _patch('focus', { isRunning: true });
    },

    'focus/TIMER_PAUSE'() {
      _patch('focus', { isRunning: false });
    },

    'focus/TIMER_RESET'() {
      _patch('focus', { timerRemaining: _state.focus.timerTotal, isRunning: false });
    },

    'focus/SET_TIMER_MODE'(payload) {
      const { seconds } = payload;
      _patch('focus', { timerTotal: seconds, timerRemaining: seconds, isRunning: false });
    },

    'focus/INCREMENT_DISTRACTION'() {
      _patch('focus', { distractionCount: _state.focus.distractionCount + 1 });
    },

    'focus/RESET_DISTRACTION'() {
      _patch('focus', { distractionCount: 0 });
    },

    'focus/LOG_SESSION'(payload) {
      const entry = {
        date:     new Date().toISOString(),
        duration: _state.focus.timerTotal - _state.focus.timerRemaining,
        taskId:   _state.focus.activeTask?.id || null,
        ...payload
      };
      const sessionLog = [..._state.focus.sessionLog, entry];
      _patch('focus', { sessionLog });
      // Persist session log to localStorage
      try {
        localStorage.setItem('studyflow_focus_sessions', JSON.stringify(sessionLog));
      } catch (e) {
        console.warn('[SF_STORE] Could not persist session log:', e);
      }
    },

    'focus/NEXT_SESSION'() {
      const next = (_state.focus.currentSession % 4) + 1;
      _patch('focus', { currentSession: next, timerRemaining: _state.focus.timerConfig?.focus || 1500 });
    },

    // ── Settings ─────────────────────────────────────────────────────────────

    async 'settings/LOAD'() {
      // Settings are loaded as part of user/LOAD; this action can force a reload
      const settings = await window.userService.getSettings();
      _patch('settings', { ...settings, loaded: true });
    },

    async 'settings/SAVE'(payload) {
      return _handlers['user/SAVE_SETTINGS'](payload);
    }
  };

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Read the current state snapshot for a slice.
   * Returns a deep clone – safe to mutate without affecting store.
   * @param {string} sliceName
   * @returns {object}
   */
  function getSlice(sliceName) {
    if (!_state[sliceName]) {
      console.warn(`[SF_STORE] Unknown slice: "${sliceName}"`);
      return {};
    }
    return _clone(_state[sliceName]);
  }


  /**
   * Dispatch an action to mutate state.
   * @param {string} type   – e.g. 'goals/LOAD', 'focus/TIMER_TICK'
   * @param {*}      payload
   * @returns {Promise<*>}   resolves when the handler completes
   */
  async function dispatch(type, payload) {
    const handler = _handlers[type];
    if (!handler) {
      console.warn(`[SF_STORE] No handler for action: "${type}"`);
      return;
    }
    try {
      return await handler(payload);
    } catch (e) {
      console.error(`[SF_STORE] dispatch("${type}") threw:`, e);
      throw e;
    }
  }

  /**
   * Subscribe to state changes on a specific slice.
   * The callback receives a deep clone of the slice every time it changes.
   *
   * @param {string|string[]} slice – slice name or array of slice names
   * @param {(sliceState: object, sliceName: string) => void} callback
   * @returns {() => void} unsubscribe function
   */
  function subscribe(slice, callback) {
    const slices = Array.isArray(slice) ? slice : [slice];
    slices.forEach(s => {
      if (!_subscribers.has(s)) _subscribers.set(s, new Set());
      _subscribers.get(s).add(callback);
    });
    // Return unsubscribe function
    return () => slices.forEach(s => _subscribers.get(s)?.delete(callback));
  }

  /**
   * Bootstrap the store by loading the specified slices.
   * Call this once in each page's DOMContentLoaded.
   *
   * @param {string[]} slices – e.g. ['user', 'goals']
   * @returns {Promise<void>}
   */
  async function bootstrap(slices = []) {
    // Map slice name → load action
    const loadActions = {
      user:      'user/LOAD',
      goals:     'goals/LOAD',
      planner:   'planner/LOAD',
      analytics: 'analytics/LOAD',
      focus:     'focus/LOAD',
      settings:  'settings/LOAD',
      idealab:   null  // idealab/OPEN_GOAL is triggered manually with a goalId
    };

    const actions = slices
      .filter(s => loadActions[s])
      .map(s => dispatch(loadActions[s]));

    await Promise.all(actions);
  }

  /**
   * Reload session logs from localStorage on startup.
   * Called automatically when the store is initialized.
   */
  function _restoreSessionLog() {
    try {
      const raw = localStorage.getItem('studyflow_focus_sessions');
      if (raw) {
        const sessionLog = JSON.parse(raw);
        if (Array.isArray(sessionLog)) _state.focus.sessionLog = sessionLog;
      }
    } catch (e) {
      console.warn('[SF_STORE] Could not restore session log:', e);
    }
  }

  // ─── Self-Init ──────────────────────────────────────────────────────────────
  _restoreSessionLog();

  // Expose public interface
  return {
    getSlice,
    dispatch,
    subscribe,
    bootstrap,
    // Convenience: expose a live state getter (read-only)
    get state() { return _clone(_state); }
  };

})();
