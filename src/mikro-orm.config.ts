import { Task } from './entities/Task.entity';
import { MikroORMOptions } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { BaseEntity } from './entities/BaseEntity';

const config: Partial<MikroORMOptions<PostgreSqlDriver>> = {
  entities: [BaseEntity, Task],
  dbName: 'atl',
  type: 'postgresql',
  password: 'pass',
};
export default config;
