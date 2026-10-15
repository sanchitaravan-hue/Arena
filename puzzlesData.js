export const PUZZLE_CATEGORIES = [
  { id: 'logical', name: 'Logical Reasoning', icon: 'BrainCircuit', description: 'Deductive reasoning, balance scale, truth-tellers and liars.' },
  { id: 'mathematical', name: 'Mathematical', icon: 'Calculator', description: 'Probability, series, geometry, combinatorics brain teasers.' },
  { id: 'coding', name: 'Coding Puzzles', icon: 'Code2', description: 'Bit manipulation tricks, algorithmic edge cases.' },
  { id: 'debugging', name: 'Debugging', icon: 'Bug', description: 'Identify subtle memory leaks, scope bugs, and race conditions.' },
  { id: 'output-prediction', name: 'Output Prediction', icon: 'Terminal', description: 'Predict exact console output for tricky Python/JS code.' },
  { id: 'pattern-recognition', name: 'Pattern Recognition', icon: 'Sparkles', description: 'Matrix sequences, number grids, visual patterns.' },
];

export const PUZZLES_DATA = [
  {
    id: 'puz-1',
    category: 'output-prediction',
    difficulty: 'Easy',
    isDaily: true,
    title: 'Python List Assignment Behavior',
    question: `What is the exact console output of the following Python snippet?

\`\`\`python
a = [1, 2, 3]
b = a
b.append(4)
print(len(a))
\`\`\``,
    options: ['3', '4', 'Error', 'None'],
    answerIndex: 1, // '4'
    explanation: `In Python, variables store references to objects. When you execute 'b = a', 'b' points to the exact same list instance in memory. Modifying 'b' mutates 'a' as well. Therefore, len(a) is 4.`,
    xpReward: 50,
    timeLimitSeconds: 60,
  },
  {
    id: 'puz-2',
    category: 'logical',
    difficulty: 'Medium',
    isDaily: false,
    title: 'The Burning Ropes',
    question: `You have two non-uniform ropes. Each rope takes exactly 60 minutes to burn completely from end to end, but they burn at inconsistent rates. How can you measure exactly 45 minutes using only these two ropes and a lighter?`,
    options: [
      'Light both ends of Rope 1 and one end of Rope 2 simultaneously',
      'Light one end of Rope 1 and both ends of Rope 2',
      'Burn Rope 1 completely, then burn half of Rope 2',
      'It is impossible without a stopwatch',
    ],
    answerIndex: 0,
    explanation: `Step 1: Light both ends of Rope 1 AND one end of Rope 2.
Step 2: When Rope 1 burns completely (30 mins elapsed), light the other end of Rope 2.
Step 3: Rope 2 will finish burning in another 15 mins (Total = 30 + 15 = 45 mins).`,
    xpReward: 75,
    timeLimitSeconds: 90,
  },
  {
    id: 'puz-3',
    category: 'debugging',
    difficulty: 'Medium',
    isDaily: false,
    title: 'JavaScript Asynchronous Loop Scope',
    question: `What will be printed to the console?

\`\`\`javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
\`\`\``,
    options: ['0 1 2', '3 3 3', '0 0 0', '1 2 3'],
    answerIndex: 1, // '3 3 3'
    explanation: `Because 'var' is function-scoped rather than block-scoped, all three setTimeout callbacks capture the same shared binding 'i'. By the time callbacks execute after 100ms, the loop has completed and 'i' equals 3.`,
    xpReward: 60,
    timeLimitSeconds: 60,
  },
  {
    id: 'puz-4',
    category: 'mathematical',
    difficulty: 'Hard',
    isDaily: false,
    title: 'Probability of Matching Socks',
    question: `In a dark room, you have 10 black socks and 10 white socks in a drawer. What is the minimum number of socks you must pick to guarantee a matching pair?`,
    options: ['2', '3', '10', '11'],
    answerIndex: 1, // '3'
    explanation: `Pigeonhole Principle: There are 2 colors (black and white). If you draw 3 socks, at least 2 must be of the same color.`,
    xpReward: 100,
    timeLimitSeconds: 45,
  },
  {
    id: 'puz-5',
    category: 'pattern-recognition',
    difficulty: 'Easy',
    isDaily: false,
    title: 'Number Grid Sequence',
    question: `Find the missing number in the sequence: 2, 6, 12, 20, 30, ?`,
    options: ['36', '40', '42', '50'],
    answerIndex: 2, // '42'
    explanation: `The pattern is n*(n+1):
1*2 = 2
2*3 = 6
3*4 = 12
4*5 = 20
5*6 = 30
6*7 = 42.`,
    xpReward: 40,
    timeLimitSeconds: 45,
  },
];
