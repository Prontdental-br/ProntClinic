import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AppConstant } from 'src/app.constant';
@UseGuards(TenantGuard)
@UseGuards(AccessTokenGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('/me')
  me() {
    return this.accountsService.me();
  }

  // @Get('/migrate')
  // migrate() {
  //   return this.accountsService.migrateReserveAccounts();
  // }

  @Get('/status')
  getAccountStatus() {
    return this.accountsService.getAccountStatus();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.accountsService.findOne(id).catch((err) => {
      if ((err.name = 'SequelizeEmptyResultError')) {
        throw new BadRequestException(AppConstant.NO_DATA);
      }
    });
  }

  @HttpCode(204)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    this.accountsService.update(id, updateAccountDto);
  }
}
