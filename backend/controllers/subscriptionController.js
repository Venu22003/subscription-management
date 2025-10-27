const Subscription = require("../models/Subscription");
const PaymentHistory = require("../models/PaymentHistory");

function calculateNextPaymentDate(startDate, frequency) {
  const date = new Date(startDate);
  const freq = frequency.toLowerCase();
  
  if (freq === "monthly") {
    date.setMonth(date.getMonth() + 1);
  } else if (freq === "yearly") {
    date.setFullYear(date.getFullYear() + 1);
  } else if (freq === "weekly") {
    date.setDate(date.getDate() + 7);
  }
  return date;
}

async function addSubscription(req, res) {
  try {
    const { name, price, cost, category, billingCycle, frequency, startDate, nextBillingDate, nextPaymentDate, receipt, notes, description } = req.body;
    const userId = req.user.userId;

    console.log('Received subscription data:', req.body);

    // Support both old (cost/frequency/nextPaymentDate) and new (price/billingCycle/nextBillingDate) field names
    const actualPrice = price || cost;
    const actualBillingCycle = billingCycle || frequency;
    const actualNextBillingDate = nextBillingDate || nextPaymentDate;
    const actualNotes = notes || description || "";

    // Validate required fields
    if (!name || !actualPrice || !category || !actualBillingCycle) {
      return res.status(400).json({ 
        message: "Missing required fields",
        required: { name, price: actualPrice, category, billingCycle: actualBillingCycle },
        received: req.body
      });
    }

    // Use provided nextBillingDate or calculate it
    let finalNextBillingDate = actualNextBillingDate;
    if (!finalNextBillingDate) {
      finalNextBillingDate = calculateNextPaymentDate(
        startDate || new Date(),
        actualBillingCycle
      );
    }

    const subscription = new Subscription({
      user: userId,
      name,
      price: parseFloat(actualPrice),
      category,
      billingCycle: actualBillingCycle.toLowerCase(),
      startDate: startDate || new Date(),
      nextBillingDate: finalNextBillingDate,
      receipt: receipt || null,
      notes: actualNotes,
      description: actualNotes,
    });

    await subscription.save();
    console.log('Subscription saved successfully:', subscription);

    return res.status(201).json({
      message: "Subscription added successfully",
      subscription,
    });
  } catch (err) {
    console.error('Error adding subscription:', err);
    return res.status(500).json({ message: err.message });
  }
}

async function getAllSubscriptions(req, res) {
  try {
    const userId = req.user.userId;
    const subscriptions = await Subscription.find({ user: userId })
      .sort({ createdAt: -1 });

    return res.status(200).json(subscriptions);
  } catch (err) {
    console.error('Error getting subscriptions:', err);
    return res.status(500).json({ message: err.message });
  }
}

async function getSubscriptionById(req, res) {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    return res.status(200).json(subscription);
  } catch (err) {
    console.error('Error getting subscription:', err);
    return res.status(500).json({ message: err.message });
  }
}

async function updateSubscription(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log('Updating subscription:', id, updates);

    // Handle field name compatibility
    if (updates.cost) updates.price = updates.cost;
    if (updates.frequency) updates.billingCycle = updates.frequency;
    if (updates.nextPaymentDate) updates.nextBillingDate = updates.nextPaymentDate;
    if (updates.description && !updates.notes) updates.notes = updates.description;

    // Calculate next billing date if billing cycle or start date changed
    if (updates.billingCycle || updates.startDate || updates.frequency) {
      const currentSub = await Subscription.findById(id);
      const billingCycle = updates.billingCycle || updates.frequency || currentSub.billingCycle;
      updates.nextBillingDate = calculateNextPaymentDate(
        updates.startDate || currentSub.startDate,
        billingCycle
      );
    }

    if (updates.billingCycle) {
      updates.billingCycle = updates.billingCycle.toLowerCase();
    }
    if (updates.frequency) {
      updates.billingCycle = updates.frequency.toLowerCase();
      delete updates.frequency;
    }

    const subscription = await Subscription.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    console.log('Subscription updated:', subscription);

    return res.status(200).json({
      message: "Subscription updated successfully",
      subscription,
    });
  } catch (err) {
    console.error('Error updating subscription:', err);
    return res.status(500).json({ message: err.message });
  }
}

async function deleteSubscription(req, res) {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findByIdAndDelete(id);

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    return res.status(200).json({ message: "Subscription deleted successfully" });
  } catch (err) {
    console.error('Error deleting subscription:', err);
    return res.status(500).json({ message: err.message });
  }
}

async function duplicateSubscription(req, res) {
  try {
    const { id } = req.params;
    const original = await Subscription.findById(id);

    if (!original) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const duplicate = new Subscription({
      user: original.user,
      name: `${original.name} (Copy)`,
      price: original.price,
      category: original.category,
      billingCycle: original.billingCycle,
      startDate: new Date(),
      nextBillingDate: calculateNextPaymentDate(new Date(), original.billingCycle),
      receipt: original.receipt,
      notes: original.notes,
      description: original.description,
    });

    await duplicate.save();

    return res.status(201).json({
      message: "Subscription duplicated successfully",
      subscription: duplicate,
    });
  } catch (err) {
    console.error('Error duplicating subscription:', err);
    return res.status(500).json({ message: err.message });
  }
}

async function markAsPaid(req, res) {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;
    const userId = req.user.userId;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Check if subscription belongs to the user
    if (subscription.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized access to subscription" });
    }

    // Prevent duplicate payments within 10 seconds (double-click protection)
    if (subscription.lastPaymentDate) {
      const timeSinceLastPayment = Date.now() - new Date(subscription.lastPaymentDate).getTime();
      if (timeSinceLastPayment < 10000) { // 10 seconds
        return res.status(400).json({ 
          message: "Payment already recorded recently. Please wait a moment.",
          subscription 
        });
      }
    }

    // Check if there's already a payment for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingTodayPayment = await PaymentHistory.findOne({
      subscription: subscription._id,
      user: userId,
      paidDate: { $gte: today }
    });

    if (existingTodayPayment) {
      return res.status(400).json({ 
        message: "Payment already recorded for today",
        subscription,
        payment: existingTodayPayment
      });
    }

    const currentDate = new Date();

    // Record payment history
    const payment = new PaymentHistory({
      subscription: subscription._id,
      user: userId,
      amount: subscription.price,
      paymentMethod: paymentMethod || "Manual",
      paidDate: currentDate,
    });
    await payment.save();

    // Update subscription statistics
    subscription.paymentCount = (subscription.paymentCount || 0) + 1;
    subscription.totalSpent = (subscription.totalSpent || 0) + subscription.price;
    subscription.lastPaymentDate = currentDate;
    
    // Calculate next billing date
    subscription.nextBillingDate = calculateNextPaymentDate(
      subscription.nextBillingDate || currentDate,
      subscription.billingCycle
    );
    
    // Update status to active if it was something else
    if (subscription.status !== 'active') {
      subscription.status = 'active';
    }

    await subscription.save();

    return res.status(200).json({
      message: "Payment recorded successfully",
      subscription,
      payment,
    });
  } catch (err) {
    console.error('Error marking as paid:', err);
    return res.status(500).json({ message: err.message });
  }
}

async function getPaymentHistory(req, res) {
  try {
    const userId = req.user.userId;
    const history = await PaymentHistory.find({ user: userId })
      .populate("subscription")
      .sort({ paidDate: -1 });

    return res.status(200).json(history);
  } catch (err) {
    console.error('Error getting payment history:', err);
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  addSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  duplicateSubscription,
  markAsPaid,
  getPaymentHistory,
};