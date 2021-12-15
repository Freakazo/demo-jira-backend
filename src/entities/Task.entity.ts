import {
  Collection,
  Entity,
  Index,
  ManyToMany,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { User } from './User.entity';
import { TaskLog } from './TaskLog.entity';

@Entity()
export class Task extends BaseEntity {
  @Property()
  @Index()
  title: string;

  @Property({ length: 5000 })
  description: string;

  // TODO: Add task status

  @ManyToMany(() => User, 'assignedTasks', { owner: true })
  assignedUsers = new Collection<User>(this);

  @OneToMany(() => TaskLog, (taskLog) => taskLog.task)
  logs = new Collection<TaskLog>(this);

  constructor(code: string, title: string, description: string) {
    super();
    this.title = title;
    this.description = description;
  }
}
