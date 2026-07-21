/**
 * StudyFlow AI – Centralized UI Component Rendering Layer
 * Exposes window.SF_COMPONENTS with pure, reusable HTML render functions.
 * Preserves 100% identical appearance, CSS classes, and interaction attributes.
 */
(function () {
  window.closeGoalActionMenus = function (exceptGoalId = null) {
    document.querySelectorAll('[id^="goal-menu-dropdown-"]').forEach(menu => {
      const gId = menu.id.replace('goal-menu-dropdown-', '');
      if (gId !== exceptGoalId) {
        menu.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
          if (menu.classList.contains('scale-95')) {
            menu.classList.add('hidden');
          }
        }, 150);
        const btn = document.getElementById(`goal-menu-btn-${gId}`);
        if (btn) {
          btn.setAttribute('aria-expanded', 'false');
          const card = btn.closest('.group') || btn.closest('.card') || btn.closest('[role="button"]');
          if (card) card.classList.remove('z-[60]');
        }
      }
    });
  };

  window.toggleGoalActionMenu = function (goalId, event) {
    if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
    const menu = document.getElementById(`goal-menu-dropdown-${goalId}`);
    const btn = document.getElementById(`goal-menu-btn-${goalId}`);
    if (!menu || !btn) return;

    const isHidden = menu.classList.contains('hidden');
    window.closeGoalActionMenus(isHidden ? goalId : null);

    if (isHidden) {
      menu.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
      const card = btn.closest('.group') || btn.closest('.card') || btn.closest('[role="button"]');
      if (card) card.classList.add('z-[60]');
      requestAnimationFrame(() => {
        menu.classList.remove('scale-95', 'opacity-0');
        const firstItem = menu.querySelector('[role="menuitem"]');
        if (firstItem) firstItem.focus();
      });
    } else {
      btn.focus();
    }
  };

  window.handleGoalMenuKeyDown = function (goalId, event) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      event.stopPropagation();
      window.toggleGoalActionMenu(goalId, event);
    }
  };

  window.handleGoalItemKeyDown = function (goalId, action, event) {
    const menu = document.getElementById(`goal-menu-dropdown-${goalId}`);
    if (!menu) return;
    const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));
    const currentIndex = items.indexOf(document.activeElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      event.stopPropagation();
      const nextIndex = (currentIndex + 1) % items.length;
      items[nextIndex].focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      items[prevIndex].focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      window.closeGoalActionMenus();
      const btn = document.getElementById(`goal-menu-btn-${goalId}`);
      if (btn) btn.focus();
    } else if (event.key === 'Tab') {
      window.closeGoalActionMenus();
    }
  };

  document.addEventListener('click', function (e) {
    if (!e.target || typeof e.target.closest !== 'function' || !e.target.closest('.goal-action-menu-container')) {
      window.closeGoalActionMenus();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const openMenu = document.querySelector('[id^="goal-menu-dropdown-"]:not(.hidden)');
      if (openMenu) {
        const gId = openMenu.id.replace('goal-menu-dropdown-', '');
        window.closeGoalActionMenus();
        const btn = document.getElementById(`goal-menu-btn-${gId}`);
        if (btn) btn.focus();
      }
    }
  });

  window.SF_COMPONENTS = {
    /**
     * Render Goal Action Overflow Menu (Sprint 1D.2)
     */
    renderGoalActionMenu(goalId) {
      return `
        <div class="goal-action-menu-container relative shrink-0">
          <button
            type="button"
            onclick="event.stopPropagation(); window.toggleGoalActionMenu('${goalId}', event)"
            onkeydown="window.handleGoalMenuKeyDown('${goalId}', event)"
            id="goal-menu-btn-${goalId}"
            aria-haspopup="true"
            aria-expanded="false"
            aria-label="Goal actions menu"
            class="p-1.5 min-w-[32px] min-h-[32px] rounded-lg bg-transparent hover:bg-[#151515] text-[#A1A1AA] hover:text-[#FAFAFA] transition border border-transparent hover:border-[#2A2A2A] focus:outline-none focus:ring-1 focus:ring-[#A855F7] flex items-center justify-center shrink-0"
            title="More Actions"
          >
            <svg class="w-4 h-4 fill-current pointer-events-none" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
          </button>
          <div
            id="goal-menu-dropdown-${goalId}"
            role="menu"
            aria-labelledby="goal-menu-btn-${goalId}"
            class="hidden custom-dropdown-menu absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-[#0E0E0E]/95 backdrop-blur-xl border border-[#2A2A2A] shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(168,85,247,0.2)] py-1.5 z-[100] transform origin-top-right transition-all duration-150 ease-out scale-95 opacity-0"
          >
            <button
              role="menuitem"
              type="button"
              tabindex="-1"
              onclick="event.stopPropagation(); window.closeGoalActionMenus(); window.openEditGoalModal('${goalId}')"
              onkeydown="window.handleGoalItemKeyDown('${goalId}', 'edit', event)"
              class="w-full px-3 py-2 text-left text-xs font-semibold text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1C1C24] transition flex items-center space-x-2.5 focus:outline-none focus:bg-[#1C1C24] focus:text-[#FAFAFA]"
            >
              <svg class="w-3.5 h-3.5 fill-current shrink-0 pointer-events-none text-[#A855F7]" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              <span>Edit Goal</span>
            </button>
            <button
              role="menuitem"
              type="button"
              tabindex="-1"
              onclick="event.stopPropagation(); window.closeGoalActionMenus(); window.confirmDeleteGoal('${goalId}', event)"
              onkeydown="window.handleGoalItemKeyDown('${goalId}', 'delete', event)"
              class="w-full px-3 py-2 text-left text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/15 transition flex items-center space-x-2.5 focus:outline-none focus:bg-red-500/15 focus:text-red-300"
            >
              <svg class="w-3.5 h-3.5 fill-current shrink-0 pointer-events-none" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              <span>Delete Goal</span>
            </button>
          </div>
        </div>
      `;
    },

    /**
     * Canonical Goal Progress Helper
     */
    calculateGoalProgress(goal) {
      if (!goal || !Array.isArray(goal.subtasks) || goal.subtasks.length === 0) {
        return 0;
      }
      const completedCount = goal.subtasks.filter(s => s.completed).length;
      return Math.round((completedCount / goal.subtasks.length) * 100);
    },

    /**
     * Render Floating Action Buttons for Goal Cards
     */
    renderGoalActionButtons(goalId) {
      return this.renderGoalActionMenu(goalId);
    },

    /**
     * Render Goal Card
     * @param {Object} goal
     * @param {string} mode - 'compact' (dashboard), 'grid' (workspace cards), 'expanded' (workspace detail)
     */
    renderGoalCard(goal, mode = 'compact') {
      const done = goal.subtasks ? goal.subtasks.filter(s => s.completed).length : 0;
      const total = goal.subtasks ? goal.subtasks.length : 0;
      const progress = this.calculateGoalProgress(goal);
      const isUrg = goal.urgency === 'URGENT' || (goal.urgency && goal.urgency.includes('High'));

      if (mode === 'compact') {
        const urgClass = isUrg ? 'bg-red-500/15 text-red-400 border border-red-500/30 font-bold' : 'bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/30 font-bold';
        return `
          <div role="button" tabindex="0" aria-label="Open Goal: ${goal.title}" onclick="window.location.href='idealab.html?goalId=${goal.id}'" onkeydown="if(event.key==='Enter'||event.key===' ')window.location.href='idealab.html?goalId=${goal.id}'" class="relative p-3.5 rounded-xl bg-[#0A0A0A] border border-[#202020] hover:border-[#A855F7]/50 hover:shadow-lg transition-all duration-200 cursor-pointer space-y-2.5 group">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center space-x-2 min-w-0">
                <span class="text-[10px] px-2 py-0.5 rounded shrink-0 ${urgClass}">${goal.urgency || 'ACTIVE'}</span>
                <span class="text-[10px] font-mono text-[#FACC15] truncate">📅 ${goal.finalDeadlineDisplay || 'No deadline'}</span>
              </div>
              ${this.renderGoalActionMenu(goal.id)}
            </div>
            <div>
              <h4 class="text-xs font-bold text-[#FAFAFA] group-hover:text-[#A855F7] transition truncate">${goal.title}</h4>
              <p class="text-[10px] text-[#6B7280] truncate mt-0.5">${goal.description || 'AI Goal Blueprint'}</p>
            </div>
            <div class="space-y-1 pt-1 border-t border-[#1C1C1C]">
              <div class="flex items-center justify-between text-[10px] font-mono">
                <span class="text-[#A1A1AA]">${done} / ${total} Subtasks</span>
                <span class="text-[#FAFAFA] font-bold">${progress}%</span>
              </div>
              ${this.renderProgressBar(progress, { heightClass: 'h-1.5', bgClass: 'bg-[#151515]' })}
            </div>
          </div>
        `;
      } else if (mode === 'grid') {
        const urgClass = isUrg ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40';
        return `
          <div role="button" tabindex="0" aria-label="Open Goal Grid: ${goal.title}" onclick="window.location.href='idealab.html?goalId=${goal.id}'" onkeydown="if(event.key==='Enter'||event.key===' ')window.location.href='idealab.html?goalId=${goal.id}'" class="card bg-[#0E0E0E] border border-[#202020] p-6 rounded-[20px] flex flex-col justify-between space-y-4 hover:border-[#A855F7]/50 hover:shadow-[0_10px_30px_rgba(168,85,247,0.12)] transition-all duration-200 cursor-pointer relative group">
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center space-x-2.5 min-w-0">
                  <span class="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase shrink-0 ${urgClass}">${goal.urgency || 'ACTIVE'}</span>
                  <span class="text-xs font-mono text-[#FACC15] font-semibold truncate">${goal.finalDeadlineDisplay || 'In 7 days'}</span>
                </div>
                ${this.renderGoalActionMenu(goal.id)}
              </div>
              <h3 class="text-base font-bold text-[#FAFAFA]">${goal.title}</h3>
              <p class="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">${goal.description || ''}</p>
            </div>
            <div class="space-y-3 pt-4 border-t border-[#1C1C1C]">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-[#6B7280]">${done}/${total} Subtasks</span>
                <span class="text-[#A855F7] font-bold">${progress}%</span>
              </div>
              ${this.renderProgressBar(progress, { heightClass: 'h-1.5', bgClass: 'bg-[#0A0A0A]' })}
              <div class="flex items-center">
                <button onclick="event.stopPropagation(); window.location.href='idealab.html?goalId=${goal.id}'" class="w-full py-2 bg-[#151515] hover:bg-[#A855F7] text-[#A855F7] hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 border border-[#2A2A2A] hover:border-transparent shadow-sm">
                  <svg class="w-3.5 h-3.5 inline shrink-0 fill-current drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" viewBox="0 0 24 24"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>
                  <span>IdeaLab Architect</span>
                </button>
              </div>
            </div>
          </div>
        `;
      } else if (mode === 'expanded') {
        const subtasksHtml = (goal.subtasks || []).map(sub => this.renderTaskCard(sub, { mode: 'workspace', goalId: goal.id })).join('');
        return `
          <div id="goal-${goal.id}" class="card bg-[#0E0E0E] border border-[#202020] p-6 rounded-[20px] space-y-4 shadow-saas animate-fadeIn relative group hover:border-[#A855F7]/40 transition-all duration-200">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
              <div class="flex items-start space-x-3.5 min-w-0 flex-1">
                <div class="w-10 h-10 rounded-xl bg-[#A855F7]/15 border border-[#A855F7]/30 flex items-center justify-center text-[#A855F7] font-bold text-sm shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <svg class="w-5 h-5 text-[#A855F7] fill-current drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" viewBox="0 0 24 24"><path d="M10 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V8C22 6.89 21.11 6 20 6H12L10 4Z"/></svg>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2.5">
                    <h3 class="text-base font-bold text-[#FAFAFA] truncate">${goal.title}</h3>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shrink-0 ${isUrg ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40'}">${goal.urgency || 'ACTIVE'}</span>
                    <button onclick="window.location.href='idealab.html?goalId=${goal.id}'" class="px-3 py-1 rounded-lg bg-[#A855F7] text-white hover:bg-[#9333EA] transition text-[11px] font-bold flex items-center space-x-1.5 shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0" title="Restructure & Refine Main Goal in IdeaLab">
                      <svg class="w-3.5 h-3.5 inline shrink-0 fill-current drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" viewBox="0 0 24 24"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>
                      <span>IdeaLab Architect</span>
                      <span>→</span>
                    </button>
                  </div>
                  <p class="text-xs text-[#A1A1AA] mt-1">${goal.description || 'AI Goal Plan'}</p>
                </div>
              </div>
              <div class="flex items-center justify-between md:justify-end space-x-4 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-[#1C1C1C]">
                <div class="text-right">
                  <span class="text-[10px] font-mono text-[#6B7280] block">FINAL DEADLINE</span>
                  <span class="text-xs font-bold text-[#FACC15]">${goal.finalDeadlineDisplay || 'In 7 days'}</span>
                </div>
                <div class="w-px h-8 bg-[#1C1C1C] hidden md:block"></div>
                <div class="flex items-center space-x-3">
                  <div class="w-24 bg-[#0A0A0A] h-2 rounded-full overflow-hidden border border-[#202020]">
                    <div class="bg-[#A855F7] h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(168,85,247,0.3)]" style="width: ${progress}%;"></div>
                  </div>
                  <span class="text-xs font-mono font-bold text-[#A855F7] w-9 text-right">${progress}%</span>
                </div>
                ${this.renderGoalActionMenu(goal.id)}
              </div>
            </div>

            <div class="space-y-2 pt-1">
              <div class="flex items-center justify-between text-xs text-[#6B7280] font-mono mb-2 px-1">
                <span>NESTED SUBTASKS & STRUCTURED IDEALAB BLUEPRINTS</span>
                <span>${done} / ${total} Completed</span>
              </div>
              <div class="space-y-2.5">
                ${subtasksHtml}
              </div>
            </div>
          </div>
        `;
      }
      return '';
    },

    /**
     * Render Task Card
     * @param {Object} sub
     * @param {Object} options
     */
    renderTaskCard(sub, options = {}) {
      const mode = options.mode || 'dashboard';
      const goalId = options.goalId || sub.goalId;
      const badgeColor = sub.priority === 'High' ? 'bg-red-500/10 border border-red-500/30 text-red-400' : sub.priority === 'Medium' ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400' : 'bg-green-500/10 border border-green-500/30 text-green-400';
      const isScheduled = typeof window.isMilestoneScheduled === 'function' ? window.isMilestoneScheduled(goalId, sub.id) : (sub.status === 'SCHEDULED');

      let scheduleBtnHtml = '';
      if (mode === 'workspace') {
        scheduleBtnHtml = isScheduled ? `
          <button onclick="window.location.href='planner.html'" class="w-7 h-7 rounded-lg hover:bg-[#A855F7]/10 text-[#A855F7]/80 hover:text-[#A855F7] transition-all duration-200 ease-out flex items-center justify-center hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:-translate-y-0.5 active:translate-y-0" title="View in Planner">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
          </button>
        ` : `
          <button onclick="window.openScheduleMilestoneModal('${goalId}', '${sub.id}')" class="w-7 h-7 rounded-lg hover:bg-[#A855F7]/10 text-[#A855F7]/80 hover:text-[#A855F7] transition-all duration-200 ease-out flex items-center justify-center hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:-translate-y-0.5 active:translate-y-0" title="Schedule to Planner">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z"/></svg>
          </button>
        `;
      } else {
        if (isScheduled) {
          scheduleBtnHtml = `
            <button onclick="window.location.href='planner.html'" class="w-7 h-7 rounded-lg hover:bg-[#A855F7]/10 text-[#A855F7]/80 hover:text-[#A855F7] transition-all duration-200 ease-out flex items-center justify-center hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:-translate-y-0.5 active:translate-y-0" title="View in Planner">
              <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
            </button>
          `;
        }
      }

      if (mode === 'dashboard') {
        return `
          <div class="flex items-center justify-between p-3.5 rounded-xl bg-[#0A0A0A] border border-[#202020] hover:border-[#343434] transition group gap-4">
            <div class="flex items-center space-x-3.5 overflow-hidden">
              <input type="checkbox" aria-label="Mark task ${sub.title} completed" onchange="SF_STORE.dispatch('goals/TOGGLE_SUBTASK',{goalId:'${goalId}',subtaskId:'${sub.id}'})" ${sub.completed ? 'checked' : ''} class="w-4 h-4 rounded border-[#2A2A2A] bg-[#161616] text-[#A855F7] focus:ring-[#A855F7] cursor-pointer shrink-0" />
              <div class="truncate">
                <h4 class="text-xs font-semibold text-[#FAFAFA] ${sub.completed ? 'line-through text-[#6B7280]' : 'group-hover:text-[#A855F7]'} transition truncate">${sub.title}</h4>
                <p class="text-[10px] text-[#6B7280] font-mono mt-0.5 truncate flex items-center gap-1.5">
                  <span>${sub.goalTitle || 'Task'}</span>
                  <span>•</span>
                  <span class="text-[#A855F7]">${sub.deadlineDisplay || 'Assigned'}</span>
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-3 shrink-0">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}">${sub.priority || 'High'}</span>
              <div class="flex items-center bg-[#111116] border border-[#20202A] rounded-xl p-1 space-x-1 hover:border-[#303040] shadow-sm transition duration-300">
                <button onclick="window.openSubtaskIdeaLab('${goalId}', '${sub.id}')" class="w-7 h-7 rounded-lg hover:bg-[#A855F7]/10 text-[#A855F7]/80 hover:text-[#A855F7] transition-all duration-200 ease-out flex items-center justify-center hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:-translate-y-0.5 active:translate-y-0" title="AI IdeaLab">
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>
                </button>
                ${scheduleBtnHtml}
                <button onclick="window.location.href='focus.html'" class="w-7 h-7 rounded-lg hover:bg-[#FACC15]/10 text-[#FACC15]/80 hover:text-[#FACC15] transition-all duration-200 ease-out flex items-center justify-center hover:shadow-[0_0_15px_rgba(250,204,21,0.2)] hover:-translate-y-0.5 active:translate-y-0" title="Start Focus Timer">
                  <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      } else if (mode === 'workspace') {
        return `
          <div class="flex items-center justify-between p-3.5 rounded-xl bg-[#0A0A0A] border border-[#202020] hover:border-[#343434] transition group gap-4">
            <div class="flex items-center space-x-3.5 overflow-hidden">
              <input type="checkbox" aria-label="Mark task ${sub.title} completed" onchange="window.SF_STORE.dispatch('goals/TOGGLE_SUBTASK',{goalId:'${goalId}',subtaskId:'${sub.id}'})" ${sub.completed ? 'checked' : ''} class="w-4 h-4 rounded border-[#2A2A2A] bg-[#161616] text-[#A855F7] focus:ring-[#A855F7] cursor-pointer shrink-0" />
              <div class="truncate">
                <h4 class="text-xs font-semibold text-[#FAFAFA] ${sub.completed ? 'line-through text-[#6B7280]' : 'group-hover:text-[#A855F7]'} transition truncate">${sub.title}</h4>
                <p class="text-[10px] text-[#6B7280] font-mono mt-0.5 truncate flex items-center gap-1.5">
                  <span>${sub.estimate || 'Task'}</span>
                  <span>•</span>
                  <span class="text-[#A855F7]">${sub.deadlineDisplay || 'Assigned'}</span>
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-3 shrink-0">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}">${sub.priority || 'High'}</span>
              <div class="flex items-center bg-[#111116] border border-[#20202A] rounded-xl p-1 space-x-1 hover:border-[#303040] shadow-sm transition duration-300">
                <button onclick="window.openSubtaskIdeaLab('${goalId}', '${sub.id}')" class="w-7 h-7 rounded-lg hover:bg-[#A855F7]/10 text-[#A855F7]/80 hover:text-[#A855F7] transition-all duration-200 ease-out flex items-center justify-center hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:-translate-y-0.5 active:translate-y-0" title="AI IdeaLab">
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>
                </button>
                ${scheduleBtnHtml}
                <button onclick="window.location.href='focus.html'" class="w-7 h-7 rounded-lg hover:bg-[#FACC15]/10 text-[#FACC15]/80 hover:text-[#FACC15] transition-all duration-200 ease-out flex items-center justify-center hover:shadow-[0_0_15px_rgba(250,204,21,0.2)] hover:-translate-y-0.5 active:translate-y-0" title="Start Focus Timer">
                  <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }
      return '';
    },

    /**
     * Render Sidebar
     */
    renderSidebar() {
      return window.StudyFlowTemplates && window.StudyFlowTemplates['components/sidebar.html'] ? window.StudyFlowTemplates['components/sidebar.html'] : '';
    },

    /**
     * Render Navbar
     */
    renderNavbar() {
      return window.StudyFlowTemplates && window.StudyFlowTemplates['components/navbar.html'] ? window.StudyFlowTemplates['components/navbar.html'] : '';
    },

    /**
     * Render Button
     * @param {Object} props
     */
    renderButton({ text = '', variant = 'primary', onClick = '', className = '', type = 'button', iconHtml = '' }) {
      let baseClass = 'btn text-xs font-bold transition flex items-center justify-center space-x-1.5 rounded-xl ';
      if (variant === 'primary') baseClass += 'btn-primary px-4 py-2.5 shadow-[0_0_20px_rgba(168,85,247,0.25)] ';
      else if (variant === 'secondary') baseClass += 'btn-secondary px-4 py-2.5 border-[#202020] hover:border-[#A855F7] ';
      else if (variant === 'ghost') baseClass += 'btn-ghost px-3 py-2 text-[#6B7280] hover:text-[#FAFAFA] ';

      return `<button type="${type}" ${onClick ? `onclick="${onClick}"` : ''} class="${baseClass} ${className}">${iconHtml}<span>${text}</span></button>`;
    },

    /**
     * Render Progress Bar
     */
    renderProgressBar(percentage = 0, options = {}) {
      const height = options.heightClass || 'h-1.5';
      const bg = options.bgClass || 'bg-[#151515]';
      return `
        <div class="w-full ${bg} ${height} rounded-full overflow-hidden border border-[#202020]">
          <div class="bg-[#A855F7] h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all duration-500" style="width: ${percentage}%;"></div>
        </div>
      `;
    },

    /**
     * Render Progress Ring
     */
    renderProgressRing(percentage = 0, options = {}) {
      const size = options.size || 100;
      const strokeWidth = options.strokeWidth || 6;
      const radius = (size - strokeWidth * 2) / 2;
      const circumference = radius * 2 * Math.PI;
      const offset = circumference - (percentage / 100) * circumference;

      return `
        <div class="relative flex items-center justify-center" style="width:${size}px; height:${size}px;">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 ${size} ${size}">
            <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="#202020" stroke-width="${strokeWidth}" />
            <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="#A855F7" stroke-width="${strokeWidth}" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round" class="transition-all duration-1000 shadow-[0_0_20px_rgba(168,85,247,0.25)]" />
          </svg>
          <div class="absolute text-sm font-mono font-bold text-[#FAFAFA]">${percentage}%</div>
        </div>
      `;
    },

    /**
     * Render Analytics Card
     */
    renderAnalyticsCard({ title, value, subtitle, iconHtml }) {
      return `
        <div class="card bg-[#0E0E0E] border border-[#202020] p-5 rounded-[20px] flex items-center justify-between relative overflow-hidden group hover:border-[#A855F7]/40 transition">
          <div class="space-y-1">
            <span class="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block font-mono">${title}</span>
            <div class="text-2xl font-bold text-[#FAFAFA] font-mono tracking-tight">${value}</div>
            <p class="text-[11px] text-[#A1A1AA] flex items-center gap-1">${subtitle || ''}</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-[#151515] border border-[#252525] flex items-center justify-center text-[#A855F7] text-xl group-hover:scale-110 transition shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            ${iconHtml || '📊'}
          </div>
        </div>
      `;
    },

    /**
     * Render Modal Wrapper
     */
    renderModal({ id, title, subtitle, bodyHtml, footerHtml, iconHtml = '💡', maxWidth = 'max-w-2xl' }) {
      return `
        <div class="bg-[#0D0D0D] border border-[#2A2A2A] p-6 md:p-8 rounded-[24px] w-full ${maxWidth} shadow-[0_0_40px_rgba(168,85,247,0.18)] space-y-6 max-h-[90vh] overflow-y-auto animate-fadeIn">
          <div class="flex items-start justify-between pb-4 border-b border-[#1C1C1C] gap-4">
            <div class="flex items-center space-x-3.5">
              <div class="w-10 h-10 rounded-xl bg-[#A855F7]/20 border border-[#A855F7]/40 flex items-center justify-center text-[#A855F7] text-lg shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.25)]">${iconHtml}</div>
              <div>
                ${subtitle ? `<span class="text-[10px] font-mono font-bold tracking-wider text-[#A855F7] uppercase">${subtitle}</span>` : ''}
                <h3 class="text-base font-bold text-[#FAFAFA]">${title}</h3>
              </div>
            </div>
            <button onclick="document.getElementById('${id}').style.display='none'" class="text-[#6B7280] hover:text-[#FAFAFA] text-lg p-1">✕</button>
          </div>
          <div class="space-y-4">
            ${bodyHtml || ''}
          </div>
          ${footerHtml ? `<div class="flex items-center justify-between pt-4 border-t border-[#1C1C1C]">${footerHtml}</div>` : ''}
        </div>
      `;
    },

    /**
     * Render Dialog
     */
    renderDialog({ title, message, onConfirm, confirmText = 'Confirm' }) {
      return this.renderModal({
        id: 'globalDialogModal',
        title,
        bodyHtml: `<p class="text-xs text-[#A1A1AA] leading-relaxed">${message}</p>`,
        footerHtml: `
          <button onclick="document.getElementById('globalDialogModal').style.display='none'" class="btn btn-ghost px-4 py-2 text-xs">Cancel</button>
          <button onclick="${onConfirm}; document.getElementById('globalDialogModal').style.display='none'" class="btn btn-primary px-5 py-2 text-xs font-bold">${confirmText}</button>
        `,
        maxWidth: 'max-w-md'
      });
    },

    /**
     * Render Loading Skeletons
     */
    renderSkeleton(type = 'card', count = 1) {
      let html = '';
      for (let i = 0; i < count; i++) {
        if (type === 'card' || type === 'compact') {
          html += `
            <div class="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#202020] animate-pulse space-y-3">
              <div class="flex justify-between items-center"><div class="h-4 w-16 bg-[#181818] rounded"></div><div class="h-3 w-20 bg-[#181818] rounded"></div></div>
              <div class="space-y-1.5"><div class="h-4 w-3/4 bg-[#181818] rounded"></div><div class="h-3 w-1/2 bg-[#181818] rounded"></div></div>
              <div class="h-1.5 w-full bg-[#181818] rounded-full mt-2"></div>
            </div>
          `;
        } else if (type === 'grid') {
          html += `
            <div class="card bg-[#0E0E0E] border border-[#202020] p-6 rounded-[20px] animate-pulse h-48 flex flex-col justify-between space-y-4">
              <div class="space-y-2.5">
                <div class="flex justify-between items-center"><div class="h-4 w-20 bg-[#181818] rounded"></div><div class="h-3 w-24 bg-[#181818] rounded"></div></div>
                <div class="h-5 w-4/5 bg-[#181818] rounded"></div>
                <div class="h-3 w-full bg-[#181818] rounded"></div>
              </div>
              <div class="space-y-2 pt-4 border-t border-[#1C1C1C]">
                <div class="h-1.5 w-full bg-[#181818] rounded-full"></div>
                <div class="h-8 w-full bg-[#181818] rounded-xl"></div>
              </div>
            </div>
          `;
        } else if (type === 'row') {
          html += `
            <div class="flex items-center justify-between p-3.5 rounded-xl bg-[#0A0A0A] border border-[#202020] animate-pulse">
              <div class="flex items-center space-x-3.5"><div class="w-4 h-4 rounded bg-[#181818]"></div><div class="h-4 w-48 bg-[#181818] rounded"></div></div>
              <div class="h-5 w-14 bg-[#181818] rounded-full"></div>
            </div>
          `;
        }
      }
      return html;
    },

    /**
     * Render Empty State
     */
    renderEmptyState({ title = 'No items found', message = 'Get started by creating your first item below.', iconHtml = '📭', actionHtml = '' }) {
      return `
        <div class="p-8 rounded-2xl bg-[#0A0A0A]/60 border border-dashed border-[#2A2A2A] text-center space-y-3 my-4 animate-fadeIn">
          <div class="w-12 h-12 rounded-2xl bg-[#151515] border border-[#252525] flex items-center justify-center text-2xl mx-auto text-[#A855F7] shadow-[0_0_15px_rgba(168,85,247,0.15)]">${iconHtml}</div>
          <h4 class="text-sm font-bold text-[#FAFAFA]">${title}</h4>
          <p class="text-xs text-[#6B7280] max-w-sm mx-auto leading-relaxed">${message}</p>
          ${actionHtml ? `<div class="pt-2">${actionHtml}</div>` : ''}
        </div>
      `;
    },

    /**
     * Render Error Component
     */
    renderError({ title = 'Something went wrong', message = 'We encountered an error loading this section.', retryAction = 'window.location.reload()' }) {
      const alertSvg = `<svg class="w-5 h-5 text-red-400 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;
      return `
        <div class="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-3 my-4 animate-fadeIn" role="alert">
          <div class="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(239,68,68,0.2)]">${alertSvg}</div>
          <h4 class="text-sm font-bold text-red-400">${title}</h4>
          <p class="text-xs text-[#A1A1AA] max-w-md mx-auto leading-relaxed">${message}</p>
          <button onclick="${retryAction}" class="px-4 py-2 bg-[#151515] hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition border border-red-500/30">Try Again</button>
        </div>
      `;
    },

    /**
     * Show Custom StudyFlow Confirmation Modal
     */
    showConfirm(options = {}) {
      const {
        title = "Delete Goal?",
        description = "This action cannot be undone. The goal and all of its subtasks will be permanently deleted.",
        confirmText = "Delete Goal",
        cancelText = "Cancel",
        onConfirm = () => {},
        onCancel = () => {}
      } = options;

      const existing = document.getElementById('sf-confirm-modal');
      if (existing) existing.remove();

      const trashSvg = `<svg class="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;

      const modalHtml = `
        <div id="sf-confirm-modal" class="sf-confirm-overlay fixed inset-0 z-[200000] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn transition-opacity duration-200" role="dialog" aria-modal="true" aria-labelledby="sf-confirm-title">
          <div id="sf-confirm-card" class="bg-[#0E0E0E]/95 border border-[#2A2A2A] rounded-2xl p-6 max-w-md w-full mx-4 shadow-[0_0_50px_rgba(168,85,247,0.15)] relative transform transition-all duration-200 scale-95 opacity-0">
            <div class="flex items-start space-x-4">
              <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                ${trashSvg}
              </div>
              <div class="flex-1 space-y-1.5">
                <h3 id="sf-confirm-title" class="text-base font-bold text-[#FAFAFA]">${title}</h3>
                <p class="text-xs text-[#A1A1AA] leading-relaxed">${description}</p>
              </div>
            </div>
            <div class="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-[#1C1C1C]">
              <button id="sf-confirm-cancel-btn" class="px-4 py-2 rounded-xl bg-[#151515] hover:bg-[#202020] text-[#A1A1AA] hover:text-[#FAFAFA] text-xs font-bold transition border border-[#2A2A2A]">
                ${cancelText}
              </button>
              <button id="sf-confirm-proceed-btn" class="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-xs font-bold transition shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center space-x-1.5">
                ${trashSvg}
                <span>${confirmText}</span>
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHtml);

      const modalEl = document.getElementById('sf-confirm-modal');
      const cardEl = document.getElementById('sf-confirm-card');
      const cancelBtn = document.getElementById('sf-confirm-cancel-btn');
      const proceedBtn = document.getElementById('sf-confirm-proceed-btn');

      requestAnimationFrame(() => {
        if (cardEl) {
          cardEl.classList.remove('scale-95', 'opacity-0');
          cardEl.classList.add('scale-100', 'opacity-100');
        }
        if (cancelBtn) cancelBtn.focus();
      });

      const close = () => {
        if (cardEl) {
          cardEl.classList.remove('scale-100', 'opacity-100');
          cardEl.classList.add('scale-95', 'opacity-0');
        }
        if (modalEl) modalEl.classList.add('opacity-0');
        setTimeout(() => {
          if (modalEl) modalEl.remove();
          document.removeEventListener('keydown', keydownHandler);
        }, 150);
      };

      const keydownHandler = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
          close();
        } else if (e.key === 'Tab') {
          if (document.activeElement === proceedBtn && !e.shiftKey) {
            e.preventDefault();
            cancelBtn.focus();
          } else if (document.activeElement === cancelBtn && e.shiftKey) {
            e.preventDefault();
            proceedBtn.focus();
          }
        }
      };

      document.addEventListener('keydown', keydownHandler);

      cancelBtn.addEventListener('click', () => {
        onCancel();
        close();
      });

      proceedBtn.addEventListener('click', () => {
        close();
        onConfirm();
      });

      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
          onCancel();
          close();
        }
      });
    },

    confirm(options = {}) {
      return this.showConfirm(options);
    },

    /**
     * Show Floating Toast Notification
     */
    showToast(message, type = 'info', duration = 3500) {
      let container = document.getElementById('sf-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'sf-toast-container';
        container.className = 'sf-toast-container fixed bottom-5 right-5 z-[2147483647] flex flex-col gap-2.5 pointer-events-none max-w-xs w-full px-4 md:px-0';
        document.body.appendChild(container);
      }
      container.style.setProperty('z-index', '2147483647', 'important');
      if (container !== document.body.lastElementChild) {
        document.body.appendChild(container);
      }

      const toastId = 'toast-' + Math.random().toString(36).substring(2, 9);
      const toastEl = document.createElement('div');
      toastEl.id = toastId;

      let icon = `<svg class="w-4 h-4 text-[#A855F7] fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`;
      let borderGlow = 'border-[#A855F7]/40 text-[#FAFAFA] bg-[#0D0D0D]/95 shadow-[0_0_20px_rgba(168,85,247,0.2)]';
      if (type === 'success') {
        icon = `<svg class="w-4 h-4 text-green-400 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
        borderGlow = 'border-green-500/40 text-[#FAFAFA] bg-[#0D0D0D]/95 shadow-[0_0_20px_rgba(34,197,94,0.2)]';
      } else if (type === 'error') {
        icon = `<svg class="w-4 h-4 text-red-400 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;
        borderGlow = 'border-red-500/40 text-red-400 bg-[#0D0D0D]/95 shadow-[0_0_20px_rgba(239,68,68,0.2)]';
      }

      toastEl.className = `pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 ${borderGlow}`;
      toastEl.innerHTML = `
        <div class="flex items-center space-x-3 overflow-hidden">
          <span class="shrink-0 flex items-center">${icon}</span>
          <span class="text-xs font-semibold truncate">${message}</span>
        </div>
        <button onclick="const t = document.getElementById('${toastId}'); if(t) { t.style.opacity='0'; setTimeout(()=>t.remove(),200); }" class="text-[#6B7280] hover:text-[#FAFAFA] ml-3 text-xs shrink-0">✕</button>
      `;

      container.appendChild(toastEl);

      // Animate in
      requestAnimationFrame(() => {
        toastEl.classList.remove('translate-y-2', 'opacity-0');
      });

      // Auto dismiss
      setTimeout(() => {
        if (document.getElementById(toastId)) {
          toastEl.style.opacity = '0';
          toastEl.style.transform = 'translateY(8px)';
          setTimeout(() => {
            if (toastEl && toastEl.parentNode) toastEl.remove();
          }, 250);
        }
      }, duration);
    }
  };

  window.calculateGoalProgress = window.SF_COMPONENTS.calculateGoalProgress;
})();

