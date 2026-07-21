import mongoose from 'mongoose';
import { generateAccessToken } from '../../src/utils/jwt.js';
import { createMockUser } from '../factories/models.factory.js';

export const generateAuthToken = (userId) => {
  return generateAccessToken(userId, 'student', 0);
};

import { User } from '../../src/models/User.js';

export const createTestUsers = async () => {
  const userA = createMockUser();
  const userB = createMockUser();
  
  await User.insertMany([
    { _id: userA, name: 'User A', email: 'a@example.com', password: 'password123' },
    { _id: userB, name: 'User B', email: 'b@example.com', password: 'password123' }
  ]);
  
  return {
    userA,
    userB,
    tokenA: generateAuthToken(userA),
    tokenB: generateAuthToken(userB)
  };
};
