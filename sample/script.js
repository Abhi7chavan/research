// Sample products data (static)
const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 79.99,
        description: "High-quality wireless headphones with noise cancellation"
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 199.99,
        description: "Feature-rich smartwatch with health monitoring"
    },
    {
        id: 3,
        name: "Laptop Stand",
        price: 39.99,
        description: "Ergonomic laptop stand for better posture"
    },
    {
        id: 4,
        name: "USB-C Hub",
        price: 49.99,
        description: "Multi-port USB-C hub with HDMI and SD card slots"
    },
    {
        id: 5,
        name: "Wireless Mouse",
        price: 29.99,
        description: "Precision wireless mouse with ergonomic design"
    },
    {
        id: 6,
        name: "Portable Charger",
        price: 34.99,
        description: "High-capacity portable charger for all devices"
    }
];

let cart = [];

// Load products when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
});

function loadProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="price">$${product.price}</div>
            <button onclick="addToCart(${product.id})" class="add-to-cart-btn">
                Add to Cart
            </button>
        `;
        grid.appendChild(productCard);
    });
}

function setupEventListeners() {
    // Cart button
    document.getElementById('cart-btn').addEventListener('click', openCart);
    
    // Close modal
    document.querySelector('.close').addEventListener('click', closeCart);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('cart-modal');
        if (event.target === modal) {
            closeCart();
        }
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}

function updateCartQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    updateCartModal();
}

function updateCartModal() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    cartItems.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666;">Your cart is empty</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div>
                    <strong>${item.name}</strong><br>
                    <small>$${item.price} each</small>
                </div>
                <div style="text-align: right;">
                    <div style="margin-bottom: 5px;">
                        <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})" style="background: #e74c3c; color: white; border: none; width: 25px; height: 25px; border-radius: 3px; cursor: pointer;">-</button>
                        <span style="margin: 0 10px; font-weight: bold;">${item.quantity}</span>
                        <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})" style="background: #27ae60; color: white; border: none; width: 25px; height: 25px; border-radius: 3px; cursor: pointer;">+</button>
                    </div>
                    <div style="font-weight: bold;">$${itemTotal.toFixed(2)}</div>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
    }
    
    cartTotal.textContent = total.toFixed(2);
}

function openCart() {
    updateCartModal();
    document.getElementById('cart-modal').style.display = 'block';
}

function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`Thank you for your order! Total: $${total.toFixed(2)}\n\nThis is a demo checkout. In a real store, you would be redirected to payment processing.`);
    
    cart = [];
    updateCartDisplay();
    closeCart();
}

function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
