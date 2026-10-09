import type { Request, Response } from "express";
import { z } from "zod";

import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { paymentService } from "./payment.service";
import type Stripe from "stripe";
import stripe from "../../lib/stripe";

const bookingIdParamSchema = z.object({
	id: z.uuid("Invalid booking ID"),
});

export const checkout = catchAsync(async (req: Request, res: Response) => {
	const { id: bookingId } = bookingIdParamSchema.parse(req.params);

	const result = await paymentService.createCheckoutSession(
		req.user!.userId,
		bookingId,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Checkout session created successfully",
		data: result,
	});
});

export const getMyPayments = catchAsync(async (req: Request, res: Response) => {
	const payments = await prisma.payment.findMany({
		where: {
			booking: {
				customer: {
					userId: req.user!.userId,
				},
			},
		},
		include: {
			booking: {
				include: {
					ambulance: true,
					driver: {
						include: {
							user: {
								omit: {
									password: true,
									googleId: true,
								},
							},
						},
					},
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	if (!payments) {
		throw new Error("No payment found");
	}

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Payments retrieved successfully",
		data: { payments },
	});
});

export const webhook = catchAsync(async (req: Request, res: Response) => {
	const signature = req.headers["stripe-signature"];

	if (!signature || Array.isArray(signature)) {
		throw new Error("Missing or invalid Stripe signature");
	}

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(
			req.body,
			signature,
			config.stripe_webhook_secret,
		);
	} catch {
		throw new Error("Invalid webhook signature");
	}

	if (
		event.type === "checkout.session.completed" ||
		event.type === "checkout.session.expired" ||
		event.type === "checkout.session.async_payment_failed"
	) {
		const session = event.data.object as Stripe.Checkout.Session;
		const bookingId = session.metadata?.bookingId;

		if (bookingId) {
			if (
				event.type === "checkout.session.completed" &&
				session.payment_status === "paid"
			) {
				await paymentService.completePayment(bookingId, session.id);
			} else if (
				event.type === "checkout.session.expired" ||
				event.type === "checkout.session.async_payment_failed"
			) {
				await prisma.payment.updateMany({
					where: {
						bookingId,
						status: PaymentStatus.PENDING,
					},
					data: {
						status: PaymentStatus.FAILED,
					},
				});
			}
		}
	}

	res.status(httpStatus.OK).json({ received: true });
});

export const paymentController = {
	checkout,
	getMyPayments,
	webhook,
};
