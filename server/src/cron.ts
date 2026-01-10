import cron from 'node-cron';
import { checkPaymentStatuses } from './utils/paymentStatusChecker';

export const setupCronJobs = () => {
  // Payment status checking: Run every 10 seconds
  cron.schedule('*/10 * * * * *', async () => {
    if (process.env.NOWPAYMENTS_API_KEY) {
      try {
        await checkPaymentStatuses();
      } catch (error: any) {
        console.error('Error in payment status check cron:', error.message);
      }
    }
  });

  console.log('Cron jobs scheduled:');
  console.log('  - Payment status check: every 10 seconds');
};

