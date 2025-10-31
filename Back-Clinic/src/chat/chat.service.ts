/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, Scope } from "@nestjs/common";
import { Contact } from "./entities/contact.entity";
import { TenantModel } from "src/common/decorators/tenant.decorators";
import { TenantService } from "src/tenant/tenant/tenant.service";
import { TenantModelService } from "src/tenant/tenant/tenant.serviceModel";
import { ChatMessage } from "./entities/chat-message.entity";
import { Chat } from "./entities/chat.entity";


@Injectable({ scope: Scope.REQUEST })
export class ChatService {
  constructor(
    private tenantService: TenantService,
    private readonly tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Contact)
  private readonly contactModel: typeof Contact;

  @TenantModel(ChatMessage)
  private readonly messageModel: typeof ChatMessage;

  @TenantModel(Chat)
  private readonly chatModel: typeof Chat;

  findAllContacts() {
    return this.contactModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
      },
    });
  }

  findAllMessages() {
    return this.messageModel.findAll({
      
    });
  }

 async clearChat(contactId: string) {
  const chat = await this.chatModel.findOne({
    where: {
      contactId,
    },
  });

  if (!chat) {
    throw new Error('Chat not found');
  }

  await this.messageModel.destroy({
    where: {
      chatId: chat.id,
    },
  });

  await chat.update({ lastMessage: '' });

  return { success: true, message: 'Chat cleared' };
  }

  async removeContact(contactId: string) {
    const contact = await this.contactModel.findOne({
      where: {   
        id: contactId,
        accountId: this.tenantService.tenant.id,
      },
    });
    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }
    await this.chatModel.destroy({
      where: {
        contactId: contact.id,
      },
    });
    await this.messageModel.destroy({
      where: {
        contactId: contact.id,
      },
    });
    await contact.destroy();
  
   return { success: true, message: 'Contact deleted' };
  }
}
