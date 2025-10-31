import { HttpException, HttpStatus } from '@nestjs/common';

export class TenantException extends HttpException {
  constructor() {
    super('Account not found in user login', HttpStatus.PRECONDITION_FAILED);
  }
}
