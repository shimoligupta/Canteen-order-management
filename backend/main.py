from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from functools import reduce, wraps
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ============================================================
# 1. DICTIONARY
# Store menu items and their prices
# ============================================================

menu = {
    "Burger": 80,
    "Pizza": 150,
    "Sandwich": 60,
    "Momos": 70,
    "Cold Drink": 40,
    "Coffee": 50
}


# ============================================================
# 2. SET
# Maintain unique food categories
# ============================================================

categories = {
    "Fast Food",
    "Snacks",
    "Beverages"
}


# ============================================================
# 3. FROZEN SET
# Fixed meal codes
# ============================================================

meal_codes = frozenset({
    "M1",
    "M2",
    "M3"
})


# ============================================================
# 4. TUPLE
# Store order details as (Item, Quantity)
# ============================================================

orders = []


# ============================================================
# 5. LAMBDA + MAP
# Apply 10% discount to menu prices
# ============================================================

discounted_prices = list(
    map(lambda price: price * 0.90, menu.values())
)


# ============================================================
# 6. FILTER
# Find food items whose price is <= 80
# ============================================================

def find_items_by_price(max_price):
    return list(
        filter(
            lambda item: item[1] <= max_price,
            menu.items()
        )
    )


# ============================================================
# 7. REDUCE
# Calculate total order amount
# ============================================================

def calculate_total(order_list):

    amounts = list(
        map(
            lambda order: menu[order[0]] * order[1],
            order_list
        )
    )

    total = reduce(
        lambda x, y: x + y,
        amounts,
        0
    )

    return total


# ============================================================
# 8. FUNCTION ALIASING
# Give another name to billing function
# ============================================================

def generate_bill(order_list):

    subtotal = calculate_total(order_list)

    discount = subtotal * 0.10

    final_amount = subtotal - discount

    return {
        "subtotal": subtotal,
        "discount": discount,
        "total": final_amount
    }


billing_function = generate_bill


# ============================================================
# 9. DECORATOR
# Logging order processing
# ============================================================

def logging_decorator(func):

    def wrapper(order_list):

        print("Order processing started.")

        result = func(order_list)

        print("Order processing completed.")

        return result

    return wrapper


# ============================================================
# 10. DECORATOR CHAINING
# Validation + Billing Check
# ============================================================

def validate_order(func):

    def wrapper(order_list):

        if not order_list:
            return {
                "error": "Order cannot be empty."
            }

        for item, quantity in order_list:

            if item not in menu:
                return {
                    "error": f"{item} is not available."
                }

            if quantity <= 0:
                return {
                    "error": "Quantity must be greater than zero."
                }

        return func(order_list)

    return wrapper


def billing_check(func):

    def wrapper(order_list):

        result = func(order_list)

        if "total" in result and result["total"] <= 0:
            return {
                "error": "Invalid billing amount."
            }

        return result

    return wrapper


@logging_decorator
@validate_order
@billing_check
def process_order(order_list):

    bill = billing_function(order_list)

    return bill


# ============================================================
# 11. RECURSIVE FUNCTION
# Process multiple orders recursively
# ============================================================

def process_multiple_orders(order_list, index=0):

    if index >= len(order_list):
        return []

    current_order = order_list[index]

    remaining_orders = process_multiple_orders(
        order_list,
        index + 1
    )

    return [current_order] + remaining_orders


# ============================================================
# FASTAPI ROUTES
# ============================================================

@app.get("/")
def home():

    return {
        "message": "Canteen Order Management System is working!"
    }


# ------------------------------------------------------------
# Display Menu
# ------------------------------------------------------------

@app.get("/menu")
def get_menu():

    return {
        "menu": menu,
        "categories": list(categories),
        "meal_codes": list(meal_codes)
    }


# ------------------------------------------------------------
# Search items using FILTER
# ------------------------------------------------------------

@app.get("/search/{max_price}")
def search_items(max_price: int):

    items = find_items_by_price(max_price)

    return {
        "maximum_price": max_price,
        "items": items
    }


# ------------------------------------------------------------
# Place Order
# ------------------------------------------------------------

@app.post("/order")
def place_order(order_data: dict):

    order_list = []

    for item in order_data.get("orders", []):

        item_name = item.get("item")
        quantity = item.get("quantity")

        # Tuple: (Item, Quantity)
        order_tuple = (item_name, quantity)

        order_list.append(order_tuple)

    # Recursive processing
    processed_orders = process_multiple_orders(order_list)

    # Decorator chain + billing
    result = process_order(processed_orders)

    return {
        "orders": processed_orders,
        "bill": result
    }