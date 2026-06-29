/**
 * StudyFlow AI – Focus Router Module
 * Handles focus timer session parameters and navigation hooks.
 */
(function () {
  const FocusRouter = {
    init() {
      console.log('[SF_ROUTER] Initializing Focus route');
      
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      if (mode && typeof window.setTimerMode === 'function') {
        setTimeout(() => {
          if (mode === 'focus') window.setTimerMode(1500);
          else if (mode === 'short') window.setTimerMode(300);
          else if (mode === 'long') window.setTimerMode(900);
        }, 100);
      }
    },

    setModeRoute(modeName, seconds) {
      if (typeof window.setTimerMode === 'function') {
        window.setTimerMode(seconds);
      }
      const url = new URL(window.location.href);
      url.searchParams.set('mode', modeName);
      window.history.replaceState({ mode: modeName }, '', url.toString());
    }
  };

  if (window.SF_ROUTER) {
    window.SF_ROUTER.register('focus', FocusRouter);
  } else {
    window._sfPendingRoutes = window._sfPendingRoutes || {};
    window._sfPendingRoutes['focus'] = FocusRouter;
  }
})();
