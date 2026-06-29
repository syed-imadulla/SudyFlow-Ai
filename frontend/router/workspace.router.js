/**
 * StudyFlow AI – Workspace Router Module
 * Handles workspace tab navigation (#goals, #tasks, #timeblocks) and query parameters.
 */
(function () {
  const WorkspaceRouter = {
    init() {
      console.log('[SF_ROUTER] Initializing Workspace route');
      
      this.syncTabFromHash();
      window.addEventListener('hashchange', () => this.syncTabFromHash());
    },

    syncTabFromHash() {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;

      const tabMap = {
        'goals': 0,
        'tasks': 1,
        'timeblocks': 2
      };

      if (tabMap[hash] !== undefined) {
        const tabs = document.querySelectorAll('.ws-tab');
        const targetTab = tabs[tabMap[hash]];
        if (targetTab && typeof targetTab.click === 'function') {
          setTimeout(() => targetTab.click(), 50);
        }
      }
    },

    setTabHash(tabName) {
      if (!tabName) return;
      window.history.replaceState(null, '', `#${tabName}`);
    }
  };

  if (window.SF_ROUTER) {
    window.SF_ROUTER.register('workspace', WorkspaceRouter);
  } else {
    window._sfPendingRoutes = window._sfPendingRoutes || {};
    window._sfPendingRoutes['workspace'] = WorkspaceRouter;
  }
})();
