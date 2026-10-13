/* ==========================================================================
   AbastoSoft - Sistema ERP y Proveedor Agrícola
   Archivo de Lógica Principal Integrado (main.js)
   ========================================================================== */

// Variable global para gestionar el carrito de compras y cotizaciones
let cart = [];

document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------
    // 1. Menú de Hamburguesa para Pantallas Móviles
    // -------------------------------------------------------------
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            
            // Alternar ícono entre barras y X
            const icon = menuToggle.querySelector("i");
            if (icon) {
                if (navLinks.classList.contains("active")) {
                    icon.classList.remove("fa-bars");
                    icon.classList.add("fa-xmark");
                } else {
                    icon.classList.remove("fa-xmark");
                    icon.classList.add("fa-bars");
                }
            }
        });

        // Cerrar menú al hacer clic en un enlace de navegación
        const links = navLinks.querySelectorAll("a");
        links.forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
                const icon = menuToggle.querySelector("i");
                if (icon) {
                    icon.classList.remove("fa-xmark");
                    icon.classList.add("fa-bars");
                }
            });
        });
    }

    // -------------------------------------------------------------
    // 2. Animaciones GSAP & ScrollTrigger
    // -------------------------------------------------------------
    if (typeof gsap !== "undefined") {
        if (typeof ScrollTrigger !== "undefined") {
            gsap.registerPlugin(ScrollTrigger);
        }

        if (document.querySelector(".hero-content")) {
            const tl = gsap.timeline();
            tl.from(".hero-content h1", {
                duration: 1,
                y: 40,
                opacity: 0,
                ease: "power4.out"
            })
            .from(".hero-content p", {
                duration: 0.8,
                y: 20,
                opacity: 0,
                ease: "power3.out"
            }, "-=0.6")
            .from(".hero-btns .btn-primary, .hero-btns .btn-secondary", {
                duration: 0.8,
                y: 20,
                opacity: 0,
                stagger: 0.15,
                ease: "back.out(1.7)"
            }, "-=0.5");
        }

        if (document.querySelector(".hero-image-wrapper")) {
            gsap.from(".hero-image-wrapper", {
                duration: 1.2,
                scale: 0.9,
                opacity: 0,
                delay: 0.3,
                ease: "power3.out"
            });
        }

        if (document.querySelector(".product-card")) {
            gsap.from(".product-card", {
                scrollTrigger: {
                    trigger: ".features-grid",
                    start: "top 95%"
                },
                duration: 0.8,
                y: 40,
                opacity: 0,
                stagger: 0.1,
                ease: "power2.out",
                clearProps: "opacity,transform"
            });
        }

        if (document.querySelector(".feature-card")) {
            gsap.from(".feature-card", {
                scrollTrigger: {
                    trigger: ".features-grid",
                    start: "top 95%"
                },
                duration: 0.8,
                y: 40,
                opacity: 0,
                stagger: 0.1,
                ease: "power2.out",
                clearProps: "opacity,transform"
            });
        }

        if (document.querySelector(".stat-card")) {
            gsap.from(".stat-card", {
                scrollTrigger: {
                    trigger: ".stats-grid",
                    start: "top 95%"
                },
                duration: 0.8,
                y: 30,
                opacity: 0,
                stagger: 0.12,
                ease: "power2.out",
                clearProps: "opacity,transform",
                onComplete: animateCounters
            });
        }
    }

    // -------------------------------------------------------------
    // 3. Efecto 3D Tilt en Tarjetas
    // -------------------------------------------------------------
    const cards = document.querySelectorAll(".product-card, .feature-card, .stat-card");
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            card.style.transform = `perspective(1000px) rotateX(${-y / 15}deg) rotateY(${x / 15}deg) translateY(-8px)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
        });
    });

    // -------------------------------------------------------------
    // 4. Estilo del Header al Hacer Scroll
    // -------------------------------------------------------------
    const header = document.querySelector("header");
    if (header) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 40) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        });
    }

    // Cierre del modal al hacer clic en el fondo oscuro
    window.addEventListener("click", (e) => {
        const modal = document.getElementById("orderModal");
        if (e.target === modal) {
            closeOrderModal();
        }
    });
});

// -------------------------------------------------------------
// 5. Animación de Contadores (Métricas)
// -------------------------------------------------------------
function animateCounters() {
    const counters = document.querySelectorAll(".stat-card h3");
    counters.forEach(counter => {
        const originalText = counter.getAttribute("data-value") || counter.innerText;
        if (!counter.getAttribute("data-value")) {
            counter.setAttribute("data-value", originalText);
        }

        const cleanNumber = originalText.replace(/[^0-9]/g, '');
        if (!cleanNumber || originalText.includes("/")) return;

        const target = parseInt(cleanNumber);
        let count = 0;
        const speed = target / 30;

        const updateCount = () => {
            count += speed;
            if (count < target) {
                let formatted = Math.ceil(count).toString();
                if (originalText.includes("+")) formatted = "+" + formatted;
                if (originalText.includes("%")) formatted = formatted + "%";
                counter.innerText = formatted;
                setTimeout(updateCount, 30);
            } else {
                counter.innerText = originalText;
            }
        };
        updateCount();
    });
}

// -------------------------------------------------------------
// 6. Lógica del Carrito y Cotizaciones
// -------------------------------------------------------------

// Cambiar visualización del precio al seleccionar otra unidad
function updatePrice(productName, selectElem) {
    const [price] = selectElem.value.split('|');
    const priceDisplay = document.getElementById(`price-${productName}`);
    if (priceDisplay) {
        priceDisplay.innerText = `$${parseFloat(price).toFixed(2)}`;
    }
}

// Agregar producto al carrito
function addToCart(productName, evt) {
    const card = evt ? evt.currentTarget.closest('.product-info') : null;
    if (!card) return;

    const selectElem = card.querySelector('.unit-select');
    const [price, unit] = selectElem.value.split('|');
    const numPrice = parseFloat(price);

    const existingIndex = cart.findIndex(item => item.name === productName && item.unit === unit);

    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
            name: productName,
            unit: unit,
            price: numPrice,
            qty: 1
        });
    }

    renderCart();
    toggleCart(true); // Desliza automáticamente el panel del carrito
}

// Modificar cantidad de un ítem en el carrito
function changeQty(index, delta) {
    if (!cart[index]) return;

    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    renderCart();
}

// Renderizar contenido HTML del carrito
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const btnCheckout = document.getElementById('btnCheckout');

    if (!cartItems || !cartCount || !cartTotal || !btnCheckout) return;

    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
    cartCount.innerText = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-msg">El carrito está vacío. Agrega productos para cotizar.</p>';
        cartTotal.innerText = '$0.00';
        btnCheckout.disabled = true;
        return;
    }

    btnCheckout.disabled = false;
    let total = 0;
    let html = '';

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        html += `
            <div class="cart-item">
                <div>
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-unit">${item.unit} - $${item.price.toFixed(2)} c/u</div>
                    <div class="cart-qty-ctrl">
                        <button type="button" onclick="changeQty(${index}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button type="button" onclick="changeQty(${index}, 1)">+</button>
                    </div>
                </div>
                <strong style="color: var(--primary-green);">$${itemTotal.toFixed(2)}</strong>
            </div>
        `;
    });

    cartItems.innerHTML = html;
    cartTotal.innerText = `$${total.toFixed(2)}`;
}

// Abrir o cerrar el panel lateral del carrito
function toggleCart(forceOpen = false) {
    const drawer = document.getElementById('cartDrawer');
    if (!drawer) return;

    if (forceOpen) {
        drawer.classList.add('open');
    } else {
        drawer.classList.toggle('open');
    }
}

// -------------------------------------------------------------
// 7. Lógica del Modal de Formulario / Checkout
// -------------------------------------------------------------

function openCheckoutModal() {
    toggleCart(false); // Oculta el panel lateral del carrito
    const modal = document.getElementById('orderModal');
    const modalSummaryList = document.getElementById('modalSummaryList');
    const modalTotal = document.getElementById('modalTotal');

    if (!modal) return;

    let total = 0;
    let summaryHtml = '';

    cart.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        summaryHtml += `<li>• ${item.qty}x ${item.name} (${item.unit}) - $${subtotal.toFixed(2)}</li>`;
    });

    if (modalSummaryList) modalSummaryList.innerHTML = summaryHtml;
    if (modalTotal) modalTotal.innerText = `$${total.toFixed(2)}`;
    
    modal.style.display = 'flex';
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function submitOrder(e) {
    e.preventDefault();
    alert('¡Cotización enviada con éxito! Un ejecutivo de AbastoSoft se pondrá en contacto contigo a la brevedad.');
    cart = [];
    renderCart();
    closeOrderModal();
}