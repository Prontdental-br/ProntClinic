import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TokensService } from './tokens.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Post('/reset')
  reset(@Body() createTokenDto: CreateTokenDto) {
    return this.tokensService.reset(createTokenDto);
  }

  @Post('/reset/:userId/:token')
  recover(
    @Param('userId') userId: string,
    @Param('token') token: string,
    @Body() recoverPassword,
  ) {
    return this.tokensService.recover(userId, token, recoverPassword);
  }
}
