const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Subscription name is required"],
      trim: true,
      minlength: [1, "Name must be at least 1 character"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    // Price & Currency
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      length: 3,
    },
    // Billing Information
    billingCycle: {
      type: String,
      required: [true, "Billing cycle is required"],
      enum: {
        values: ["daily", "weekly", "monthly", "quarterly", "yearly"],
        message: "{VALUE} is not a valid billing cycle",
      },
      default: "monthly",
    },
    nextBillingDate: {
      type: Date,
      required: [true, "Next billing date is required"],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: Date,
    // Category & Organization
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    // Status & Management
    status: {
      type: String,
      enum: ["active", "paused", "cancelled", "expired"],
      default: "active",
      index: true,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    reminderDays: {
      type: Number,
      default: 3,
      min: [0, "Reminder days cannot be negative"],
      max: [30, "Reminder days cannot exceed 30"],
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    lastReminderDate: Date,
    // Payment Information
    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "paypal", "bank_transfer", "other"],
    },
    lastFourDigits: String,
    // Additional Information
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    tags: [String],
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    // Analytics & History
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastPaymentDate: Date,
    paymentHistory: [
      {
        amount: Number,
        currency: String,
        date: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["success", "failed", "pending"],
          default: "success",
        },
        transactionId: String,
        receipt: String,
      },
    ],
    // Notifications
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },
    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    deletedAt: Date,
    // Metadata
    metadata: {
      source: String, // How was this subscription added (manual, import, api)
      importedFrom: String,
      lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  },
  {
    timestamps: true,
    collection: "subscriptions",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ user: 1, nextBillingDate: 1 });
subscriptionSchema.index({ user: 1, category: 1 });
subscriptionSchema.index({ user: 1, isDeleted: 1 });
subscriptionSchema.index({ nextBillingDate: 1, status: 1 });
subscriptionSchema.index({ createdAt: -1 });

// Text index for search functionality
subscriptionSchema.index({ name: "text", description: "text", notes: "text" });

// Virtual for days until next billing
subscriptionSchema.virtual("daysUntilBilling").get(function () {
  if (!this.nextBillingDate) return null;
  const now = new Date();
  const diff = this.nextBillingDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for monthly equivalent cost
subscriptionSchema.virtual("monthlyEquivalent").get(function () {
  const multipliers = {
    daily: 30,
    weekly: 4.33,
    monthly: 1,
    quarterly: 1 / 3,
    yearly: 1 / 12,
  };
  return this.price * (multipliers[this.billingCycle] || 1);
});

// Virtual for yearly equivalent cost
subscriptionSchema.virtual("yearlyEquivalent").get(function () {
  const multipliers = {
    daily: 365,
    weekly: 52,
    monthly: 12,
    quarterly: 4,
    yearly: 1,
  };
  return this.price * (multipliers[this.billingCycle] || 1);
});

// Query middleware to exclude soft-deleted subscriptions
subscriptionSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

// Pre-save middleware to update next billing date
subscriptionSchema.pre("save", function (next) {
  if (this.isModified("nextBillingDate") && this.nextBillingDate) {
    this.reminderSent = false;
  }
  next();
});

// Method to calculate next billing date based on cycle
subscriptionSchema.methods.calculateNextBillingDate = function () {
  const current = this.nextBillingDate || new Date();
  const date = new Date(current);

  switch (this.billingCycle) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
};

// Method to add payment to history
subscriptionSchema.methods.addPayment = async function (paymentData) {
  this.paymentHistory.push({
    amount: paymentData.amount || this.price,
    currency: paymentData.currency || this.currency,
    date: paymentData.date || new Date(),
    status: paymentData.status || "success",
    transactionId: paymentData.transactionId,
    receipt: paymentData.receipt,
  });

  // Update analytics
  if (paymentData.status === "success") {
    this.totalSpent += paymentData.amount || this.price;
    this.paymentCount += 1;
    this.lastPaymentDate = paymentData.date || new Date();

    // Calculate next billing date if auto-renew is enabled
    if (this.autoRenew) {
      this.nextBillingDate = this.calculateNextBillingDate();
    }
  }

  // Limit payment history to last 50 entries
  if (this.paymentHistory.length > 50) {
    this.paymentHistory = this.paymentHistory.slice(-50);
  }

  await this.save();
};

// Method to soft delete subscription
subscriptionSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = Date.now();
  this.status = "cancelled";
  await this.save({ validateBeforeSave: false });
};

// Method to restore soft-deleted subscription
subscriptionSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.status = "active";
  await this.save({ validateBeforeSave: false });
};

// Static method to get user's total monthly spending
subscriptionSchema.statics.getTotalMonthlySpending = async function (userId) {
  const subscriptions = await this.find({ user: userId, status: "active" });
  return subscriptions.reduce((total, sub) => total + sub.monthlyEquivalent, 0);
};

// Static method to get user's spending by category
subscriptionSchema.statics.getSpendingByCategory = async function (userId) {
  return await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId), status: "active", isDeleted: { $ne: true } } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        totalSpent: { $sum: "$totalSpent" },
        monthlyTotal: { $sum: "$price" },
      },
    },
    { $sort: { totalSpent: -1 } },
  ]);
};

// Force new schema - no caching
if (mongoose.models.Subscription) {
  delete mongoose.models.Subscription;
}

module.exports = mongoose.model("Subscription", subscriptionSchema);