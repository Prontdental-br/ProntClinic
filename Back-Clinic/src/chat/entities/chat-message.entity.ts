/* eslint-disable prettier/prettier */
import { BelongsTo, Column, CreatedAt, ForeignKey, Table, UpdatedAt } from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { Whatsapp } from 'src/whatsapp/entities/whatsapp.entity';
import { Contact } from './contact.entity';
import { Chat } from './chat.entity';

@Table({ tableName: 'chat_messages', createdAt: 'created_at', updatedAt: 'updated_at' })
export class ChatMessage extends ModelBase {
  @ForeignKey(() => Chat)
  @Column({ field: 'chat_id' })
  chatId: number;

  @ForeignKey(() => Contact)
  @Column({ field: 'contact_id' })
  contactId: number;

  @ForeignKey(() => Whatsapp)
  @Column({ field: 'whatsapp_id' })
  whatsappId: string;

  @Column({ field: 'from_me' })
  fromMe: boolean; 

  @Column
  message: string;

  @Column
  type:
    | 'text'
    | 'image'
    | 'audio'
    | 'video'
    | 'document'
    | 'location'
    | 'sticker'
    | 'contact'
    | 'button'
    | 'unknown';

  @Column({ allowNull: true, field: 'media_url' })
  mediaUrl: string; 

  @Column({ allowNull: true, field: 'media_mime_type' })
  mediaMimeType: string;

  @Column({ allowNull: true })
  caption: string;

  @Column({ allowNull: true, field: 'file_name' })
  fileName: string;

  @Column({ allowNull: true })
  latitude: string;

  @Column({ allowNull: true })
  longitude: string;

  @Column({ allowNull: true })
  status: string;

  @Column({ field: 'message_id' })
  messageId: string; 

  @Column
  timestamp: Date;

  @BelongsTo(() => Chat)
  chat: Chat;

  @BelongsTo(() => Contact)
  contact: Contact;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;
}