// Premium Schedule Milestone Modal
window.ScheduleModal = {
  date: new Date(),
  timeStr: '09:00',
  duration: 60,
  
  open(goalId, milestoneId) {
    const goal = window.SF_STORE?.state?.goals?.items?.find(g => g.id === goalId) || { title: 'Goal' };
    const milestone = goal.subtasks?.find(s => s.id === milestoneId) || { title: 'Milestone', priority: 'High', estimate: '1 hr' };
    
    this.goalId = goalId;
    this.milestoneId = milestoneId;
    this.goalTitle = goal.title;
    this.milestoneTitle = milestone.title;
    this.milestonePriority = milestone.priority || 'High';
    this.milestoneEstimate = milestone.estimate || '1 hr';
    
    const now = new Date();
    this.date = now;
    let h = now.getHours() + 1;
    if (h > 23) h = 23;
    this.timeStr = `${String(h).padStart(2, '0')}:00`;
    this.duration = 60;
    
    this.currentMonth = this.date.getMonth();
    this.currentYear = this.date.getFullYear();
    
    this.render();
  },

  render() {
    let modalEl = document.getElementById('globalScheduleModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'globalScheduleModal';
      modalEl.className = 'fixed inset-0 z-[600000] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fadeIn p-4 transition-all duration-200 ease-out';
      document.body.appendChild(modalEl);
      
      modalEl.addEventListener('click', e => {
        if (e.target === modalEl) this.close();
      });
    }

    modalEl.innerHTML = this.getModalHtml();
    modalEl.style.display = 'flex';
    
    this.updateDisplay();

    // Close dropdowns on outside click within modal
    modalEl.querySelector('.modal-content-box').addEventListener('click', e => {
      if (!e.target.closest('#sm-date-wrapper')) document.getElementById('sm-date-dropdown').classList.add('hidden');
      if (!e.target.closest('#sm-time-wrapper')) document.getElementById('sm-time-dropdown').classList.add('hidden');
    });
  },
  
  close() {
    const modalEl = document.getElementById('globalScheduleModal');
    if (modalEl) {
      modalEl.classList.remove('animate-fadeIn');
      modalEl.style.opacity = '0';
      setTimeout(() => {
        modalEl.style.display = 'none';
        modalEl.style.opacity = '1';
        modalEl.classList.add('animate-fadeIn');
      }, 200);
    }
  },

  getModalHtml() {
    const badgeColor = this.milestonePriority === 'High' ? 'text-red-400 bg-red-500/10 border-red-500/20' : this.milestonePriority === 'Medium' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 'text-green-400 bg-green-500/10 border-green-500/20';

    return `
      <div class="modal-content-box bg-[#0A0A0B] border border-[#20202A] p-6 rounded-[24px] w-full max-w-[440px] shadow-[0_40px_80px_rgba(0,0,0,0.8),0_0_40px_rgba(168,85,247,0.15)] relative animate-scaleIn flex flex-col gap-6">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#A855F7]/20 to-[#A855F7]/5 border border-[#A855F7]/30 flex items-center justify-center text-[#A855F7] shadow-[0_0_20px_rgba(168,85,247,0.25)]">
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z"/></svg>
            </div>
            <h3 class="text-[18px] font-bold text-[#FAFAFA] tracking-tight">Schedule to Planner</h3>
          </div>
          <button onclick="window.ScheduleModal.close()" class="w-8 h-8 flex items-center justify-center rounded-full text-[#6B7280] hover:bg-[#1A1A24] hover:text-[#FAFAFA] transition duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
          </button>
        </div>

        <!-- Premium Context Card -->
        <div class="bg-gradient-to-br from-[#121218] to-[#0D0D12] border border-[#22222E] rounded-[16px] p-4 flex flex-col shadow-inner">
          <div class="flex items-center space-x-2 text-[#A1A1AA] mb-3 border-b border-[#22222E] pb-2.5">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
            <span class="text-[10px] font-bold tracking-widest uppercase">Goal</span>
            <span class="text-[12px] font-medium text-[#D4D4D8] truncate ml-1">${this.goalTitle}</span>
          </div>
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center space-x-2 text-[#A855F7] mb-0.5">
              <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              <span class="text-[10px] font-bold tracking-widest uppercase">Milestone</span>
            </div>
            <div class="text-[15px] font-bold text-[#FAFAFA] truncate">${this.milestoneTitle}</div>
            <div class="flex items-center space-x-2 mt-1">
              <span class="px-2 py-0.5 rounded-full text-[9px] font-bold border ${badgeColor}">${this.milestonePriority} Priority</span>
              <span class="text-[10px] font-medium text-[#6B7280]">Est. ${this.milestoneEstimate}</span>
            </div>
          </div>
        </div>
        
        <!-- Pickers Row -->
        <div class="grid grid-cols-2 gap-5">
          
          <!-- Date Picker -->
          <div id="sm-date-wrapper" class="relative">
            <label class="block text-[11px] font-bold text-[#8A8A98] uppercase tracking-wider mb-2.5">Date</label>
            <div onclick="window.ScheduleModal.toggleDatePicker()" class="w-full bg-[#111116] border border-[#2A2A35] hover:border-[#A855F7]/50 rounded-[14px] p-4 flex items-center justify-between cursor-pointer transition-all duration-200 ease-out group shadow-sm">
              <span id="sm-date-display" class="text-[14px] font-semibold text-[#A1A1AA]">Choose a date</span>
              <svg class="w-4.5 h-4.5 text-[#6B7280] group-hover:text-[#A855F7] transition duration-200 ease-out" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z"/></svg>
            </div>
            
            <div id="sm-date-dropdown" class="hidden absolute top-[calc(100%+8px)] left-0 w-[280px] bg-[#111116] border border-[#2A2A35] rounded-[20px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-scaleIn origin-top">
              <div class="flex items-center justify-between mb-5">
                <button type="button" onclick="window.ScheduleModal.changeMonth(-1); event.stopPropagation();" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1A1A24] hover:text-[#FAFAFA] text-[#A1A1AA] transition-all duration-200 ease-out">&lsaquo;</button>
                <div id="sm-calendar-title" class="text-[13px] font-bold text-[#FAFAFA] tracking-wide"></div>
                <button type="button" onclick="window.ScheduleModal.changeMonth(1); event.stopPropagation();" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1A1A24] hover:text-[#FAFAFA] text-[#A1A1AA] transition-all duration-200 ease-out">&rsaquo;</button>
              </div>
              <div class="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-[#6B7280] mb-3">
                <div>SU</div><div>MO</div><div>TU</div><div>WE</div><div>TH</div><div>FR</div><div>SA</div>
              </div>
              <div id="sm-calendar-grid" class="grid grid-cols-7 gap-1.5"></div>
            </div>
          </div>

          <!-- Time Picker -->
          <div id="sm-time-wrapper" class="relative">
            <label class="block text-[11px] font-bold text-[#8A8A98] uppercase tracking-wider mb-2.5">Time</label>
            <div onclick="window.ScheduleModal.toggleTimePicker()" class="w-full bg-[#111116] border border-[#2A2A35] hover:border-[#A855F7]/50 rounded-[14px] p-4 flex items-center justify-between cursor-pointer transition-all duration-200 ease-out group shadow-sm">
              <span id="sm-time-display" class="text-[14px] font-semibold text-[#A1A1AA]">Choose a time</span>
              <svg class="w-4.5 h-4.5 text-[#6B7280] group-hover:text-[#A855F7] transition duration-200 ease-out" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
            </div>
            <div id="sm-time-dropdown" class="hidden absolute top-[calc(100%+8px)] left-0 w-full bg-[#111116] border border-[#2A2A35] rounded-[20px] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-scaleIn origin-top flex justify-between gap-1 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] pt-6 pb-6">
            </div>
          </div>
        </div>

        <!-- Duration Quick Chips (No Dropdown) -->
        <div>
          <div class="flex items-center justify-between mb-2.5">
            <label class="block text-[11px] font-bold text-[#8A8A98] uppercase tracking-wider">Duration</label>
            <span id="sm-duration-display" class="text-[12px] font-semibold text-[#A855F7]">60 min</span>
          </div>
          <div class="flex items-center gap-2.5 flex-wrap">
             <div onclick="window.ScheduleModal.selectDuration(30)" class="duration-chip px-3.5 py-1.5 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-200 ease-out border border-[#2A2A35] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1A1A24] hover:scale-105 active:scale-95">30m</div>
             <div onclick="window.ScheduleModal.selectDuration(45)" class="duration-chip px-3.5 py-1.5 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-200 ease-out border border-[#2A2A35] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1A1A24] hover:scale-105 active:scale-95">45m</div>
             <div onclick="window.ScheduleModal.selectDuration(60)" class="duration-chip px-3.5 py-1.5 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-200 ease-out border border-[#2A2A35] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1A1A24] hover:scale-105 active:scale-95">60m</div>
             <div onclick="window.ScheduleModal.selectDuration(90)" class="duration-chip px-3.5 py-1.5 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-200 ease-out border border-[#2A2A35] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1A1A24] hover:scale-105 active:scale-95">90m</div>
             <div onclick="window.ScheduleModal.selectDuration(120)" class="duration-chip px-3.5 py-1.5 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-200 ease-out border border-[#2A2A35] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1A1A24] hover:scale-105 active:scale-95">120m</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end space-x-3 pt-3 border-t border-[#22222E]">
          <button type="button" onclick="window.ScheduleModal.close()" class="px-5 py-2.5 rounded-[12px] text-[13px] font-bold text-[#8A8A98] hover:text-[#FAFAFA] transition duration-200 ease-out hover:bg-[#1A1A24]">Cancel</button>
          <button type="button" onclick="window.ScheduleModal.submit()" id="scheduleSubmitBtn" class="px-7 py-3 rounded-[12px] bg-gradient-to-r from-[#A855F7] to-[#9333EA] hover:from-[#9333EA] hover:to-[#7E22CE] text-white text-[14px] font-bold shadow-[0_0_24px_rgba(168,85,247,0.4)] transition-all duration-200 ease-out flex items-center space-x-2 hover:-translate-y-0.5 active:translate-y-0">
            <span id="scheduleSubmitText">Schedule to Planner</span>
            <svg id="scheduleSubmitSpinner" class="animate-spin -mr-1 ml-2 h-4.5 w-4.5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  },

  updateDisplay() {
    const dStr = this.date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    document.getElementById('sm-date-display').innerText = dStr;

    let [h, m] = this.timeStr.split(':').map(Number);
    let ampm = h >= 12 ? 'PM' : 'AM';
    let hr12 = h % 12 || 12;
    document.getElementById('sm-time-display').innerText = `${String(hr12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;

    document.getElementById('sm-duration-display').innerText = `${this.duration} min`;
    
    // Update chips visual state
    const chips = document.querySelectorAll('.duration-chip');
    chips.forEach(chip => {
      const val = parseInt(chip.innerText);
      if (val === this.duration) {
        chip.className = "duration-chip px-3.5 py-1.5 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-200 ease-out bg-[#A855F7]/20 border border-[#A855F7]/50 text-[#FAFAFA] shadow-[0_0_12px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95";
      } else {
        chip.className = "duration-chip px-3.5 py-1.5 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-200 ease-out border border-[#2A2A35] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1A1A24] hover:scale-105 active:scale-95";
      }
    });
    
    this.renderCalendar();
    this.renderTimePicker();
  },

  toggleDatePicker() {
    const dd = document.getElementById('sm-date-dropdown');
    const wasHidden = dd.classList.contains('hidden');
    this.hideAllDropdowns();
    if (wasHidden) dd.classList.remove('hidden');
  },

  toggleTimePicker() {
    const dd = document.getElementById('sm-time-dropdown');
    const wasHidden = dd.classList.contains('hidden');
    this.hideAllDropdowns();
    if (wasHidden) dd.classList.remove('hidden');
  },

  hideAllDropdowns() {
    document.getElementById('sm-date-dropdown').classList.add('hidden');
    document.getElementById('sm-time-dropdown').classList.add('hidden');
  },

  changeMonth(dir) {
    this.currentMonth += dir;
    if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
    if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
    this.renderCalendar();
  },

  selectDate(d, e) {
    e.stopPropagation();
    this.date = new Date(this.currentYear, this.currentMonth, d);
    this.hideAllDropdowns();
    this.updateDisplay();
  },

  renderCalendar() {
    const grid = document.getElementById('sm-calendar-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const d = new Date(this.currentYear, this.currentMonth, 1);
    const monthName = d.toLocaleString('default', { month: 'long' });
    document.getElementById('sm-calendar-title').innerText = `${monthName} ${this.currentYear}`;
    
    const startDay = d.getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
    
    for (let i = 0; i < startDay; i++) {
      grid.innerHTML += `<div class="p-1.5 text-center text-[11px] font-medium text-[#3A3A3A]">${daysInPrevMonth - startDay + i + 1}</div>`;
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = (this.date.getDate() === i && this.date.getMonth() === this.currentMonth && this.date.getFullYear() === this.currentYear);
      const isToday = (new Date().getDate() === i && new Date().getMonth() === new Date().getMonth() && new Date().getFullYear() === new Date().getFullYear());
      
      let classes = "p-1.5 text-center text-[12px] font-bold rounded-[8px] cursor-pointer transition-all duration-200 ease-out flex items-center justify-center w-8 h-8 mx-auto ";
      if (isSelected) {
        classes += "bg-[#A855F7] text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] scale-110";
      } else if (isToday) {
        classes += "text-[#A855F7] border border-[#A855F7]/30 hover:bg-[#1A1A24] hover:scale-105 active:scale-95";
      } else {
        classes += "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1A1A24] hover:scale-105 active:scale-95";
      }
      
      grid.innerHTML += `<div><div onclick="window.ScheduleModal.selectDate(${i}, event)" class="${classes}">${i}</div></div>`;
    }
    
    const remaining = 42 - (startDay + daysInMonth);
    for (let i = 1; i <= remaining && i <= 14; i++) {
      grid.innerHTML += `<div class="p-1.5 text-center text-[11px] font-medium text-[#3A3A3A] flex items-center justify-center w-8 h-8 mx-auto">${i}</div>`;
    }
  },

  selectHour(hr12, e) {
    e.stopPropagation();
    let [h, m] = this.timeStr.split(':').map(Number);
    let ampm = h >= 12 ? 'PM' : 'AM';
    let newH = ampm === 'PM' ? (hr12 === 12 ? 12 : hr12 + 12) : (hr12 === 12 ? 0 : hr12);
    this.timeStr = `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    this.updateDisplay();
  },

  selectMinute(m, e) {
    e.stopPropagation();
    let [h, _oldM] = this.timeStr.split(':').map(Number);
    this.timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    this.updateDisplay();
  },

  selectAmPm(newAmPm, e) {
    e.stopPropagation();
    let [h, m] = this.timeStr.split(':').map(Number);
    let ampm = h >= 12 ? 'PM' : 'AM';
    if (newAmPm !== ampm) {
      if (newAmPm === 'PM') h = (h % 12) + 12;
      else h = h % 12;
    }
    this.timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    this.updateDisplay();
  },

  renderTimePicker() {
    const container = document.getElementById('sm-time-dropdown');
    if (!container) return;
    
    let [h, m] = this.timeStr.split(':').map(Number);
    let ampm = h >= 12 ? 'PM' : 'AM';
    let hr12 = h % 12 || 12;
    
    let hrHtml = '<div class="flex-1 h-[160px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-y snap-mandatory flex flex-col text-center px-1 space-y-1">';
    hrHtml += '<div class="h-[60px] shrink-0"></div>'; // padding for scroll center
    for (let i = 1; i <= 12; i++) {
      const isSel = i === hr12;
      const pad = String(i).padStart(2, '0');
      hrHtml += `<div onclick="window.ScheduleModal.selectHour(${i}, event)" class="py-2 cursor-pointer rounded-[10px] transition-all duration-200 ${isSel ? 'bg-[#A855F7] text-white text-[16px] font-bold shadow-[0_0_12px_rgba(168,85,247,0.4)] scale-110' : 'text-[#6B7280] text-[13px] font-semibold hover:text-[#FAFAFA] hover:bg-[#1A1A24]'} snap-center shrink-0">${pad}</div>`;
    }
    hrHtml += '<div class="h-[60px] shrink-0"></div>';
    hrHtml += '</div>';

    let minHtml = '<div class="flex-1 h-[160px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-y snap-mandatory flex flex-col text-center px-1 space-y-1 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-[1px] before:bg-[#2A2A35] pl-2 ml-1">';
    minHtml += '<div class="h-[60px] shrink-0"></div>';
    for (let i = 0; i < 60; i+=15) {
      const isSel = i === m || (Math.abs(i - m) < 15 && i <= m && (i+15 > m));
      const pad = String(i).padStart(2, '0');
      minHtml += `<div onclick="window.ScheduleModal.selectMinute(${i}, event)" class="py-2 cursor-pointer rounded-[10px] transition-all duration-200 ${isSel ? 'bg-[#A855F7] text-white text-[16px] font-bold shadow-[0_0_12px_rgba(168,85,247,0.4)] scale-110' : 'text-[#6B7280] text-[13px] font-semibold hover:text-[#FAFAFA] hover:bg-[#1A1A24]'} snap-center shrink-0">${pad}</div>`;
    }
    minHtml += '<div class="h-[60px] shrink-0"></div>';
    minHtml += '</div>';

    let ampmHtml = '<div class="flex-1 h-[160px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col text-center justify-center gap-3 px-1 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-[1px] before:bg-[#2A2A35] pl-2 ml-1">';
    ampmHtml += `<div onclick="window.ScheduleModal.selectAmPm('AM', event)" class="py-2.5 cursor-pointer rounded-[10px] transition-all duration-200 ${ampm === 'AM' ? 'bg-[#A855F7] text-white text-[14px] font-bold shadow-[0_0_12px_rgba(168,85,247,0.4)] scale-105' : 'text-[#6B7280] text-[13px] font-semibold hover:text-[#FAFAFA] hover:bg-[#1A1A24]'} shrink-0">AM</div>`;
    ampmHtml += `<div onclick="window.ScheduleModal.selectAmPm('PM', event)" class="py-2.5 cursor-pointer rounded-[10px] transition-all duration-200 ${ampm === 'PM' ? 'bg-[#A855F7] text-white text-[14px] font-bold shadow-[0_0_12px_rgba(168,85,247,0.4)] scale-105' : 'text-[#6B7280] text-[13px] font-semibold hover:text-[#FAFAFA] hover:bg-[#1A1A24]'} shrink-0">PM</div>`;
    ampmHtml += '</div>';
    
    container.innerHTML = hrHtml + minHtml + ampmHtml;
  },

  selectDuration(mins) {
    this.duration = mins;
    this.updateDisplay();
  },

  async submit() {
    const btn = document.getElementById('scheduleSubmitBtn');
    btn.disabled = true;
    btn.style.opacity = '0.7';
    btn.style.transform = 'scale(0.98)';
    document.getElementById('scheduleSubmitText').textContent = 'Scheduling...';
    document.getElementById('scheduleSubmitSpinner').classList.remove('hidden');

    try {
      let [h, m] = this.timeStr.split(':').map(Number);
      const start = new Date(this.date);
      start.setHours(h, m, 0, 0);
      
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + this.duration);
      
      const payload = {
        goalId: this.goalId,
        milestoneId: this.milestoneId,
        startTime: start.toISOString(),
        endTime: end.toISOString()
      };
      
      await window.SF_STORE.dispatch('planner/SCHEDULE_MILESTONE', payload);
      
      document.getElementById('scheduleSubmitSpinner').classList.add('hidden');
      document.getElementById('scheduleSubmitText').innerHTML = '✓ Scheduled';
      btn.style.opacity = '1';
      btn.className = "px-7 py-3 rounded-[12px] bg-[#16A34A] text-white text-[14px] font-bold shadow-[0_0_24px_rgba(22,163,74,0.4)] transition-all duration-200 ease-out flex items-center justify-center space-x-2";
      
      setTimeout(() => {
        this.close();
        if (window.SF_COMPONENTS && window.SF_COMPONENTS.showToast) {
          window.SF_COMPONENTS.showToast('Milestone scheduled successfully!', 'success');
        }
      }, 1000);
    } catch (error) {
      if (window.SF_COMPONENTS && window.SF_COMPONENTS.showToast) {
        window.SF_COMPONENTS.showToast(error.message || 'Failed to schedule milestone.', 'error');
      }
    } finally {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.transform = 'none';
      document.getElementById('scheduleSubmitText').textContent = 'Schedule to Planner';
      document.getElementById('scheduleSubmitSpinner').classList.add('hidden');
    }
  }
};

window.openScheduleMilestoneModal = function(goalId, milestoneId) {
  window.ScheduleModal.open(goalId, milestoneId);
};

