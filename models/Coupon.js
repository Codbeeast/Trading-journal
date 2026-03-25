import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        // Discount percentage (e.g. 15 = 15% off)
        discountPercent: {
            type: Number,
            required: true,
            min: 1,
            max: 100,
        },

        // Optional: specific plan this coupon is restricted to (null = all plans)
        // e.g. "1_MONTH", "3_MONTHS", "12_MONTHS"
        applicablePlanId: {
            type: String,
            default: null,
        },

        // Optional max discount cap in paise (0 = no cap)
        maxDiscountAmount: {
            type: Number,
            default: 0,
        },

        // Optional minimum purchase amount in paise to qualify
        minPurchaseAmount: {
            type: Number,
            default: 0,
        },

        // Maximum number of times this coupon can be used (0 = unlimited)
        maxUses: {
            type: Number,
            default: 0,
        },

        // How many times the coupon has been used so far
        usedCount: {
            type: Number,
            default: 0,
        },

        // Coupon validity window
        validFrom: {
            type: Date,
            default: Date.now,
        },

        validUntil: {
            type: Date,
            default: null,
        },

        // Active / inactive toggle
        isActive: {
            type: Boolean,
            default: true,
        },

        // Admin who created it
        createdBy: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Coupon =
    mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

export default Coupon;
