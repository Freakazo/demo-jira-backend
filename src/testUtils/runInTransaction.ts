import { MikroORM } from '@mikro-orm/core';

export async function runInTransaction(
  orm: MikroORM,
  func: () => Promise<void> | void,
) {
  try {
    await orm.em.transactional(async () => {
      await func();
      throw new Error('RUN_IN_TRANSACTION_ROLLBACK');
    });
  } catch (e) {
    if (e.message !== 'RUN_IN_TRANSACTION_ROLLBACK') {
      throw e;
    }
  }
}
