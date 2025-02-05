// Cart class definition
class Cart {
  constructor() {
    this.items = [];
    this.total = 0;
    this.loadCart();
  }

  loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      this.items = cartData.items || [];
      this.total = cartData.total || 0;
    }
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify({
      items: this.items,
      total: this.total
    }));
  }

  addItem(product) {
    this.items.push(product);
    this.total += product.price;
    this.saveCart();
  }

  removeItem(productId) {
    const index = this.items.findIndex(item => item.id === productId);
    if (index > -1) {
      const product = this.items[index];
      this.total -= product.price;
      this.items.splice(index, 1);
      this.saveCart();
    }
  }

  clearCart() {
    this.items = [];
    this.total = 0;
    this.saveCart();
  }
}

// Store class with proper error handling
class Store {
  constructor() {
    this.products = [];
    this.cart = new Cart();
    this.loadData();
  }

  async loadData() {
    try {
      const savedProducts = localStorage.getItem('products');
      this.products = savedProducts ? JSON.parse(savedProducts) : [];
      this.renderProducts();
    } catch (err) {
      console.error('Error loading products:', err);
      this.products = [];
      this.renderProducts();
    }
  }

  renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = `
      <h2 class="store-title">РђРєС‚РёРІРЅС‹Рµ РїСЂРѕРµРєС‚С‹</h2>
      <div class="products-grid">
        ${this.products.map(product => this.renderProductCard(product)).join('')}
      </div>
    `;
  }

  renderProductCard(product) {
    return `
      <div class="product-card" data-aos="fade-up">
        <img src="${product.image}" alt="${this.escapeHtml(product.name)}" loading="lazy">
        <h3>${this.escapeHtml(product.name)}</h3>
        <p>${this.escapeHtml(product.description)}</p>
        <div class="price">
          ${product.oldPrice ? `
            <span class="old-price">${product.oldPrice}в‚Ѕ</span>
            <span class="discount">-${this.calculateDiscount(product.oldPrice, product.price)}%</span>
          ` : ''}
          <span class="current-price">${product.price}в‚Ѕ</span>
        </div>
        <a href="https://t.me/Rolse_tg" class="buy-button" target="_blank">РљСѓРїРёС‚СЊ</a>
      </div>
    `;
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  calculateDiscount(oldPrice, newPrice) {
    return Math.round((1 - newPrice / oldPrice) * 100);
  }
}

class UserProfile {
  constructor() {
    this.isLoggedIn = false;
    this.balance = 0;
    this.transactions = [];
    this.userData = null;
    this.settings = {
      notifications: true,
      twoFactorAuth: false,
      theme: 'dark',
      language: 'ru',
      privacy: false,
      pushNotifications: true
    };
    
    this.init();
  }

  async init() {
    try {
      await this.checkAuthStatus();
      this.loadSettings();
      this.setupEventListeners();
      this.updateUI();
    } catch (err) {
      console.error('Error initializing profile:', err);
    }
  }

  async checkAuthStatus() {
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (authToken && userData) {
      this.isLoggedIn = true;
      this.userData = JSON.parse(userData);
      this.loadUserData();
    }
  }

  async loadUserData() {
    // Load saved data
    this.balance = parseFloat(localStorage.getItem('balance')) || 0;
    this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  }

  updateUI() {
    const profileBtn = document.getElementById('profile-btn');
    const profileMenu = document.getElementById('profile-menu');
    
    if (!profileBtn || !profileMenu) return;

    if (!this.isLoggedIn) {
      profileMenu.innerHTML = this.getLoginPromptHTML();
    } else {
      profileMenu.innerHTML = this.getProfileMenuHTML();
      this.initProfileControls();
    }

    // Update profile button
    const avatar = this.userData?.avatar || 'https://via.placeholder.com/100';
    profileBtn.innerHTML = `<img src="${avatar}" alt="Profile">`;
  }

  getLoginPromptHTML() {
    return `
      <div class="login-prompt">
        <h3>РўСЂРµР±СѓРµС‚СЃСЏ Р°РІС‚РѕСЂРёР·Р°С†РёСЏ</h3>
        <p>Р”Р»СЏ РґРѕСЃС‚СѓРїР° Рє РїСЂРѕС„РёР»СЋ РЅРµРѕР±С…РѕРґРёРјРѕ Р°РІС‚РѕСЂРёР·РѕРІР°С‚СЊСЃСЏ</p>
        <a href="https://t.me/RZgdzRU_Robot" class="login-button telegram">
          Р’РѕР№С‚Рё С‡РµСЂРµР· Telegram
        </a>
      </div>
    `;
  }

