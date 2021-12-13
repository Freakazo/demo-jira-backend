import { Test, TestingModule } from '@nestjs/testing';
import { TasksResolver } from './tasks.resolver';
import { TasksService } from './tasks.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Task } from '../entities/Task.entity';

describe('TasksResolver', () => {
  let resolver: TasksResolver;
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot(),
        MikroOrmModule.forFeature({
          entities: [Task],
        }),
      ],
      providers: [TasksResolver, TasksService],
    }).compile();

    resolver = module.get<TasksResolver>(TasksResolver);
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('correctly calls finds all tasks', () => {
    jest.spyOn(service, 'findAll').mockImplementation();
    resolver.findAll();
    expect(service.findAll).toBeCalled();
  });

  it('correctly calls createTask', () => {
    jest.spyOn(service, 'create').mockImplementation();
    const testTaskData = { title: 'test', description: 'test2' };
    resolver.createTask(testTaskData);
    expect(service.create).toBeCalledWith(testTaskData);
  });

  it('correctly calls to fetch one task', () => {
    jest.spyOn(service, 'findOne').mockImplementation();
    resolver.findOne(1);
    expect(service.findOne).toBeCalledWith(1);
  });

  it('correctly calls remove task', () => {
    jest.spyOn(service, 'remove').mockImplementation();
    resolver.removeTask(2);
    expect(service.remove).toBeCalledWith(2);
  });

  it('correctly calls update task', () => {
    jest.spyOn(service, 'update').mockImplementation();
    resolver.updateTask(2, { title: 'new title' });
    expect(service.update).toBeCalledWith(2, { title: 'new title' });
  });
});
