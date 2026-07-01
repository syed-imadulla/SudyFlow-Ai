/**
 * StudyFlow AI – Centralized UI Component Rendering Layer
 * Exposes window.SF_COMPONENTS with pure, reusable HTML render functions.
 * Preserves 100% identical appearance, CSS classes, and interaction attributes.
 */
(function () {
  window.SF_COMPONENTS = {
    /**
     * Render Goal Card
     * @param {Object} goal
     * @param {string} mode - 'compact' (dashboard), 'grid' (workspace cards), 'expanded' (workspace detail)
     */
    renderGoalCard(goal, mode = 'compact') {
      const done = goal.subtasks ? goal.subtasks.filter(s => s.completed).length : 0;
      const total = goal.subtasks ? goal.subtasks.length : 0;
      const progress = goal.progress || 0;
      const isUrg = goal.urgency === 'URGENT' || (goal.urgency && goal.urgency.includes('High'));

      if (mode === 'compact') {
        const urgClass = isUrg ? 'bg-red-500/15 text-red-400 border border-red-500/30 font-bold' : 'bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/30 font-bold';
        return `
          <div role="button" tabindex="0" aria-label="Open Goal: ${goal.title}" onclick="window.location.href='idealab.html?goalId=${goal.id}'" onkeydown="if(event.key==='Enter'||event.key===' ')window.location.href='idealab.html?goalId=${goal.id}'" class="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#202020] hover:border-[#A855F7]/50 transition cursor-pointer space-y-2.5 group">
            <div class="flex items-center justify-between">
              <span class="text-[10px] px-2 py-0.5 rounded ${urgClass}">${goal.urgency || 'ACTIVE'}</span>
              <span class="text-[10px] font-mono text-[#FACC15]">📅 ${goal.finalDeadlineDisplay || 'No deadline'}</span>
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
          <div role="button" tabindex="0" aria-label="Open Goal Grid: ${goal.title}" onclick="window.location.href='idealab.html?goalId=${goal.id}'" onkeydown="if(event.key==='Enter'||event.key===' ')window.location.href='idealab.html?goalId=${goal.id}'" class="card bg-[#0E0E0E] border border-[#202020] p-6 rounded-[20px] flex flex-col justify-between space-y-4 hover:border-[#A855F7]/50 transition cursor-pointer relative group">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${urgClass}">${goal.urgency || 'ACTIVE'}</span>
                <span class="text-xs font-mono text-[#FACC15] font-semibold">${goal.finalDeadlineDisplay || 'In 7 days'}</span>
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
              <div class="flex items-center space-x-2">
                <button onclick="event.stopPropagation(); window.openEditGoalModal('${goal.id}')" class="px-3 py-2 bg-[#151515] hover:bg-[#202020] text-[#FAFAFA] rounded-xl text-xs font-bold transition border border-[#2A2A2A]" title="Edit Goal Details">
                  ✏️ Edit
                </button>
                <button onclick="event.stopPropagation(); window.location.href='idealab.html?goalId=${goal.id}'" class="flex-1 py-2 bg-[#151515] hover:bg-[#A855F7] text-[#A855F7] hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 border border-[#2A2A2A] hover:border-transparent">
                  <span>✨ IdeaLab Architect</span>
                </button>
              </div>
            </div>
          </div>
        `;
      } else if (mode === 'expanded') {
        const subtasksHtml = (goal.subtasks || []).map(sub => this.renderTaskCard(sub, { mode: 'workspace', goalId: goal.id })).join('');
        return `
          <div class="card bg-[#0E0E0E] border border-[#202020] p-6 rounded-[20px] space-y-4 shadow-saas animate-fadeIn">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
              <div class="flex items-start space-x-3.5">
                <div class="w-10 h-10 rounded-xl bg-[#A855F7]/15 border border-[#A855F7]/30 flex items-center justify-center text-[#A855F7] font-bold text-sm shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <svg class="w-5 h-5 text-[#A855F7] fill-current drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" viewBox="0 0 24 24"><path d="M10 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V8C22 6.89 21.11 6 20 6H12L10 4Z"/></svg>
                </div>
                <div>
                  <div class="flex flex-wrap items-center gap-2.5">
                    <h3 class="text-base font-bold text-[#FAFAFA]">${goal.title}</h3>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${isUrg ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40'}">${goal.urgency || 'ACTIVE'}</span>
                    <button onclick="event.stopPropagation(); window.openEditGoalModal('${goal.id}')" class="px-2.5 py-1 rounded-lg bg-[#151515] hover:bg-[#202020] text-[#FAFAFA] border border-[#2A2A2A] text-[11px] font-bold transition shrink-0" title="Quick Edit Goal">
                      ✏️ Edit
                    </button>
                    <button onclick="window.location.href='idealab.html?goalId=${goal.id}'" class="px-3 py-1 rounded-lg bg-[#A855F7] text-white hover:bg-[#9333EA] transition text-[11px] font-bold flex items-center space-x-1.5 shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0" title="Restructure & Refine Main Goal in IdeaLab">
                      <svg class="w-3.5 h-3.5 inline shrink-0 fill-current drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" viewBox="0 0 24 24"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>
                      <span>IdeaLab Architect</span>
                      <span>→</span>
                    </button>
                  </div>
                  <p class="text-xs text-[#A1A1AA] mt-1">${goal.description || 'AI Goal Plan'}</p>
                </div>
              </div>
              <div class="flex items-center space-x-4 shrink-0">
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
            <div class="flex items-center space-x-2.5 shrink-0">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}">${sub.priority || 'High'}</span>
              <button onclick="window.location.href='focus.html'" class="p-1.5 rounded-lg bg-[#151515] hover:bg-[#A855F7]/20 text-[#A855F7] transition" title="Start Focus Block">
                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </button>
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
            <div class="flex items-center space-x-2.5 shrink-0">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}">${sub.priority || 'High'}</span>
              <div class="flex items-center bg-[#151520] rounded-lg border border-[#252535] p-0.5 space-x-0.5">
                <button onclick="window.openSubtaskIdeaLab('${goalId}', '${sub.id}')" class="p-1.5 rounded-md hover:bg-[#A855F7]/20 text-[#A855F7] transition flex items-center justify-center" title="Open IdeaLab Guide">
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>
                </button>
                <button onclick="window.location.href='focus.html'" class="p-1.5 rounded-md hover:bg-[#FACC15]/20 text-[#FACC15] transition flex items-center justify-center" title="Start Focus Timer">
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
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
      return `
        <div class="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-3 my-4 animate-fadeIn" role="alert">
          <div class="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-lg mx-auto text-red-400">⚠️</div>
          <h4 class="text-sm font-bold text-red-400">${title}</h4>
          <p class="text-xs text-[#A1A1AA] max-w-md mx-auto leading-relaxed">${message}</p>
          <button onclick="${retryAction}" class="px-4 py-2 bg-[#151515] hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition border border-red-500/30">Try Again</button>
        </div>
      `;
    },

    /**
     * Show Floating Toast Notification
     */
    showToast(message, type = 'info', duration = 3500) {
      let container = document.getElementById('sf-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'sf-toast-container';
        container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-xs w-full px-4 md:px-0';
        document.body.appendChild(container);
      }

      const toastId = 'toast-' + Math.random().toString(36).substring(2, 9);
      const toastEl = document.createElement('div');
      toastEl.id = toastId;

      let icon = '💡';
      let borderGlow = 'border-[#A855F7]/40 text-[#FAFAFA] bg-[#0D0D0D]/95 shadow-[0_0_20px_rgba(168,85,247,0.2)]';
      if (type === 'success') {
        icon = '✨';
        borderGlow = 'border-green-500/40 text-[#FAFAFA] bg-[#0D0D0D]/95 shadow-[0_0_20px_rgba(34,197,94,0.2)]';
      } else if (type === 'error') {
        icon = '⚠️';
        borderGlow = 'border-red-500/40 text-red-400 bg-[#0D0D0D]/95 shadow-[0_0_20px_rgba(239,68,68,0.2)]';
      }

      toastEl.className = `pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 ${borderGlow}`;
      toastEl.innerHTML = `
        <div class="flex items-center space-x-3 overflow-hidden">
          <span class="text-base shrink-0">${icon}</span>
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
})();
