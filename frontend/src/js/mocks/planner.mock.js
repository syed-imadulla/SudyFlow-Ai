/**
 * StudyFlow AI – Planner Domain Mock Data
 * Isolated schedule, calendar, and deadline datasets.
 */

// Helper: build a local-date ISO string offset from today by N days (midnight UTC+5:30 approximated via local midnight)
function _mockDateISO(dayOffset, hours, minutes) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}
function _mockDateStr(dayOffset) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function _fmt12(h, m) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`;
}

export const MOCK_DAILY_BLOCKS = [
  {
    id: 'blk-1',
    _id: 'blk-1',
    user: 'mock-user-123',
    title: 'Deep Work Session',
    description: 'DBMS Project',
    startTime: _mockDateISO(0, 9, 0),
    endTime: _mockDateISO(0, 11, 0),
    startTimeDisplay: _fmt12(9, 0),
    endTimeDisplay: _fmt12(11, 0),
    dateStr: _mockDateStr(0),
    type: 'STUDY',
    color: '#A855F7',
    completed: false,
    goalId: 'goal-1',
    milestoneId: 'sub-101',
    duration: 120,
    status: 'planned',
    isRecurring: false,
    seriesId: null,
    originalSeriesId: null,
    recurrence: { frequency: null, repeatDays: [], daysOfWeek: [], interval: 1, endType: 'NEVER', repeatUntil: null, untilDate: null, maxOccurrences: null },
    isException: false,
    exDate: null,
    isCancelled: false,
    createdAt: '2026-07-15T09:00:00.000Z',
    updatedAt: '2026-07-15T09:00:00.000Z'
  },
  {
    id: 'blk-2',
    _id: 'blk-2',
    user: 'mock-user-123',
    title: 'Review Flashcards',
    description: 'OS Lab',
    startTime: _mockDateISO(0, 11, 30),
    endTime: _mockDateISO(0, 12, 0),
    startTimeDisplay: _fmt12(11, 30),
    endTimeDisplay: _fmt12(12, 0),
    dateStr: _mockDateStr(0),
    type: 'CLASS',
    color: '#FACC15',
    completed: false,
    goalId: 'goal-2',
    milestoneId: 'sub-201',
    duration: 30,
    status: 'planned',
    isRecurring: false,
    seriesId: null,
    originalSeriesId: null,
    recurrence: { frequency: null, repeatDays: [], daysOfWeek: [], interval: 1, endType: 'NEVER', repeatUntil: null, untilDate: null, maxOccurrences: null },
    isException: false,
    exDate: null,
    isCancelled: false,
    createdAt: '2026-07-15T09:00:00.000Z',
    updatedAt: '2026-07-15T09:00:00.000Z'
  },
  {
    id: 'blk-3',
    _id: 'blk-3',
    user: 'mock-user-123',
    title: 'Algorithm Practice',
    description: 'DSA',
    startTime: _mockDateISO(1, 14, 0),
    endTime: _mockDateISO(1, 16, 0),
    startTimeDisplay: _fmt12(14, 0),
    endTimeDisplay: _fmt12(16, 0),
    dateStr: _mockDateStr(1),
    type: 'STUDY',
    color: '#22C55E',
    completed: false,
    goalId: 'goal-1',
    milestoneId: 'sub-103',
    duration: 120,
    status: 'planned',
    isRecurring: false,
    seriesId: null,
    originalSeriesId: null,
    recurrence: { frequency: null, repeatDays: [], daysOfWeek: [], interval: 1, endType: 'NEVER', repeatUntil: null, untilDate: null, maxOccurrences: null },
    isException: false,
    exDate: null,
    isCancelled: false,
    createdAt: '2026-07-15T09:00:00.000Z',
    updatedAt: '2026-07-15T09:00:00.000Z'
  },
  {
    id: 'blk-4',
    _id: 'blk-4',
    user: 'mock-user-123',
    title: 'Lecture Notes Review',
    description: 'Computer Networks',
    startTime: _mockDateISO(2, 17, 0),
    endTime: _mockDateISO(2, 18, 0),
    startTimeDisplay: _fmt12(17, 0),
    endTimeDisplay: _fmt12(18, 0),
    dateStr: _mockDateStr(2),
    type: 'STUDY',
    color: '#38BDF8',
    completed: false,
    goalId: 'goal-2',
    milestoneId: 'sub-202',
    duration: 60,
    status: 'planned',
    isRecurring: false,
    seriesId: null,
    originalSeriesId: null,
    recurrence: { frequency: null, repeatDays: [], daysOfWeek: [], interval: 1, endType: 'NEVER', repeatUntil: null, untilDate: null, maxOccurrences: null },
    isException: false,
    exDate: null,
    isCancelled: false,
    createdAt: '2026-07-15T09:00:00.000Z',
    updatedAt: '2026-07-15T09:00:00.000Z'
  }
];

export const MOCK_UPCOMING_DEADLINES = [
  { id: 'dl-1', title: 'DBMS Mini Project',         dueDisplay: 'Tomorrow',  priority: 'URGENT',   goalId: 'goal-1' },
  { id: 'dl-2', title: 'OS Lab Assessment',          dueDisplay: 'In 3 days', priority: 'HIGH',     goalId: 'goal-2' },
  { id: 'dl-3', title: 'DSA Assignment Submission',  dueDisplay: 'In 5 days', priority: 'MEDIUM',   goalId: null     }
];

export const MOCK_WEEKLY_STATS = {
  weekLabel: 'This Week',
  focusHours: '28.4h',
  tasksPlanned: { done: 34, total: 37 },
  subjectCount: 7
};

export const MOCK_MONTHLY_CALENDAR = {
  month: 'June 2026',
  weeks: [
    { date: '2026-06-01', label: '1',  hasTask: false, isMilestone: false, isToday: false },
    { date: '2026-06-02', label: '2',  hasTask: true,  isMilestone: false, isToday: false },
    { date: '2026-06-03', label: '3',  hasTask: false, isMilestone: false, isToday: false },
    { date: '2026-06-04', label: '4',  hasTask: false, isMilestone: false, isToday: false },
    { date: '2026-06-05', label: '5',  hasTask: true,  isMilestone: true,  isToday: false, milestoneLabel: 'DBMS M1' },
    { date: '2026-06-06', label: '6',  hasTask: false, isMilestone: false, isToday: false },
    { date: '2026-06-07', label: '7',  hasTask: false, isMilestone: false, isToday: false },
    { date: '2026-06-08', label: '8',  hasTask: true,  isMilestone: false, isToday: false },
    { date: '2026-06-09', label: '9',  hasTask: true,  isMilestone: false, isToday: false },
    { date: '2026-06-10', label: '10', hasTask: false, isMilestone: false, isToday: false },
    { date: '2026-06-11', label: '11', hasTask: false, isMilestone: false, isToday: false },
    { date: '2026-06-12', label: '12', hasTask: true,  isMilestone: true,  isToday: false, milestoneLabel: 'OS Lab' },
    { date: '2026-06-13', label: '13', hasTask: false, isMilestone: false, isToday: false },
    { date: '2026-06-14', label: '14', hasTask: false, isMilestone: false, isToday: false },
    { date: '2026-06-15', label: '15', hasTask: true,  isMilestone: false, isToday: false },
    { date: '2026-06-16', label: '16', hasTask: true,  isMilestone: false, isToday: false },
    { date: '2026-06-17', label: '17', hasTask: false, isMilestone: false, isToday: false },
    { date: '2026-06-18', label: '18', hasTask: false, isMilestone: false, isToday: false },
    { date: '2026-06-19', label: '19', hasTask: true,  isMilestone: true,  isToday: false, milestoneLabel: 'DSA Test' },
    { date: '2026-06-20', label: '20', hasTask: false, isMilestone: false, isToday: false },
    { date: '2026-06-21', label: '21', hasTask: false, isMilestone: false, isToday: false },
    { date: '2026-06-22', label: '22', hasTask: true,  isMilestone: false, isToday: false },
    { date: '2026-06-23', label: '23', hasTask: true,  isMilestone: false, isToday: false },
    { date: '2026-06-24', label: '24', hasTask: false, isMilestone: false, isToday: false },
    { date: '2026-06-25', label: '25', hasTask: false, isMilestone: false, isToday: false },
    { date: '2026-06-26', label: '26', hasTask: false, isMilestone: false, isToday: false },
    { date: '2026-06-27', label: '27', hasTask: true,  isMilestone: false, isToday: false },
    { date: '2026-06-28', label: '28', hasTask: true,  isMilestone: false, isToday: true  },
    { date: '2026-06-29', label: '29', hasTask: false, isMilestone: false, isToday: false },
    { date: '2026-06-30', label: '30', hasTask: false, isMilestone: false, isToday: false }
  ]
};
