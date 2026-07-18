/**
 * StudyFlow AI – Planner Router Module
 * Handles planner view routing (daily, weekly, monthly) and syncs URL query parameters.
 */
(function () {
  const PlannerRouter = {
    init() {
      console.log('[SF_ROUTER] Initializing Planner route');
      
      // Parse query parameter or hash or localStorage for initial view
      const params = new URLSearchParams(window.location.search);
      let viewParam = params.get('view') || window.location.hash.replace('#', '');
      if (!viewParam || !['daily', 'weekly', 'monthly'].includes(viewParam)) {
        try { viewParam = typeof window._loadPlannerUIState === 'function' ? window._loadPlannerUIState().view : localStorage.getItem('sf_last_planner_view'); } catch(e) {}
      }
      if (!viewParam || !['daily', 'weekly', 'monthly'].includes(viewParam)) {
        viewParam = 'daily';
      }

      // Listen for browser popstate / hashchange
      window.addEventListener('popstate', () => this.syncViewFromUrl());
      window.addEventListener('hashchange', () => this.syncViewFromUrl());
    },

    syncViewFromUrl() {
      this.isSyncing = true;
      const params = new URLSearchParams(window.location.search);
      let view = params.get('view') || window.location.hash.replace('#', '');
      if (!view || !['daily', 'weekly', 'monthly'].includes(view)) {
        try { view = typeof window._loadPlannerUIState === 'function' ? window._loadPlannerUIState().view : localStorage.getItem('sf_last_planner_view'); } catch(e) {}
      }
      if (!view || !['daily', 'weekly', 'monthly'].includes(view)) view = 'daily';
      if (typeof window.switchPlannerView === 'function') {
        window.switchPlannerView(view);
      }
      this.isSyncing = false;
    },

    setViewRoute(view) {
      if (this.isSyncing) return;
      if (!['daily', 'weekly', 'monthly'].includes(view)) return;
      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      window.history.pushState({ view }, '', url.toString());
      if (typeof window._savePlannerUIState === 'function') {
        window._savePlannerUIState({ view });
      } else {
        try { localStorage.setItem('sf_last_planner_view', view); } catch(e) {}
      }
    }
  };

  // Intercept global switchPlannerView to update route history cleanly
  const origSwitch = window.switchPlannerView;
  window.switchPlannerView = function (view) {
    if (typeof origSwitch === 'function') origSwitch(view);
    PlannerRouter.setViewRoute(view);
  };

  if (window.SF_ROUTER) {
    window.SF_ROUTER.register('planner', PlannerRouter);
  } else {
    window._sfPendingRoutes = window._sfPendingRoutes || {};
    window._sfPendingRoutes['planner'] = PlannerRouter;
  }
})();
