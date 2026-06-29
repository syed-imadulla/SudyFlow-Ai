/**
 * StudyFlow AI – Settings Router Module
 * Handles settings section navigation and anchor hash scrolling.
 */
(function () {
  const SettingsRouter = {
    init() {
      console.log('[SF_ROUTER] Initializing Settings route');
      
      this.scrollToHashSection();
      window.addEventListener('hashchange', () => this.scrollToHashSection());
    },

    scrollToHashSection() {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;
      
      const el = document.getElementById(hash) || document.querySelector(`[name="${hash}"]`);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    }
  };

  if (window.SF_ROUTER) {
    window.SF_ROUTER.register('settings', SettingsRouter);
  } else {
    window._sfPendingRoutes = window._sfPendingRoutes || {};
    window._sfPendingRoutes['settings'] = SettingsRouter;
  }
})();
