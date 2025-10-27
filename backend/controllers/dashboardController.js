const Subscription = require("../models/Subscription");

async function getDashboardStats(req, res) {
  try {
    const userId = req.user.userId;

    const subscriptions = await Subscription.find({ user: userId });

    const totalMonthly = subscriptions.reduce((sum, sub) => {
      const freq = (sub.billingCycle || sub.frequency || 'monthly').toLowerCase();
      const cost = sub.price || sub.cost || 0;
      
      if (freq === "monthly") return sum + cost;
      if (freq === "yearly") return sum + cost / 12;
      if (freq === "weekly") return sum + (cost * 52) / 12;
      if (freq === "quarterly") return sum + cost / 3;
      if (freq === "daily") return sum + cost * 30;
      return sum;
    }, 0);

    const totalYearly = totalMonthly * 12;

    // Category breakdown using category IDs
    const categoryBreakdown = {};
    subscriptions.forEach((sub) => {
      const catId = sub.category;
      if (!categoryBreakdown[catId]) {
        categoryBreakdown[catId] = 0;
      }
      const freq = (sub.billingCycle || sub.frequency || 'monthly').toLowerCase();
      const cost = sub.price || sub.cost || 0;
      let monthlyCost = cost;
      
      if (freq === "yearly") monthlyCost = cost / 12;
      if (freq === "weekly") monthlyCost = (cost * 52) / 12;
      if (freq === "quarterly") monthlyCost = cost / 3;
      if (freq === "daily") monthlyCost = cost * 30;
      
      categoryBreakdown[catId] += monthlyCost;
    });

    const topSubscriptions = subscriptions
      .map((sub) => {
        const freq = (sub.billingCycle || sub.frequency || 'monthly').toLowerCase();
        const cost = sub.price || sub.cost || 0;
        let monthlyCost = cost;
        
        if (freq === "yearly") monthlyCost = cost / 12;
        if (freq === "weekly") monthlyCost = (cost * 52) / 12;
        if (freq === "quarterly") monthlyCost = cost / 3;
        if (freq === "daily") monthlyCost = cost * 30;
        
        return { ...sub.toObject(), monthlyCost };
      })
      .sort((a, b) => b.monthlyCost - a.monthlyCost)
      .slice(0, 5);

    const now = new Date();
    const upcomingPayments = subscriptions
      .filter((sub) => {
        const nextDate = sub.nextBillingDate || sub.nextPaymentDate;
        return nextDate && new Date(nextDate) > now;
      })
      .sort((a, b) => {
        const dateA = new Date(a.nextBillingDate || a.nextPaymentDate);
        const dateB = new Date(b.nextBillingDate || b.nextPaymentDate);
        return dateA - dateB;
      })
      .slice(0, 5);

    return res.status(200).json({
      totalMonthly: totalMonthly.toFixed(2),
      totalYearly: totalYearly.toFixed(2),
      totalSubscriptions: subscriptions.length,
      categoryBreakdown,
      topSubscriptions,
      upcomingPayments,
    });
  } catch (err) {
    console.error('Error getting dashboard stats:', err);
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getDashboardStats,
};