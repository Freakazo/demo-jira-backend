import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { User } from '../../entities/User.entity';
import { Task } from '../../entities/Task.entity';
import { LOG_TYPE } from '../../entities/TaskLog.entity';
import { TaskGqlType } from './task.gqlEntity';
import { UserGqlType } from '../../users/entities/user.gqlEntity';

registerEnumType(LOG_TYPE, {
  name: 'LOG_TYPE',
});

@ObjectType('TaskLog')
export class TaskLogGqlType {
  @Field(() => Int)
  id: number;

  @Field(() => LOG_TYPE)
  type!: LOG_TYPE;

  @Field(() => UserGqlType, { nullable: true })
  user: User;

  @Field(() => TaskGqlType)
  task: Task;

  @Field({ nullable: true })
  prevValue: string;

  @Field({ nullable: true })
  newValue: string;
}
