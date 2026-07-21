const fs = require('fs');

let content = fs.readFileSync('frontend/src/js/components.js', 'utf8');

// 1. Update the buttons pill in renderTaskCard
const newButtons = `<div class="flex items-center bg-[#111116] border border-[#20202A] rounded-xl p-1 space-x-1 hover:border-[#303040] shadow-md transition duration-300">
                <button onclick="window.openSubtaskIdeaLab('\\${goalId}', '\\${sub.id}')" class="w-7 h-7 rounded-lg hover:bg-[#A855F7]/10 text-[#A855F7]/70 hover:text-[#A855F7] transition-all duration-300 flex items-center justify-center hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:scale-105 active:scale-95" title="AI IdeaLab">
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>
                </button>
                <button onclick="window.openScheduleMilestoneModal('\\${goalId}', '\\${sub.id}')" class="w-7 h-7 rounded-lg hover:bg-[#A855F7]/10 text-[#A855F7]/70 hover:text-[#A855F7] transition-all duration-300 flex items-center justify-center hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:scale-105 active:scale-95" title="Schedule to Planner">
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z"/></svg>
                </button>
                <button onclick="window.location.href='focus.html'" class="w-7 h-7 rounded-lg hover:bg-[#FACC15]/10 text-[#FACC15]/70 hover:text-[#FACC15] transition-all duration-300 flex items-center justify-center hover:shadow-[0_0_15px_rgba(250,204,21,0.2)] hover:scale-105 active:scale-95" title="Start Focus Timer">
                  <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>`;

