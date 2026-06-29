import { Goal } from '../models/Goal.js';
import { Task } from '../models/Task.js';
import { FocusSession } from '../models/FocusSession.js';
import { TASK_STATUS, FOCUS_SESSION_STATUS, GOAL_STATUS } from '../constants/index.js';

export class AnalyticsService {
  /**
   * Calculate master analytics summary dynamically from collections (No persistence)
   */
  static async getSummary(userId) {
    const goals = await Goal.find({ user: userId });
    const tasks = await Task.find({ user: userId });
    const sessions = await FocusSession.find({ user: userId, status: FOCUS_SESSION_STATUS.COMPLETED }).sort('-startTime');

    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === GOAL_STATUS.COMPLETED || g.status === 'COMPLETED').length;

    let totalSubtasks = 0;
    let completedSubtasks = 0;
    goals.forEach(g => {
      totalSubtasks += g.subtasks?.length || 0;
      completedSubtasks += g.subtasks?.filter(s => s.completed).length || 0;
    });

    const totalTasks = tasks.length + totalSubtasks;
    const completedTasks = tasks.filter(t => t.status === TASK_STATUS.COMPLETED || t.status === 'COMPLETED').length + completedSubtasks;

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const focusHours = parseFloat((totalMinutes / 60).toFixed(1)) || 0;

    // Calculate daily streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const sessionDates = [...new Set(sessions.map(s => new Date(s.startTime).toISOString().split('T')[0]))].sort().reverse();

    if (sessionDates.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (sessionDates[0] === todayStr || sessionDates[0] === yesterdayStr) {
        currentStreak = 1;
        let lastDate = new Date(sessionDates[0]);
        for (let i = 1; i < sessionDates.length; i++) {
          const currDate = new Date(sessionDates[i]);
          const diffDays = Math.round((lastDate - currDate) / 86400000);
          if (diffDays === 1) {
            currentStreak++;
            lastDate = currDate;
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      if (sessionDates.length > 0) {
        tempStreak = 1;
        longestStreak = 1;
        for (let i = 0; i < sessionDates.length - 1; i++) {
          const d1 = new Date(sessionDates[i]);
          const d2 = new Date(sessionDates[i + 1]);
          if (Math.round((d1 - d2) / 86400000) === 1) {
            tempStreak++;
            if (tempStreak > longestStreak) longestStreak = tempStreak;
          } else {
            tempStreak = 1;
          }
        }
      }
    }

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalGoals,
      completedGoals,
      totalTasks,
      completedTasks,
      focusHours,
      currentStreak,
      longestStreak,
      weeklySummary: {
        focusHours,
        tasksDone: completedTasks
      },
      monthlySummary: {
        goalsCompleted: completedGoals,
        focusHours
      },
      productivityMetrics: {
        completionRate: isNaN(completionRate) ? 0 : completionRate
      }
    };
  }

  /**
   * Get KPIs formatted for UI compatibility (/analytics/kpis)
   */
  static async getKPIs(userId, period = 'last7') {
    const summary = await this.getSummary(userId);
    const rate = summary.productivityMetrics.completionRate || 0;
    const goalPercent = Math.min(100, Math.round((summary.focusHours / 40) * 100));

    return {
      focusTime: {
        value: `${summary.focusHours}h`,
        change: '+10%',
        changeDirection: 'up',
        subtitle: `${summary.currentStreak} day streak`,
        goalPercent: isNaN(goalPercent) ? 0 : goalPercent,
        comparisonLabel: `vs ${period}`
      },
      taskCompletion: {
        value: `${rate}%`,
        change: '+5%',
        changeDirection: 'up',
        subtitle: `${summary.completedTasks} / ${summary.totalTasks} tasks finished`,
        rating: rate >= 80 ? 'Excellent' : rate >= 50 ? 'Good' : 'Building',
        comparisonLabel: `vs ${period}`
      },
      peakVelocity: {
        value: '10 AM – 1 PM',
        subtitle: 'Highest cognitive flow',
        avgHours: `${(summary.focusHours / 7).toFixed(1)}h avg`
      },
      distractionScore: {
        value: 'Low',
        change: '↓ 10% interruptions',
        changeDirection: 'down',
        subtitle: 'Focus discipline',
        ranking: 'Top 20%'
      }
    };
  }

  /**
   * Get Focus Chart data for UI compatibility (/analytics/focus)
   */
  static async getFocusChart(userId, period = 'last7') {
    const now = new Date();
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [0, 0, 0, 0, 0, 0, 0];

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sessions = await FocusSession.find({ user: userId, status: FOCUS_SESSION_STATUS.COMPLETED, startTime: { $gte: sevenDaysAgo } });

    sessions.forEach(s => {
      const dayIdx = new Date(s.startTime).getDay(); // 0=Sun, 1=Mon...
      const mappedIdx = dayIdx === 0 ? 6 : dayIdx - 1;
      data[mappedIdx] += parseFloat(((s.duration || 0) / 60).toFixed(1));
    });

    return {
      labels,
      datasets: [
        {
          label: 'Focus Hours',
          data,
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
  }

  /**
   * Get Velocity Chart data for UI compatibility (/analytics/velocity)
   */
  static async getVelocityChart(userId, period = 'last30') {
    return {
      labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
      datasets: [
        { label: 'Planned', data: [15, 20, 22, 25], backgroundColor: '#1F1F1F', borderRadius: 6 },
        { label: 'Completed', data: [12, 18, 20, 24], backgroundColor: '#A855F7', borderRadius: 6 }
      ]
    };
  }

  /**
   * Get Weekly Comparison data for UI compatibility (/analytics/weekly-comparison)
   */
  static async getWeeklyComparison(userId) {
    const focusChart = await this.getFocusChart(userId);
    const actualData = focusChart.datasets[0].data;
    const targetData = actualData.map(val => Math.max(2.0, Math.round(val + 1)));

    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        { label: 'Actual Hours', data: actualData, backgroundColor: '#A855F7', borderRadius: 4 },
        { label: 'Target Goal', data: targetData, backgroundColor: '#222222', borderColor: '#3E3E3E', borderWidth: 1, borderRadius: 4 }
      ]
    };
  }

  /**
   * Get Goal Allocation data for UI compatibility (/analytics/goal-allocation)
   */
  static async getGoalAllocation(userId) {
    const goals = await Goal.find({ user: userId }).limit(4);
    if (goals.length === 0) {
      return {
        labels: ['No Active Goals'],
        datasets: [{ data: [100], backgroundColor: ['#3E3E3E'], borderColor: '#0E0E0E', borderWidth: 3 }]
      };
    }

    const labels = goals.map(g => g.title);
    const data = goals.map(g => Math.max(10, g.subtasks?.length * 15 || 25));
    const colors = ['#A855F7', '#FACC15', '#22C55E', '#38BDF8', '#6B7280'];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: '#0E0E0E',
          borderWidth: 3
        }
      ]
    };
  }
}
