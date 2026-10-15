export const COMPREHENSIVE_ASSESSMENT_DATA = {
  id: 'mega-placement-brain-test',
  title: 'Ultimate Placement Brain & Competency Assessment',
  subtitle: 'Aptitude • Technical • Group Discussion • HR Management',
  durationMinutes: 25,
  stages: [
    {
      id: 'aptitude',
      name: 'Stage 1: Aptitude & Logical Brain Power',
      icon: 'Calculator',
      description: 'Tests analytical speed, numerical computation, deductive logic, and pattern spotting under timed conditions.',
      questions: [
        {
          id: 'apt-1',
          question: 'A work crew of 12 people can finish a software sprint in 18 days. If 4 more engineers join with equal velocity, in how many days will the sprint be completed?',
          options: ['12 days', '13.5 days', '14 days', '15 days'],
          correctIndex: 1, // 13.5 days: (12 * 18) / 16 = 216 / 16 = 13.5
          explanation: 'Total effort units = 12 * 18 = 216 person-days. With 16 people: 216 / 16 = 13.5 days.',
        },
        {
          id: 'apt-2',
          question: 'What comes next in the alphanumeric sequence: A2Z, C4X, E8V, G16T, _____?',
          options: ['I32R', 'I32S', 'H32R', 'I24R'],
          correctIndex: 0, // I32R (A+2=C, C+2=E, E+2=G, G+2=I; 2*2=4, 4*2=8, 8*2=16, 16*2=32; Z-2=X, X-2=V, V-2=T, T-2=R)
          explanation: 'First letter advances by 2 (A->C->E->G->I). Numbers double (2->4->8->16->32). Last letter steps back by 2 (Z->X->V->T->R). Result: I32R.',
        },
        {
          id: 'apt-3',
          question: 'A fair pair of 6-sided dice is rolled. What is the probability that the sum of the dice is a prime number (2, 3, 5, 7, 11)?',
          options: ['5/12', '7/18', '1/2', '15/36'],
          correctIndex: 0, // 15 / 36 = 5 / 12
          explanation: 'Favorable outcomes: Sum=2 (1), Sum=3 (2), Sum=5 (4), Sum=7 (6), Sum=11 (2). Total = 1+2+4+6+2 = 15 out of 36. 15/36 = 5/12.',
        },
      ],
    },
    {
      id: 'technical',
      name: 'Stage 2: Core Technical & Algorithmic Acumen',
      icon: 'Cpu',
      description: 'Tests Data Structures, System Architecture, Code Tracing, and Database principles.',
      questions: [
        {
          id: 'tech-1',
          question: 'What is the amortized average time complexity of insertion, deletion, and lookup in a well-balanced Red-Black Tree vs an ideal Hash Table?',
          options: [
            'Tree: O(1), Hash Table: O(log N)',
            'Tree: O(log N), Hash Table: O(1)',
            'Tree: O(N), Hash Table: O(log N)',
            'Tree: O(log N), Hash Table: O(log N)',
          ],
          correctIndex: 1,
          explanation: 'Red-Black self-balancing trees guarantee O(log N) for search/insert/delete, while Hash Tables provide average amortized O(1).',
        },
        {
          id: 'tech-2',
          question: 'In a microservices architecture, what is the primary role of the Saga Pattern?',
          options: [
            'Managing distributed transactions and maintaining data consistency across decoupled services via compensating events',
            'Compressing network payload sizes across REST endpoints',
            'Balancing HTTP client traffic to prevent cache stampedes',
            'Encrypting TLS certificates on gateway nodes',
          ],
          correctIndex: 0,
          explanation: 'The Saga Pattern orchestrates distributed transactions across multiple microservices using a sequence of local transactions and compensating transactions in case of failure.',
        },
        {
          id: 'tech-3',
          question: 'What does the following Python snippet print?\n\ndef fn(val, acc=[]):\n    acc.append(val)\n    return acc\n\nprint(fn(1))\nprint(fn(2))',
          options: ['[1] then [2]', '[1] then [1, 2]', '[1] then [2, 1]', 'SyntaxError'],
          correctIndex: 1,
          explanation: 'Default arguments in Python are evaluated once at function definition time. Therefore, `acc` retains its mutable state between function calls, producing [1] then [1, 2].',
        },
      ],
    },
    {
      id: 'gd',
      name: 'Stage 3: Group Discussion & Articulation Round',
      icon: 'Mic',
      description: 'Evaluate speech clarity, logical structure, persuasion, vocabulary, and confident articulation.',
      topic: 'Should AI-generated code and automated agents have intellectual property rights, and who bears legal liability when an AI system causes critical software failure?',
      prompt: 'State your perspective clearly. Address legal liability, the role of human prompt engineers/architects, and how software engineering organizations should safeguard production stability.',
      criteria: ['Confidence & Flow', 'Critical Stance & Nuance', 'Concrete Industry Examples', 'Constructive Tone'],
    },
    {
      id: 'hr',
      name: 'Stage 4: HR Management & Leadership Dilemmas',
      icon: 'Users',
      description: 'Tests conflict management, integrity under pressure, teamwork, and alignment with corporate culture.',
      scenarios: [
        {
          id: 'hr-1',
          scenario: 'A high-impact product launch is scheduled in 24 hours. Your team lead tells you to bypass automated unit tests to meet the deadline. However, you suspect an edge-case concurrency race condition in payment processing. How do you respond?',
          options: [
            'Silently approve the bypass because the team lead has senior authority and will take responsibility.',
            'Refuse to work and escalate directly to the Chief Technology Officer without speaking to the lead.',
            'Concisely explain the critical financial risk to the lead with proof of the race condition, propose a scoped hotfix or staging canary test, and agree on an executive risk-mitigation signoff.',
            'Deploy the flawed code and fix it privately over the weekend without telling anyone.',
          ],
          correctIndex: 2,
          weight: 25,
        },
        {
          id: 'hr-2',
          scenario: 'During a sprint retrospective, a peer publicly blames you for an unexpected API outage that actually resulted from changes made by their own sub-team. How do you handle this confrontation?',
          options: [
            'Immediately yell back and accuse them of incompetence in front of the entire team.',
            'Maintain professional composure in the meeting, refer calmly to git commit logs and pull request history to clarify root cause neutrally, and schedule a private 1-on-1 with the peer to build future trust.',
            'Ignore the meeting entirely and log a complaint with HR without addressing the technical misunderstanding.',
            'Accept the blame even though you did not do it, to prevent conflict.',
          ],
          correctIndex: 1,
          weight: 25,
        },
        {
          id: 'hr-3',
          scenario: 'You are offered two roles: one with a high base salary but legacy maintenance work, and one with a moderate salary but working on cutting-edge distributed AI systems and mentorship. Which factors weigh into your long-term career calculation?',
          options: [
            'Only pick the highest initial dollar amount regardless of skills stagnation.',
            'Evaluate the steepness of the learning curve, compound growth of rare technical expertise, culture of engineering excellence, and long-term trajectory.',
            'Pick randomly based on company brand notoriety.',
            'Decline both and wait indefinitely for a unicorn offer.',
          ],
          correctIndex: 1,
          weight: 25,
        },
      ],
    },
  ],
};
