import { PaymentStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import stripe from "../../lib/stripe";

const CURRENCY = "bdt";

const createCheckoutSession = async (userId: string, bookingId: string) => {
	const booking = await prisma.booking.findUnique({
		where: {
			id: bookingId,
		},
		include: {
			customer: {
				include: {
					user: {
						omit: {
							password: true,
							googleId: true,
						},
					},
				},
			},
			payment: true,
			ambulance: true,
		},
	});

	if (!booking || booking.isDeleted) {
		throw new Error("Booking not found");
	}

	if (booking.customer.userId !== userId || booking.customer.user.isDeleted) {
		throw new Error("You cannot pay for this booking");
	}

	if (!booking.payment) {
		throw new Error("Payment record not found");
	}

	if (booking.payment.status === PaymentStatus.PAID) {
		throw new Error("Booking is already paid");
	}

	const amount = booking.estimatedFare;

	if (amount === null || Number(amount) <= 0) {
		throw new Error("Valid booking fare is not available");
	}

	const session = await stripe.checkout.sessions.create({
		mode: "payment",
		metadata: {
			bookingId: booking.id,
		},
		success_url: `${config.client_base_url}/payment/success`,
		cancel_url: `${config.client_base_url}/payment/cancel`,
		line_items: [
			{
				quantity: 1,
				price_data: {
					currency: CURRENCY,
					unit_amount: Math.round(Number(amount) * 100),
					product_data: {
						name: `Ambulance Booking - ${booking.id}`,
					},
				},
			},
		],
	});

	await prisma.payment.update({
		where: {
			bookingId: booking.id,
		},
		data: {
			transactionId: session.id,
			status: PaymentStatus.PENDING,
		},
	});

	return {
		bookingId: booking.id,
		checkoutUrl: session.url,
		sessionId: session.id,
	};
};

const completePayment = async (bookingId: string, transactionId: string) => {
	const payment = await prisma.payment.findUnique({
		where: {
			bookingId,
		},
	});

	if (!payment || payment.status === PaymentStatus.PAID) {
		return;
	}

	if (payment.transactionId !== transactionId) {
		return;
	}

	await prisma.payment.updateMany({
		where: {
			bookingId,
			transactionId,
			status: PaymentStatus.PENDING,
		},
		data: {
			status: PaymentStatus.PAID,
		},
	});
};

const failPayment = async (bookingId: string, transactionId: string) => {
	await prisma.payment.updateMany({
		where: {
			bookingId,
			transactionId,
			status: PaymentStatus.PENDING,
		},
		data: {
			status: PaymentStatus.FAILED,
		},
	});
};

export const paymentService = {
	createCheckoutSession,
	completePayment,
	failPayment,
};
