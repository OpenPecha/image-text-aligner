import { groupHandlers } from './group.handler';
import { userHandlers } from './user.handler';

export const handlers = [
    ...groupHandlers,
    ...userHandlers,
];