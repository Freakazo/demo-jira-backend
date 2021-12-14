import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { TasksService } from './tasks.service';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { TaskGqlType } from './gqlEntities/task.gqlEntity';
import { UserGqlType } from '../users/entities/user.gqlEntity';
import { User } from '../entities/User.entity';
import { Task } from '../entities/Task.entity';
import { FilterTaskInput } from './dto/task-filter.input';
import { TaskLogGqlType } from './gqlEntities/taskLog.gqlEntity';
import { TaskLog } from '../entities/TaskLog.entity';

@Resolver(() => TaskGqlType)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  @Mutation(() => TaskGqlType)
  createTask(@Args('createTaskInput') createTaskInput: CreateTaskInput) {
    return this.tasksService.create(createTaskInput);
  }

  @Query(() => [TaskGqlType], { name: 'tasks' })
  findAll(@Args('filter', { nullable: true }) filter?: FilterTaskInput) {
    return this.tasksService.findAll(filter);
  }

  @Query(() => TaskGqlType, { name: 'task' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.tasksService.findOne(id);
  }

  @Mutation(() => TaskGqlType)
  updateTask(
    @Args('id') id: number,
    @Args('updateTaskInput') updateTaskInput: UpdateTaskInput,
  ) {
    return this.tasksService.update(id, updateTaskInput);
  }

  @Mutation(() => TaskGqlType)
  removeTask(@Args('id', { type: () => Int }) id: number) {
    return this.tasksService.remove(id);
  }

  @Mutation(() => TaskGqlType)
  async assignUserToTask(
    @Args('taskId', { type: () => Int }) taskId: number,
    @Args('userId', { type: () => Int }) userId: number,
  ) {
    await this.tasksService.assignUserToTask(taskId, userId);
    return this.tasksService.findOne(taskId);
  }

  @Mutation(() => TaskGqlType)
  async unassignUserToTask(
    @Args('taskId', { type: () => Int }) taskId: number,
    @Args('userId', { type: () => Int }) userId: number,
  ) {
    await this.tasksService.unassignUserFromTask(taskId, userId);
    return this.tasksService.findOne(taskId);
  }

  @ResolveField('assignees')
  async assignees(@Parent() task: Task) {
    await task.assignedUsers.loadItems();
    return task.assignedUsers;
  }

  @ResolveField('logs', () => [TaskLogGqlType])
  async logs(@Parent() task: Task) {
    await task.logs.loadItems();
    console.log(task.logs.getItems(true));
    return task.logs.getItems(true);
  }
}

@Resolver(() => TaskLogGqlType)
export class TaskLogResolver {
  @ResolveField('user')
  async user(@Parent() taskLog: TaskLog) {
    return taskLog.user;
  }
}

@Resolver(() => UserGqlType)
export class UserTaskResolver {
  constructor(private taskService: TasksService) {}

  @ResolveField('assignedTasks', () => [TaskGqlType])
  assignedTasks(@Parent() user: User): Promise<Task[]> {
    return this.taskService.findAll({ assignedUserId: user.id });
  }
}
