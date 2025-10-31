import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpiredSubscriptionException extends HttpException {
  constructor(paymentLink: string, fullPaymentLink: string, amount: number) {
    super(
      {
        message: 'Expired Subscription',
        paymentLink,
        fullPaymentLink,
        amount,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

// export class ExpiredSubscriptionException extends HttpException {
//   constructor(paymentLink: string, fullPaymentLink: string) {
//     super(
//       {
//         message: 'Expired Subscription',
//         paymentLink,
//         fullPaymentLink,
//       },
//       HttpStatus.FORBIDDEN,
//     );
//   }
// }
