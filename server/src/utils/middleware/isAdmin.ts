import { User } from '../../entities/User';
import { MyContext } from '../../types';
import { MiddlewareFn } from 'type-graphql';

export const isAdmin: MiddlewareFn<MyContext> = async ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error('not authenticated');
  }

  const user = await User.findOne({
    where: { id: context.req.session.userId },
  });

  if (!user) {
    throw new Error('User is not in the database');
  }

  if (!user.isAdmin) {
    throw new Error('You need to be logged in as Admin to approve the posts');
  }

  return next();
};
