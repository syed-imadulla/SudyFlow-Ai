/**
 * StudyFlow AI – Planner Domain Mock Data
 * Isolated schedule, calendar, and deadline datasets.
 */

export const MOCK_DAILY_BLOCKS = [
  { id: 'blk-1', startTime: '2026-07-20T09:00:00.000Z', endTime: '2026-07-20T11:00:00.000Z', dateStr: '2026-07-20', startTimeDisplay: '09:00 AM', endTimeDisplay: '11:00 AM', title: 'Deep Work Session',     subject: 'DBMS Project',    category: 'focus',  color: '#A855F7' },
  { id: 'blk-2', startTime: '2026-07-20T11:30:00.000Z', endTime: '2026-07-20T12:00:00.000Z', dateStr: '2026-07-20', startTimeDisplay: '11:30 AM', endTimeDisplay: '12:00 PM', title: 'Review Flashcards',      subject: 'OS Lab',           category: 'review', color: '#FACC15' },
  { id: 'blk-3', startTime: '2026-07-20T14:00:00.000Z', endTime: '2026-07-20T16:00:00.000Z', dateStr: '2026-07-20', startTimeDisplay: '02:00 PM', endTimeDisplay: '04:00 PM', title: 'Algorithm Practice',     subject: 'DSA',              category: 'deep',   color: '#22C55E' },
  { id: 'blk-4', startTime: '2026-07-20T17:00:00.000Z', endTime: '2026-07-20T18:00:00.000Z', dateStr: '2026-07-20', startTimeDisplay: '05:00 PM', endTimeDisplay: '06:00 PM', title: 'Lecture Notes Review',   subject: 'Computer Networks', category: 'review', color: '#38BDF8' }
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
