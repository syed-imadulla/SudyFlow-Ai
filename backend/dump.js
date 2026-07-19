import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '/home/syed-imadulla/Desktop/StudyFlow Ai/backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(async () => {
    
    const goals = await mongoose.connection.collection('goals').find({}).toArray();
    
    console.log(JSON.stringify(goals, null, 2));

    const planners = await mongoose.connection.collection('planners').find({}).toArray();
    
    console.log(JSON.stringify(planners, null, 2));
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
