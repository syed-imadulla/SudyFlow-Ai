/**
 * StudyFlow AI – Focus Domain Mock Data
 * Isolated active sprint task, AI suggestion, and weekly distraction datasets.
 */

export const MOCK_SPRINT_TASK = {
  id: 'sub-103',
  title: 'Create ER Diagram',
  goalTitle: 'DBMS Mini Project',
  milestone: 'Milestone 2',
  urgency: 'URGENT',
  checklist: [
    { id: 'chk-1', text: 'Identify Entities (Student, Course, Dept)',  completed: true  },
    { id: 'chk-2', text: 'Map 1:N and M:N relationship cardinality',   completed: false },
    { id: 'chk-3', text: 'Define Primary & Foreign Keys',               completed: false }
  ]
};

export const MOCK_AI_SUGGESTION = {
  message: 'This is your most productive time. You usually get 28% more done in the evening.'
};

export const MOCK_WEEKLY_DISTRACTION = {
  days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  values: [30, 60, 40, 20, 40, 30, 50],
  activeDay: 1
};
