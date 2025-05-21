import { User } from '@prisma/client';

export type simpleUser = Pick<User, 'username' | 'id'>;
