import { Task } from './entities/Task.entity';
import { MikroORMOptions } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { BaseEntity } from './entities/BaseEntity';
import { User } from './entities/User.entity';
import { TaskLog } from './entities/TaskLog.entity';

const config: Partial<MikroORMOptions<PostgreSqlDriver>> = {
  entities: [BaseEntity, Task, TaskLog, User],
  dbName: 'atl',
  type: 'postgresql',
  password: 'pass',
  debug: true,
};
export default config;
