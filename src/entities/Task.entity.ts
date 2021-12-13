import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';

@Entity()
export class Task extends BaseEntity {
  @Property()
  title: string;

  @Property()
  description: string;

  constructor(code: string, title: string, description: string) {
    super();
    this.title = title;
    this.description = description;
  }
}
