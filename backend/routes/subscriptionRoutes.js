const express = require("express");
const router = express.Router();
const {
    addSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription,
    duplicateSubscription,
    markAsPaid,
    getPaymentHistory,
} = require("../controllers/subscriptionController");
const { validateToken } = require("../middleware/auth");

router.post("/", validateToken, addSubscription);
router.get("/", validateToken, getAllSubscriptions);
router.get("/:id", validateToken, getSubscriptionById);
router.put("/:id", validateToken, updateSubscription);
router.delete("/:id", validateToken, deleteSubscription);
router.post("/:id/duplicate", validateToken, duplicateSubscription);
router.post("/:id/mark-paid", validateToken, markAsPaid);
router.get("/history/payments", validateToken, getPaymentHistory);

module.exports = router;