export const APTITUDE_CATEGORIES = [
  { id: 'quant', name: 'Quantitative Aptitude', icon: 'Calculator', count: 25, description: 'Percentages, Profit & Loss, Speed-Time-Distance, Permutations, Probability' },
  { id: 'logical', name: 'Logical Reasoning', icon: 'BrainCircuit', count: 20, description: 'Blood Relations, Syllogisms, Coding-Decoding, Seating Arrangements' },
  { id: 'verbal', name: 'Verbal Ability', icon: 'BookOpen', count: 18, description: 'Reading Comprehension, Sentence Correction, Antonyms & Synonyms' },
  { id: 'puzzles', name: 'Placement Puzzles', icon: 'Puzzle', count: 15, description: 'Classic Google/Amazon brain teasers, balance scale, bridge crossing' },
];

export const APTITUDE_QUESTIONS = [
  {
    id: 'q1',
    category: 'quant',
    topic: 'Time and Distance',
    difficulty: 'Medium',
    question: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
    options: ['65 seconds', '89 seconds', '100 seconds', '150 seconds'],
    answerIndex: 1, // 89 seconds
    explanation: `1. Speed of the train = (Length of train) / (Time to pass pole) = 240 / 24 = 10 m/sec.
2. Total distance to cover platform = Length of train + Length of platform = 240 + 650 = 890 m.
3. Time required = 890 / 10 = 89 seconds.`,
  },
  {
    id: 'q2',
    category: 'quant',
    topic: 'Profit & Loss',
    difficulty: 'Easy',
    question: 'A merchant buys an item for $80 and sells it for $100. Find the profit percentage.',
    options: ['20%', '25%', '30%', '15%'],
    answerIndex: 1, // 25%
    explanation: `Profit = Selling Price - Cost Price = 100 - 80 = $20.
Profit Percentage = (Profit / Cost Price) * 100 = (20 / 80) * 100 = 25%.`,
  },
  {
    id: 'q3',
    category: 'logical',
    topic: 'Coding-Decoding',
    difficulty: 'Easy',
    question: 'If in a certain code language, "COMPUTER" is written as "RFUVQNPC", how will "MEDICINE" be written in that code?',
    options: ['EOJDEJFM', 'EOJDJEFM', 'MFEDICIN', 'EOJDEJGM'],
    answerIndex: 1, // EOJDJEFM
    explanation: `Reverse the word and add +1 to each letter except the first and last letters.
"MEDICINE" reversed becomes "ENICIDEM".
E -> E, N -> O, I -> J, C -> D, I -> J, D -> E, E -> F, M -> M.
Result: EOJDJEFM.`,
  },
  {
    id: 'q4',
    category: 'logical',
    topic: 'Blood Relations',
    difficulty: 'Medium',
    question: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
    options: ['Brother', 'Uncle', 'Cousin', 'Father'],
    answerIndex: 3, // Father
    explanation: `Suresh's mother's only son is Suresh himself.
Therefore, the boy in the photograph is Suresh's son.
Suresh is the father of the boy.`,
  },
  {
    id: 'q5',
    category: 'puzzles',
    topic: 'Balance Scale & Heavy Coin',
    difficulty: 'Hard',
    question: 'You have 8 coins, 7 of which weigh the same and 1 is slightly heavier. You have a balance scale. What is the minimum number of weighings needed to guarantee finding the heavy coin?',
    options: ['1', '2', '3', '4'],
    answerIndex: 1, // 2 weighings
    explanation: `Step 1: Divide coins into 3 groups: Group A (3 coins), Group B (3 coins), Group C (2 coins).
Weigh Group A against Group B.
Case 1: If equal, heavy coin is in Group C. Weigh the 2 coins in Group C against each other (Total 2 weighings).
Case 2: If A or B is heavier, take that group of 3. Weigh any 2 coins against each other. If equal, the 3rd is heavy; if unequal, scale points to heavy coin (Total 2 weighings).`,
  },
  {
    id: 'q6',
    category: 'verbal',
    topic: 'Sentence Correction',
    difficulty: 'Easy',
    question: 'Choose the correct form of the sentence: "Neither of the candidates _____ submitted their resume yet."',
    options: ['have', 'has', 'were', 'are'],
    answerIndex: 1, // has
    explanation: `"Neither" is a singular indefinite pronoun and takes a singular verb. Therefore, "has" is the grammatically correct choice.`,
  },
];
