import { Test, TestingModule } from '@nestjs/testing';
import { TasksResolver } from './tasks.resolver';
import { TasksService } from './tasks.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Task } from '../entities/Task.entity';
import { UsersModule } from '../users/users.module';
import { TaskLog } from '../entities/TaskLog.entity';

describe('TasksResolver', () => {
  let resolver: TasksResolver;
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        MikroOrmModule.forRoot(),
        MikroOrmModule.forFeature({
          entities: [Task, TaskLog],
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

  it('assigns a user to a task', async () => {
    jest.spyOn(service, 'assignUserToTask').mockImplementation();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(service, 'findOne').mockImplementation(() => '_TEST_');
    const res = await resolver.assignUserToTask(1, 2);
    expect(res).toEqual('_TEST_');
    expect(service.assignUserToTask).toBeCalledWith(1, 2);
    expect(service.findOne).toBeCalledWith(1);
  });
});
