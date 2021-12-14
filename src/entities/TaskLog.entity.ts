import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { Task } from './Task.entity';
import { User } from './User.entity';

export enum LOG_TYPE {
  CREATE_DELETE = 'create_delete',
  EDIT_DESCRIPTION = 'edit_description',
  EDIT_TITLE = 'edit_title',
  ASSIGNEE_UPDATE = 'assignee_update',
}

@Entity()
export class TaskLog extends BaseEntity {
  @Enum(() => LOG_TYPE)
  type!: LOG_TYPE;

  @ManyToOne(() => User, {
    nullable: true,
    comment: "The user who's action caused a change on a task",
    onDelete: 'set null',
  })
  user?: User;

  @ManyToOne(() => Task, { onDelete: 'cascade' })
  task: Task;

  @Property({ nullable: true })
  prevValue: string;

  @Property({ nullable: true })
  newValue: string;
}
