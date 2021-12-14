import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import {
  TaskLogResolver,
  TasksResolver,
  UserTaskResolver,
} from './tasks.resolver';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Task } from '../entities/Task.entity';
import { UsersModule } from '../users/users.module';
import { TaskLog } from '../entities/TaskLog.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [Task, TaskLog],
    }),
    UsersModule,
  ],
  providers: [TasksResolver, TaskLogResolver, UserTaskResolver, TasksService],
  exports: [TasksService],
})
export class TasksModule {}
