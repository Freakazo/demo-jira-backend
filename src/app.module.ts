import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    TasksModule,
    MikroOrmModule.forRoot(),
    GraphQLModule.forRoot({ autoSchemaFile: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
