import { Field, InputType } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class CreateTaskInput {
  @Field()
  @MinLength(3)
  @IsString()
  title: string;

  @Field()
  @MinLength(2)
  @IsString()
  description: string;
}
