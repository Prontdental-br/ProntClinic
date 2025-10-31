/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Whatsapp } from './entities/whatsapp.entity';
import { InjectModel } from '@nestjs/sequelize';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import axios, { AxiosInstance } from 'axios';
import {
  CreateEvolutionInstanceReturn,
  EvolutionInstanceData,
} from './interfaces';
import { randomBytes, randomInt, randomUUID } from 'crypto';
import { EvolutionWebhookDTO } from './dto/evolution-webhook.dto';
import { Op } from 'sequelize';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { SchemasReference } from 'src/schemas_references/entities/schemas_reference.entity';
import { Contact } from 'src/chat/entities/contact.entity';
import { Chat } from 'src/chat/entities/chat.entity';
import { ChatMessage } from 'src/chat/entities/chat-message.entity';
import { WhatsAppGateway } from './whatsapp.gateway';
import { OpportunityTask } from 'src/opportunity/entities/opportunity-tasks.entity';
import { OpportunityColumn } from 'src/opportunity/entities/opportunity-columns.entity';

@Injectable({ scope: Scope.REQUEST })
export class WhatsappService {
  private evolutionApi: AxiosInstance;
  private evolutionApiChat: AxiosInstance;

  constructor(
    private tenantService: TenantService,
    private readonly tenantModelService: TenantModelService,
    private readonly websocketGateway: WhatsAppGateway
  ) {
    this.evolutionApi = axios.create({
      baseURL: process.env.EVOLUTION_API_URL,
    });

    this.evolutionApi.defaults.headers.common['apikey'] =
      process.env.EVOLUTION_API_TOKEN;

    this.evolutionApiChat = axios.create({
      baseURL: process.env.EVOLUTION_API_URL_CHAT,
    });

    this.evolutionApiChat.defaults.headers.common['apikey'] =
      process.env.EVOLUTION_API_TOKEN_CHAT;
  }

  @TenantModel(Whatsapp)
  private readonly whatsappModel: typeof Whatsapp

  @TenantModel(Contact)
  private readonly contactModel: typeof Contact

  @TenantModel(ChatMessage)
  private readonly messageModel: typeof ChatMessage

  @TenantModel(Chat)
  private readonly chatModel: typeof Chat

  @TenantModel(OpportunityTask)
  private readonly taskModel: typeof OpportunityTask

  findAll() {
    const accountId = this.tenantService.tenant?.id;
    
      if (!accountId) {
        throw new NotFoundException('Tenant ID não definido antes da consulta');
      }

    return this.whatsappModel.findAll({
      where: {
        accountId: { [Op.eq]: accountId },
        chatConnected: false,
      },
      order: [['created_at', 'DESC']],
    });
  }

  findAllChat() {
    const accountId = this.tenantService.tenant?.id;
    
      if (!accountId) {
        throw new NotFoundException('Tenant ID não definido antes da consulta');
      }

    return this.whatsappModel.findAll({
      where: {
        accountId: { [Op.eq]: accountId },
        chatConnected: true,
      },
      order: [['created_at', 'DESC']],
    });
  }

  findAllIsConnected() {
    const accountId = this.tenantService.tenant?.id;
    
    if (!accountId) {
      throw new NotFoundException('Tenant ID não definido antes da consulta');
    }
    
    return this.whatsappModel.findAll({
      where: {
        accountId: { [Op.eq]: accountId },
        isConnected: true,
        chatConnected: false
      },
      order: [['created_at', 'DESC']],
    });
  }

  findAllIsConnectedChat() {
    const accountId = this.tenantService.tenant?.id;
    
    if (!accountId) {
      throw new NotFoundException('Tenant ID não definido antes da consulta');
    }
    
    return this.whatsappModel.findOne({
      where: {
        accountId: { [Op.eq]: accountId },
        isConnected: true,
        chatConnected: true,
      },
      order: [['created_at', 'DESC']],
    });
  }


  findAllIsConnectedAdmin() {
    return Whatsapp.findAll({
      where: {
        isConnected: true,
        createdByAdmin: true,
      },
      order: [['created_at', 'DESC']],
    });
  }

  private async sendMessageInEvolution(
    messageContent: string,
    instanceName: string,
    phone: string,
    delay: number,
  ) {
    try {
      const body: any = {
        number: phone,
        text: messageContent,
      };
      if (delay > 0) {
        body.delay = delay;
      }

      await this.evolutionApi.post('/message/sendText/' + encodeURIComponent(instanceName), body);
    } catch (error) {
      console.error(error);
    }
  }

