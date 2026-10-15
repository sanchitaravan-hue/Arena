export const CODING_QUESTIONS = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Data Structures',
    tags: ['Array', 'Hash Table', 'Two Pointers'],
    acceptanceRate: '49.8%',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
      },
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Write your solution here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def two_sum(nums, target):
    # Write your solution here
    prev_map = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in prev_map:
            return [prev_map[diff], i]
        prev_map[n] = i
    return []`,
    },
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
    ],
    hints: [
      'Can you use a Hash Map to store elements and their index as you iterate?',
      'Instead of a nested loop O(N²), looking up keys in a Hash Map takes O(1) time.',
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
  },
  {
    id: 'valid-anagram',
    title: 'Valid Anagram',
    difficulty: 'Easy',
    category: 'Data Structures',
    tags: ['String', 'Hash Table', 'Sorting'],
    acceptanceRate: '63.2%',
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' },
    ],
    starterCode: {
      javascript: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = {};
  for (let char of s) count[char] = (count[char] || 0) + 1;
  for (let char of t) {
    if (!count[char]) return false;
    count[char]--;
  }
  return true;
}`,
      python: `def is_anagram(s, t):
    if len(s) != len(t):
        return False
    return sorted(s) == sorted(t)`,
    },
    testCases: [
      { input: { s: 'anagram', t: 'nagaram' }, expected: true },
      { input: { s: 'rat', t: 'car' }, expected: false },
    ],
    hints: [
      'Check string lengths first; if unequal, they cannot be anagrams.',
      'Count character frequencies using an array of length 26 or a frequency object.',
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'longest-substring-without-repeating',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Algorithms',
    tags: ['Sliding Window', 'String', 'Hash Table'],
    acceptanceRate: '34.5%',
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
    ],
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {
  let set = new Set();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    while (set.has(s[right])) {
      set.delete(s[left]);
      left++;
    }
    set.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
      python: `def length_of_longest_substring(s):
    char_set = set()
    left = 0
    res = 0

    for right in range(len(s)):
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        char_set.add(s[right])
        res = max(res, right - left + 1)
    return res`,
    },
    testCases: [
      { input: { s: 'abcabcbb' }, expected: 3 },
      { input: { s: 'bbbbb' }, expected: 1 },
      { input: { s: 'pwwkew' }, expected: 3 },
    ],
    hints: [
      'Use a Sliding Window with left and right pointers.',
      'Maintain a Set of characters currently in your window.',
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(min(N, M))',
  },
  {
    id: 'lru-cache-design',
    title: 'LRU Cache System Design',
    difficulty: 'Hard',
    category: 'System Design',
    tags: ['Hash Table', 'Linked List', 'System Design'],
    acceptanceRate: '41.2%',
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) Cache**.

Implement the \`LRUCache\` class:
- \`LRUCache(capacity)\` Initialize the LRU cache with positive size \`capacity\`.
- \`get(key)\` Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
- \`put(key, value)\` Update or insert the value if key is not present. When capacity is exceeded, evict the least recently used key.`,
    examples: [
      {
        input: '["LRUCache", "put", "put", "get", "put", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2]]',
        output: '[null, null, null, 1, null, -1]',
      },
    ],
    starterCode: {
      javascript: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}`,
      python: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        val = self.cache.pop(key)
        self.cache[key] = val
        return val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.capacity:
            oldest = next(iter(self.cache))
            del self.cache[oldest]
        self.cache[key] = value`,
    },
    testCases: [],
    hints: [
      'In JavaScript, Map preserves insertion order. Deleting and re-setting a key moves it to the end (most recent).',
      'In traditional C++/Java interviews, pair a Hash Map with a Doubly Linked List for O(1) operations.',
    ],
    timeComplexity: 'O(1) for get and put',
    spaceComplexity: 'O(Capacity)',
  },
];
