/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { ChatService } from './chat.service';

@UseGuards(TenantGuard)
@UseGuards(AccessTokenGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/contacts')
  findAllContacts() {
    return this.chatService.findAllContacts();
  }

  @Get('/messages')
  findAllMessages() {
    return this.chatService.findAllMessages();
  }
  
  //   @Patch(':id')
  //   update(@Param('id') id: string, @Body() updateCashDto: UpdateCashDto) {
  //     return this.cashService.update(id, updateCashDto);
  //   }

  @Delete('clear/:contactId')
  async clearChat(@Param('contactId') contactId: string) {
     return this.chatService.clearChat(contactId);
  }

  @Delete('contact/:contactId')
  async removeContact(@Param('contactId') contactId: string) {
     return this.chatService.removeContact(contactId);
  }
}
