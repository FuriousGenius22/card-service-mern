import { Router } from "express";
import { isAuth } from "@/middlewares/auth";
import { createInvoice, createPayment, getPendingPayment, getBalance } from "@/controllers/payment";

const paymentRouter = Router();

paymentRouter.post("/create-invoice", isAuth, createInvoice);
paymentRouter.post("/create-payment", isAuth, createPayment);
paymentRouter.get("/pending/:paymentId", isAuth, getPendingPayment);
paymentRouter.get("/balance", isAuth, getBalance);

export default paymentRouter;

