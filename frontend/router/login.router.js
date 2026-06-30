/**
 * StudyFlow AI – Login Router Module
 * Handles login form interception and authentication dispatch.
 */
(function () {
  const LoginRouter = {
    init() {
      console.log('[SF_ROUTER] Initializing Login route');
      const form = document.querySelector('form');
      if (!form) return;

      form.removeAttribute('onsubmit');
      form.onsubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const emailInput = form.querySelector('input[type="email"]');
        const passInput = form.querySelector('input[type="password"]');
        const submitBtn = form.querySelector('button[type="submit"]');
        if (!emailInput || !passInput || !submitBtn) return;

        const email = emailInput.value.trim();
        const password = passInput.value;

        if (!email || !password) {
          if (window.SF_COMPONENTS && typeof window.SF_COMPONENTS.showToast === 'function') {
            window.SF_COMPONENTS.showToast('Please enter both email and password.', 'error');
          }
          return;
        }

        const origHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Signing in... ✨';

        try {
          if (!window.authService) {
            throw new Error('Authentication service unavailable.');
          }
          const res = await window.authService.login(email, password);
          if (res && res.user) {
            window.location.href = 'dashboard.html';
          }
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origHtml;
          if (window.SF_COMPONENTS && typeof window.SF_COMPONENTS.showToast === 'function') {
            window.SF_COMPONENTS.showToast(err.message || 'Invalid email or password', 'error');
          } else {
            alert(err.message || 'Invalid email or password');
          }
        }
      };
    }
  };

  if (window.SF_ROUTER) {
    window.SF_ROUTER.register('login', LoginRouter);
  } else {
    window._sfPendingRoutes = window._sfPendingRoutes || {};
    window._sfPendingRoutes['login'] = LoginRouter;
  }
})();
