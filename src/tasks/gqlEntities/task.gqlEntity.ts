import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UserGqlType } from '../../users/entities/user.gqlEntity';

@ObjectType('Task')
export class TaskGqlType {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => [UserGqlType])
  assignees: UserGqlType[];
}
