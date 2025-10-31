import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  BadRequestException,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { AppConstant } from 'src/app.constant';
import { QuotePlanGuard } from 'src/quote-plan/quote-plan.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(TenantGuard)
@UseGuards(AccessTokenGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @HttpCode(201)
  @Post()
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get('/count/')
  countPatient() {
    return this.patientsService.countPatients();
  }

  @Get('/birthdays')
  getBirthdays() {
    return this.patientsService.getBirthdays();
  }

  @Get('search/:query?')
  findAll(@Query('query') query?: string) {
    return this.patientsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id).catch((err) => {
      if ((err.name = 'SequelizeEmptyResultError')) {
        throw new BadRequestException(AppConstant.NO_DATA);
      }
    });
  }

  @HttpCode(204)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    this.patientsService.update(id, updatePatientDto);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id') id: string) {
    this.patientsService.remove(id);
  }

  // @HttpCode(204)
  // @UseInterceptors(FileInterceptor('file'))
  // @Post('/import-excel-data/')
  // importExcelData(@UploadedFile() file: Express.Multer.File) {
  //   this.patientsService.importExcelData(file);
  // }
}