  getProfileMenuHTML() {
    return `
      <div class="profile-header">
        <h3>РџСЂРѕС„РёР»СЊ</h3>
        <span class="close-menu">&times;</span>
      </div>
      <div class="profile-content">
        <div class="balance-section">
          <h4>Р‘Р°Р»Р°РЅСЃ</h4>
          <p class="balance">${this.balance.toFixed(2)}в‚Ѕ</p>
          <button class="deposit-btn">РџРѕРїРѕР»РЅРёС‚СЊ</button>
          <p class="min-deposit">РњРёРЅРёРјР°Р»СЊРЅР°СЏ СЃСѓРјРјР°: 1в‚Ѕ</p>
        </div>
        <div class="profile-tab-buttons">
          <button class="tab-button active" data-tab="history">РСЃС‚РѕСЂРёСЏ</button>
          <button class="tab-button" data-tab="settings">РќР°СЃС‚СЂРѕР№РєРё</button>
        </div>
        <div class="profile-tab active" id="history-tab">
          <div class="transactions-list">
            ${this.renderTransactions()}
          </div>
        </div>
        <div class="profile-tab" id="settings-tab">
          ${this.renderSettingsTab()}
        </div>
      </div>
    `;
  }

  renderTransactions() {
    if (!this.transactions.length) {
      return '<p>РСЃС‚РѕСЂРёСЏ С‚СЂР°РЅР·Р°РєС†РёР№ РїСѓСЃС‚Р°</p>';
    }

    return this.transactions.map(tx => `
      <div class="transaction-item">
        <div class="transaction-info">
          <div>${tx.type === 'deposit' ? 'РџРѕРїРѕР»РЅРµРЅРёРµ' : 'РџРѕРєСѓРїРєР°'}</div>
          <div class="transaction-date">${new Date(tx.date).toLocaleDateString()}</div>
        </div>
        <div class="transaction-amount ${tx.amount > 0 ? 'positive' : 'negative'}">
          ${tx.amount > 0 ? '+' : ''}${tx.amount}в‚Ѕ
        </div>
      </div>
    `).join('');
  }

  renderSettingsTab() {
    return `
      <div class="settings-group">
        <h4>РџСЂРѕС„РёР»СЊ</h4>
        <div class="avatar-upload">
          <img src="${this.userData?.avatar || 'https://via.placeholder.com/100'}" id="profile-avatar" alt="Profile">
          <label for="avatar-input" class="avatar-change">РР·РјРµРЅРёС‚СЊ</label>
          <input type="file" id="avatar-input" accept="image/*" hidden>
        </div>
      </div>
      ${this.renderSettingsGroups()}
      <button class="save-settings">РЎРѕС…СЂР°РЅРёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ</button>
    `;
  }

  renderSettingsGroups() {
    const groups = [
      {name: 'notifications', label: 'РЈРІРµРґРѕРјР»РµРЅРёСЏ'},
      {name: 'twoFactorAuth', label: 'Р”РІСѓС…С„Р°РєС‚РѕСЂРЅР°СЏ Р°СѓС‚РµРЅС‚РёС„РёРєР°С†РёСЏ'},
      {name: 'privacy', label: 'РџСЂРёРІР°С‚РЅРѕСЃС‚СЊ'},
      {name: 'pushNotifications', label: 'Push-СѓРІРµРґРѕРјР»РµРЅРёСЏ'}
    ];

    return groups.map(group => `
      <div class="settings-group">
        <h4>${group.label}</h4>
        <label class="toggle-switch">
          <input type="checkbox" id="${group.name}-toggle" ${this.settings[group.name] ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
    `).join('') + `
      <div class="settings-group">
        <h4>РЇР·С‹Рє РёРЅС‚РµСЂС„РµР№СЃР°</h4>
        <select class="language-select">
          <option value="ru" ${this.settings.language === 'ru' ? 'selected' : ''}>Р СѓСЃСЃРєРёР№</option>
          <option value="en" ${this.settings.language === 'en' ? 'selected' : ''}>English</option>
        </select>
      </div>
      <div class="settings-group">
        <h4>РўРµРјР° РёРЅС‚РµСЂС„РµР№СЃР°</h4>
        <select class="theme-select">
          <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>РўС‘РјРЅР°СЏ</option>
          <option value="light" ${this.settings.theme === 'light' ? 'selected' : ''}>РЎРІРµС‚Р»Р°СЏ</option>
          <option value="auto" ${this.settings.theme === 'auto' ? 'selected' : ''}>РЎРёСЃС‚РµРјРЅР°СЏ</option>
        </select>
      </div>
    `;
  }

