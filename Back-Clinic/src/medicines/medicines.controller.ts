import { Controller, Get, Param } from '@nestjs/common';
import { MedicinesService } from './medicines.service';

@Controller('medicines')
export class MedicinesController {
  constructor(private readonly MedicinesService: MedicinesService) {}

  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.MedicinesService.findByName(name);
  }
}
