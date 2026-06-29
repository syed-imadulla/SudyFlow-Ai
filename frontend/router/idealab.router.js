/**
 * StudyFlow AI – IdeaLab Router Module
 * Handles IdeaLab step navigation and URL parameters (?goalId=...).
 */
(function () {
  const IdeaLabRouter = {
    init() {
      console.log('[SF_ROUTER] Initializing IdeaLab route');
      
      const params = new URLSearchParams(window.location.search);
      const step = parseInt(params.get('step'), 10);
      if (step && step >= 1 && step <= 4 && typeof window.goToStep === 'function') {
        setTimeout(() => window.goToStep(step), 100);
      }
    },

    navigateToStep(stepNumber) {
      if (typeof window.goToStep === 'function') {
        window.goToStep(stepNumber);
      }
      const url = new URL(window.location.href);
      url.searchParams.set('step', stepNumber);
      window.history.replaceState({ step: stepNumber }, '', url.toString());
    }
  };

  if (window.SF_ROUTER) {
    window.SF_ROUTER.register('idealab', IdeaLabRouter);
  } else {
    window._sfPendingRoutes = window._sfPendingRoutes || {};
    window._sfPendingRoutes['idealab'] = IdeaLabRouter;
  }
})();
