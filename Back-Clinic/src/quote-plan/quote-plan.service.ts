import { Injectable } from '@nestjs/common';
import { CreateQuotePlanDto } from './dto/create-quote-plan.dto';
import { UpdateQuotePlanDto } from './dto/update-quote-plan.dto';

@Injectable()
export class QuotePlanService {
  create(createQuotePlanDto: CreateQuotePlanDto) {
    return 'This action adds a new quotePlan';
  }

  findAll() {
    return `This action returns all quotePlan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} quotePlan`;
  }

  update(id: number, updateQuotePlanDto: UpdateQuotePlanDto) {
    return `This action updates a #${id} quotePlan`;
  }

  remove(id: number) {
    return `This action removes a #${id} quotePlan`;
  }
}
