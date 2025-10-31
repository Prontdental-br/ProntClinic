import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreatePromotionalCodeDto } from './dto/create-promotional-code.dto';
import { UpdatePromotionalCodeDto } from './dto/update-promotional-code.dto';
import { PromotionalCode } from './entities/promotional-code.entity';

@Injectable({ scope: Scope.REQUEST })
export class PromotionalCodeService {
  create(createPromotionalCodeDto: CreatePromotionalCodeDto) {
    return 'This action adds a new promotionalCode';
  }

  findAll() {
    return `This action returns all promotionalCode`;
  }

   async findByName(name: string) {
    const promo = await PromotionalCode.findOne({
      where: { name },
    });

    if (!promo) {
      throw new NotFoundException('Cupom não encontrado');
    }

    // if (promo.validity && promo.validity < new Date()) {
    //   throw new NotFoundException('Cupom expirado');
    // }

    return {
      id: promo.id,
      valid: true,
      discount: promo.percentage, 
      name: promo.name,
    };
  }

  findById(id: string) {
    return PromotionalCode.findOne({
      where: {
        id,
      }
    })
  }

  update(id: number, updatePromotionalCodeDto: UpdatePromotionalCodeDto) {
    return `This action updates a #${id} promotionalCode`;
  }

  remove(id: number) {
    return `This action removes a #${id} promotionalCode`;
  }
}
