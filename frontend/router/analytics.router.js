/**
 * StudyFlow AI – Analytics Router Module
 * Handles analytics period filtering and URL parameter state syncing.
 */
(function () {
  const AnalyticsRouter = {
    init() {
      console.log('[SF_ROUTER] Initializing Analytics route');
      
      const params = new URLSearchParams(window.location.search);
      const period = params.get('period');
      
      if (period && window.SF_STORE) {
        setTimeout(() => {
          window.SF_STORE.dispatch('analytics/SET_PERIOD', { period });
        }, 100);
      }
    },

    setPeriodRoute(period) {
      if (!period) return;
      const url = new URL(window.location.href);
      url.searchParams.set('period', period);
      window.history.replaceState({ period }, '', url.toString());
      if (window.SF_STORE) {
        window.SF_STORE.dispatch('analytics/SET_PERIOD', { period });
      }
    }
  };

  if (window.SF_ROUTER) {
    window.SF_ROUTER.register('analytics', AnalyticsRouter);
  } else {
    window._sfPendingRoutes = window._sfPendingRoutes || {};
    window._sfPendingRoutes['analytics'] = AnalyticsRouter;
  }
})();
