document.addEventListener('DOMContentLoaded', () => {
    const cartIcon = document.getElementById('cart-icon');
    const cartSidebar = document.getElementById('cart-sidebar');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutButton = document.querySelector('.checkout-button');

    const closeSidebarBtn = document.querySelector('.close-sidebar-btn');
    const cartOverlay = document.createElement('div');
    cartOverlay.classList.add('cart-overlay');
    document.body.appendChild(cartOverlay);

    let cart = [];

    // Tenta carregar o carrinho do armazenamento local ao carregar a página
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        renderCart();
    }

    // Função para mostrar ou esconder o carrinho
    function toggleCart() {
        cartSidebar.classList.toggle('active');
        cartOverlay.classList.toggle('active');
    }

    // Mostra/Esconde o carrinho lateral
    cartIcon.addEventListener('click', toggleCart);
    
    // Fecha a barra lateral quando o botão X ou o overlay são clicados
    closeSidebarBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    // Adiciona o item ao carrinho
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const item = e.target.closest('.item');
            const itemName = item.dataset.name;
            const itemPrice = parseFloat(item.dataset.price);

            const existingItem = cart.find(cartItem => cartItem.name === itemName);

            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    name: itemName,
                    price: itemPrice,
                    quantity: 1
                });
            }

            saveCart();
            renderCart();
        });
    });

    // Salva o carrinho no armazenamento local
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Renderiza os itens no carrinho
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">O seu carrinho está vazio.</p>';
            cartCount.textContent = '0';
            cartTotalPrice.textContent = '0.00';
            return;
        }

        cart.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.innerHTML = `
                <p>${item.name} (x${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2)}</p>
                <div class="cart-item-actions">
                    <button class="btn-minus" data-name="${item.name}">-</button>
                    <button class="btn-plus" data-name="${item.name}">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
            total += item.price * item.quantity;
        });

        cartCount.textContent = cart.length;
        cartTotalPrice.textContent = total.toFixed(2);

        // Adiciona os event listeners para os botões de + e -
        document.querySelectorAll('.btn-plus').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemName = e.target.dataset.name;
                const item = cart.find(i => i.name === itemName);
                item.quantity++;
                saveCart();
                renderCart();
            });
        });

        document.querySelectorAll('.btn-minus').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemName = e.target.dataset.name;
                const itemIndex = cart.findIndex(i => i.name === itemName);
                if (cart[itemIndex].quantity > 1) {
                    cart[itemIndex].quantity--;
                } else {
                    cart.splice(itemIndex, 1);
                }
                saveCart();
                renderCart();
            });
        });
    }
    
    // Redireciona para a página de checkout
    checkoutButton.addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });
});