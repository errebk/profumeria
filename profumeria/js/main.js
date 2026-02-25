document.addEventListener('DOMContentLoaded', () => {
    // --- Header Scroll Effect (Optimized) ---
    const header = document.getElementById('main-header');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // --- Cart State and Logic ---
    let cart = JSON.parse(localStorage.getItem('fragransCart')) || [];

    // DOM Elements
    const cartToggle = document.getElementById('cart-toggle');
    const closeCartBtn = document.getElementById('close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartBadge = document.getElementById('cart-badge');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const addButtons = document.querySelectorAll('.btn-add');
    const checkoutBtn = document.getElementById('btn-checkout');

    // Open Cart
    cartToggle.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        cartSidebar.setAttribute('aria-hidden', 'false');
        cartOverlay.setAttribute('aria-hidden', 'false');
        cartToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        closeCartBtn.focus(); // A11y focus management
    });

    // Close Cart
    const closeCart = () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        cartSidebar.setAttribute('aria-hidden', 'true');
        cartOverlay.setAttribute('aria-hidden', 'true');
        cartToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        cartToggle.focus(); // Return focus
    };

    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Format Number to Euro Currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    // Update Cart UI
    const updateCartUI = () => {
        // Update badge
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        cartBadge.textContent = totalItems;

        // Clear container
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Il carrello è attualmente vuoto.</p>';
            cartTotalPrice.textContent = '€ 0,00';
            checkoutBtn.style.opacity = '0.5';
            checkoutBtn.style.pointerEvents = 'none';
            return;
        }

        checkoutBtn.style.opacity = '1';
        checkoutBtn.style.pointerEvents = 'auto';

        let total = 0;

        // Render each item
        cart.forEach((item, index) => {
            total += item.price * item.qty;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';

            itemEl.innerHTML = `
                <img src="${item.img}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-info">
                    <span class="cart-item-brand">${item.brand}</span>
                    <h4 class="cart-item-title">${item.title}</h4>
                    <span class="cart-item-price">${formatCurrency(item.price)}</span>
                    <div class="cart-item-actions">
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                            <span>${item.qty}</span>
                            <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeItem(${index})">Rimuovi</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        // Update Total
        cartTotalPrice.textContent = formatCurrency(total);

        // Save to localStorage
        localStorage.setItem('fragransCart', JSON.stringify(cart));
    };

    // Add to Cart
    addButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const id = card.dataset.id;
            const price = parseFloat(card.dataset.price);
            const title = card.querySelector('.product-title').textContent;
            const brand = card.querySelector('.brand-name').textContent;
            const img = card.querySelector('.product-img').src;

            const existingItemIndex = cart.findIndex(item => item.id === id);

            if (existingItemIndex > -1) {
                cart[existingItemIndex].qty += 1;
            } else {
                cart.push({ id, title, brand, price, img, qty: 1 });
            }

            updateCartUI();

            // Visual feedback on button
            const originalText = btn.textContent;
            btn.textContent = 'Aggiunto!';
            btn.style.background = 'var(--accent-gold)';
            btn.style.color = 'var(--bg-primary)';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = 'transparent';
                btn.style.color = 'var(--accent-gold)';
            }, 1000);

            // Open cart automatically (optional UX improvement)
            // cartSidebar.classList.add('active');
            // cartOverlay.classList.add('active');
            // document.body.style.overflow = 'hidden';
        });
    });

    // Expose functions to global scope for inline onclick handlers
    window.updateQty = (index, change) => {
        if (cart[index].qty + change > 0) {
            cart[index].qty += change;
        } else {
            removeItem(index);
        }
        updateCartUI();
    };

    window.removeItem = (index) => {
        cart.splice(index, 1);
        updateCartUI();
    };

    // Simulated Checkout
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            alert('Questa è una demo. Grazie per aver simulato il tuo ordine!');
            cart = [];
            localStorage.removeItem('fragransCart');
            updateCartUI();
            closeCart();
        }
    });

    // Initialize UI
    updateCartUI();
});
