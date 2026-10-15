export const TECHNICAL_TOPICS = [
  { id: 'os', title: 'Operating Systems', icon: 'Cpu', count: 15, description: 'Processes, Threads, Deadlocks, Virtual Memory, Paging, CPU Scheduling.' },
  { id: 'dbms', title: 'Database Management Systems', icon: 'Database', count: 20, description: 'SQL, Normalization (1NF to BCNF), ACID Transactions, Indexing, B-Trees.' },
  { id: 'cn', title: 'Computer Networks', icon: 'Network', count: 18, description: 'TCP/IP Model, OSI 7 Layers, HTTP/HTTPS, DNS, Sockets, Subnetting.' },
  { id: 'oop', title: 'Object-Oriented Programming', icon: 'Layers', count: 14, description: 'Inheritance, Encapsulation, Polymorphism, Abstraction, SOLID principles.' },
  { id: 'sd', title: 'System Design Fundamentals', icon: 'Server', count: 12, description: 'Load Balancers, Caching, CAP Theorem, Sharding, Message Queues.' },
];

export const TECHNICAL_QUESTIONS = [
  {
    id: 'tech-1',
    topic: 'dbms',
    title: 'ACID Properties in Transactions',
    question: 'Which DBMS ACID property guarantees that once a transaction completes, its updates persist permanently even in the event of a system crash?',
    options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
    answerIndex: 3, // Durability
    explanation: 'Durability ensures that once a transaction has committed, its changes survive system crashes by writing to write-ahead logs (WAL) and non-volatile storage.',
  },
  {
    id: 'tech-2',
    topic: 'os',
    title: 'Deadlock Conditions',
    question: 'Which of the following is NOT one of the 4 Coffman conditions required for a deadlock to occur?',
    options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption', 'Circular Wait'],
    answerIndex: 2, // Preemption (No Preemption is required)
    explanation: 'The 4 Coffman conditions are: 1) Mutual Exclusion, 2) Hold and Wait, 3) NO Preemption, and 4) Circular Wait. "Preemption" prevents deadlocks.',
  },
  {
    id: 'tech-3',
    topic: 'cn',
    title: 'TCP vs UDP Protocols',
    question: 'Which layer of the OSI model do TCP and UDP operate on?',
    options: ['Network Layer (Layer 3)', 'Transport Layer (Layer 4)', 'Session Layer (Layer 5)', 'Application Layer (Layer 7)'],
    answerIndex: 1, // Layer 4
    explanation: 'TCP (Transmission Control Protocol) and UDP (User Datagram Protocol) are Layer 4 (Transport Layer) protocols responsible for end-to-end communication and port delivery.',
  },
  {
    id: 'tech-4',
    topic: 'sd',
    title: 'CAP Theorem',
    question: 'According to CAP Theorem, a distributed database system can provide at most how many of the three guarantees simultaneously?',
    options: ['1', '2', '3', 'All 3 during network partitions'],
    answerIndex: 1, // 2
    explanation: 'CAP Theorem states that in the presence of a network Partition (P), a distributed system must choose between Consistency (C) or Availability (A). You can pick 2 of 3.',
  },
];
