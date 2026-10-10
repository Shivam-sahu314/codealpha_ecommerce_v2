function getCart() {

    return JSON.parse(
        localStorage.getItem("cart")
    ) || [];

}


function saveCart(cart) {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

}


function loadCart() {

    const cartItems =
        document.getElementById(
            "cartItems"
        );

    const cartSummary =
        document.getElementById(
            "cartSummary"
        );


    const cart =
        getCart();


    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <h3>
                    Your cart is empty 🛒
                </h3>

                <a href="index.html">
                    Continue Shopping
                </a>

            </div>

        `;


        cartSummary.innerHTML =
            "";


        return;

    }


    cartItems.innerHTML =
        "";


    let total =
        0;


    cart.forEach(
        function(item, index) {

            const product =
                item.product;


            const itemTotal =
                product.price *
                item.quantity;


            total +=
                itemTotal;


            const cartItem =
                document.createElement(
                    "div"
                );


            cartItem.className =
                "cart-item";


            cartItem.innerHTML = `

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >


                <div class="cart-item-info">

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        ₹${product.price}
                    </p>

                    <p>
                        Category:
                        ${product.category}
                    </p>

                </div>


                <div class="cart-quantity">

                    <button
                        onclick="
                            decreaseQuantity(${index})
                        "
                    >
                        −
                    </button>


                    <span>
                        ${item.quantity}
                    </span>


                    <button
                        onclick="
                            increaseQuantity(${index})
                        "
                    >
                        +
                    </button>

                </div>


                <div class="cart-item-total">

                    <p>
                        ₹${itemTotal}
                    </p>


                    <button
                        class="remove-btn"
                        onclick="
                            removeFromCart(${index})
                        "
                    >
                        Remove
                    </button>

                </div>

            `;


            cartItems.appendChild(
                cartItem
            );

        }
    );


    cartSummary.innerHTML = `

        <h2>
            Total:
            ₹${total}
        </h2>


        <button
            class="checkout-btn"
            onclick="goToCheckout()"
        >
            Proceed to Checkout
        </button>

    `;

}


// =====================================
// INCREASE QUANTITY
// =====================================

function increaseQuantity(index) {

    const cart =
        getCart();


    const item =
        cart[index];


    if (
        item.quantity >=
        item.product.stock
    ) {

        alert(
            "Maximum available stock reached"
        );

        return;

    }


    item.quantity++;


    saveCart(cart);


    loadCart();

}


// =====================================
// DECREASE QUANTITY
// =====================================

function decreaseQuantity(index) {

    const cart =
        getCart();


    const item =
        cart[index];


    if (
        item.quantity <= 1
    ) {

        return;

    }


    item.quantity--;


    saveCart(cart);


    loadCart();

}


// =====================================
// REMOVE PRODUCT
// =====================================

function removeFromCart(index) {

    const cart =
        getCart();


    cart.splice(
        index,
        1
    );


    saveCart(cart);


    loadCart();

}


// =====================================
// GO TO CHECKOUT
// =====================================

function goToCheckout() {

    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        alert(
            "Please login before checkout."
        );


        window.location.href =
            "login.html";


        return;

    }


    const cart =
        getCart();


    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );


        return;

    }


    window.location.href =
        "checkout.html";

}


// =====================================
// START
// =====================================

loadCart();