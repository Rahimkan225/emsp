/**
 * EMSP - Module d'authentification JWT
 * Partagé entre toutes les pages (publiques et dashboard)
 */

const API_BASE = window.EMSP_API_BASE || 'http://localhost:8000/api/';
const LOCAL_DASHBOARD_ORIGIN = window.EMSP_DASHBOARD_ORIGIN || 'http://127.0.0.1:5500';

function getAppUrl(path) {
  if (window.location.protocol === 'file:') {
    return `${LOCAL_DASHBOARD_ORIGIN}${path}`;
  }
  return new URL(path, window.location.origin).href;
}

function getDashboardUrl() {
  return window.EMSP_DASHBOARD_URL || getAppUrl('/dashboard/index.html');
}

function getLoginUrl() {
  return window.EMSP_LOGIN_URL || getAppUrl('/login.html');
}

function goToDashboard() {
  window.location.href = getDashboardUrl();
}

function goToLogin() {
  window.location.href = getLoginUrl();
}

// ─── Theme legacy dashboard blanc / jaune / vert ─────────────────────
const DASHBOARD_THEME_STORAGE_KEY = 'emsp_legacy_dashboard_theme';

const LEGACY_DASHBOARD_THEME_CSS = `
html[data-emsp-dashboard-theme] body {
  --emsp-green: #16a34a;
  --emsp-green-dark: #14532d;
  --emsp-yellow: #facc15;
  --emsp-cream: #fffbea;
  --emsp-soft: #f6faef;
  --emsp-border: #dbe8c7;
  --emsp-text: #12351f;
  --emsp-muted: #5e715f;
  background-image: radial-gradient(circle at 10% 0%, rgba(250, 204, 21, .22), transparent 32%),
    radial-gradient(circle at 96% 8%, rgba(34, 197, 94, .16), transparent 34%);
  background-color: var(--emsp-soft) !important;
  color: var(--emsp-text) !important;
}

html[data-emsp-dashboard-theme="light"] body .top-header .navbar {
  background: rgba(255, 255, 255, .92) !important;
  border-bottom: 1px solid var(--emsp-border);
  box-shadow: 0 14px 36px -30px rgba(20, 83, 45, .35) !important;
  backdrop-filter: blur(12px);
}

html[data-emsp-dashboard-theme="light"] body .sidebar-wrapper,
html[data-emsp-dashboard-theme="light"] body .sidebar-wrapper .sidebar-header,
html[data-emsp-dashboard-theme="light"] body .sidebar-wrapper .sidebar-nav {
  background: linear-gradient(180deg, #fffde7 0%, #fef9c3 45%, #ecfccb 100%) !important;
  border-color: var(--emsp-border) !important;
  color: var(--emsp-text) !important;
}

html[data-emsp-dashboard-theme="light"] body .sidebar-wrapper .sidebar-header h5,
html[data-emsp-dashboard-theme="light"] body .sidebar-wrapper .metismenu a,
html[data-emsp-dashboard-theme="light"] body .sidebar-wrapper .menu-label,
html[data-emsp-dashboard-theme="light"] body .top-header .navbar .btn-toggle a,
html[data-emsp-dashboard-theme="light"] body .top-header .navbar .nav-link,
html[data-emsp-dashboard-theme="light"] body h1,
html[data-emsp-dashboard-theme="light"] body h2,
html[data-emsp-dashboard-theme="light"] body h3,
html[data-emsp-dashboard-theme="light"] body h4,
html[data-emsp-dashboard-theme="light"] body h5,
html[data-emsp-dashboard-theme="light"] body h6,
html[data-emsp-dashboard-theme="light"] body .text-dark {
  color: var(--emsp-text) !important;
}

html[data-emsp-dashboard-theme="light"] body .text-muted,
html[data-emsp-dashboard-theme="light"] body small,
html[data-emsp-dashboard-theme="light"] body .breadcrumb,
html[data-emsp-dashboard-theme="light"] body .breadcrumb-item {
  color: var(--emsp-muted) !important;
}

html[data-emsp-dashboard-theme="light"] body .card,
html[data-emsp-dashboard-theme="light"] body .dropdown-menu,
html[data-emsp-dashboard-theme="light"] body .modal-content,
html[data-emsp-dashboard-theme="light"] body .table {
  background: rgba(255, 255, 255, .94) !important;
  color: var(--emsp-text) !important;
  border-color: var(--emsp-border) !important;
  box-shadow: 0 18px 48px -32px rgba(20, 83, 45, .32);
}

html[data-emsp-dashboard-theme="light"] body .bg-light,
html[data-emsp-dashboard-theme="light"] body .form-control,
html[data-emsp-dashboard-theme="light"] body .form-select,
html[data-emsp-dashboard-theme="light"] body .search-control {
  background-color: #fbfdf7 !important;
  color: var(--emsp-text) !important;
  border-color: var(--emsp-border) !important;
}

html[data-emsp-dashboard-theme="light"] body .metismenu .mm-active > a,
html[data-emsp-dashboard-theme="light"] body .metismenu a:hover {
  background: linear-gradient(90deg, #22c55e, #84cc16) !important;
  color: #fff !important;
}

html[data-emsp-dashboard-theme] body .btn-grd-primary,
html[data-emsp-dashboard-theme] body .btn-grd-emsp,
html[data-emsp-dashboard-theme] body .btn-primary {
  background-image: linear-gradient(105deg, #16a34a 0%, #22c55e 58%, #facc15 100%) !important;
  border: 0 !important;
  color: #fff !important;
  box-shadow: 0 12px 30px -18px rgba(22, 163, 74, .75);
}

html[data-emsp-dashboard-theme] body .text-primary {
  color: #16a34a !important;
}

html[data-emsp-dashboard-theme] body .bg-primary {
  background-color: #16a34a !important;
}

html[data-emsp-dashboard-theme="dark"] body {
  --emsp-border: #25452b;
  --emsp-text: #f7fee7;
  --emsp-muted: #bdd0b7;
  background-image: radial-gradient(circle at 10% 0%, rgba(250, 204, 21, .15), transparent 32%),
    radial-gradient(circle at 96% 8%, rgba(34, 197, 94, .18), transparent 34%);
  background-color: #07120a !important;
}

html[data-emsp-dashboard-theme="dark"] body .top-header .navbar,
html[data-emsp-dashboard-theme="dark"] body .sidebar-wrapper,
html[data-emsp-dashboard-theme="dark"] body .sidebar-wrapper .sidebar-header,
html[data-emsp-dashboard-theme="dark"] body .sidebar-wrapper .sidebar-nav {
  background: #0f1f11 !important;
  border-color: var(--emsp-border) !important;
}

html[data-emsp-dashboard-theme="dark"] body .card,
html[data-emsp-dashboard-theme="dark"] body .dropdown-menu,
html[data-emsp-dashboard-theme="dark"] body .modal-content {
  background: linear-gradient(127deg, rgba(12, 28, 14, .96), rgba(18, 38, 18, .82)) !important;
  color: var(--emsp-text) !important;
  border-color: var(--emsp-border) !important;
}

html[data-emsp-dashboard-theme="dark"] body .form-control,
html[data-emsp-dashboard-theme="dark"] body .form-select,
html[data-emsp-dashboard-theme="dark"] body .search-control,
html[data-emsp-dashboard-theme="dark"] body .bg-light {
  background-color: #132416 !important;
  color: var(--emsp-text) !important;
  border-color: var(--emsp-border) !important;
}

html[data-emsp-dashboard-theme="dark"] body .metismenu .mm-active > a,
html[data-emsp-dashboard-theme="dark"] body .metismenu a:hover {
  background: linear-gradient(90deg, #15803d, #ca8a04) !important;
  color: #fff !important;
}

.emsp-legacy-theme-toggle {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--emsp-border, #dbe8c7);
  border-radius: 999px;
  background: rgba(255, 255, 255, .72);
  color: var(--emsp-green, #16a34a);
  transition: .2s ease;
}

.emsp-legacy-theme-toggle:hover {
  background: #16a34a;
  color: #fff;
}
`;

