/**
 * StudyFlow AI – Goals Service
 * --------------------------------
 * Owns all Goals + Subtasks data operations.
 * Backed by localStorage in mock mode; switches to REST API by flipping SF_CONFIG.USE_MOCK_API.
 *
 * Public API:
 *   goalsService.getGoals()                    → Promise<Goal[]>
 *   goalsService.createGoal(data)              → Promise<Goal>
 *   goalsService.updateGoal(goalId, patch)     → Promise<Goal>
 *   goalsService.deleteGoal(goalId)            → Promise<void>
 *   goalsService.toggleSubtask(gId, subId)     → Promise<Goal>
 */

window.goalsService = (function () {

  const LS_KEY = 'studyflow_goals';

  // ─── Local helpers ────────────────────────────────────────────────────────

  function _readLS() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    } catch { return null; }
  }

  function _writeLS(goals) {
    localStorage.setItem(LS_KEY, JSON.stringify(goals));
  }

  async function _ensureSeed() {
    if (!window.SF_CONFIG?.USE_MOCK_API) return;
    if (!_readLS()) {
      const { SEED_GOALS = [] } = await import('./src/js/mocks/goals.mock.js');
      _writeLS(SEED_GOALS);
    }
  }

  function _recalcProgress(goal) {
    const total = goal.subtasks.length;
    const done  = goal.subtasks.filter(s => s.completed).length;
    goal.progress = total > 0 ? Math.round((done / total) * 100) : 0;
    return goal;
  }

  // ─── Service Methods ──────────────────────────────────────────────────────

  async function getGoals() {
    await _ensureSeed();
    const data = _readLS() || [];
    return window.SF_HTTP.request('/goals', data);
  }

  async function createGoal(payload) {
    await _ensureSeed();
    const goals = _readLS() || [];
    const newGoal = {
      id: 'goal-' + Date.now(),
      urgency: 'ACTIVE',
      progress: 0,
      subtasks: [],
      ...payload
    };
    goals.unshift(newGoal);
    _writeLS(goals);
    return window.SF_HTTP.request('/goals', newGoal, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Create a goal with auto-generated subtasks from a braindump string.
   * Mirrors the previous StudyFlowDB.createGoalWithSubtasks() API exactly.
   */
  async function createGoalWithSubtasks(title, urgency, description, finalDeadlineDaysStr, rawDump) {
    let totalDays = 7;
    const match = finalDeadlineDaysStr ? String(finalDeadlineDaysStr).match(/\d+/) : null;
    if (match) totalDays = parseInt(match[0], 10) || 7;

    let lines = rawDump
      ? rawDump.split('\n').map(l => l.replace(/^[-*•\d.]+\s*/, '').trim()).filter(Boolean)
      : [];

    if (lines.length === 0 && window.SF_CONFIG?.USE_MOCK_API) {
      const { DEFAULT_BRAINDUMP_STEPS = [] } = await import('./src/js/mocks/idealab.mock.js');
      lines = DEFAULT_BRAINDUMP_STEPS;
    } else if (lines.length === 0) {
      lines = ['Complete Milestone 1', 'Complete Milestone 2', 'Final Review'];
    }

    const priorities = ['High', 'High', 'Medium', 'Low'];
    const subtasks = lines.map((line, idx) => {
      const stepDays = Math.max(1, Math.round(((idx + 1) / lines.length) * totalDays));
      return {
        id: 'sub-' + Date.now() + '-' + idx,
        title: line,
        estimate: `Sprint ${idx + 1} • 1.5h`,
        priority: priorities[idx % priorities.length],
        deadlineDisplay: stepDays === 1 ? 'Tomorrow' : `In ${stepDays} days`,
        completed: false
      };
    });

    const payload = {
      title: title || 'New AI Academic Goal',
      urgency: urgency || 'ACTIVE',
      description: description || 'AI generated study plan with spaced backward deadline assignment.',
      finalDeadline: new Date(Date.now() + totalDays * 86400000).toISOString().split('T')[0],
      finalDeadlineDisplay: `In ${totalDays} days`,
      subtasks
    };
    return createGoal(payload);
  }

  async function toggleSubtask(goalId, subtaskId) {
    await _ensureSeed();
    const goals = _readLS() || [];
    const goal  = goals.find(g => g.id === goalId);
    if (!goal) return Promise.reject(new Error('Goal not found'));
    const sub = goal.subtasks.find(s => s.id === subtaskId);
    if (!sub)  return Promise.reject(new Error('Subtask not found'));
    sub.completed = !sub.completed;
    _recalcProgress(goal);
    _writeLS(goals);
    return window.SF_HTTP.request(`/goals/${goalId}/subtasks/${subtaskId}/toggle`, goal, {
      method: 'PATCH',
      body: JSON.stringify({ completed: sub.completed })
    });
  }

  async function deleteGoal(goalId) {
    await _ensureSeed();
    let goals = _readLS() || [];
    goals = goals.filter(g => g.id !== goalId);
    _writeLS(goals);
    return window.SF_HTTP.request(`/goals/${goalId}`, null, { method: 'DELETE' });
  }

  async function saveGoals(goals) {
    _writeLS(goals);
    return window.SF_HTTP.request('/goals/bulk', goals, {
      method: 'PUT',
      body: JSON.stringify(goals)
    });
  }

  return { getGoals, createGoal, createGoalWithSubtasks, toggleSubtask, deleteGoal, saveGoals };
})();
