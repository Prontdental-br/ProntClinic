import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AppConstant } from 'src/app.constant';
import { QuotePlanGuard } from 'src/quote-plan/quote-plan.guard';

@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  //@UseGuards(QuotePlanGuard)
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @HttpCode(201)
  @Post()
  create(@Body() createProfessionalDto: CreateProfessionalDto) {
    return this.professionalsService.create(createProfessionalDto);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @HttpCode(201)
  @Post('admin-professional')
  createAdminProfessional(
    @Body() createProfessionalDto: CreateProfessionalDto,
  ) {
    return this.professionalsService.createAdminProfessional(
      createProfessionalDto,
    );
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get()
  findAll() {
    return this.professionalsService.findAll();
  }

  @Get('/email/:email')
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  findByProfessionalEmail(@Param('email') email: string) {
    return this.professionalsService
      .findByProfessionalEmailWithAccountId(email)
      .catch((err) => {
        if ((err.name = 'SequelizeEmptyResultError')) {
          throw new BadRequestException(AppConstant.NO_DATA);
        }
      });
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.professionalsService.findOne(id).catch((err) => {
      if ((err.name = 'SequelizeEmptyResultError')) {
        throw new BadRequestException(AppConstant.NO_DATA);
      }
    });
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProfessionalDto: UpdateProfessionalDto,
  ) {
    return this.professionalsService
      .update(id, updateProfessionalDto)
      .catch((err) => {
        if ((err.name = 'SequelizeEmptyResultError')) {
          throw new BadRequestException(AppConstant.NO_DATA);
        }
      });
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.professionalsService.remove(id).catch((err) => {
      if ((err.name = 'SequelizeEmptyResultError')) {
        throw new BadRequestException(AppConstant.NO_DATA);
      }
    });
  }
}
