// ============================================
// CHINET - Streaming & Digital Services
// Enhanced JavaScript Functionality (Multi-Page)
// ============================================

// ============================================
// PAGE DETECTION UTILITY
// ============================================

function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    return filename.replace('.html', '');
}

// ============================================
// SHOPPING CART SYSTEM (Enhanced - Works on all pages)
// ============================================

class ShoppingCart {
    constructor() {
        try {
            this.items = JSON.parse(localStorage.getItem('chinet_cart')) || [];
        } catch (e) {
            console.error('Error reading cart from localStorage:', e);
            this.items = [];
        }
        this.cartCountEl = document.getElementById('cartCount');
        this.cartModal = document.getElementById('cartModal');
        this.cartItemsEl = document.getElementById('cartItems');
        this.cartTotalEl = document.getElementById('cartTotal');
        this.cartBtn = document.getElementById('cartBtn');

        this.init();
    }

    init() {
        this.updateCartUI();
        this.bindEvents();
    }

    bindEvents() {
        // Add to cart buttons - using event delegation for dynamic content
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart')) {
                const btn = e.target.closest('.add-to-cart');
                const name = btn.dataset.name;
                const price = parseFloat(btn.dataset.price);
                if (name && !isNaN(price)) {
                    this.addItem(name, price);
                    this.showAddedAnimation(btn);
                } else {
                    console.error('Invalid cart item data:', { name, price });
                }
            }
        });

        // Cart modal close button
        const closeBtn = document.getElementById('cartModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideModal();
            });
        }

        // Clear cart button
        const clearBtn = document.getElementById('clearCart');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearCart();
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.checkout();
            });
        }

        // Cart page specific buttons
        const clearCartPageBtn = document.getElementById('clearCartPage');
        if (clearCartPageBtn) {
            clearCartPageBtn.addEventListener('click', () => {
                this.clearCart();
            });
        }

        const checkoutPageBtn = document.getElementById('checkoutPage');
        if (checkoutPageBtn) {
            checkoutPageBtn.addEventListener('click', () => {
                this.checkout();
            });
        }

        // Close modal on outside click
        if (this.cartModal) {
            this.cartModal.addEventListener('click', (e) => {
                if (e.target === this.cartModal) {
                    this.hideModal();
                }
            });
        }

        // Keyboard navigation for cart modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.cartModal && this.cartModal.classList.contains('active')) {
                this.hideModal();
            }
            // Tab trapping for cart modal
            if (e.key === 'Tab' && this.cartModal && this.cartModal.classList.contains('active')) {
                this.handleTabTrap(e);
            }
        });
    }

    handleTabTrap(e) {
        const modal = this.cartModal;
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    }

    addItem(name, price) {
        const existingItem = this.items.find(item => item.name === name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ name, price, quantity: 1 });
        }

        this.saveCart();
        this.updateCartUI();
        this.renderCartPageItems();
        this.showNotification(`${name} agregado al carrito`, 'success');
    }

    removeItem(index) {
        if (index >= 0 && index < this.items.length) {
            this.items.splice(index, 1);
            this.saveCart();
            this.updateCartUI();
            this.renderCartItems();
            this.renderCartPageItems();
        }
    }

    updateQuantity(index, newQuantity) {
        if (index >= 0 && index < this.items.length && newQuantity > 0) {
            this.items[index].quantity = newQuantity;
            this.saveCart();
            this.updateCartUI();
            this.renderCartItems();
            this.renderCartPageItems();
        } else if (newQuantity <= 0) {
            this.removeItem(index);
        }
    }

    clearCart() {
        if (this.items.length === 0) return;

        if (confirm('¿Estás seguro de vaciar el carrito?')) {
            this.items = [];
            this.saveCart();
            this.updateCartUI();
            this.renderCartItems();
            this.renderCartPageItems();
            this.showNotification('Carrito vaciado', 'info');
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    saveCart() {
        try {
            localStorage.setItem('chinet_cart', JSON.stringify(this.items));
        } catch (e) {
            console.error('Error saving cart to localStorage:', e);
        }
    }

    updateCartUI() {
        // Update cart count
        const count = this.getCount();
        if (this.cartCountEl) {
            this.cartCountEl.textContent = count;

            // Animate cart count with pulse
            this.cartCountEl.style.animation = 'none';
            void this.cartCountEl.offsetWidth;
            this.cartCountEl.style.animation = 'cartPulse 0.3s ease';

            // Update aria-label
            this.cartBtn?.setAttribute('aria-label', `Carrito de compras - ${count} artículo${count !== 1 ? 's' : ''}`);
        }
    }

    renderCartItems() {
        if (!this.cartItemsEl) return;

        if (this.items.length === 0) {
            this.cartItemsEl.innerHTML = `
                <div class="empty-cart-cta">
                    <span class="material-symbols-outlined">shopping_cart</span>
                    <p>Tu carrito está vacío</p>
                    <button class="btn btn-primary" onclick="window.location.href='streaming.html'">
                        <span class="material-symbols-outlined">storefront</span> Explorar Servicios
                    </button>
                </div>
            `;
        } else {
            this.cartItemsEl.innerHTML = this.items.map((item, index) => `
                <div class="cart-item added">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">S/ ${item.price.toFixed(2)} c/u</div>
                        <div class="cart-item-subtotal">Subtotal: S/ ${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    <div class="cart-item-controls">
                        <div class="cart-item-qty">
                            <button class="qty-btn" onclick="cart.updateQuantity(${index}, ${item.quantity - 1})" aria-label="Reducir cantidad de ${item.name}">−</button>
                            <span class="qty-value" aria-label="Cantidad: ${item.quantity}">${item.quantity}</span>
                            <button class="qty-btn" onclick="cart.updateQuantity(${index}, ${item.quantity + 1})" aria-label="Aumentar cantidad de ${item.name}">+</button>
                        </div>
                        <button class="cart-item-remove" onclick="cart.removeItem(${index})" aria-label="Eliminar ${item.name} del carrito">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Update total
        if (this.cartTotalEl) {
            this.cartTotalEl.textContent = `S/ ${this.getTotal().toFixed(2)}`;
        }
    }

    renderCartPageItems() {
        const cartPageItemsEl = document.getElementById('cartPageItems');
        if (!cartPageItemsEl) return;

        const subtotalEl = document.getElementById('cartSubtotal');
        const totalEl = document.getElementById('cartTotal');

        if (this.items.length === 0) {
            cartPageItemsEl.innerHTML = `
                <div class="empty-cart-page">
                    <span class="material-symbols-outlined">shopping_cart</span>
                    <h3>Tu carrito está vacío</h3>
                    <p>Agrega servicios de streaming o desarrollo para comenzar.</p>
                    <button class="btn btn-primary" onclick="window.location.href='streaming.html'">
                        <span class="material-symbols-outlined">storefront</span> Explorar Servicios
                    </button>
                </div>
            `;
            if (subtotalEl) subtotalEl.textContent = 'S/ 0.00';
            if (totalEl) totalEl.textContent = 'S/ 0.00';
        } else {
            cartPageItemsEl.innerHTML = this.items.map((item, index) => `
                <div class="cart-page-item added">
                    <div class="cart-page-item-info">
                        <div class="cart-page-item-name">${item.name}</div>
                        <div class="cart-page-item-price">S/ ${item.price.toFixed(2)} c/u</div>
                    </div>
                    <div class="cart-page-item-controls">
                        <div class="cart-page-item-qty">
                            <button class="cart-page-qty-btn" onclick="cart.updateQuantity(${index}, ${item.quantity - 1})" aria-label="Reducir cantidad">−</button>
                            <span class="cart-page-qty-value" aria-label="Cantidad: ${item.quantity}">${item.quantity}</span>
                            <button class="cart-page-qty-btn" onclick="cart.updateQuantity(${index}, ${item.quantity + 1})" aria-label="Aumentar cantidad">+</button>
                        </div>
                        <button class="cart-page-item-remove" onclick="cart.removeItem(${index})" aria-label="Eliminar ${item.name}">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>
            `).join('');

            const total = this.getTotal();
            if (subtotalEl) subtotalEl.textContent = `S/ ${total.toFixed(2)}`;
            if (totalEl) totalEl.textContent = `S/ ${total.toFixed(2)}`;
        }
    }

    showModal() {
        this.renderCartItems();
        if (this.cartModal) {
            this.cartModal.classList.add('active');
            document.body.style.overflow = 'hidden';

            const closeBtn = document.getElementById('cartModalClose');
            if (closeBtn) {
                setTimeout(() => closeBtn.focus(), 100);
            }
        }
    }

    hideModal() {
        if (this.cartModal) {
            this.cartModal.classList.remove('active');
            document.body.style.overflow = 'auto';

            if (this.cartBtn) {
                this.cartBtn.focus();
            }
        }
    }

    checkout() {
        if (this.items.length === 0) {
            this.showNotification('Tu carrito está vacío', 'warning');
            return;
        }

        const total = this.getTotal().toFixed(2);
        const message = `¡Hola! Me gustaría realizar la compra de:\n\n${this.items.map(item =>
            `- ${item.name} (x${item.quantity}): S/ ${(item.price * item.quantity).toFixed(2)}`
        ).join('\n')}\n\nTotal: S/ ${total}`;

        const whatsappUrl = `https://wa.me/51956131320?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        this.showNotification('Redirigiendo a WhatsApp...', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        const iconName = type === 'success' ? 'check_circle' : type === 'warning' ? 'warning' : 'info';
        notification.innerHTML = `
            <span class="material-symbols-outlined" aria-hidden="true">${iconName}</span>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    showAddedAnimation(btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">check</span> Agregado';
        btn.classList.add('added-animation');
        btn.disabled = true;
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('added-animation');
            btn.disabled = false;
        }, 1500);
    }
}

// Global helper to close cart and browse
function closeCartAndBrowse() {
    if (window.cart) {
        window.cart.hideModal();
    }
    window.location.href = 'streaming.html';
}

// ============================================
// CONTACT FORM (Enhanced with Real-time Validation)
// ============================================

class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.fields = {
            name: {
                el: document.getElementById('name'),
                errorEl: document.getElementById('name-error'),
                validate: (val) => val.trim().length >= 2 ? '' : 'El nombre debe tener al menos 2 caracteres'
            },
            email: {
                el: document.getElementById('email'),
                errorEl: document.getElementById('email-error'),
                validate: (val) => this.isValidEmail(val) ? '' : 'Por favor ingresa un email válido'
            },
            service: {
                el: document.getElementById('service'),
                errorEl: document.getElementById('service-error'),
                validate: (val) => val ? '' : 'Selecciona un servicio'
            },
            message: {
                el: document.getElementById('message'),
                errorEl: document.getElementById('message-error'),
                counterEl: document.getElementById('message-counter'),
                validate: (val) => val.trim().length >= 10 ? '' : 'El mensaje debe tener al menos 10 caracteres'
            }
        };

        this.init();
    }

    init() {
        if (!this.form) return;

        // Real-time validation on blur and input
        Object.values(this.fields).forEach(field => {
            if (field.el) {
                field.el.addEventListener('blur', () => this.validateField(field));
                field.el.addEventListener('input', () => {
                    const parent = field.el.closest('.form-group');
                    if (parent && (parent.classList.contains('error') || parent.classList.contains('success'))) {
                        this.validateField(field);
                    }
                    if (field.counterEl) {
                        const len = field.el.value.length;
                        field.counterEl.textContent = `${len}/500`;
                        field.counterEl.classList.toggle('warning', len > 400 && len <= 470);
                        field.counterEl.classList.toggle('danger', len > 470);
                    }
                });
            }
        });

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    validateField(field) {
        if (!field || !field.el) return true;

        const value = field.el.value;
        const errorMsg = field.validate(value);
        const parent = field.el.closest('.form-group');

        if (parent) {
            parent.classList.toggle('error', !!errorMsg);
            parent.classList.toggle('success', !errorMsg && value.length > 0);
        }

        if (field.errorEl) {
            field.errorEl.textContent = errorMsg;
        }

        return !errorMsg;
    }

    validateAllFields() {
        let isValid = true;
        Object.values(this.fields).forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        return isValid;
    }

    handleSubmit() {
        if (!this.validateAllFields()) {
            this.showNotification('Por favor corrige los errores del formulario', 'warning');
            return;
        }

        if (this.submitBtn) {
            this.submitBtn.classList.add('loading');
            this.submitBtn.disabled = true;
        }

        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        setTimeout(() => {
            const message = `*Nuevo Mensaje desde Chinet Web*\n\n` +
                `*Nombre:* ${data.name}\n` +
                `*Email:* ${data.email}\n` +
                `*Servicio:* ${this.getServiceName(data.service)}\n` +
                `*Mensaje:*\n${data.message}`;

            const whatsappUrl = `https://wa.me/51956131320?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');

            this.showSuccessAnimation();

            this.form.reset();
            Object.values(this.fields).forEach(field => {
                const parent = field.el?.closest('.form-group');
                if (parent) {
                    parent.classList.remove('success', 'error');
                }
                if (field.errorEl) {
                    field.errorEl.textContent = '';
                }
                if (field.counterEl) {
                    field.counterEl.textContent = '0/500';
                    field.counterEl.classList.remove('warning', 'danger');
                }
            });

            if (this.submitBtn) {
                this.submitBtn.classList.remove('loading');
                this.submitBtn.disabled = false;
            }
        }, 800);
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    getServiceName(service) {
        const services = {
            'bot': 'Bots Automáticos',
            'web': 'Página Web',
            'system': 'Sistema Completo',
            'database': 'Base de Datos',
            'mobile': 'App Móvil',
            'api': 'APIs & Integraciones',
            'streaming': 'Streaming'
        };
        return services[service] || service;
    }

    showSuccessAnimation() {
        this.showNotification('¡Mensaje enviado con éxito!', 'success');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        const iconName = type === 'success' ? 'check_circle' : type === 'warning' ? 'warning' : 'info';
        notification.innerHTML = `
            <span class="material-symbols-outlined" aria-hidden="true">${iconName}</span>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// ============================================
// PLATFORMS MODAL & TABS (Enhanced with Accessibility)
// ============================================

class PlatformsModal {
    constructor() {
        this.modal = document.getElementById('platformsModal');
        this.viewMoreBtn = document.getElementById('viewMoreBtn');
        this.closeBtn = document.getElementById('platformsModalClose');
        this.searchInput = document.getElementById('platformSearch');
        this.catButtons = document.querySelectorAll('.platform-cat-btn');
        this.platformCards = document.querySelectorAll('.platform-card');
        this.detailButtons = document.querySelectorAll('.btn-platform-detail');
        this.lastFocusedElement = null;

        // Detail modal
        this.detailModal = null;

        this.init();
    }

    init() {
        if (!this.modal) return;

        // Open modal
        if (this.viewMoreBtn) {
            this.viewMoreBtn.addEventListener('click', () => {
                this.openModal();
            });
        }

        // Close modal
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Click outside to close
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }

        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.filterPlatforms(e.target.value.toLowerCase());
            });
        }

        // Category filter buttons - usando delegación de eventos
        document.addEventListener('click', (e) => {
            if (e.target.closest('.platform-cat-btn')) {
                const btn = e.target.closest('.platform-cat-btn');
                document.querySelectorAll('.platform-cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterByCategory(btn.dataset.category);
            }
        });

        // Detail buttons - usando delegación de eventos
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-platform-detail')) {
                const btn = e.target.closest('.btn-platform-detail');
                this.openDetailModal(btn.dataset.platform);
            }
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.detailModal && this.detailModal.classList.contains('active')) {
                    this.closeDetailModal();
                } else if (this.modal && this.modal.classList.contains('active')) {
                    this.closeModal();
                }
            }
        });

        // Consultame al privado button - using delegation since button is in hidden modal
        document.addEventListener('click', (e) => {
            const whatsappBtn = e.target.closest('.btn-whatsapp-generic');
            if (whatsappBtn) {
                e.preventDefault();
                const message = `¡Hola! Me interesa un servicio que no veo en la lista. ¿Podrías ayudarme?`;
                const whatsappUrl = `https://wa.me/51956131320?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            }
        });
    }

    filterPlatforms(searchTerm) {
        const activeCategory = document.querySelector('.platform-cat-btn.active')?.dataset.category || 'all';
        
        this.platformCards.forEach(card => {
            const name = card.dataset.name.toLowerCase();
            const category = card.dataset.category;
            const matchesSearch = name.includes(searchTerm);
            const matchesCategory = activeCategory === 'all' || category === activeCategory;
            
            if (matchesSearch && matchesCategory) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    filterByCategory(category) {
        const searchTerm = this.searchInput?.value.toLowerCase() || '';
        
        this.platformCards.forEach(card => {
            const name = card.dataset.name.toLowerCase();
            const cardCategory = card.dataset.category;
            const matchesSearch = name.includes(searchTerm);
            const matchesCategory = category === 'all' || cardCategory === category;
            
            if (matchesSearch && matchesCategory) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    openModal() {
        this.lastFocusedElement = document.activeElement;
        if (this.modal) {
            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            if (this.closeBtn) {
                setTimeout(() => this.closeBtn.focus(), 100);
            }
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
            document.body.style.overflow = 'auto';

            if (this.lastFocusedElement) {
                this.lastFocusedElement.focus();
            }
        }
    }

    openDetailModal(platform) {
        const platformData = this.getPlatformData(platform);
        if (!platformData) return;

        // Create detail modal if it doesn't exist
        if (!this.detailModal) {
            this.createDetailModal();
        }

        // Populate content
        const content = this.detailModal.querySelector('.platform-detail-modal-content');
        content.innerHTML = this.renderPlatformDetail(platformData);

        // Show modal
        this.detailModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Bind add to cart button
        const addToCartBtn = content.querySelector('.add-to-cart-detail');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                if (window.cart) {
                    window.cart.addItem(addToCartBtn.dataset.name, parseFloat(addToCartBtn.dataset.price));
                }
            });
        }

        // Close button
        const closeBtn = this.detailModal.querySelector('.platform-detail-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeDetailModal());
        }

        // Click outside to close
        this.detailModal.addEventListener('click', (e) => {
            if (e.target === this.detailModal) {
                this.closeDetailModal();
            }
        });
    }

    closeDetailModal() {
        if (this.detailModal) {
            this.detailModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    createDetailModal() {
        this.detailModal = document.createElement('div');
        this.detailModal.className = 'platform-detail-modal';
        this.detailModal.setAttribute('role', 'dialog');
        this.detailModal.setAttribute('aria-modal', 'true');
        this.detailModal.innerHTML = `
            <div class="platform-detail-modal-content">
                <div class="platform-detail-modal-header">
                    <button class="platform-detail-modal-close" aria-label="Cerrar">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="platform-detail-modal-body"></div>
            </div>
        `;
        document.body.appendChild(this.detailModal);
    }

    getPlatformData(platform) {
        const platforms = {
            netflix: {
                name: 'Netflix Premium',
                icon: `<img src="images/netflix.jpg" alt="Netflix" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'netflix-bg',
                price: 'S/ 13.00/mes',
                priceValue: '13.00',
                nameCart: 'Netflix Premium',
                quality: 'HD / 4K Ultra HD',
                devices: 'Hasta 4 pantallas',
                duration: '30 días garantizados',
                features: [
                    'Acceso completo a todo el catálogo',
                    'Sin anuncios ni interrupciones',
                    'Descarga para ver offline',
                    'Perfiles personalizados',
                    'Control parental avanzado',
                    'Soporte técnico 24/7',
                    'Garantía de reposición',
                    'Renovación automática disponible'
                ]
            },
            amazon: {
                name: 'Amazon Prime Video',
                icon: `<img src="images/amazon-prime.jpg" alt="Amazon Prime" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'amazon-bg',
                price: 'S/ 4.00/mes',
                priceValue: '4.00',
                nameCart: 'Amazon Prime',
                quality: 'HD / 4K HDR',
                devices: 'Hasta 3 pantallas',
                duration: '30 días garantizados',
                features: [
                    'Amazon Music incluido',
                    'Envíos gratis en Amazon',
                    'Contenido exclusivo Original',
                    'Descargas offline',
                    'X-Ray para actores y música',
                    'Watch Party con amigos',
                    'Soporte prioritario'
                ]
            },
            disney: {
                name: 'Disney+ Premium',
                icon: `<img src="images/disney-plus.jpg" alt="Disney+" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'disney-bg',
                price: 'S/ 8.00/mes',
                priceValue: '8.00',
                nameCart: 'Disney+',
                quality: 'HD / 4K UHD + IMAX',
                devices: 'Hasta 4 pantallas',
                duration: '30 días garantizados',
                features: [
                    'Marvel, Star Wars, Pixar',
                    'National Geographic',
                    'Contenido Star (adulto)',
                    'Estrenos exclusivos',
                    'Descargas ilimitadas',
                    'GroupWatch con amigos',
                    'Renovación automática'
                ]
            },
            hbo: {
                name: 'HBO Max',
                icon: `<img src="images/hbo-max.svg" alt="HBO Max" style="width:100%;height:100%;object-fit:contain;border-radius:12px;background:white;">`,
                bgClass: 'hbo-bg',
                price: 'S/ 7.00/mes',
                priceValue: '7.00',
                nameCart: 'HBO Max',
                quality: 'HD / 4K UHD',
                devices: 'Hasta 3 pantallas',
                duration: '30 días garantizados',
                features: [
                    'Series originales exclusivas',
                    'Películas de Warner Bros',
                    'DC Comics y más',
                    'Documentales premium',
                    'Contenido bajo demanda',
                    'Descargas disponibles',
                    'Perfiles personalizados',
                    'Garantía total'
                ]
            },
            spotify: {
                name: 'Spotify Premium',
                icon: `<img src="images/spotify.png" alt="Spotify" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'spotify-bg',
                price: 'S/ 7.00/mes',
                priceValue: '7.00',
                nameCart: 'Spotify Premium',
                quality: 'Alta calidad 320kbps',
                devices: '1 cuenta individual',
                duration: '30 días garantizados',
                features: [
                    'Música ilimitada sin anuncios',
                    'Modo offline completo',
                    'Calidad de audio premium',
                    'Saltos ilimitados',
                    'Spotify Connect',
                    'Listas personalizadas',
                    'Podcasts exclusivos',
                    'Letras en tiempo real'
                ]
            },
            youtube: {
                name: 'YouTube Premium',
                icon: `<img src="images/youtube.jpg" alt="YouTube" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'youtube-bg',
                price: 'S/ 4.00/mes',
                priceValue: '4.00',
                nameCart: 'YouTube Premium',
                quality: 'HD / 4K HDR',
                devices: 'Cuenta individual',
                duration: '30 días garantizados',
                features: [
                    'YouTube sin anuncios',
                    'YouTube Music Premium',
                    'Reproducción en segundo plano',
                    'Descargas para offline',
                    'YouTube Originals',
                    'Música sin interrupciones',
                    'Acceso a contenido exclusivo',
                    'Soporte completo'
                ]
            },
            canva: {
                name: 'Canva Pro',
                icon: `<img src="images/canva.png" alt="Canva" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'canva-bg',
                price: 'S/ 5.00/mes',
                priceValue: '5.00',
                nameCart: 'Canva Pro',
                quality: 'Pro completo',
                devices: '1 cuenta',
                duration: '30 días garantizados',
                features: [
                    'Plantillas premium ilimitadas',
                    'Fotos, gráficos y elementos',
                    'Quitar fondos de imágenes',
                    'Redimensionar mágico',
                    'Kit de marca personalizado',
                    'Almacenamiento en la nube',
                    'Colaboración en equipo',
                    'Exportar en alta calidad'
                ]
            },
            crunchyroll: {
                name: 'Crunchyroll Premium',
                icon: `<img src="images/crunchyroll.jpg" alt="Crunchyroll" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'crunchy-bg',
                price: 'S/ 4.00/mes',
                priceValue: '4.00',
                nameCart: 'Crunchyroll Premium',
                quality: 'Full HD / 1080p',
                devices: 'Múltiples dispositivos',
                duration: '30 días garantizados',
                features: [
                    'Anime sin anuncios',
                    'Simulcast de Japón',
                    'Manga digital incluido',
                    'Descargas offline',
                    'Acceso a estrenos',
                    'Series clásicas y nuevas',
                    'Doramas exclusivos',
                    'Renovación automática'
                ]
            },
            viki: {
                name: 'Viki Rakuten',
                icon: `<img src="images/viki.png" alt="Viki" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'viki-bg',
                price: 'S/ 6.00/mes',
                priceValue: '6.00',
                nameCart: 'Viki Rakuten',
                quality: 'HD 1080p',
                devices: 'Múltiples pantallas',
                duration: '30 días garantizados',
                features: [
                    'Dramas coreanos exclusivos',
                    'Series asiáticas premium',
                    'Subtítulos en español',
                    'Sin anuncios',
                    'Contenido exclusivo',
                    'Estrenos simultáneos',
                    'Descargas disponibles',
                    'Calidad HD garantizada'
                ]
            },
            paramount: {
                name: 'Paramount+',
                icon: `<img src="images/paramount.png" alt="Paramount+" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'paramount-bg',
                price: 'S/ 6.00/mes',
                priceValue: '6.00',
                nameCart: 'Paramount+',
                quality: 'HD / 4K',
                devices: 'Hasta 3 pantallas',
                duration: '30 días garantizados',
                features: [
                    'Películas de Paramount',
                    'Series originales exclusivas',
                    'Star Trek y más',
                    'Deportes en vivo',
                    'Noticias ydocumentales',
                    'Contenido infantil',
                    'Descargas offline',
                    'Perfiles personalizados'
                ]
            },
            appletv: {
                name: 'Apple TV+',
                icon: `<img src="images/apple-tv.png" alt="Apple TV+" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'appletv-bg',
                price: 'S/ 5.00/mes',
                priceValue: '5.00',
                nameCart: 'Apple TV+',
                quality: '4K Dolby Vision',
                devices: 'Múltiples dispositivos',
                duration: '30 días garantizados',
                features: [
                    'Originales de Apple exclusivos',
                    'Calidad 4K Dolby Vision',
                    'Audio Dolby Atmos',
                    'Sin anuncios',
                    'Contenido para toda la familia',
                    'Descargas disponibles',
                    'Integración con Apple Music',
                    'Compartir con familia'
                ]
            },
            deezer: {
                name: 'Deezer Premium',
                icon: `<img src="images/deezer.png" alt="Deezer" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'deezer-bg',
                price: 'S/ 5.00/mes',
                priceValue: '5.00',
                nameCart: 'Deezer Premium',
                quality: 'HiFi 320kbps',
                devices: '1 cuenta individual',
                duration: '30 días garantizados',
                features: [
                    'Música ilimitada sin anuncios',
                    'Modo offline completo',
                    'Calidad HiFi sin pérdida',
                    'Letras de canciones',
                    'Flow personalizado',
                    'Podcasts exclusivos',
                    'Playlist inteligentes',
                    'Saltos ilimitados'
                ]
            },
            tidal: {
                name: 'Tidal HiFi',
                icon: `<img src="images/tidal.png" alt="Tidal" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'tidal-bg',
                price: 'S/ 5.00/mes',
                priceValue: '5.00',
                nameCart: 'Tidal HiFi',
                quality: 'Master Quality Audio',
                devices: '1 cuenta individual',
                duration: '30 días garantizados',
                features: [
                    'Audio Master sin pérdida',
                    'Más de 80 millones de canciones',
                    'Vídeos musicales',
                    'Podcasts exclusivos',
                    'Sin anuncios',
                    'Modo offline',
                    'Créditos justos a artistas',
                    'Contenido exclusivo'
                ]
            },
            iptv: {
                name: 'IPTV Premium',
                icon: `<img src="images/iptv.png" alt="IPTV" style="width:100%;height:100%;object-fit:contain;border-radius:12px;background:white;" onerror="this.outerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:white;font-weight:bold;font-size:24px;\\'>IPTV</div>'">`,
                bgClass: 'iptv-bg',
                price: 'S/ 10.00/mes',
                priceValue: '10.00',
                nameCart: 'IPTV Premium',
                quality: 'HD / FHD / 4K',
                devices: '2 conexiones simultáneas',
                duration: '30 días garantizados',
                features: [
                    '+5000 canales en vivo',
                    'Canales internacionales',
                    'Películas y series VOD',
                    'Guía de programación (EPG)',
                    'Deportes en vivo',
                    'Canales para adultos',
                    'Soporte técnico 24/7',
                    'Compatible con todos los dispositivos'
                ]
            },
            flow: {
                name: 'Flow Premium',
                icon: `<img src="images/flow-tv.png" alt="Flow" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'flow-bg',
                price: 'S/ 12.00/mes',
                priceValue: '12.00',
                nameCart: 'Flow Premium',
                quality: 'HD / Full HD',
                devices: 'Hasta 2 pantallas',
                duration: '30 días garantizados',
                features: [
                    'Canales argentinos en vivo',
                    'Contenido bajo demanda',
                    'Deportes nacionales',
                    'Series y películas latinas',
                    'Noticias en español',
                    'Programación infantil',
                    'Grabación en la nube',
                    'Multi-dispositivo'
                ]
            },
            dazn: {
                name: 'DAZN',
                icon: `<img src="images/dazn.png" alt="DAZN" style="width:100%;height:100%;object-fit:contain;border-radius:12px;background:white;" onerror="this.outerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#FF6B00;font-weight:bold;font-size:20px;\\'>DAZN</div>'">`,
                bgClass: 'amazon-bg',
                price: 'S/ 15.00/mes',
                priceValue: '15.00',
                nameCart: 'DAZN',
                quality: 'HD / Full HD',
                devices: 'Hasta 2 pantallas',
                duration: '30 días garantizados',
                features: [
                    'Deportes en vivo',
                    'Fútbol internacional',
                    'Boxeo y MMA',
                    'Fórmula 1',
                    'MotoGP',
                    'Documentales deportivos',
                    'Sin contratos',
                    'Multi-dispositivo'
                ]
            },
            directvgo: {
                name: 'Directv Go',
                icon: `<img src="images/directvgo.png" alt="Directv Go" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'hbo-bg',
                price: 'S/ 25.00/mes',
                priceValue: '25.00',
                nameCart: 'Directv Go',
                quality: 'HD / 4K UHD',
                devices: 'Hasta 2 pantallas',
                duration: '30 días garantizados',
                features: [
                    'Canales en vivo',
                    'Deportes exclusivos',
                    'Películas y series VOD',
                    'Noticias 24/7',
                    'Programación infantil',
                    'Sin cables',
                    'Instalación inmediata',
                    'Garantía premium'
                ]
            },
            movistar: {
                name: 'Movistar Play',
                icon: `<img src="images/movistar.png" alt="Movistar" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'viki-bg',
                price: 'S/ 15.00/mes',
                priceValue: '15.00',
                nameCart: 'Movistar Play',
                quality: 'HD / Full HD',
                devices: 'Hasta 2 pantallas',
                duration: '30 días garantizados',
                features: [
                    'Canales nacionales e internacionales',
                    'Series originales Movistar',
                    'Películas de estreno',
                    'Deportes en vivo',
                    'Contenido infantil',
                    'Acceso multi-pantalla',
                    'Garantía de servicio',
                    'Soporte técnico'
                ]
            },
            vix: {
                name: 'Vix Premium',
                icon: `<img src="images/vix.png" alt="Vix" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'paramount-bg',
                price: 'S/ 6.00/mes',
                priceValue: '6.00',
                nameCart: 'Vix Premium',
                quality: 'HD / Full HD',
                devices: 'Hasta 3 pantallas',
                duration: '30 días garantizados',
                features: [
                    'Contenido latino premium',
                    'Novelas y series',
                    'Fútbol en vivo',
                    'Películas originales',
                    'Sin anuncios',
                    'Descargas offline',
                    'Perfiles personalizados',
                    'Acceso inmediato'
                ]
            },
            scribd: {
                name: 'Scribd Premium',
                icon: `<img src="images/scribd.png" alt="Scribd" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'deezer-bg',
                price: 'S/ 11.00/mes',
                priceValue: '11.00',
                nameCart: 'Scribd Premium',
                quality: 'Digital ilimitado',
                devices: 'Acceso total',
                duration: '30 días garantizados',
                features: [
                    'Libros ilimitados',
                    'Audiolibros premium',
                    'Revistas y noticias',
                    'Documentos técnicos',
                    'Partituras musicales',
                    'Descargas para offline',
                    'Sin anuncios',
                    'Sincronización multidispositivo'
                ]
            },
            gemini: {
                name: 'Gemini Advanced',
                icon: `<img src="images/gemini.png" alt="Gemini" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'appletv-bg',
                price: 'S/ 9.00/mes',
                priceValue: '9.00',
                nameCart: 'Gemini AI',
                quality: 'Google AI Premium',
                devices: 'Cuenta individual',
                duration: '30 días garantizados',
                features: [
                    'Modelo Ultra 1.0',
                    'Capacidad de razonamiento avanzado',
                    'Integración con Google Workspace',
                    'Análisis de datos masivos',
                    'Generación de imágenes Pro',
                    'Privacidad mejorada',
                    'Acceso prioritario',
                    'Soporte avanzado'
                ]
            },
            chatgpt: {
                name: 'ChatGPT Plus',
                icon: `<img src="images/chatgpt.png" alt="ChatGPT" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`,
                bgClass: 'chatgpt-bg',
                price: 'S/ 10.00/mes',
                priceValue: '10.00',
                nameCart: 'ChatGPT Plus',
                quality: 'OpenAI Premium',
                devices: 'Cuenta individual',
                duration: '30 días garantizados',
                features: [
                    'Acceso a GPT-4',
                    'DALL-E 3 generación imágenes',
                    'Navegación con Bing',
                    'Análisis de datos avanzado',
                    'Plugins y GPTs personalizados',
                    'Sin límites de espera',
                    'Respuestas ultra rápidas',
                    'Nuevas funciones exclusivas'
                ]
            }
        };
        
        return platforms[platform] || null;
    }

    renderPlatformDetail(data) {
        return `
            <div class="platform-detail-modal-header ${data.bgClass}">
                <div class="platform-detail-icon">
                    ${data.icon}
                </div>
                <div class="platform-detail-title">
                    <h2>${data.name}</h2>
                    <p>${data.price}</p>
                </div>
            </div>
            <div class="platform-detail-modal-body">
                <div class="platform-detail-info-grid">
                    <div class="platform-detail-info-item">
                        <span class="material-symbols-outlined" aria-hidden="true">payments</span>
                        <div><h4>Precio</h4><p>${data.price}</p></div>
                    </div>
                    <div class="platform-detail-info-item">
                        <span class="material-symbols-outlined" aria-hidden="true">high_quality</span>
                        <div><h4>Calidad</h4><p>${data.quality}</p></div>
                    </div>
                    <div class="platform-detail-info-item">
                        <span class="material-symbols-outlined" aria-hidden="true">devices</span>
                        <div><h4>Dispositivos</h4><p>${data.devices}</p></div>
                    </div>
                    <div class="platform-detail-info-item">
                        <span class="material-symbols-outlined" aria-hidden="true">schedule</span>
                        <div><h4>Duración</h4><p>${data.duration}</p></div>
                    </div>
                </div>
                <div class="platform-detail-features">
                    <h3>Características Incluidas</h3>
                    <ul class="platform-features-list">
                        ${data.features.map(f => `<li><span class="material-symbols-outlined" aria-hidden="true">check_circle</span> ${f}</li>`).join('')}
                    </ul>
                </div>
                <div class="platform-detail-actions">
                    <button class="btn btn-primary btn-full add-to-cart-detail" data-name="${data.nameCart}" data-price="${data.priceValue}">
                        <span class="material-symbols-outlined" aria-hidden="true">add_shopping_cart</span> Agregar al Carrito - ${data.price}
                    </button>
                </div>
            </div>
        `;
    }
}

// ============================================
// NAVIGATION & UI (Enhanced for Multi-Page)
// ============================================

class Navigation {
    constructor() {
        this.header = document.getElementById('header');
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.navLinks = document.querySelector('.nav-links');
        this.isMobileMenuOpen = false;
        this.currentPage = getCurrentPage();
        this.init();
    }

    init() {
        // Set active nav link based on current page
        this.setActiveNavLink();

        // Scroll effect for header
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                this.header?.classList.add('scrolled');
            } else {
                this.header?.classList.remove('scrolled');
            }
        });

        // Mobile menu toggle
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Nav links - handle external page links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                // If link points to a different page, let it navigate normally
                if (href && href.endsWith('.html')) {
                    return; // Let the browser navigate
                }
                // For same-page anchors, prevent default and scroll
                e.preventDefault();
                const targetId = href.substring(1);
                this.scrollToSection(targetId);

                if (window.innerWidth <= 768) {
                    this.closeMobileMenu();
                }
            });
        });

        // Close mobile menu on resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    setActiveNavLink() {
        const pageMap = {
            'index': 'index.html',
            'streaming': 'streaming.html',
            'servicios': 'servicios.html',
            'precios': 'precios.html',
            'contacto': 'contacto.html',
            'carrito': 'carrito.html'
        };

        const activeHref = pageMap[this.currentPage] || 'index.html';

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === activeHref) {
                link.classList.add('active');
            }
        });
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;

        if (this.isMobileMenuOpen) {
            this.navLinks.style.display = 'flex';
            this.navLinks.style.flexDirection = 'column';
            this.navLinks.style.position = 'absolute';
            this.navLinks.style.top = '100%';
            this.navLinks.style.left = '0';
            this.navLinks.style.right = '0';
            this.navLinks.style.backgroundColor = 'var(--bg-dark)';
            this.navLinks.style.padding = '20px';
            this.navLinks.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
            this.navLinks.style.zIndex = '999';
            this.mobileMenuBtn?.setAttribute('aria-expanded', 'true');
            const icon = this.mobileMenuBtn?.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = 'close';
        } else {
            this.closeMobileMenu();
        }
    }

    closeMobileMenu() {
        this.isMobileMenuOpen = false;
        if (this.navLinks) {
            this.navLinks.style.display = '';
            this.navLinks.style.flexDirection = '';
            this.navLinks.style.position = '';
            this.navLinks.style.top = '';
            this.navLinks.style.left = '';
            this.navLinks.style.right = '';
            this.navLinks.style.backgroundColor = '';
            this.navLinks.style.padding = '';
            this.navLinks.style.boxShadow = '';
            this.navLinks.style.zIndex = '';
        }
        this.mobileMenuBtn?.setAttribute('aria-expanded', 'false');
        const icon = this.mobileMenuBtn?.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = 'menu';
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const headerHeight = this.header?.offsetHeight || 80;
            const targetPosition = section.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// ============================================
// SCROLL TO SECTION FUNCTION
// ============================================

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.getElementById('header')?.offsetHeight || 80;
        const targetPosition = section.offsetTop - headerHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// ============================================
// NOTIFICATION STYLES (injected)
// ============================================

function injectNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(145deg, #111111 0%, #1a1a1a 100%);
            color: var(--text-white);
            padding: 20px 28px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 14px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(255, 102, 0, 0.2);
            transform: translateX(450px);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 3000;
            border-left: 4px solid;
            min-width: 320px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .notification.show {
            transform: translateX(0);
        }

        .notification-success {
            border-left-color: var(--success);
        }

        .notification-warning {
            border-left-color: #FFD600;
        }

        .notification-info {
            border-left-color: var(--primary-orange);
        }

        .notification .material-symbols-outlined {
            font-size: 28px;
            flex-shrink: 0;
        }

        .notification-success .material-symbols-outlined {
            color: var(--success);
        }

        .notification-warning .material-symbols-outlined {
            color: #FFD600;
        }

        .notification-info .material-symbols-outlined {
            color: var(--primary-orange);
        }
    `;
    document.head.appendChild(style);
}

// ScrollAnimations handled below (enhanced version with reveal classes)

// ============================================
// ANIMATED COUNTERS (Stats Bar)
// ============================================

class AnimatedCounters {
    constructor() {
        this.counters = document.querySelectorAll('.stat-number[data-target]');
        this.hasAnimated = false;
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.hasAnimated = true;
                    this.animateAllCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        const statsSection = document.getElementById('stats-bar');
        if (statsSection) {
            observer.observe(statsSection);
        }
    }

    animateAllCounters() {
        this.counters.forEach(counter => {
            const target = parseFloat(counter.dataset.target);
            const suffix = counter.dataset.suffix || '';
            const duration = 2000;
            const startTime = performance.now();
            const isDecimal = target % 1 !== 0;

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                const currentValue = easedProgress * target;

                if (isDecimal) {
                    counter.textContent = currentValue.toFixed(1) + suffix;
                } else {
                    counter.textContent = Math.floor(currentValue) + suffix;
                }

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
                }
            };

            requestAnimationFrame(updateCounter);
        });
    }
}

// ============================================
// FAQ ACCORDION
// ============================================

class FAQAccordion {
    constructor() {
        this.faqItems = document.querySelectorAll('.faq-item');
        this.init();
    }

    init() {
        if (this.faqItems.length === 0) return;

        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => {
                    this.toggleItem(item, question);
                });

                question.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleItem(item, question);
                    }
                });
            }
        });
    }

    toggleItem(item, question) {
        const isActive = item.classList.contains('active');
        const answer = item.querySelector('.faq-answer');

        this.faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
                const otherQuestion = otherItem.querySelector('.faq-question');
                if (otherQuestion) {
                    otherQuestion.setAttribute('aria-expanded', 'false');
                }
            }
        });

        if (isActive) {
            item.classList.remove('active');
            question.setAttribute('aria-expanded', 'false');
        } else {
            item.classList.add('active');
            question.setAttribute('aria-expanded', 'true');
        }
    }
}

// ============================================
// CONTACT INFO CLICK TO COPY
// ============================================

class ContactInfo {
    constructor() {
        this.init();
    }

    init() {
        // Only initialize on contact page where info-items exist
        const infoItems = document.querySelectorAll('.contact-info .info-item');
        if (infoItems.length === 0) return;

        infoItems.forEach(item => {
            // Don't add click handler if it's already a link
            if (item.tagName === 'A') return;

            item.style.cursor = 'pointer';

            const handleClick = () => {
                const text = item.querySelector('p')?.textContent || '';
                if (text) {
                    this.copyToClipboard(text);
                }
            };

            item.addEventListener('click', handleClick);
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            });

            item.title = 'Click para copiar';
        });
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification(`${text} copiado al portapapeles`, 'success');
        }).catch(() => {
            try {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                this.showNotification(`${text} copiado al portapapeles`, 'success');
            } catch (e) {
                console.error('Copy to clipboard failed:', e);
            }
        });
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        const iconName = type === 'success' ? 'check_circle' : 'info';
        notification.innerHTML = `
            <span class="material-symbols-outlined" aria-hidden="true">${iconName}</span>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// ============================================
// DEBOUNCE UTILITY
// ============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// INITIALIZE EVERYTHING (Multi-Page Aware)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Inject notification styles
    injectNotificationStyles();

    // Initialize shopping cart (always)
    window.cart = new ShoppingCart();

    // Initialize cart page items if on cart page
    if (getCurrentPage() === 'carrito') {
        window.cart.renderCartPageItems();
    }

    // Initialize contact form (only if form exists)
    if (document.getElementById('contactForm')) {
        window.contactForm = new ContactForm();
    }

    // Initialize platforms modal (only if modal exists)
    if (document.getElementById('platformsModal')) {
        window.platformsModal = new PlatformsModal();
    }

    // Initialize navigation
    window.navigation = new Navigation();

    // Initialize scroll animations (premium reveal system)
    const scrollAnimations = new ScrollAnimations();

    // Initialize scroll progress bar
    const scrollProgress = new ScrollProgressBar();

    // Initialize back to top button
    const backToTop = new BackToTop();

    // Initialize animated counters (only if stats section exists)
    if (document.getElementById('stats-bar')) {
        const animatedCounters = new AnimatedCounters();
    }

    // Initialize FAQ accordion (only if FAQ exists)
    if (document.querySelector('.faq-item')) {
        window.faqAccordion = new FAQAccordion();
    }

    // Initialize contact info
    const contactInfo = new ContactInfo();

    // Initialize premium button ripple effects
    initButtonRipple();

    // Initialize smooth parallax on scroll
    initParallaxEffect();

    // Initialize 3D card tilt effect
    init3DTilt();

    console.log(`🐯 Chinet Web initialized - Page: ${getCurrentPage()}`);

    // Add smooth reveal animation on page load
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 80);
});

