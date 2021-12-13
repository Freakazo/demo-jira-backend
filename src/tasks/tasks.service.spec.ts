import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Task } from '../entities/Task.entity';

describe('TasksService', () => {
  let service: TasksService;
  const newTaskData = {
    title: 'test',
    description: 'A test task',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot(),
        MikroOrmModule.forFeature({
          entities: [Task],
        }),
      ],
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
    // Normally this would be dealt with fixture/better testing system.
    const allTasks = await service.findAll();
    await Promise.all(allTasks.map((t) => service.remove(t.id)));
  });

  afterEach(async () => {
    // Normally this would be dealt with fixture/better testing system.
    const allTasks = await service.findAll();
    await Promise.all(allTasks.map((t) => service.remove(t.id)));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Can create a new task', async () => {
    const resultTask = await service.create(newTaskData);
    expect(resultTask).toEqual(expect.objectContaining(newTaskData));
    expect(resultTask.id).toBeGreaterThan(0);
  });

  it('Can find a task by id', async () => {
    const resultTask = await service.create(newTaskData);
    expect(resultTask).toEqual(expect.objectContaining(newTaskData));
    expect(resultTask.id).toBeGreaterThan(0);
    const reFetchedTask = await service.findOne(resultTask.id);
    expect(reFetchedTask).toEqual(resultTask);
  });

  it('Can update a task', async () => {
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

    // Test for a task that doesn't exist
    await expect(
      service.update(-1, { description: 'updated from test' }),
    ).rejects.toThrow();
  });

  it('Can delete a task', async () => {
    const resultTask = await service.create(newTaskData);
    expect(resultTask).toBeDefined();
    await service.remove(resultTask.id);
    expect(await service.findOne(resultTask.id)).toBeFalsy();
    await expect(service.remove(-1)).rejects.toThrow();
  });

  it('Throws when trying to delete a non-existent task', async () => {
    await expect(service.remove(-1)).rejects.toThrow();
  });

  it('Can get a list of all tasks', async () => {
    await service.create(newTaskData);
    await service.create(newTaskData);
    await service.create(newTaskData);

    const allTasks = await service.findAll();
    expect(allTasks).toHaveLength(3);
  });
});
