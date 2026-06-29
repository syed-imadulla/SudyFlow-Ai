/**
 * StudyFlow AI – Dashboard Router Module
 * Handles dashboard-specific routing, parameters, and navigation events.
 */
(function () {
  const DashboardRouter = {
    init() {
      console.log('[SF_ROUTER] Initializing Dashboard route');
      
      // Handle optional URL hash navigation (e.g. #tasks, #goals)
      this.handleHashChange();
      window.addEventListener('hashchange', () => this.handleHashChange());
    },

    handleHashChange() {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;
      
      if (hash === 'tasks') {
        const el = document.getElementById('dashTasksList');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (hash === 'goals') {
        const el = document.getElementById('dashMainGoalsList');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },

    navigateToIdeaLab(goalId) {
      window.location.href = `idealab.html${goalId ? '?goalId=' + encodeURIComponent(goalId) : ''}`;
    }
  };

  if (window.SF_ROUTER) {
    window.SF_ROUTER.register('dashboard', DashboardRouter);
    window.SF_ROUTER.register('index', DashboardRouter);
  } else {
    window._sfPendingRoutes = window._sfPendingRoutes || {};
    window._sfPendingRoutes['dashboard'] = DashboardRouter;
    window._sfPendingRoutes['index'] = DashboardRouter;
  }
})();
