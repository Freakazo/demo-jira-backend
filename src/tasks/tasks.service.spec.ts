import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Task } from '../entities/Task.entity';
import { runInTransaction } from '../testUtils/runInTransaction';
import { MikroORM } from '@mikro-orm/core';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { TaskLog } from '../entities/TaskLog.entity';

const NON_EXISTENT_ID = 999999999;

describe('TasksService', () => {
  let service: TasksService;
  let userService: UsersService;
  let orm: MikroORM;

  const newTaskData = {
    title: 'test',
    description: 'A test task',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot(),
        MikroOrmModule.forFeature({
          entities: [Task, TaskLog],
        }),
        UsersModule,
      ],
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
    orm = module.get<MikroORM>(MikroORM);
    userService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Can create a new task', async () => {
    await runInTransaction(orm, async () => {
      const resultTask = await service.create(newTaskData);
      expect(resultTask).toEqual(expect.objectContaining(newTaskData));
      expect(resultTask.id).toBeGreaterThan(0);

      // Check that we created the logs
      expect(resultTask.logs).toHaveLength(1);
      expect(resultTask.logs[0]).toEqual(
        expect.objectContaining({
          type: 'create_delete',
          prevValue: null,
        }),
      );
    });
  });

  it('Can find a task by id', async () => {
    await runInTransaction(orm, async () => {
      const resultTask = await service.create(newTaskData);
      expect(resultTask).toEqual(expect.objectContaining(newTaskData));
      expect(resultTask.id).toBeGreaterThan(0);
      const reFetchedTask = await service.findOne(resultTask.id);
      expect(reFetchedTask).toEqual(resultTask);
    });
  });

  it('Can update a task', async () => {
    await runInTransaction(orm, async () => {
      const resultTask = await service.create(newTaskData);
      expect(resultTask).toBeDefined();
      await service.update(resultTask.id, { title: 'Updated Test' });
      expect(resultTask).toEqual(
        expect.objectContaining({
          id: resultTask.id,
          title: 'Updated Test',
          description: newTaskData.description,
        }),
      );

      // Ensure the logs were created
      expect(resultTask.logs).toHaveLength(2);
      expect(resultTask.logs[0]).toEqual(
        expect.objectContaining({
          type: 'create_delete',
          prevValue: null,
        }),
      );
      expect(resultTask.logs[1]).toEqual(
        expect.objectContaining({
          type: 'edit_title',
          prevValue: newTaskData.title,
          newValue: 'Updated Test',
        }),
      );

      // Test for a task that doesn't exist
      await expect(
        service.update(-1, { description: 'updated from test' }),
      ).rejects.toThrow();
    });
  });

  it('Can delete a task', async () => {
    await runInTransaction(orm, async () => {
      const resultTask = await service.create(newTaskData);
      expect(resultTask).toBeDefined();
      await service.remove(resultTask.id);
      expect(await service.findOne(resultTask.id)).toBeFalsy();
      await expect(service.remove(-1)).rejects.toThrow();
    });
  });

  it('Throws when trying to delete a non-existent task', async () => {
    await expect(service.remove(-1)).rejects.toThrow();
  });

  it('Can get a list of all tasks', async () => {
    await runInTransaction(orm, async () => {
      await service.create(newTaskData);
      await service.create(newTaskData);
      await service.create(newTaskData);

      const allTasks = await service.findAll();
      expect(allTasks).toHaveLength(3);
    });
  });

  it('Can filter tasks', async () => {
    await runInTransaction(orm, async () => {
      const newTask = await service.create({
        title: 'test bug task',
        description: 'A test task',
      });
      await service.create({
        title: 'Implement Everything',
        description: 'A tiny task to implement a couple weeks worth of work',
      });
      await service.create({
        title: 'Tiny bug fix',
        description: 'It never is tiny is it',
      });

      const allTasks = await service.findAll();
      expect(allTasks).toHaveLength(3);
      expect(await service.findAll({ title: 'Tiny bug fix' })).toHaveLength(1);
      expect(await service.findAll({ title__like: 'bug' })).toHaveLength(2);
      expect(
        await service.findAll({ description: 'It never is tiny is it' }),
      ).toHaveLength(1);
      expect(await service.findAll({ description__like: 'tiny' })).toHaveLength(
        2,
      );
      const searchedTask = await service.findAll({ id: newTask.id });
      expect(searchedTask).toHaveLength(1);
      expect(searchedTask[0]).toEqual(
        expect.objectContaining({
          id: newTask.id,
          title: 'test bug task',
          description: 'A test task',
        }),
      );
    });
  });

  it('Can assign and remove users from a task', async () => {
    await runInTransaction(orm, async () => {
      // Test successfully adding or removing users from tasks
      const task = await service.create(newTaskData);
      const user = await userService.create({
        username: 'test',
        email: 'test',
        password: 'test',
      });
      await service.assignUserToTask(task.id, user.id);
      expect(task.assignedUsers).toHaveLength(1);

      await service.unassignUserFromTask(task.id, user.id);
      expect(task.assignedUsers).toHaveLength(0);

      // Test some error handling when assigning users to tasks
      await expect(
        service.assignUserToTask(task.id, NON_EXISTENT_ID),
      ).rejects.toThrow();
      await expect(
        service.assignUserToTask(NON_EXISTENT_ID, user.id),
      ).rejects.toThrow();

      // Test some error handling when removing users from tasks
      await expect(
        service.unassignUserFromTask(task.id, NON_EXISTENT_ID),
      ).rejects.toThrow();
      await expect(
        service.unassignUserFromTask(NON_EXISTENT_ID, user.id),
      ).rejects.toThrow();
    });
  });
});
