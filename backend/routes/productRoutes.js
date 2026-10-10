const express = require("express");
const Product = require("../models/Product");

const {
    authMiddleware,
    adminMiddleware
} = require("../middleware/authMiddleware");

const router = express.Router();


// ================= GET ALL PRODUCTS =================

router.get("/", async (req, res) => {
    try {
        const products = await Product.find();

        res.json(products);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to fetch products"
        });
    }
});


// ================= GET SINGLE PRODUCT =================

router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(product);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to fetch product"
        });
    }
});


// ================= ADD PRODUCT =================

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const product = await Product.create(req.body);

            res.status(201).json(product);

        } catch (error) {
            console.log(error);

            res.status(400).json({
                message: "Failed to create product"
            });
        }
    }
);


// ================= UPDATE PRODUCT =================

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const product = await Product.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            res.json(product);

        } catch (error) {
            console.log(error);

            res.status(400).json({
                message: "Failed to update product"
            });
        }
    }
);


// ================= DELETE PRODUCT =================

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const product = await Product.findByIdAndDelete(
                req.params.id
            );

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            res.json({
                message: "Product deleted successfully"
            });

        } catch (error) {
            console.log(error);

            res.status(500).json({
                message: "Failed to delete product"
            });
        }
    }
);


module.exports = router;