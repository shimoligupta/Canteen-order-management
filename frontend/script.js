// ================= MENU DATA =================

const menuItems = [
    {
        name: "Burger",
        price: 80,
        category: "Fast Food",
        icon: "🍔"
    },
    {
        name: "Pizza",
        price: 150,
        category: "Fast Food",
        icon: "🍕"
    },
    {
        name: "Sandwich",
        price: 60,
        category: "Snacks",
        icon: "🥪"
    },
    {
        name: "Momos",
        price: 70,
        category: "Snacks",
        icon: "🥟"
    },
    {
        name: "Cold Drink",
        price: 40,
        category: "Beverages",
        icon: "🥤"
    },
    {
        name: "Coffee",
        price: 50,
        category: "Beverages",
        icon: "☕"
    }
];


// ================= ORDER =================

let order = {};


// ================= DISPLAY MENU =================

function displayMenu(items = menuItems) {

    const menuContainer = document.getElementById("menu-container");

    menuContainer.innerHTML = "";

    items.forEach((item, index) => {

        const quantity = order[item.name] || 0;

        const card = document.createElement("div");

        card.className = "food-card";

        card.innerHTML = `
            
            <div class="food-image">
                ${item.icon}
            </div>

            <h3>${item.name}</h3>

            <div class="food-category">
                ${item.category}
            </div>

            <div class="food-price">
                ₹${item.price}
            </div>

            <div class="quantity-control">

                <button 
                    class="quantity-btn"
                    onclick="changeQuantity('${item.name}', -1)"
                >
                    −
                </button>

                <span class="quantity-value">
                    ${quantity}
                </span>

                <button 
                    class="quantity-btn"
                    onclick="changeQuantity('${item.name}', 1)"
                >
                    +
                </button>

            </div>

            <button 
                class="add-btn"
                onclick="addToOrder('${item.name}')"
            >
                Add to Order
            </button>

        `;

        menuContainer.appendChild(card);
    });
}


// ================= CHANGE QUANTITY =================

function changeQuantity(itemName, change) {

    let currentQuantity = order[itemName] || 0;

    currentQuantity += change;

    if (currentQuantity < 0) {
        currentQuantity = 0;
    }

    order[itemName] = currentQuantity;

    if (currentQuantity === 0) {
        delete order[itemName];
    }

    displayMenu();
    displayOrder();
}


// ================= ADD TO ORDER =================

function addToOrder(itemName) {

    order[itemName] = (order[itemName] || 0) + 1;

    displayMenu();
    displayOrder();

    showAddedMessage(itemName);
}


// ================= CATEGORY FILTER =================

function filterCategory(category) {

    document.querySelectorAll(".category-btn").forEach(button => {
        button.classList.remove("active");
    });

    event.target.classList.add("active");

    if (category === "all") {

        displayMenu(menuItems);

    } else {

        const filteredItems = menuItems.filter(
            item => item.category === category
        );

        displayMenu(filteredItems);
    }
}


// ================= DISPLAY ORDER =================

function displayOrder() {

    const orderContainer = document.getElementById("order-items");

    const orderedItems = Object.keys(order);

    let totalItems = 0;
    let subtotal = 0;

    if (orderedItems.length === 0) {

        orderContainer.innerHTML = `
            <div class="empty-order">

                <div class="empty-icon">
                    🛒
                </div>

                <h3>No items selected</h3>

                <p>
                    Add something delicious from the menu!
                </p>

            </div>
        `;

    } else {

        orderContainer.innerHTML = "";

        orderedItems.forEach(itemName => {

            const item = menuItems.find(
                food => food.name === itemName
            );

            const quantity = order[itemName];

            const itemTotal = item.price * quantity;

            subtotal += itemTotal;
            totalItems += quantity;

            const orderItem = document.createElement("div");

            orderItem.className = "order-item";

            orderItem.innerHTML = `

                <div class="order-item-info">

                    <div class="order-item-icon">
                        ${item.icon}
                    </div>

                    <div>
                        <div class="order-item-name">
                            ${item.name}
                        </div>

                        <div class="order-item-price">
                            ₹${item.price} × ${quantity}
                        </div>
                    </div>

                </div>

                <div>
                    <strong>₹${itemTotal}</strong>

                    <button
                        class="remove-btn"
                        onclick="removeItem('${item.name}')"
                    >
                        Remove
                    </button>
                </div>

            `;

            orderContainer.appendChild(orderItem);
        });
    }


    // ================= BILL =================

    const discount = subtotal * 0.10;

    const total = subtotal - discount;

    document.getElementById("subtotal").textContent =
        `₹${subtotal}`;

    document.getElementById("discount").textContent =
        `₹${discount}`;

    document.getElementById("total").textContent =
        `₹${total}`;

    document.getElementById("item-count").textContent =
        `${totalItems} Items`;
}


// ================= REMOVE ITEM =================

function removeItem(itemName) {

    delete order[itemName];

    displayMenu();
    displayOrder();
}


// ================= SUCCESS MESSAGE =================

function showAddedMessage(itemName) {

    const message = document.getElementById("success-message");

    message.querySelector("h3").textContent =
        `${itemName} added to order!`;

    message.querySelector("p").textContent =
        "Your order has been updated.";

    message.style.display = "flex";

    setTimeout(() => {

        message.style.display = "none";

    }, 1500);
}


// ================= PLACE ORDER =================

async function placeOrder() {

    if (Object.keys(order).length === 0) {

        alert("Please add at least one item to your order.");

        return;
    }

    // Convert order object into backend format
    const orders = Object.entries(order).map(
        ([item, quantity]) => ({
            item: item,
            quantity: quantity
        })
    );

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/order",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    orders: orders
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert("Something went wrong!");

            return;
        }

        // Backend se bill
        const bill = data.bill;

        // ================= RECEIPT ITEMS =================

        const receiptItems =
            document.getElementById("receipt-items");

        receiptItems.innerHTML = "";

        data.orders.forEach(orderItem => {

            const itemName = orderItem[0];
            const quantity = orderItem[1];

            const item = menuItems.find(
                food => food.name === itemName
            );

            const itemTotal = item.price * quantity;

            receiptItems.innerHTML += `
                <div class="receipt-item">

                    <div class="receipt-item-info">

                        <div class="receipt-item-name">
                            ${item.icon} ${itemName}
                        </div>

                        <div class="receipt-item-quantity">
                            ₹${item.price} × ${quantity}
                        </div>

                    </div>

                    <strong>
                        ₹${itemTotal}
                    </strong>

                </div>
            `;
        });

        // ================= RECEIPT BILL =================

        document.getElementById("receipt-subtotal")
            .textContent = `₹${bill.subtotal}`;

        document.getElementById("receipt-discount")
            .textContent = `₹${bill.discount}`;

        document.getElementById("receipt-total")
            .textContent = `₹${bill.total}`;

        // ================= SHOW RECEIPT =================

        document.getElementById("receipt-modal")
            .style.display = "flex";

        // Clear order
        order = {};

        displayMenu();
        displayOrder();

    } catch (error) {

        console.error("Error:", error);

        alert(
            "Cannot connect to the backend. Please make sure FastAPI server is running."
        );
    }
}
// ================= CLOSE RECEIPT =================

function closeReceipt() {

    document.getElementById("receipt-modal")
        .style.display = "none";
}