// ============================================
// PREMIUM BUTTON RIPPLE EFFECT
// ============================================

function initButtonRipple() {
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.35);
                border-radius: 50%;
                transform: scale(0);
                animation: rippleEffect 0.6s ease-out;
                pointer-events: none;
            `;

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Inject ripple animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleEffect {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// PREMIUM PARALLAX SCROLL EFFECT
// ============================================

function initParallaxEffect() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;

                // Subtle parallax on hero elements
                const heroContent = document.querySelector('.hero-content');
                if (heroContent && scrolled < window.innerHeight) {
                    heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
                    heroContent.style.opacity = 1 - (scrolled / (window.innerHeight * 0.8));
                }

                const heroTiger = document.querySelector('.tiger-mascot');
                if (heroTiger && scrolled < window.innerHeight) {
                    heroTiger.style.transform = `translateY(${scrolled * 0.08}px)`;
                }

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ============================================
// SCROLL PROGRESS BAR
// ============================================

class ScrollProgressBar {
    constructor() {
        this.progressBar = document.getElementById('scrollProgressBar');
        if (!this.progressBar) return;
        this.init();
    }

    init() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollTop = window.pageYOffset;
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                    const scrollPercent = (scrollTop / docHeight) * 100;
                    this.progressBar.style.width = scrollPercent + '%';
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
}

// ============================================
// BACK TO TOP BUTTON
// ============================================

class BackToTop {
    constructor() {
        this.button = document.getElementById('backToTop');
        if (!this.button) return;
        this.init();
    }

    init() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (window.pageYOffset > 500) {
                        this.button.classList.add('visible');
                    } else {
                        this.button.classList.remove('visible');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ============================================
// ENHANCED SCROLL ANIMATIONS (Premium Reveal)
// ============================================

class ScrollAnimations {
    constructor() {
        this.revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // Also add animate-in for backward compatibility
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe reveal elements
        this.revealElements.forEach(el => observer.observe(el));

        // Also observe cards for backward compatibility
        document.querySelectorAll('.service-card, .dev-service-card, .pricing-card, .info-item, .stat-item, .step-card, .testimonial-card, .faq-item').forEach(card => {
            // Only observe if not already a reveal element
            if (!card.classList.contains('reveal') && !card.classList.contains('reveal-left') && !card.classList.contains('reveal-right') && !card.classList.contains('reveal-scale')) {
                observer.observe(card);
            }
        });
    }
}

// ============================================
// 3D CARD TILT EFFECT
// ============================================

function init3DTilt() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const cards = document.querySelectorAll('.service-card, .dev-service-card, .pricing-card, .testimonial-card, .platform-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ============================================
// PREMIUM BUTTON MAGNETIC EFFECT
// ============================================

function initMagneticButtons() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    document.querySelectorAll('.btn-magnetic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

// Make scrollToSection available globally
window.scrollToSection = scrollToSection;

// ============================================
// WHATSAPP SERVICE QUERY (Consultar botón)
// ============================================

function initiateWhatsAppServiceQuery(btn) {
    const card = btn.closest('.dev-service-card');
    if (!card) return;

    const serviceName = card.querySelector('h3')?.textContent || '';
    const servicePrice = card.querySelector('.service-price')?.textContent || '';

    const message = `¡Hola! Me interesa el servicio: ${serviceName}\nPrecio: ${servicePrice}`;
    const whatsappUrl = `https://wa.me/51956131320?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function initiateWhatsAppGenericQuery() {
    const message = `¡Hola! Me interesa un servicio que no veo en la lista. ¿Podrías ayudarme?`;
    const whatsappUrl = `https://wa.me/51956131320?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Botón consultar privado - asegurar que funcione
document.addEventListener('click', function(e) {
    if (e.target.closest('a[href*="wa.me"]')) {
        return true;
    }
});

window.consultarPrivado = function() {
    window.open('https://wa.me/51956131320?text=%C2%A1Hola!%20Me%20interesa%20un%20servicio%20que%20no%20veo%20en%20la%20lista.%20%C2%BFPodr%C3%ADas%20ayudarme?', '_blank');
};

// Función global para filtrar por categoría
window.filterByCategory = function(category, btn) {
    document.querySelectorAll('.platform-cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const searchTerm = document.getElementById('platformSearch')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('.platform-card');

    cards.forEach(card => {
        const name = card.dataset.name?.toLowerCase() || '';
        const cardCategory = card.dataset.category || '';
        const matchesSearch = name.includes(searchTerm);
        const matchesCategory = category === 'all' || cardCategory === category;

        if (matchesSearch && matchesCategory) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
};


