import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Coupon from '@/models/Coupon';
import Plan from '@/models/Plan';
import ReferralSignup from '@/models/ReferralSignup';

export async function POST(request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { code, planId } = body;

        if (!code || !planId) {
            return NextResponse.json({ success: false, error: 'Coupon code and plan ID are required' }, { status: 400 });
        }

        await connectDB();

        // Find and validate the coupon
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return NextResponse.json({ success: false, error: 'Invalid coupon code' }, { status: 400 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ success: false, error: 'This coupon is no longer active' }, { status: 400 });
        }

        const now = new Date();
        if (coupon.validFrom && new Date(coupon.validFrom) > now) {
            return NextResponse.json({ success: false, error: 'This coupon is not yet valid' }, { status: 400 });
        }

        if (coupon.validUntil && new Date(coupon.validUntil) < now) {
            return NextResponse.json({ success: false, error: 'This coupon has expired' }, { status: 400 });
        }

        if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({ success: false, error: 'This coupon has reached its usage limit' }, { status: 400 });
        }

        if (coupon.applicablePlanId && coupon.applicablePlanId !== planId) {
            return NextResponse.json({ success: false, error: 'This coupon is not applicable for the selected plan' }, { status: 400 });
        }

        // Get the plan amount (For special offer, default amount is 1799, for 1_month it's 599. Let's fetch from Plan model if it exists, otherwise use fallback)
        let amount = 0;
        const ONE_TIME_PRICES = {
            '1_MONTH': 599,
            'SPECIAL_OFFER': 1799
        };

        if (ONE_TIME_PRICES[planId]) {
            amount = ONE_TIME_PRICES[planId];
        } else {
            const plan = await Plan.findOne({ planId });
            if (plan) {
                amount = plan.amount;
            } else {
                return NextResponse.json({ success: false, error: 'Invalid plan selected' }, { status: 400 });
            }
        }

        if (coupon.minPurchaseAmount > 0 && amount < coupon.minPurchaseAmount) {
            return NextResponse.json({ success: false, error: `Minimum purchase amount of ₹${coupon.minPurchaseAmount} is required` }, { status: 400 });
        }

        // Check if user is a referral user for the 10% discount
        const referralRecord = await ReferralSignup.findOne({ userId, status: 'RECORDED' }).lean();
        const isReferralUser = !!referralRecord;

        let baseAmountForCoupon = amount;
        if (isReferralUser) {
            baseAmountForCoupon = Math.floor(baseAmountForCoupon * 0.9);
        }

        // Calculate discount
        let discountAmount = Math.floor((baseAmountForCoupon * coupon.discountPercent) / 100);
        
        if (coupon.maxDiscountAmount > 0 && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
        }

        const discountedAmount = Math.max(0, baseAmountForCoupon - discountAmount);

        return NextResponse.json({
            success: true,
            originalAmount: amount,
            baseAmount: baseAmountForCoupon,
            discountAmount: discountAmount,
            finalAmount: discountedAmount,
            discountPercent: coupon.discountPercent,
            message: 'Coupon applied successfully!'
        });

    } catch (error) {
        console.error('Error applying coupon:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to apply coupon' },
            { status: 500 }
        );
    }
}
