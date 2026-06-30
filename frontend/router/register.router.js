/**
 * StudyFlow AI – Register Router Module
 * Handles registration form interception and authentication dispatch.
 */
(function () {
  const RegisterRouter = {
    init() {
      console.log('[SF_ROUTER] Initializing Register route');
      const form = document.querySelector('form');
      if (!form) return;

      form.removeAttribute('onsubmit');
      form.onsubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const nameInput = form.querySelector('input[type="text"]');
        const emailInput = form.querySelector('input[type="email"]');
        const passInput = form.querySelector('input[type="password"]');
        const submitBtn = form.querySelector('button[type="submit"]');
        if (!nameInput || !emailInput || !passInput || !submitBtn) return;

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passInput.value;

        if (!name || !email || !password) {
          if (window.SF_COMPONENTS && typeof window.SF_COMPONENTS.showToast === 'function') {
            window.SF_COMPONENTS.showToast('Please fill in all required fields.', 'error');
          }
          return;
        }

        const origHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Creating Workspace... ✨';

        try {
          if (!window.authService) {
            throw new Error('Authentication service unavailable.');
          }
          const res = await window.authService.register(name, email, password);
          if (res && res.user) {
            window.location.href = 'dashboard.html';
          }
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origHtml;
          if (window.SF_COMPONENTS && typeof window.SF_COMPONENTS.showToast === 'function') {
            window.SF_COMPONENTS.showToast(err.message || 'Registration failed', 'error');
          } else {
            alert(err.message || 'Registration failed');
          }
        }
      };
    }
  };

  if (window.SF_ROUTER) {
    window.SF_ROUTER.register('register', RegisterRouter);
  } else {
    window._sfPendingRoutes = window._sfPendingRoutes || {};
    window._sfPendingRoutes['register'] = RegisterRouter;
  }
})();
