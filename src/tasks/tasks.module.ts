import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksResolver } from './tasks.resolver';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Task } from '../entities/Task.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [Task],
    }),
  ],
  providers: [TasksResolver, TasksService],
})
export class TasksModule {}
