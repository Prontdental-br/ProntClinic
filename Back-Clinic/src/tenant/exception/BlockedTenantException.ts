import { HttpException, HttpStatus } from '@nestjs/common';

export class BlockedTenantException extends HttpException {
  constructor() {
    super('Blocked Account', HttpStatus.FORBIDDEN);
  }
}