  private async sendMessageInEvolutionChat(
    messageContent: string,
    instanceName: string,
    phone: string,
    delay: number,
  ) {
    try {
      const body: any = {
        number: phone,
        text: messageContent,
      };
      if (delay > 0) {
        body.delay = delay;
      }
     const response = await this.evolutionApiChat.post('/message/sendText/' + encodeURIComponent(instanceName), body);

     return response.data;

    } catch (error) {
      console.error(error);
    }
  }

 async sendAndStoreMessage(messageContent: string, contactId: string, professionalName: string) {

  const accountId = this.tenantService.tenant?.id;
  
  const contact = await this.contactModel.findOne({
    where: {
      id: contactId,
    },
  });

   const chat = await this.chatModel.findOne({
    where: {
      contactId: contact.id,
      // whatsapp_id: msgData.instanceId,
    },
  });

  if (!contact || !contact.number) {
    throw new BadRequestException('Contato não encontrado ou sem telefone.');
  }

  if(!chat) {
    throw new BadRequestException('Chat não encontrado.');
  }

  const userDataWhatsApp = await this.findAllIsConnectedChat();

 const msgData = await this.sendMessageInEvolutionChat(messageContent, userDataWhatsApp.evolutionInstanceName, contact.number, 100);

  const task = await this.taskModel.findOne({
    where: {
      chatId: contact.id,
    },
  });

  if (task && !task.professional) {
    await task.update({ professional: professionalName });
  }

  const message = await this.messageModel.create({

      accountId,
      contactId,
      chatId: chat.id,
      message: messageContent,
      messageId: msgData.key.id,
      fromMe: true,
      status: 'SERVER_ACK',
      type: 'conversation',
      whatsappId: userDataWhatsApp.id,
      timestamp: new Date(msgData.messageTimestamp * 1000),
    
  });

  return message;
}

  async sendMessage(messageContent: string, phone: string, delay = 0) {
    const userData = await this.findAllIsConnected();
    const adminData = await this.findAllIsConnectedAdmin();

    let data: Array<any> = [];

    if (userData.length > 0) {
        data = userData; 
    } else if (adminData.length > 0) {
        data = adminData; 
    } else {
        throw new BadRequestException({
            message: 'Nenhum número de WhatsApp conectado (usuários ou administradores)',
        });
    }

    let messagedSent = false;

    while (!messagedSent) {
        if (data.length < 1) {
            if (userData.length > 0) {
              
                data = [...adminData];
            }
            if (data.length < 1) {
                throw new BadRequestException({
                    message: 'Falha ao enviar a mensagem. Verifique as conexões de WhatsApp.',
                });
            }
        }

        const randomIndex = Math.floor(Math.random() * data.length);
        try {
            const randomInstance = data[randomIndex];
            await this.sendMessageInEvolution(
                messageContent,
                randomInstance.evolutionInstanceName,
                phone,
                delay
            );
            messagedSent = true;
        } catch (error) {
            data.splice(randomIndex, 1); 
        }
    }
  }

