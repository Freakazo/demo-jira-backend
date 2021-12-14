import { Collection, Entity, ManyToMany, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { Task } from './Task.entity';

@Entity()
export class User extends BaseEntity {
  @Property({ unique: true })
  username: string;

  @Property({ unique: true })
  email: string;

  @Property()
  password: string;

  // inverse side has to point to the owning side via `mappedBy` attribute/parameter
  @ManyToMany(() => Task, (task) => task.assignedUsers)
  assignedTasks = new Collection<Task>(this);

  constructor(username: string, email: string) {
    super();
    this.username = username;
    this.email = email;
  }
}
