/* eslint-disable prettier/prettier */
import {
  Column,
  CreatedAt,
  HasMany,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { ChatMessage } from './chat-message.entity';
import { Chat } from './chat.entity';

@Table({ tableName: 'contacts', createdAt: 'created_at', updatedAt: 'updated_at' })
export class Contact extends ModelBase {
  @Column
  name: string;

  @Column({ unique: true })
  number: string;

  @Column({ field: 'profile_pic_url' })
  profilePicUrl: string;

  @Column({ field: 'is_group' })
  isGroup: boolean;

  @HasMany(() => Chat)
  chats: ChatMessage[];
}
