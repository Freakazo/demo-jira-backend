import { Injectable } from '@nestjs/common';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Task } from '../entities/Task.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { FilterQuery, wrap } from '@mikro-orm/core';
import { FilterTaskInput } from './dto/task-filter.input';
import { UsersService } from '../users/users.service';
import { LOG_TYPE, TaskLog } from '../entities/TaskLog.entity';

@Injectable()
export class TasksService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Task)
    private readonly taskRepository: EntityRepository<Task>,
    @InjectRepository(TaskLog)
    private readonly taskLogRepository: EntityRepository<TaskLog>,
    private readonly userService: UsersService,
  ) {}

  async create(createTaskInput: CreateTaskInput) {
    const newTask = this.taskRepository.create({
      ...createTaskInput,
    });
    await this.taskRepository.persistAndFlush(newTask);
    await this.taskLogRepository.create({
      task: newTask,
      type: LOG_TYPE.CREATE_DELETE,
      prevValue: null,
      newValue: newTask.id,
    });
    await this.taskRepository.flush();
    return newTask;
  }

  findAll(filter?: FilterTaskInput) {
    // Convert filter
    const whereConditions: FilterQuery<Task> = {};
    if (filter) {
      if (filter.assignedUserId) {
        whereConditions['assignedUsers'] = { id: filter.assignedUserId };
      }
      if (filter.id) {
        whereConditions['id'] = filter.id;
      }
      if (filter.description) {
        whereConditions['description'] = filter.description;
      }
      if (filter.description__like) {
        whereConditions['description'] = {
          $like: `%${filter.description__like}%`,
        };
      }
      if (filter.title) {
        whereConditions['title'] = filter.title;
      }
      if (filter.title__like) {
        whereConditions['title'] = { $like: `%${filter.title__like}%` };
      }
    }
    return this.taskRepository.find({
      ...whereConditions,
    });
  }

  findOne(id: number) {
    return this.taskRepository.findOne(id);
  }

  /**
   * Update a task, and log the update.
   * @param id - The task id to update
   * @param updateTaskInput - The task data
   */
  async update(id: number, updateTaskInput: UpdateTaskInput) {
    const task = await this.findOne(id);
    if (!task) {
      throw new Error('Task not found');
    }
    // Keep the before update data for the log
    const prevDescription = task.description;
    const prevTitle = task.title;

    await wrap(task).assign(updateTaskInput);
    await this.taskRepository.flush();

    // Keep a log of the updates made to
    if (updateTaskInput.title && updateTaskInput.title !== prevTitle) {
      const titleLogEntry = this.taskLogRepository.create({
        task,
        type: LOG_TYPE.EDIT_TITLE,
        prevValue: prevTitle,
        newValue: task.title,
      });
      this.taskLogRepository.persist(titleLogEntry);
    }

    if (
      updateTaskInput.description &&
      updateTaskInput.description !== prevDescription
    ) {
      const descriptionLogEntry = this.taskLogRepository.create({
        task,
        type: LOG_TYPE.EDIT_DESCRIPTION,
        prevValue: prevDescription,
        newValue: task.description,
      });
      this.taskLogRepository.persist(descriptionLogEntry);
    }
    await this.taskLogRepository.flush();
    return task;
  }

  async remove(id: number) {
    const task = await this.findOne(id);
    if (!task) {
      throw new Error('Task not found');
    }
    await this.taskRepository.remove(task);
    await this.taskRepository.flush();
  }

  /**
   * Adds a user to a task.
   * Will throw if attempting to add a user to a task multiple times
   */
  async assignUserToTask(taskId: number, userId: number) {
    const task = await this.findOne(taskId);
    if (!task) {
      throw new Error('Task does not exist or no permissions');
    }
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error('User does not exist');
    }
    task.assignedUsers.add(user);

    const log = this.taskLogRepository.create({
      task,
      type: LOG_TYPE.ASSIGNEE_UPDATE,
      prevValue: null,
      newValue: userId,
    });
    this.taskLogRepository.persist(log);

    await this.taskRepository.flush();
  }

  async unassignUserFromTask(taskId: number, userId: number) {
    const task = await this.findOne(taskId);
    if (!task) {
      throw new Error('Task does not exist or no permissions');
    }
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error('User does not exist');
    }
    task.assignedUsers.remove(user);

    const log = this.taskLogRepository.create({
      task,
      type: LOG_TYPE.ASSIGNEE_UPDATE,
      prevValue: userId,
      newValue: null,
    });
    this.taskLogRepository.persist(log);

    await this.taskRepository.flush();
  }
}
