// ===============================
// AUTHENTICATION STATE
// ===============================

const token = localStorage.getItem("token");

const user = JSON.parse(
    localStorage.getItem("user")
);


// ===============================
// UPDATE NAVBAR
// ===============================

function updateNavbar() {

    const nav =
        document.querySelector("nav");

    if (!nav) {
        return;
    }


    // ===============================
    // LOGGED IN USER
    // ===============================

    if (token && user) {

        let adminLink = "";

        if (user.role === "admin") {

            adminLink = `
                <a href="admin.html">
                    Admin Panel
                </a>
            `;
        }


        nav.innerHTML = `

            <a href="index.html">
                Products
            </a>

            <a href="cart.html">
                Cart 🛒
            </a>

            <a href="orders.html">
                My Orders
            </a>

            ${adminLink}

            <a
                href="#"
                onclick="logout()"
            >
                Logout
            </a>

        `;
    }


    // ===============================
    // NOT LOGGED IN
    // ===============================

    else {

        nav.innerHTML = `

            <a href="index.html">
                Products
            </a>

            <a href="cart.html">
                Cart 🛒
            </a>

            <a href="login.html">
                Login
            </a>

            <a href="register.html">
                Register
            </a>

        `;
    }
}


// ===============================
// LOGOUT
// ===============================

function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );

    alert(
        "Logout successful!"
    );

    window.location.href =
        "login.html";
}


// ===============================
// RUN
// ===============================

updateNavbar();