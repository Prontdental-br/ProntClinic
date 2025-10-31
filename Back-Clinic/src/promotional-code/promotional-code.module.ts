import { Module } from '@nestjs/common';
import { PromotionalCodeService } from './promotional-code.service';
import { PromotionalCodeController } from './promotional-code.controller';

@Module({
  controllers: [PromotionalCodeController],
  providers: [PromotionalCodeService]
})
export class PromotionalCodeModule {}
