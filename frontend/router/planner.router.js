/**
 * StudyFlow AI – Planner Router Module
 * Handles planner view routing (daily, weekly, monthly) and syncs URL query parameters.
 */
(function () {
  const PlannerRouter = {
    init() {
      console.log('[SF_ROUTER] Initializing Planner route');
      
      // Parse query parameter or hash for initial view
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') || window.location.hash.replace('#', '');
      
      if (viewParam && ['daily', 'weekly', 'monthly'].includes(viewParam)) {
        setTimeout(() => {
          if (typeof window.switchPlannerView === 'function') {
            window.switchPlannerView(viewParam);
          }
        }, 50);
      }

      // Listen for browser popstate / hashchange
      window.addEventListener('popstate', () => this.syncViewFromUrl());
      window.addEventListener('hashchange', () => this.syncViewFromUrl());
    },

    syncViewFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view') || window.location.hash.replace('#', '') || 'daily';
      if (['daily', 'weekly', 'monthly'].includes(view) && typeof window.switchPlannerView === 'function') {
        window.switchPlannerView(view);
      }
    },

    setViewRoute(view) {
      if (!['daily', 'weekly', 'monthly'].includes(view)) return;
      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      window.history.pushState({ view }, '', url.toString());
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
