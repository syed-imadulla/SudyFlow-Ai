/**
 * StudyFlow AI – Analytics Domain Mock Data
 * Isolated KPI metrics, chart arrays, and goal allocation datasets.
 */

export const MOCK_KPIS = {
  focusTime: {
    value: '28.4h',
    change: '+14%',
    changeDirection: 'up',
    subtitle: '56 Pomodoro blocks',
    goalPercent: 71,
    comparisonLabel: 'vs last 7 days'
  },
  taskCompletion: {
    value: '92%',
    change: '+5%',
    changeDirection: 'up',
    subtitle: '34 / 37 tasks finished',
    rating: 'Excellent',
    comparisonLabel: 'vs last 7 days'
  },
  peakVelocity: {
    value: '10 AM – 1 PM',
    subtitle: 'Highest cognitive flow',
    avgHours: '4.2h avg'
  },
  distractionScore: {
    value: 'Low',
    change: '↓ 12% interruptions',
    changeDirection: 'down',
    subtitle: 'Focus discipline',
    ranking: 'Top 15%'
  }
};

export const MOCK_FOCUS_CHART = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Focus Hours',
      data: [3.5, 4.2, 3.8, 5.1, 4.5, 5.5, 1.8],
      borderColor: '#A855F7',
      backgroundColor: 'rgba(168, 85, 247, 0.15)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#A855F7',
      pointRadius: 4
    }
  ]
};

export const MOCK_VELOCITY_CHART = {
  labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
  datasets: [
    { label: 'Planned',   data: [20, 25, 22, 30], backgroundColor: '#1F1F1F', borderRadius: 6 },
    { label: 'Completed', data: [18, 24, 22, 28], backgroundColor: '#A855F7', borderRadius: 6 }
  ]
};

export const MOCK_WEEKLY_COMPARISON = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    { label: 'Actual Hours', data: [3.8, 4.5, 4.0, 5.2, 4.8, 5.0, 1.1], backgroundColor: '#A855F7', borderRadius: 4 },
    { label: 'Target Goal',  data: [4.0, 4.0, 4.0, 5.0, 5.0, 5.0, 3.0], backgroundColor: '#222222', borderColor: '#3E3E3E', borderWidth: 1, borderRadius: 4 }
  ]
};

export const MOCK_GOAL_ALLOCATION = {
  labels: ['DBMS Project', 'OS Assignment', 'DSA Practice', 'CN Lab'],
  datasets: [
    {
      data: [45, 25, 20, 10],
      backgroundColor: ['#A855F7', '#FACC15', '#22C55E', '#6B7280'],
      borderColor: '#0E0E0E',
      borderWidth: 3
    }
  ]
};
