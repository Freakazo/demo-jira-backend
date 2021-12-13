import { Injectable } from '@nestjs/common';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Task } from '../entities/Task.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { wrap } from '@mikro-orm/core';

@Injectable()
export class TasksService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Task)
    private readonly taskRepository: EntityRepository<Task>,
  ) {}

  async create(createTaskInput: CreateTaskInput) {
    const newTask = this.taskRepository.create({
      ...createTaskInput,
    });
    await this.taskRepository.persist(newTask);
    await this.taskRepository.flush();
    return newTask;
  }

  findAll() {
    return this.taskRepository.findAll();
  }

  findOne(id: number) {
    return this.taskRepository.findOne(id);
  }

  async update(id: number, updateTaskInput: UpdateTaskInput) {
    const task = await this.findOne(id);
    if (!task) {
      throw new Error('Task not found');
    }
    await wrap(task).assign(updateTaskInput);
    await this.taskRepository.flush();
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
}