  private async createInstanceInEvolution(connectionName: string) {
    try {
      const { data }: { data: CreateEvolutionInstanceReturn } =
        await this.evolutionApi.post('/instance/create', {
          instanceName: connectionName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
          webhook: {
            enabled: true,
            url:
              'https://' + process.env.APP_URL + '/whatsapp/evolution-webhook',
            events: ['CONNECTION_UPDATE', 'CONTACTS_UPDATE'],
          },
        });
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  private async createInstanceInEvolutionChat(connectionName: string) {

    const eventsWebhook = ['CONNECTION_UPDATE', 'CONTACTS_UPDATE', 'CONTACTS_SET', 'SEND_MESSAGE', 'MESSAGES_UPDATE', 'MESSAGES_UPSERT', 'MESSAGES_SET'];

    try {
      const { data }: { data: CreateEvolutionInstanceReturn } =
        await this.evolutionApiChat.post('/instance/create', {
          instanceName: connectionName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
          webhook: {
            enabled: true,
            url:
              'https://' + process.env.APP_URL_CHAT + '/whatsapp/chat/evolution-webhook',
            events: eventsWebhook,
          },
        });
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async create() {
    const usersConnections = await this.findAll();
    if (usersConnections.length > 0) {
      throw new BadRequestException({ message: 'Limite de conexões excedido' });
    }
    
    const clinicName = this.tenantService.tenant.clinic
      ? this.tenantService.tenant.clinic.name
      : undefined;
    console.log('TENANT--------', this.tenantService.tenant.clinic)

    const data = await this.createInstanceInEvolution(
      `${clinicName}_${randomInt(1, 10)}${randomInt(1, 10)}${randomInt(1, 10)}`,
    );
    const accountId = this.tenantService.userTenant.accountId;
    const whatsapp = await this.whatsappModel.create({
      accountId,
      token: data.hash,
      evolutionInstanceId: data.instance.instanceId,
      isConnected: false,
      evolutionInstanceName: data.instance.instanceName,
    });
    
    await SchemasReference.create(
      {
        accountId: this.tenantService.tenant.id,
        id_reference: whatsapp.id,
        id_schema: this.tenantService.tenant.idSeq,
        type: 'whatsapp',
        externalReferences: data.instance.instanceName,
      },
  
    );
    return data.qrcode.base64;
  }

  async createChat() {
    const usersConnections = await this.findAllChat();
    if (usersConnections.length > 0) {
      throw new BadRequestException({ message: 'Limite de conexões excedido pelo chat' });
    }
    
    const clinicName = this.tenantService.tenant.clinic
      ? this.tenantService.tenant.clinic.name
      : undefined;
    
    const data = await this.createInstanceInEvolutionChat(
      `${clinicName}_${randomInt(1, 10)}${randomInt(1, 10)}${randomInt(1, 10)}`,
    );

    console.log('data', data);


    const accountId = this.tenantService.userTenant.accountId;
    const whatsapp = await this.whatsappModel.create({
      accountId,
      token: data.hash,
      evolutionInstanceId: data.instance.instanceId,
      isConnected: false,
      chatConnected: true,
      evolutionInstanceName: data.instance.instanceName,
    });
    
    await SchemasReference.create(
      {
        accountId: this.tenantService.tenant.id,
        id_reference: whatsapp.id,
        id_schema: this.tenantService.tenant.idSeq,
        type: 'whatsapp',
        externalReferences: data.instance.instanceName,
      },
  
    );
    return data.qrcode.base64;
  }


  private async getEvolutionInstanceById(instanceName: string) {
    try {
      const { data }: { data: EvolutionInstanceData[] } =
        await this.evolutionApi.get('/instance/fetchInstances', {
          params: {
            instanceName,
          },
        });
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async getEvolutionInstanceByIdChat() {
    try {

      const whatsappInstanceChat = await this.whatsappModel.findOne({
        where: {
          chatConnected: true,
        },
      });

      if(!whatsappInstanceChat) {
        throw new NotFoundException({ message: 'Nenhuma instância de WhatsApp conectada para chat.' });
      }

      const { data }: { data: EvolutionInstanceData[] } =
        await this.evolutionApiChat.get('/instance/fetchInstances', {
          params: {
            instanceName: whatsappInstanceChat.evolutionInstanceName,
          },
        });
      return data[0];
    } catch (error) {
      console.error(error);
    }
  }

  
async webhookEvolution(data: any) {
  let updateData: any = null;

  switch (data.event) {
    case 'contacts.update': {
      const remoteJid = data?.data?.remoteJid as any;

      if (!remoteJid || typeof remoteJid !== 'string') {
        console.warn(
          'remoteJid não encontrado ou inválido em handleContactUpdate',
        );
        return;
      }

      updateData = {
        phoneNumber: data.sender.split('@')[0],
      };
      break;
    }

    case 'connection.update': {
      updateData = {
        isConnected: data.data.state === 'open',
      };
      break;
    }

    default:
      return;
  }

  // busca schema reference
  const schemaReference = await SchemasReference.findOne({
    where: {
      externalReferences: data.instance,
      type: 'whatsapp',
    },
  });

  if (!schemaReference) {
    throw new NotFoundException(
      `SchemaReference não encontrado para instance=${data.instance}`,
    );
  }

  const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${schemaReference.id_schema}`;
  const WhatsAppModel = Whatsapp.schema(schemaName);

  // busca o registro atual
  const whats = await WhatsAppModel.findOne({
    where: { evolutionInstanceName: data.instance },
  });

  if (!whats) {
    throw new BadRequestException({ message: 'Conexão não encontrada' });
  }

  // compara antes de salvar
  let shouldUpdate = false;

  if (
    updateData.phoneNumber &&
    whats.phoneNumber !== updateData.phoneNumber
  ) {
    whats.phoneNumber = updateData.phoneNumber;
    shouldUpdate = true;
  }

  if (
    typeof updateData.isConnected !== 'undefined' &&
    whats.isConnected !== updateData.isConnected
  ) {
    whats.isConnected = updateData.isConnected;
    shouldUpdate = true;
  }

  if (shouldUpdate) {
    await whats.save();
  }
}

private async handleNewMessage(data: any, schemaName: string, accountId: string, instanceName: string) {
  const remoteJid = data.data?.key?.remoteJid;
  if (remoteJid?.endsWith('@g.us')) return;

  const { data: msgData } = data;
  const contactNumber = msgData.key.remoteJid.replace('@s.whatsapp.net', '');
  const isFromMe = msgData.key.fromMe;

  const MessageModel = ChatMessage.schema(schemaName);
  const existing = await MessageModel.findOne({ where: { messageId: msgData.key.id } });
  if (existing) return;

  const ContactModel = Contact.schema(schemaName);
  const ChatModel = Chat.schema(schemaName);
  const TaskModel = OpportunityTask.schema(schemaName);
  const ColumnModel = OpportunityColumn.schema(schemaName);

  let contact = await ContactModel.findOne({ where: { number: contactNumber } });
  if (!contact && isFromMe) return;

  let isNewContact = false;

  if (!contact && !isFromMe) {
    isNewContact = true;
    contact = await ContactModel.create({
      number: contactNumber,
      name: msgData.pushName,
      isGroup: false,
      accountId,
      profilePicUrl: "",
    });

    const firstColumn = await ColumnModel.findOne({ where: { order: 0 } });
    if (firstColumn) {
      await TaskModel.create({
        title: `Novo contato: ${contact.name || contact.number}`,
        number: contact.number,
        columnId: firstColumn.id,
        order: 0,
        badgeText: ["Novas Oportunidades"],
        comments: '',
        chatId: contact.id,
        dueDate: null,
      });
    } else {
      console.warn('Coluna fixa "Aguardando atuação" não encontrada.');
    }
  }

  let chat = await ChatModel.findOne({ where: { contactId: contact.id } });
  if (!chat) {
    chat = await ChatModel.create({
      contactId: contact.id,
      lastMessage: msgData.message?.conversation || '',
    });
  }

  if (isNewContact) {
    try {
      const response = await this.evolutionApiChat.post(
        `/chat/findMessages/${instanceName}`,
        {
          where: { key: { remoteJid } },
          page: 1,
        }
      );


      let records = response.data?.messages?.records ?? [];

      records = records
        .slice(0, 40)
        .reverse();

      for (const oldMsg of records) {
        const oldMessageId = oldMsg.key?.id;
        if (!oldMessageId) continue;

        const isOldTextMessage = !!oldMsg.message?.conversation;
        if (!isOldTextMessage) continue;

        const alreadyExists = await MessageModel.findOne({ where: { messageId: oldMessageId } });
        if (alreadyExists) continue;

        await MessageModel.create({
          chatId: chat.id,
          contactId: contact.id,
          whatsappId: msgData.instanceId,
          accountId,
          fromMe: oldMsg.key.fromMe,
          message: oldMsg.message?.conversation || '',
          type: 'text',
          messageId: oldMessageId,
          timestamp: new Date(oldMsg.messageTimestamp * 1000),
          status: oldMsg.status || 'sent',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens anteriores:', error);
    }
  }

  const isTextMessage = !!msgData.message?.conversation;
  if (!isTextMessage) return;

  const message = await MessageModel.create({
    chatId: chat.id,
    contactId: contact.id,
    whatsappId: msgData.instanceId,
    accountId,
    fromMe: msgData.key.fromMe,
    message: msgData.message?.conversation || '',
    type: msgData.messageType || 'text',
    messageId: msgData.key.id,
    timestamp: new Date(msgData.messageTimestamp * 1000),
    status: msgData.status || 'sent',
  });

  await chat.update({ lastMessage: message.message });

  this.websocketGateway.emitNewMessage(accountId, message);
}

  private async handleConnectionUpdate(data: EvolutionWebhookDTO, WhatsAppModel: any) {
    const isConnected = data.data?.state === 'open';
    await WhatsAppModel.update(
      { isConnected },
      { where: { evolutionInstanceName: data.instance } },
    );
  }

private async handleContactUpdate(data: any, WhatsAppModel: any, schemaName: string) {
  const remoteJid = data?.data?.remoteJid;

  if (!remoteJid || typeof remoteJid !== 'string') {
    console.warn('remoteJid não encontrado ou inválido em handleContactUpdate');
    return;
  }

  const number = remoteJid.replace('@s.whatsapp.net', '');

  const phoneNumber = typeof data?.sender === 'string' ? data.sender.split('@')[0] : '';

  const ContactModel = Contact.schema(schemaName); 

  const contact = await ContactModel.findOne({ where: { number } });

  if (!contact) {
    console.log(`Contato ${number} não encontrado para atualizar foto.`);
    return;
  }

  await contact.update({
    profilePicUrl: data.data?.profilePicUrl || contact.profilePicUrl,
  });

  console.log(`Contato ${number} atualizado com nova foto e nome.`);

 const whats = await WhatsAppModel.findOne({
    where: { evolutionInstanceName: data.instance },
  });

  if (!whats) {
    console.warn(
      `WhatsApp instance ${data.instance} não encontrada para atualizar número.`,
    );
    return;
  }

  if (phoneNumber && whats.phoneNumber !== phoneNumber) {
    whats.phoneNumber = phoneNumber;
    await whats.save();
    console.log(
      `WhatsApp instance ${data.instance} atualizada com novo número.`,
    );
  }
}

async webhookEvolutionChat(data: EvolutionWebhookDTO) {
  const { event, instance } = data;

  const schemaReference = await SchemasReference.findOne({
    where: {
      externalReferences: instance,
      type: 'whatsapp',
    },
  });

  if (!schemaReference) {
    throw new BadRequestException({ message: 'Schema não encontrado para a instância informada' });
  }

  console.log(data);

  const accountId = schemaReference.accountId;
  const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${schemaReference.id_schema}`;
  const WhatsAppModel = Whatsapp.schema(schemaName);


  switch (event) {
    case 'messages.upsert':
      await this.handleNewMessage(data, schemaName, accountId, instance);
      break;

    case 'connection.update':
      await this.handleConnectionUpdate(data, WhatsAppModel);
      break;

    case 'contacts.update':
      await this.handleContactUpdate(data, WhatsAppModel, schemaName);
      break;

    default:
      console.log(`Evento ${event} ignorado.`);
      break;
  }
}

  async delete(id: string) {
    const instance = await this.whatsappModel.findByPk(id);
    if (instance === null) {
      throw new BadRequestException({ message: 'Conexão não encontrada' });
    }
  
    // Buscar o ID da instância associada
    // const instanceId = await this.getEvolutionInstanceById(instance?.evolutionInstanceName);
    // console.log('Instance ID', instanceId);
  
    try {
      await this.evolutionApi.delete('/instance/delete/' + instance.evolutionInstanceName);
    } catch (error) {
      // if (error.response?.status === 404) {
      //   throw new NotFoundException(`Conexão ${instance.evolutionInstanceName} não encontrada na Evolution API, continuando a exclusão local.`);
      // } 
    }

    await instance.destroy();

    await SchemasReference.destroy({
      where: {  
        id_reference: id,
        type: 'whatsapp',
      },
    });
  }

  async deleteChat(id: string) {
    const instance = await this.whatsappModel.findByPk(id);
    if (instance === null) {
      throw new BadRequestException({ message: 'Conexão não encontrada' });
    }
    
    try {
      await this.evolutionApiChat.delete('/instance/delete/' + instance.evolutionInstanceName);
    } catch (error) {
      if (error.response?.status === 404) {
        // throw new NotFoundException(`Conexão ${instance.evolutionInstanceName} não encontrada na Evolution API, continuando a exclusão local.`);
      } 
    }

    await instance.destroy();

    await SchemasReference.destroy({
      where: {  
        id_reference: id,
        type: 'whatsapp',
      },
    });
  }

  async reconnect(id: string) {
    const instance = await this.whatsappModel.findByPk(id);
    if (instance === null)
      throw new BadRequestException({ message: 'Conexão não encontrada' });
    const { data } = await this.evolutionApi.get(
      '/instance/connect/' + instance.evolutionInstanceName,
    );

    return data.base64;
  }

  async disconnect(id: string) {
    const instance = await this.whatsappModel.findByPk(id);
    if (instance === null)
      throw new BadRequestException({ message: 'Conexão não encontrada' });
    await this.evolutionApi.delete(
      '/instance/logout/' + instance.evolutionInstanceName,
    );
    instance.isConnected = false;
    await instance.save();
    return;
  }

  async disconnectChat(id: string) {
    const instance = await this.whatsappModel.findByPk(id);
    if (instance === null)
      throw new BadRequestException({ message: 'Conexão não encontrada' });
    await this.evolutionApiChat.delete(
      '/instance/logout/' + instance.evolutionInstanceName,
    );
    instance.isConnected = false;
    await instance.save();
    return;
  }
  

  async restart(id: string) {
    const instance = await this.whatsappModel.findByPk(id);
    if (instance === null)
      throw new BadRequestException({ message: 'Conexão não encontrada' });
    await this.evolutionApi.put(
      '/instance/restart/' + instance.evolutionInstanceName,
    );

    return;
  }
}
