/* eslint-disable prettier/prettier */
import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { Contact } from './contact.entity';
import { ChatMessage } from './chat-message.entity';


@Table({ tableName: 'chats', createdAt: 'created_at', updatedAt: 'updated_at' })
export class Chat extends ModelBase {
  @Column({ defaultValue: '' })
  title: string; 

  @ForeignKey(() => Contact)
  @Column({ field: 'contact_id' })
  contactId: number; 

  @Column({ defaultValue: '', field: 'last_message' })
  lastMessage: string;

  @Column({ defaultValue: false, field: 'is_group' })
  isGroup: boolean; 

  @BelongsTo(() => Contact)
  contact: Contact;

  @HasMany(() => ChatMessage)
  messages: ChatMessage[];
}
