/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { WhatsappService } from './whatsapp.service';
import { EvolutionWebhookDTO } from './dto/evolution-webhook.dto';

function normalizePhoneNumber(raw: string): string {
  return '55' + raw.replace(/\D/g, '').replace(/^55/, '');
}

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get()
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  async findAll() {
    const data = await this.whatsappService.findAll();
    const res = data.map(({ id, isConnected, phoneNumber }) => ({
      id,
      isConnected,
      phone: phoneNumber,
    }));

    return { data: res };
  }
  

  @Get('/chat')
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  async findAllChat() {
    const data = await this.whatsappService.findAllChat();
    const res = data.map(({ id, isConnected, phoneNumber }) => ({
      id,
      isConnected,
      phone: phoneNumber,
    }));

    return { data: res };
  }

 @Post('/send-message')
@UseGuards(TenantGuard)
@UseGuards(AccessTokenGuard)
async sendMessageWhatsApp(@Body() body: any) {
  const { message, phone, delay = 0 } = body;

  const sanitizedPhone = normalizePhoneNumber(phone);
  console.log('Sanitized Phone:', sanitizedPhone);

  try {
    await this.whatsappService.sendMessage(message, sanitizedPhone, delay);
    return { success: true, message: 'Mensagem enviada com sucesso!' };
  } catch (error) {
    throw new BadRequestException({
      message: 'Erro ao enviar mensagem',
      error: error?.message || error,
    });
  }
}

  @Get('/chat/profile')
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  async getChatProfile() {
    const data = await this.whatsappService.getEvolutionInstanceByIdChat();
    return data;
  }

  @Get('/reconnect/:id')
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  async reconnect(@Param('id') id: string) {
    const base64 = await this.whatsappService.reconnect(id);
    return { qrCode: base64 };
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  async delete(@Param('id') id: string) {
    await this.whatsappService.delete(id);
    return;
  }

  @Delete('/chat/:id')
  @HttpCode(204)
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  async deleteChat(@Param('id') id: string) {
    await this.whatsappService.deleteChat(id);
    return;
  }

  @Get('/restart/:id')
  @HttpCode(204)
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  async restart(@Param('id') id: string) {
    await this.whatsappService.restart(id);
    return;
  }

  @Get('/disconnect/:id')
  @HttpCode(204)
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  async disconnect(@Param('id') id: string) {
    await this.whatsappService.disconnect(id);
    return;
  }

  @Get('/chat/disconnect/:id')
  @HttpCode(204)
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  async disconnectChat(@Param('id') id: string) {
    await this.whatsappService.disconnectChat(id);
    return;
  }

  @Post()
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  async create() {
    const qrCode = await this.whatsappService.create();
    return { qrCode };
  }

  @Post('/chat')
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  async createChat() {
    const qrCode = await this.whatsappService.createChat();
    return { qrCode };
  }

  @Post('/chat/send-message')
  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
    async sendMessageToContact(
      @Body() body: { to: string; message: string, professionalName: string },
    
    ) {
      return this.whatsappService.sendAndStoreMessage(
        body.message,
        body.to,
        body.professionalName,
      );
    }

  @Post('/evolution-webhook')
  @HttpCode(204)
  async webhook(@Body() webhookDto: EvolutionWebhookDTO) {
    console.log('webhookDto: ', webhookDto);
    await this.whatsappService.webhookEvolution(webhookDto);
  }
  

  @Post('/chat/evolution-webhook')
  @HttpCode(204)
  async webhookChat(@Body() webhookDto: EvolutionWebhookDTO) {
    await this.whatsappService.webhookEvolutionChat(webhookDto);
  }
}
