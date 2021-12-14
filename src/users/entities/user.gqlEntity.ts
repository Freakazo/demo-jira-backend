import { ObjectType, Field, Int } from '@nestjs/graphql';
import { TaskGqlType } from '../../tasks/gqlEntities/task.gqlEntity';

@ObjectType('User')
export class UserGqlType {
  @Field(() => Int)
  id: number;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field(() => [TaskGqlType])
  assignedTasks: TaskGqlType[];
}
