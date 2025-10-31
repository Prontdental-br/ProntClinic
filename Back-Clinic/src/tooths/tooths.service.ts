import { Injectable } from '@nestjs/common';
import { CreateToothDto } from './dto/create-tooth.dto';
import { UpdateToothDto } from './dto/update-tooth.dto';

@Injectable()
export class ToothsService {
  create(createToothDto: CreateToothDto) {
    return 'This action adds a new tooth';
  }

  findAll() {
    return `This action returns all tooths`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tooth`;
  }

  update(id: number, updateToothDto: UpdateToothDto) {
    return `This action updates a #${id} tooth`;
  }

  remove(id: number) {
    return `This action removes a #${id} tooth`;
  }
}
