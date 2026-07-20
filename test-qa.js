const http = require('http');

const request = (options, body) => new Promise((resolve, reject) => {
  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data || '{}') }));
  });
  req.on('error', reject);
  if (body) {
    req.setHeader('Content-Type', 'application/json');
    req.write(JSON.stringify(body));
  }
  req.end();
});

async function run() {
  console.log('1. Creating a Goal...');
  const goalRes = await request({ method: 'POST', port: 5000, path: '/api/v1/goals' }, { title: 'QA Goal', urgency: 'ACTIVE', description: 'Test', finalDeadlineDaysStr: '7' });
  if (goalRes.status !== 201) throw new Error('Goal creation failed: ' + JSON.stringify(goalRes));
  const goalId = goalRes.data.data.goal.id;
  
  console.log('2. Adding a Milestone...');
  const milestoneRes = await request({ method: 'POST', port: 5000, path: `/api/v1/goals/${goalId}/subtasks` }, { title: 'QA Milestone' });
  if (milestoneRes.status !== 201) throw new Error('Milestone creation failed: ' + JSON.stringify(milestoneRes));
  const milestoneId = milestoneRes.data.data.goal.subtasks.slice(-1)[0]._id;

  console.log(`Created Goal: ${goalId}, Milestone: ${milestoneId}`);

  console.log('3. Scheduling the Milestone...');
  const start = new Date();
  start.setHours(start.getHours() + 1);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  const scheduleRes = await request({ method: 'POST', port: 5000, path: '/api/v1/planner/schedule' }, {
    goalId,
    milestoneId,
    startTime: start.toISOString(),
    endTime: end.toISOString()
  });

  if (scheduleRes.status !== 201) throw new Error('Scheduling failed: ' + JSON.stringify(scheduleRes));
  
  const block = scheduleRes.data.data.block;
  console.log('Block Created:', block);
  if (block.goalId !== goalId || block.milestoneId !== milestoneId) throw new Error('Ids not stored correctly');
  if (block.title !== 'QA Milestone') throw new Error('Title not derived properly');

  console.log('4. Trying to schedule it again (should fail)...');
  const duplicateRes = await request({ method: 'POST', port: 5000, path: '/api/v1/planner/schedule' }, {
    goalId,
    milestoneId,
    startTime: start.toISOString(),
    endTime: end.toISOString()
  });

  if (duplicateRes.status !== 400) throw new Error('Duplicate scheduling should be rejected, got: ' + JSON.stringify(duplicateRes));
  console.log('Duplicate rejected correctly:', duplicateRes.data.message);

  console.log('5. Validating Planner features...');
  const getRes = await request({ method: 'GET', port: 5000, path: '/api/v1/planner/daily' });
  if (getRes.status !== 200) throw new Error('GET /planner/daily failed');
  
  console.log('All tests passed!');
}

run().catch(console.error);
