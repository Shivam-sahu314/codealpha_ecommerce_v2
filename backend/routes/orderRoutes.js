const express = require("express");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");

const {
    authMiddleware,
    adminMiddleware
} = require("../middleware/authmiddleware");

const router = express.Router();


// =====================================
// PLACE ORDER
// =====================================

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { products, deliveryDetails, paymentMethod } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        if (
            !deliveryDetails ||
            !deliveryDetails.name ||
            !deliveryDetails.phone ||
            !deliveryDetails.address ||
            !deliveryDetails.city ||
            !deliveryDetails.pincode
        ) {
            return res.status(400).json({
                message: "Delivery details are required"
            });
        }

        const selectedPayment = paymentMethod || "COD";

        if (!["COD", "ONLINE_DEMO"].includes(selectedPayment)) {
            return res.status(400).json({
                message: "Invalid payment method"
            });
        }

        let totalAmount = 0;
        const orderProducts = [];

        // Validate all products before changing stock.
        for (const item of products) {
            if (
                !item.product ||
                !mongoose.isValidObjectId(item.product) ||
                !Number.isInteger(item.quantity) ||
                item.quantity <= 0
            ) {
                return res.status(400).json({
                    message: "Invalid product or quantity"
                });
            }

            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `${product.name} does not have enough stock`
                });
            }

            totalAmount += product.price * item.quantity;

            orderProducts.push({
                product: product._id,
                quantity: item.quantity
            });
        }

        // Demo mode only: no real payment provider is connected.
        const paymentStatus =
            selectedPayment === "ONLINE_DEMO" ? "Paid" : "Pending";

        // Create the order first.
        const order = await Order.create({
            user: req.user.id,
            products: orderProducts,
            deliveryDetails: {
                name: deliveryDetails.name,
                phone: deliveryDetails.phone,
                address: deliveryDetails.address,
                city: deliveryDetails.city,
                pincode: deliveryDetails.pincode
            },
            paymentMethod: selectedPayment,
            paymentStatus,
            totalAmount,
            status: "Pending"
        });

        // Deduct stock after successful order creation.
        // Production systems should use a transaction to prevent race conditions.
        for (const item of orderProducts) {
            const updatedProduct = await Product.findOneAndUpdate(
                {
                    _id: item.product,
                    stock: { $gte: item.quantity }
                },
                {
                    $inc: { stock: -item.quantity }
                },
                {
                    returnDocument: "after"
                }
            );

            if (!updatedProduct) {
                // Cancel the order if stock changed during checkout.
                await Order.findByIdAndDelete(order._id);

                return res.status(409).json({
                    message: "Stock changed. Please refresh your cart and try again."
                });
            }
        }

        res.status(201).json({
            message: "Order placed successfully",
            order
        });
    } catch (error) {
        console.log("PLACE ORDER ERROR:", error);

        res.status(500).json({
            message: "Failed to place order"
        });
    }
});


// =====================================
// MY ORDERS
// =====================================

router.get("/my-orders", authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user.id
        })
            .populate("products.product")
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.log("MY ORDERS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch orders"
        });
    }
});


// =====================================
// ADMIN - ALL ORDERS
// =====================================

router.get(
    "/admin/all",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const orders = await Order.find()
                .populate("user", "name email")
                .populate("products.product")
                .sort({ createdAt: -1 });

            res.json(orders);
        } catch (error) {
            console.log("ADMIN ORDERS ERROR:", error);

            res.status(500).json({
                message: "Failed to fetch all orders"
            });
        }
    }
);


// =====================================
// ADMIN - UPDATE ORDER STATUS
// =====================================

router.put(
    "/admin/:id/status",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const { status } = req.body;

            const allowedStatuses = [
                "Pending",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message: "Invalid order status"
                });
            }

            const order = await Order.findByIdAndUpdate(
                req.params.id,
                { status },
                {
                    returnDocument: "after",
                    runValidators: true
                }
            );

            if (!order) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }

            res.json({
                message: "Order status updated successfully",
                order
            });
        } catch (error) {
            console.log("UPDATE STATUS ERROR:", error);

            res.status(500).json({
                message: "Failed to update order status"
            });
        }
    }
);


// =====================================
// SINGLE ORDER DETAILS
// =====================================

router.get("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid order ID"
            });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        }).populate("products.product");

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.json(order);
    } catch (error) {
        console.log("ORDER DETAILS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch order details"
        });
    }
});

module.exports = router;