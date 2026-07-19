import fs from 'fs';

const goals = JSON.parse(fs.readFileSync('goals.json', 'utf8'));
const blocks = JSON.parse(fs.readFileSync('planners.json', 'utf8'));

let scheduledBlocks = blocks
  .filter(b => b.milestoneId && b.status !== 'completed' && !b.completed)
  .sort((a, b) => new Date(a.startTime || 0) - new Date(b.startTime || 0));

scheduledBlocks = scheduledBlocks.map(block => {
  let milestoneTitle = 'Task';
  let goalTitle = 'Goal';
  goals.forEach(g => {
    if (g.id === block.goalId || g._id === block.goalId) {
      goalTitle = g.title;
      const sub = (g.subtasks || []).find(s => s.id === block.milestoneId || s._id === block.milestoneId);
      if (sub) milestoneTitle = sub.title || sub.text;
    }
  });
  return { ...block, milestoneTitle, goalTitle };
});

console.log(JSON.stringify(scheduledBlocks, null, 2));
