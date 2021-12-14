import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../entities/User.entity';
import { CreateUserInput } from './dto/create-user.input';
import { MikroORM } from '@mikro-orm/core';
import { runInTransaction } from '../testUtils/runInTransaction';

describe('UsersService', () => {
  let service: UsersService;
  let orm: MikroORM;

  const testUserData: CreateUserInput = {
    password: 'SuperSecureSecretPassword',
    username: 'test_user',
    email: 'test@not.real',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot(),
        MikroOrmModule.forFeature({
          entities: [User],
        }),
      ],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    orm = module.get<MikroORM>(MikroORM);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Can create a user', async () => {
    await runInTransaction(orm, async () => {
      const user = await service.create(testUserData);
      expect(user).toEqual(
        expect.objectContaining({
          username: 'test_user',
          email: 'test@not.real',
        }),
      );
      expect(user.id).toBeGreaterThan(0);
    });
  });

  it('Can update a user', async () => {
    await runInTransaction(orm, async () => {
      const user = await service.create(testUserData);
      expect(user).toBeDefined();
      await service.update(user.id, { email: 'hello@not.real' });
      expect(user.email).toEqual('hello@not.real');

      // Test for a user that doesn't exist
      await expect(
        service.update(999999999, { email: 'updated from test' }),
      ).rejects.toThrow();
    });
  });

  it('Can delete a user', async () => {
    await runInTransaction(orm, async () => {
      const user = await service.create(testUserData);
      expect(await service.findOne(user.id)).toBeTruthy();
      expect(user.id).toBeGreaterThan(0);
      await service.remove(user.id);
      expect(await service.findOne(user.id)).toBeFalsy();
      await expect(service.remove(999999999)).rejects.toThrow();
    });
  });
});
