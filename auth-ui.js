// ════════════════════════════════════════════════════════════════
//  YAS Beyond Education — Auth UI (modal, nav state, CTA hookup)
//  Loaded after db.js on every page: <script src="assets/js/auth-ui.js">
// ════════════════════════════════════════════════════════════════

(function () {
  const MODAL_HTML = `
  <div class="auth-overlay" id="auth-overlay">
    <div class="auth-modal">
      <button class="auth-close" id="auth-close" aria-label="Close">
        <i class="fas fa-times"></i>
      </button>

      <div id="auth-view-signin">
        <div class="auth-eyebrow">Welcome back</div>
        <h2>Sign in to your <em>account</em></h2>
        <p class="auth-sub">Track your orders and pick up right where you left off.</p>
        <form id="signin-form">
          <div class="auth-form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="name@example.com" required>
          </div>
          <div class="auth-form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="••••••••" required minlength="6">
          </div>
          <button type="submit" class="auth-submit" id="signin-submit">Sign In</button>
          <p class="auth-status" id="signin-status"></p>
        </form>
        <div class="auth-switch">
          New here? <button id="go-signup">Create an account</button>
        </div>
      </div>

      <div id="auth-view-signup" style="display:none;">
        <div class="auth-eyebrow">Get started</div>
        <h2>Create your <em>account</em></h2>
        <p class="auth-sub">One account to track every service you order from YAS.</p>
        <form id="signup-form">
          <div class="auth-form-group">
            <label>Full Name</label>
            <input type="text" name="fullName" placeholder="Your name" required>
          </div>
          <div class="auth-form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="name@example.com" required>
          </div>
          <div class="auth-form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="At least 6 characters" required minlength="6">
          </div>
          <button type="submit" class="auth-submit" id="signup-submit">Create Account</button>
          <p class="auth-status" id="signup-status"></p>
        </form>
        <div class="auth-switch">
          Already have an account? <button id="go-signin">Sign in</button>
        </div>
      </div>

      <div class="auth-divider-note">
        By continuing you agree this account is used solely to track your
        YAS Beyond Education orders and consultations.
      </div>
    </div>
  </div>`;

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    document.body.insertAdjacentHTML('beforeend', MODAL_HTML);
    wireModalControls();
    wireForms();
    await syncNavState();
    wirePackageCtas();

    YASAuth.onAuthChange(async (session) => {
      await syncNavState();
      await resolvePendingIntentIfAny(session);
    });

    // If we just arrived after a redirect-based sign-in, resolve any
    // queued package selection immediately.
    const session = await YASAuth.getSession();
    if (session) await resolvePendingIntentIfAny(session);
  }

  // ── Modal open/close ──────────────────────────────
  function openAuthModal(view) {
    document.getElementById('auth-overlay').classList.add('open');
    showView(view || 'signin');
  }
  function closeAuthModal() {
    document.getElementById('auth-overlay').classList.remove('open');
  }
  function showView(view) {
    document.getElementById('auth-view-signin').style.display = view === 'signin' ? 'block' : 'none';
    document.getElementById('auth-view-signup').style.display = view === 'signup' ? 'block' : 'none';
  }
  window.openAuthModal = openAuthModal; // exposed for nav buttons

  function wireModalControls() {
    document.getElementById('auth-close').addEventListener('click', closeAuthModal);
    document.getElementById('auth-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'auth-overlay') closeAuthModal();
    });
    document.getElementById('go-signup').addEventListener('click', () => showView('signup'));
    document.getElementById('go-signin').addEventListener('click', () => showView('signin'));
  }

  // ── Form handling ─────────────────────────────────
  function wireForms() {
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');

    signinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('signin-submit');
      const status = document.getElementById('signin-status');
      const fd = new FormData(signinForm);
      setLoading(btn, true, 'Signing In...');
      const { error } = await YASAuth.signIn(fd.get('email'), fd.get('password'));
      setLoading(btn, false, 'Sign In');
      if (error) {
        showStatus(status, error.message || 'Could not sign in. Check your details and try again.', 'error');
        return;
      }
      showStatus(status, 'Welcome back!', 'success');
      setTimeout(async () => {
        closeAuthModal();
        await afterAuthSuccess();
      }, 500);
    });

    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('signup-submit');
      const status = document.getElementById('signup-status');
      const fd = new FormData(signupForm);
      setLoading(btn, true, 'Creating Account...');
      const { data, error } = await YASAuth.signUp(fd.get('email'), fd.get('password'), fd.get('fullName'));
      setLoading(btn, false, 'Create Account');
      if (error) {
        showStatus(status, error.message || 'Could not create your account. Please try again.', 'error');
        return;
      }
      if (data.session) {
        showStatus(status, 'Account created!', 'success');
        setTimeout(async () => {
          closeAuthModal();
          await afterAuthSuccess();
        }, 500);
      } else {
        showStatus(status, 'Check your email to confirm your account, then sign in.', 'success');
        setTimeout(() => showView('signin'), 2200);
      }
    });
  }

  function setLoading(btn, loading, label) {
    btn.disabled = loading;
    btn.textContent = label;
  }
  function showStatus(el, msg, type) {
    el.textContent = msg;
    el.className = 'auth-status ' + type;
  }

  // After a successful sign-in/up: resolve a pending package click,
  // otherwise just refresh the nav and stay on the same page.
  async function afterAuthSuccess() {
    const session = await YASAuth.getSession();
    const intent = YASAuth.getPendingIntent();
    if (session && intent) {
      await resolvePendingIntentIfAny(session);
    }
    await syncNavState();
  }

  // ── Nav state (logged out vs logged in) ───────────
  async function syncNavState() {
    const slot = document.getElementById('nav-account-slot');
    if (!slot) return;
    const session = await YASAuth.getSession();
    if (session) {
      const initials = (session.user.user_metadata?.full_name || session.user.email || '?')
        .trim().charAt(0).toUpperCase();
      slot.innerHTML = `
        <a href="dashboard.html" class="nav-account-avatar" title="My Dashboard">${initials}</a>
      `;
    } else {
      slot.innerHTML = `<button class="nav-account-btn" onclick="openAuthModal('signin')">Sign In</button>`;
    }
  }

  // ── Pricing CTA hookup ─────────────────────────────
  // Clicking a package CTA while logged out opens sign-in and queues
  // the selection; clicking while logged in saves it immediately and
  // sends the buyer straight to their dashboard — no lost steps.
  function wirePackageCtas() {
    document.querySelectorAll('[data-package-id]').forEach((el) => {
      el.addEventListener('click', async (e) => {
        e.preventDefault();
        const packageId = el.getAttribute('data-package-id');
        const session = await YASAuth.getSession();
        if (session) {
          await YASData.saveSelection(session.user.id, packageId);
          window.location.href = 'dashboard.html';
        } else {
          YASAuth.setPendingIntent({ type: 'package_selection', packageId, redirectTo: 'dashboard.html' });
          openAuthModal('signup');
        }
      });
    });
  }
})();