function isLegacyDashboardPage() {
  return window.location.pathname.includes('/dashboard/');
}

function getLegacyDashboardTheme() {
  return localStorage.getItem(DASHBOARD_THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

function applyLegacyDashboardTheme(theme) {
  if (!isLegacyDashboardPage()) return;
  document.documentElement.setAttribute('data-emsp-dashboard-theme', theme);
  document.documentElement.setAttribute('data-bs-theme', theme === 'dark' ? 'dark' : 'light');
  localStorage.setItem(DASHBOARD_THEME_STORAGE_KEY, theme);
  const icon = document.querySelector('#emspThemeToggleIcon');
  if (icon) icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
}

function installLegacyDashboardTheme() {
  if (!isLegacyDashboardPage()) return;

  if (!document.getElementById('emspLegacyDashboardThemeStyle')) {
    const style = document.createElement('style');
    style.id = 'emspLegacyDashboardThemeStyle';
    style.textContent = LEGACY_DASHBOARD_THEME_CSS;
    document.head.appendChild(style);
  }

  const navList = document.querySelector('.top-header .navbar .navbar-nav');
  if (navList && !document.getElementById('emspLegacyThemeToggle')) {
    const item = document.createElement('li');
    item.className = 'nav-item';
    item.innerHTML = `
      <button type="button" class="emsp-legacy-theme-toggle" id="emspLegacyThemeToggle" title="Changer le theme" aria-label="Changer le theme">
        <i class="material-icons-outlined" id="emspThemeToggleIcon">dark_mode</i>
      </button>
    `;
    navList.insertBefore(item, navList.firstChild);
    item.querySelector('button').addEventListener('click', () => {
      applyLegacyDashboardTheme(getLegacyDashboardTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  applyLegacyDashboardTheme(getLegacyDashboardTheme());
}

// ─── Permissions par page dashboard ─────────────────────────────
const PERMISSIONS = {
  'utilisateurs': ['ADMIN'],
  'configuration': ['ADMIN'],
  'comptabilite': ['ADMIN', 'DIRECTION', 'COMPTA'],
  'transport': ['ADMIN', 'DIRECTION', 'STAFF', 'COMPTA', 'CHAUFFEUR'],
  'chauffeur-transport': ['CHAUFFEUR'],
  'inscriptions': ['ADMIN', 'DIRECTION', 'STAFF'],
  'formations': ['ADMIN', 'DIRECTION'],
  'actualites': ['ADMIN', 'DIRECTION', 'STAFF'],
  'mediatheque': ['ADMIN', 'STAFF'],
  'etudiants': ['ADMIN', 'DIRECTION', 'STAFF', 'ENSEIGNANT'],
  'promotions': ['ADMIN', 'DIRECTION', 'STAFF'],
  'notes': ['ADMIN', 'DIRECTION', 'ENSEIGNANT', 'ETUDIANT'],
  'emploi-du-temps': ['ADMIN', 'DIRECTION', 'ENSEIGNANT', 'ETUDIANT'],
};

// ─── Appel API générique avec gestion JWT ───────────────────────
async function apiCall(endpoint, options = {}, _retry = false) {
  const token = localStorage.getItem('access_token');
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(API_BASE + endpoint, {
      ...options,
      headers
    });

    if (response.status === 401 && !_retry) {
      const refreshed = await refreshToken();
      if (refreshed) {
        return apiCall(endpoint, options, true); // retry once
      }
      throw { status: 401, data: { detail: 'Session expirée' } };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erreur serveur' }));
      throw { status: response.status, data: errorData };
    }

    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    if (error.status) throw error;
    console.error('Erreur réseau:', error);
    throw { status: 0, data: { detail: 'Erreur de connexion au serveur' } };
  }
}

// ─── Rafraîchir le token ────────────────────────────────────────
async function refreshToken() {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) {
    logout();
    return false;
  }
  try {
    const res = await fetch(API_BASE + 'auth/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('access_token', data.access);
      return true;
    } else {
      logout();
      return false;
    }
  } catch {
    logout();
    return false;
  }
}

// ─── Déconnexion ────────────────────────────────────────────────
function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  goToLogin();
}

// ─── Vérification d'authentification ────────────────────────────
function requireAuth() {
  if (!localStorage.getItem('access_token')) {
    goToLogin();
    return false;
  }
  return true;
}

// ─── Décoder le JWT pour obtenir l'utilisateur ──────────────────
function getStoredUser() {
  const rawUser = localStorage.getItem('user');
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

function normalizeRole(role) {
  return typeof role === 'string' ? role.trim().toUpperCase() : '';
}

function getCurrentUser() {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  const storedUser = getStoredUser();
  let tokenUser = null;

  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    tokenUser = JSON.parse(decoded);
  } catch {
    tokenUser = null;
  }

  const user = { ...(tokenUser || {}), ...(storedUser || {}) };
  user.role = normalizeRole(user.role);
  return user;
}

// ─── Vérifier les permissions ───────────────────────────────────
function checkPermission(pageName) {
  const user = getCurrentUser();
  const role = user?.role;
  if (!role) {
    logout();
    return false;
  }
  const allowedRoles = PERMISSIONS[pageName];
  if (allowedRoles && !allowedRoles.includes(role)) {
    goToDashboard();
    return false;
  }
  return true;
}

// ─── Filtrer les liens du menu sidebar selon le rôle ────────────
function filterSidebarMenu() {
  const user = getCurrentUser();
  const role = user?.role;
  if (!role) return;

  document.querySelectorAll('[data-permission]').forEach(el => {
    const page = el.getAttribute('data-permission');
    const allowedRoles = PERMISSIONS[page];
    if (allowedRoles && !allowedRoles.includes(role)) {
      el.style.display = 'none';
    }
  });

  // Afficher le nom de l'utilisateur dans le header
  const userNameEl = document.getElementById('dashboard-user-name');
  if (userNameEl) {
    userNameEl.textContent = user.first_name || user.email || 'Utilisateur';
  }

  const userRoleEl = document.getElementById('dashboard-user-role');
  if (userRoleEl) {
    userRoleEl.textContent = role;
  }
}

// ─── Afficher une alerte dans l'UI ──────────────────────────────
function showAlert(message, type = 'danger', container = null) {
  const alertContainer = container || document.getElementById('alert-container');
  if (!alertContainer) {
    console.error(message);
    return;
  }
  const alertHtml = `
    <div class="alert alert-${type} alert-dismissible fade show border-0" role="alert">
      <strong>${type === 'danger' ? '<i class="material-icons-outlined me-1" style="vertical-align:middle;font-size:18px">error</i>Erreur' : type === 'success' ? '<i class="material-icons-outlined me-1" style="vertical-align:middle;font-size:18px">check_circle</i>Succès' : '<i class="material-icons-outlined me-1" style="vertical-align:middle;font-size:18px">info</i>Info'} :</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  alertContainer.innerHTML = alertHtml;

  // Auto-dismiss après 5s
  setTimeout(() => {
    const alert = alertContainer.querySelector('.alert');
    if (alert) alert.remove();
  }, 5000);
}

// ─── Afficher/masquer un loader ─────────────────────────────────
function showLoader(show = true) {
  let loader = document.getElementById('emsp-loader');
  if (!loader && show) {
    loader = document.createElement('div');
    loader.id = 'emsp-loader';
    loader.innerHTML = `
      <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;">
        <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>
    `;
    document.body.appendChild(loader);
  }
  if (loader) {
    loader.style.display = show ? 'block' : 'none';
  }
}

// ─── Formatage de date ──────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Pagination helper ──────────────────────────────────────────
function renderPagination(containerId, currentPage, totalPages, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = '<nav><ul class="pagination justify-content-center">';

  html += `<li class="page-item ${currentPage <= 1 ? 'disabled' : ''}">
    <a class="page-link" href="javascript:;" data-page="${currentPage - 1}">Précédent</a></li>`;

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    html += `<li class="page-item"><a class="page-link" href="javascript:;" data-page="1">1</a></li>`;
    if (startPage > 2) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
      <a class="page-link" href="javascript:;" data-page="${i}">${i}</a></li>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    html += `<li class="page-item"><a class="page-link" href="javascript:;" data-page="${totalPages}">${totalPages}</a></li>`;
  }

  html += `<li class="page-item ${currentPage >= totalPages ? 'disabled' : ''}">
    <a class="page-link" href="javascript:;" data-page="${currentPage + 1}">Suivant</a></li>`;

  html += '</ul></nav>';
  container.innerHTML = html;

  container.querySelectorAll('.page-link[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      const page = parseInt(e.target.dataset.page);
      if (page >= 1 && page <= totalPages) {
        onPageChange(page);
      }
    });
  });
}

// ─── Statut badge helper ────────────────────────────────────────
function getStatusBadge(statut) {
  const badges = {
    'soumis': 'bg-warning',
    'en_examen': 'bg-info',
    'accepte': 'bg-success',
    'refuse': 'bg-danger',
    'paye': 'bg-success',
    'en_attente': 'bg-warning',
    'echoue': 'bg-danger',
    'brouillon': 'bg-secondary',
    'publie': 'bg-success',
  };
  const labels = {
    'soumis': 'Soumis',
    'en_examen': 'En examen',
    'accepte': 'Accepté',
    'refuse': 'Refusé',
    'paye': 'Payé',
    'en_attente': 'En attente',
    'echoue': 'Échoué',
    'brouillon': 'Brouillon',
    'publie': 'Publié',
  };
  const badgeClass = badges[statut] || 'bg-secondary';
  const label = labels[statut] || statut;
  return `<span class="badge ${badgeClass} rounded-pill">${label}</span>`;
}

// ─── Export CSV helper ──────────────────────────────────────────
function exportToCSV(data, filename, headers) {
  const csvRows = [];
  csvRows.push(headers.join(';'));
  data.forEach(row => {
    csvRows.push(headers.map(h => {
      const val = row[h] || '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(';'));
  });
  const blob = new Blob(['\ufeff' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installLegacyDashboardTheme);
} else {
  installLegacyDashboardTheme();
}