content = content.replace(/<div class="flex items-center bg-\[#111116\][^>]+>[\s\S]*?<\/button>\s*<\/div>/g, newButtons);


// 2. Replace the Premium Schedule Milestone Modal
const oldModalRegex = /\/\/ Premium Schedule Milestone Modal[\s\S]*/;
const newModal = `// Premium Schedule Milestone Modal
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
    this.timeStr = \`\${String(h).padStart(2, '0')}:00\`;
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
      modalEl.className = 'fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fadeIn p-4 transition-opacity duration-300';
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

    return \`
      <div class="modal-content-box bg-[#0A0A0B] border border-[#20202A] p-8 rounded-[28px] w-full max-w-[480px] shadow-[0_30px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(168,85,247,0.12)] relative animate-scaleIn flex flex-col gap-7">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-11 h-11 rounded-[16px] bg-gradient-to-br from-[#A855F7]/20 to-[#A855F7]/5 border border-[#A855F7]/30 flex items-center justify-center text-[#A855F7] shadow-[0_0_20px_rgba(168,85,247,0.25)]">
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z"/></svg>
            </div>
            <h3 class="text-xl font-bold text-[#FAFAFA] tracking-tight">Schedule to Planner</h3>
          </div>
          <button onclick="window.ScheduleModal.close()" class="w-9 h-9 flex items-center justify-center rounded-full text-[#6B7280] hover:bg-[#1A1A24] hover:text-[#FAFAFA] transition duration-200">
            <svg class="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" width="18" height="18"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
          </button>
        </div>

        <!-- Premium Context Card -->
        <div class="bg-gradient-to-br from-[#121218] to-[#0D0D12] border border-[#22222E] rounded-[20px] p-5 flex flex-col shadow-inner">
          <div class="flex items-center space-x-2 text-[#A1A1AA] mb-4 border-b border-[#22222E] pb-3">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
            <span class="text-xs font-semibold tracking-wide uppercase">Goal</span>
            <span class="text-[13px] font-medium text-[#D4D4D8] truncate ml-2">\${this.goalTitle}</span>
          </div>
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center space-x-2 text-[#A855F7] mb-0.5">
                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                <span class="text-[11px] font-bold tracking-widest uppercase">Milestone</span>
              </div>
              <div class="text-[16px] font-bold text-[#FAFAFA] truncate max-w-[260px]">\${this.milestoneTitle}</div>
              <div class="flex items-center space-x-2 mt-1">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border \${badgeColor}">\${this.milestonePriority} Priority</span>
                <span class="text-[11px] font-medium text-[#6B7280]">Est. \${this.milestoneEstimate}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pickers Row -->
        <div class="grid grid-cols-2 gap-5">
          
          <!-- Date Picker -->
          <div id="sm-date-wrapper" class="relative">
            <label class="block text-[11px] font-bold text-[#8A8A98] uppercase tracking-wider mb-2.5">Date</label>
            <div onclick="window.ScheduleModal.toggleDatePicker()" class="w-full bg-[#111116] border border-[#2A2A35] hover:border-[#A855F7]/50 rounded-[14px] p-4 flex items-center justify-between cursor-pointer transition-all duration-300 group shadow-sm">
              <span id="sm-date-display" class="text-[14px] font-semibold text-[#FAFAFA]">Select Date</span>
              <svg class="w-4.5 h-4.5 text-[#6B7280] group-hover:text-[#A855F7] transition duration-300" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z"/></svg>
            </div>
            
            <div id="sm-date-dropdown" class="hidden absolute top-[calc(100%+8px)] left-0 w-[280px] bg-[#111116] border border-[#2A2A35] rounded-[20px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-scaleIn">
              <div class="flex items-center justify-between mb-5">
                <button type="button" onclick="window.ScheduleModal.changeMonth(-1); event.stopPropagation();" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1A1A24] hover:text-[#FAFAFA] text-[#A1A1AA] transition">&lsaquo;</button>
                <div id="sm-calendar-title" class="text-[13px] font-bold text-[#FAFAFA] tracking-wide"></div>
                <button type="button" onclick="window.ScheduleModal.changeMonth(1); event.stopPropagation();" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1A1A24] hover:text-[#FAFAFA] text-[#A1A1AA] transition">&rsaquo;</button>
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
            <div onclick="window.ScheduleModal.toggleTimePicker()" class="w-full bg-[#111116] border border-[#2A2A35] hover:border-[#A855F7]/50 rounded-[14px] p-4 flex items-center justify-between cursor-pointer transition-all duration-300 group shadow-sm">
              <span id="sm-time-display" class="text-[14px] font-semibold text-[#FAFAFA]">--:-- --</span>
              <svg class="w-4.5 h-4.5 text-[#6B7280] group-hover:text-[#A855F7] transition duration-300" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
            </div>
            <div id="sm-time-dropdown" class="hidden absolute top-[calc(100%+8px)] left-0 w-full bg-[#111116] border border-[#2A2A35] rounded-[20px] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-scaleIn flex justify-between gap-1 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] pt-6 pb-6">
            </div>
          </div>
        </div>

        <!-- Duration Quick Chips (No Dropdown) -->
        <div>
          <div class="flex items-center justify-between mb-2.5">
            <label class="block text-[11px] font-bold text-[#8A8A98] uppercase tracking-wider">Duration</label>
            <span id="sm-duration-display" class="text-[12px] font-semibold text-[#A855F7]">60 min</span>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
             <div onclick="window.ScheduleModal.selectDuration(30)" class="duration-chip px-3.5 py-2 rounded-[10px] text-[13px] font-bold cursor-pointer transition-all duration-200 border border-[#2A2A35] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1A1A24]">30m</div>
             <div onclick="window.ScheduleModal.selectDuration(45)" class="duration-chip px-3.5 py-2 rounded-[10px] text-[13px] font-bold cursor-pointer transition-all duration-200 border border-[#2A2A35] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1A1A24]">45m</div>
             <div onclick="window.ScheduleModal.selectDuration(60)" class="duration-chip px-3.5 py-2 rounded-[10px] text-[13px] font-bold cursor-pointer transition-all duration-200 border border-[#2A2A35] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1A1A24]">60m</div>
             <div onclick="window.ScheduleModal.selectDuration(90)" class="duration-chip px-3.5 py-2 rounded-[10px] text-[13px] font-bold cursor-pointer transition-all duration-200 border border-[#2A2A35] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1A1A24]">90m</div>
             <div onclick="window.ScheduleModal.selectDuration(120)" class="duration-chip px-3.5 py-2 rounded-[10px] text-[13px] font-bold cursor-pointer transition-all duration-200 border border-[#2A2A35] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1A1A24]">120m</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end space-x-4 pt-3 border-t border-[#22222E]">
          <button type="button" onclick="window.ScheduleModal.close()" class="px-5 py-2.5 rounded-[12px] text-[13px] font-bold text-[#8A8A98] hover:text-[#FAFAFA] transition duration-200">Cancel</button>
          <button type="button" onclick="window.ScheduleModal.submit()" id="scheduleSubmitBtn" class="px-7 py-3 rounded-[12px] bg-gradient-to-r from-[#A855F7] to-[#9333EA] hover:from-[#9333EA] hover:to-[#7E22CE] text-white text-[14px] font-bold shadow-[0_0_24px_rgba(168,85,247,0.4)] transition-all duration-300 flex items-center space-x-2 hover:scale-[1.02] active:scale-[0.98]">
            <span id="scheduleSubmitText">Schedule to Planner</span>
            <svg id="scheduleSubmitSpinner" class="animate-spin -mr-1 ml-2 h-4.5 w-4.5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </div>
      </div>
    \`;
  },

  updateDisplay() {
    const dStr = this.date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    document.getElementById('sm-date-display').innerText = dStr;

    let [h, m] = this.timeStr.split(':').map(Number);
    let ampm = h >= 12 ? 'PM' : 'AM';
    let hr12 = h % 12 || 12;
    document.getElementById('sm-time-display').innerText = \`\${String(hr12).padStart(2, '0')}:\${String(m).padStart(2, '0')} \${ampm}\`;

    document.getElementById('sm-duration-display').innerText = \`\${this.duration} min\`;
    
    // Update chips visual state
    const chips = document.querySelectorAll('.duration-chip');
    chips.forEach(chip => {
      const val = parseInt(chip.innerText);
      if (val === this.duration) {
        chip.className = "duration-chip px-3.5 py-2 rounded-[10px] text-[13px] font-bold cursor-pointer transition-all duration-200 bg-[#A855F7]/20 border border-[#A855F7]/50 text-[#FAFAFA] shadow-[0_0_12px_rgba(168,85,247,0.3)]";
      } else {
        chip.className = "duration-chip px-3.5 py-2 rounded-[10px] text-[13px] font-bold cursor-pointer transition-all duration-200 border border-[#2A2A35] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1A1A24]";
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
    document.getElementById('sm-calendar-title').innerText = \`\${monthName} \${this.currentYear}\`;
    
    const startDay = d.getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
    
    for (let i = 0; i < startDay; i++) {
      grid.innerHTML += \`<div class="p-1.5 text-center text-[11px] font-medium text-[#3A3A3A]">\${daysInPrevMonth - startDay + i + 1}</div>\`;
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = (this.date.getDate() === i && this.date.getMonth() === this.currentMonth && this.date.getFullYear() === this.currentYear);
      const isToday = (new Date().getDate() === i && new Date().getMonth() === new Date().getMonth() && new Date().getFullYear() === new Date().getFullYear());
      
      let classes = "p-1.5 text-center text-[12px] font-bold rounded-[8px] cursor-pointer transition-all duration-200 flex items-center justify-center w-8 h-8 mx-auto ";
      if (isSelected) {
        classes += "bg-[#A855F7] text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] scale-110";
      } else if (isToday) {
        classes += "text-[#A855F7] border border-[#A855F7]/30 hover:bg-[#1A1A24]";
      } else {
        classes += "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1A1A24]";
      }
      
      grid.innerHTML += \`<div><div onclick="window.ScheduleModal.selectDate(\${i}, event)" class="\${classes}">\${i}</div></div>\`;
    }
    
    const remaining = 42 - (startDay + daysInMonth);
    for (let i = 1; i <= remaining && i <= 14; i++) {
      grid.innerHTML += \`<div class="p-1.5 text-center text-[11px] font-medium text-[#3A3A3A] flex items-center justify-center w-8 h-8 mx-auto">\${i}</div>\`;
    }
  },

  selectHour(hr12, e) {
    e.stopPropagation();
    let [h, m] = this.timeStr.split(':').map(Number);
    let ampm = h >= 12 ? 'PM' : 'AM';
    let newH = ampm === 'PM' ? (hr12 === 12 ? 12 : hr12 + 12) : (hr12 === 12 ? 0 : hr12);
    this.timeStr = \`\${String(newH).padStart(2, '0')}:\${String(m).padStart(2, '0')}\`;
    this.updateDisplay();
  },

  selectMinute(m, e) {
    e.stopPropagation();
    let [h, _oldM] = this.timeStr.split(':').map(Number);
    this.timeStr = \`\${String(h).padStart(2, '0')}:\${String(m).padStart(2, '0')}\`;
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
    this.timeStr = \`\${String(h).padStart(2, '0')}:\${String(m).padStart(2, '0')}\`;
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
      hrHtml += \`<div onclick="window.ScheduleModal.selectHour(\${i}, event)" class="py-2 cursor-pointer rounded-[10px] transition-all duration-200 \${isSel ? 'bg-[#A855F7] text-white text-[16px] font-bold shadow-[0_0_12px_rgba(168,85,247,0.4)] scale-110' : 'text-[#6B7280] text-[13px] font-semibold hover:text-[#FAFAFA] hover:bg-[#1A1A24]'} snap-center shrink-0">\${pad}</div>\`;
    }
    hrHtml += '<div class="h-[60px] shrink-0"></div>';
    hrHtml += '</div>';

    let minHtml = '<div class="flex-1 h-[160px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-y snap-mandatory flex flex-col text-center px-1 space-y-1 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-[1px] before:bg-[#2A2A35] pl-2 ml-1">';
    minHtml += '<div class="h-[60px] shrink-0"></div>';
    for (let i = 0; i < 60; i+=15) {
      const isSel = i === m || (Math.abs(i - m) < 15 && i <= m && (i+15 > m));
      const pad = String(i).padStart(2, '0');
      minHtml += \`<div onclick="window.ScheduleModal.selectMinute(\${i}, event)" class="py-2 cursor-pointer rounded-[10px] transition-all duration-200 \${isSel ? 'bg-[#A855F7] text-white text-[16px] font-bold shadow-[0_0_12px_rgba(168,85,247,0.4)] scale-110' : 'text-[#6B7280] text-[13px] font-semibold hover:text-[#FAFAFA] hover:bg-[#1A1A24]'} snap-center shrink-0">\${pad}</div>\`;
    }
    minHtml += '<div class="h-[60px] shrink-0"></div>';
    minHtml += '</div>';

    let ampmHtml = '<div class="flex-1 h-[160px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col text-center justify-center gap-3 px-1 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-[1px] before:bg-[#2A2A35] pl-2 ml-1">';
    ampmHtml += \`<div onclick="window.ScheduleModal.selectAmPm('AM', event)" class="py-2.5 cursor-pointer rounded-[10px] transition-all duration-200 \${ampm === 'AM' ? 'bg-[#A855F7] text-white text-[14px] font-bold shadow-[0_0_12px_rgba(168,85,247,0.4)] scale-105' : 'text-[#6B7280] text-[13px] font-semibold hover:text-[#FAFAFA] hover:bg-[#1A1A24]'} shrink-0">AM</div>\`;
    ampmHtml += \`<div onclick="window.ScheduleModal.selectAmPm('PM', event)" class="py-2.5 cursor-pointer rounded-[10px] transition-all duration-200 \${ampm === 'PM' ? 'bg-[#A855F7] text-white text-[14px] font-bold shadow-[0_0_12px_rgba(168,85,247,0.4)] scale-105' : 'text-[#6B7280] text-[13px] font-semibold hover:text-[#FAFAFA] hover:bg-[#1A1A24]'} shrink-0">PM</div>\`;
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
      
      this.close();
      if (window.SF_COMPONENTS && window.SF_COMPONENTS.showToast) {
        window.SF_COMPONENTS.showToast('Milestone scheduled successfully!', 'success');
      }
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
`;

content = content.replace(oldModalRegex, newModal);

fs.writeFileSync('update-components-v2.js', `
const fs = require('fs');
fs.writeFileSync('frontend/src/js/components.js', \`${content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`);
`, 'utf8');

console.log('Update script ready');
