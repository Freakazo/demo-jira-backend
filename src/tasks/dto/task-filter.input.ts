import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

@InputType()
export class FilterTaskInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  id?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(3)
  @IsString()
  title__like?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(3)
  @IsString()
  description__like?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsPositive()
  assignedUserId?: number;
}