  setupEventListeners() {
    // Profile button click
    const profileBtn = document.getElementById('profile-btn');
    const profileMenu = document.getElementById('profile-menu');

    if (profileBtn && profileMenu) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileMenu.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
        if (!profileMenu.contains(e.target) && e.target !== profileBtn) {
          profileMenu.classList.remove('active');
        }
      });
    }
  }

  initProfileControls() {
    this.initAvatarUpload();
    this.initSettingsControls();
    this.initTabButtons();
  }

  initAvatarUpload() {
    const avatarInput = document.getElementById('avatar-input');
    if (!avatarInput) return;

    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        
        // Update all avatar images
        document.querySelectorAll('#profile-avatar, #profile-btn img').forEach(img => {
          img.src = imageUrl;
        });

        // Save avatar
        this.userData = {...this.userData, avatar: imageUrl};
        localStorage.setItem('userData', JSON.stringify(this.userData));
      };
      reader.readAsDataURL(file);
    });
  }

  initSettingsControls() {
    // Toggle switches
    document.querySelectorAll('[id$="-toggle"]').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const setting = e.target.id.replace('-toggle', '');
        this.settings[setting] = e.target.checked;
        this.saveSettings();
      });
    });

    // Selects
    document.querySelector('.language-select')?.addEventListener('change', (e) => {
      this.settings.language = e.target.value;
      this.saveSettings();
      this.updateLanguage();
    });

    document.querySelector('.theme-select')?.addEventListener('change', (e) => {
      this.settings.theme = e.target.value;
      this.saveSettings();
      this.updateTheme();
    });

    // Save button
    document.querySelector('.save-settings')?.addEventListener('click', () => {
      this.saveSettings();
      alert('РќР°СЃС‚СЂРѕР№РєРё СЃРѕС…СЂР°РЅРµРЅС‹!');
    });
  }

  initTabButtons() {
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });
  }

  switchTab(tabName) {
    document.querySelectorAll('.profile-tab, .tab-button').forEach(el => {
      el.classList.remove('active');
    });
    
    document.getElementById(`${tabName}-tab`)?.classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
  }

  saveSettings() {
    localStorage.setItem('settings', JSON.stringify(this.settings));
    this.updateTheme();
    this.updateLanguage();
  }

  loadSettings() {
    const saved = localStorage.getItem('settings');
    if (saved) {
      this.settings = {...this.settings, ...JSON.parse(saved)};
      this.updateTheme();
      this.updateLanguage();
    }
  }

  updateTheme() {
    document.body.className = this.settings.theme;
  }

  updateLanguage() {
    document.documentElement.setAttribute('lang', this.settings.language);
    this.updateUI(); // Refresh UI with new language
  }

  addTransaction(transaction) {
    this.transactions.unshift(transaction);
    localStorage.setItem('transactions', JSON.stringify(this.transactions));
    this.updateUI();
  }

  updateBalance(amount) {
    this.balance = amount;
    localStorage.setItem('balance', amount.toString());
    this.updateUI();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    window.store = new Store();
    window.profile = new UserProfile();
  } catch (err) {
    console.error('Error initializing application:', err);
  }
});

// Handle Telegram auth callback
window.addEventListener('message', (event) => {
  if (event.data.type === 'tg-auth-success' && window.profile) {
    const profile = window.profile;
    profile.isLoggedIn = true;
    profile.userData = event.data.userData;
    localStorage.setItem('authToken', event.data.token);
    localStorage.setItem('userData', JSON.stringify(event.data.userData));
    profile.updateUI();
  }
});
