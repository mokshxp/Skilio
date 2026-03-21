require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sql = `
-- SEED DATA for interview_sheets
-- Adjust column names if yours differ slightly

INSERT INTO interview_sheets 
(title, slug, description, category, subcategory, difficulty, is_premium, tags, estimated_read_time, content, is_published)
VALUES

-- ══════════ FREE SHEETS (visible to everyone) ══════════

(
  'Big-O Cheat Sheet',
  'big-o-cheatsheet',
  'Quick reference for time and space complexity of every common algorithm and data structure.',
  'dsa',
  'Complexity Analysis',
  'beginner',
  false,
  ARRAY['complexity', 'big-o', 'algorithms', 'basics'],
  5,
  '{
    "sections": [
      {
        "id": "1",
        "type": "text",
        "title": "What is Big-O?",
        "content": {
          "body": "Big-O notation describes the upper bound of how an algorithm performs as input size n grows. We always analyze worst-case unless specified."
        }
      },
      {
        "id": "2",
        "type": "table",
        "title": "Complexity Hierarchy (Best to Worst)",
        "content": {
          "headers": ["Notation", "Name", "Example", "n=100"],
          "rows": [
            ["O(1)", "Constant", "Array index access", "1 op"],
            ["O(log n)", "Logarithmic", "Binary search", "7 ops"],
            ["O(n)", "Linear", "Linear scan", "100 ops"],
            ["O(n log n)", "Linearithmic", "Merge sort", "664 ops"],
            ["O(n²)", "Quadratic", "Bubble sort", "10,000 ops"],
            ["O(2ⁿ)", "Exponential", "Subsets generation", "Huge"],
            ["O(n!)", "Factorial", "Permutations", "Astronomical"]
          ]
        }
      },
      {
        "id": "3",
        "type": "table",
        "title": "Data Structure Operations",
        "content": {
          "headers": ["Structure", "Access", "Search", "Insert", "Delete"],
          "rows": [
            ["Array", "O(1)", "O(n)", "O(n)", "O(n)"],
            ["Linked List", "O(n)", "O(n)", "O(1)", "O(1)"],
            ["Hash Table", "—", "O(1)*", "O(1)*", "O(1)*"],
            ["BST (balanced)", "O(log n)", "O(log n)", "O(log n)", "O(log n)"],
            ["Stack / Queue", "O(n)", "O(n)", "O(1)", "O(1)"]
          ]
        }
      },
      {
        "id": "4",
        "type": "tips",
        "title": "Simplification Rules",
        "content": {
          "items": [
            "Drop constants: O(3n) → O(n)",
            "Drop lower-order terms: O(n² + n) → O(n²)",
            "Different inputs = different variables: O(a + b) not O(n)",
            "Nested loops multiply: two nested O(n) loops = O(n²)",
            "Sequential steps add: O(n) + O(n²) = O(n²)"
          ]
        }
      }
    ]
  }'::jsonb,
  true
),

(
  'STAR Method Answer Framework',
  'star-method-framework',
  'The complete framework for answering every behavioral interview question with proven templates.',
  'behavioral',
  'STAR Method',
  'beginner',
  false,
  ARRAY['behavioral', 'star', 'hr', 'soft-skills', 'templates'],
  8,
  '{
    "sections": [
      {
        "id": "1",
        "type": "text",
        "title": "The STAR Formula",
        "content": {
          "body": "STAR = Situation + Task + Action + Result. Spend 10% on S, 10% on T, 60% on A, and 20% on R. Most candidates over-explain the situation and under-explain what THEY specifically did."
        }
      },
      {
        "id": "2",
        "type": "comparison",
        "title": "Breaking Down Each Component",
        "content": {
          "items": [
            {"label": "Situation (10%)", "value": "Set the scene briefly. One or two sentences max. Context the interviewer needs."},
            {"label": "Task (10%)", "value": "Your specific responsibility. What were YOU accountable for?"},
            {"label": "Action (60%)", "value": "What YOU did step by step. Use I not we. Be specific about decisions made."},
            {"label": "Result (20%)", "value": "Quantify the outcome. Numbers, percentages, impact. What changed because of you?"}
          ]
        }
      },
      {
        "id": "3",
        "type": "tips",
        "title": "Power Phrases for Each Section",
        "content": {
          "items": [
            "S: ''We were facing a critical deadline when...'' / ''Our team was struggling with...''",
            "T: ''I was responsible for...'' / ''My goal was to...'' / ''I needed to...''",
            "A: ''I decided to...'' / ''I approached this by...'' / ''I collaborated with X to...''",
            "R: ''As a result, we reduced X by Y%...'' / ''This led to...'' / ''The outcome was...''"
          ]
        }
      },
      {
        "id": "4",
        "type": "comparison",
        "title": "Top 8 Questions + What They Test",
        "content": {
          "items": [
            {"label": "Tell me about yourself", "value": "Career narrative — connect past, present, future in 90 seconds"},
            {"label": "Greatest weakness", "value": "Self-awareness — pick a real weakness with active improvement"},
            {"label": "Conflict with colleague", "value": "EQ — focus on resolution process, not who was right"},
            {"label": "Failed project", "value": "Growth mindset — what changed in how you work after"},
            {"label": "Leadership example", "value": "Influence — show leading without formal authority"},
            {"label": "Why this company", "value": "Research — name specific product, mission, or recent news"},
            {"label": "5-year goals", "value": "Alignment — connect your growth to the company direction"},
            {"label": "Proudest achievement", "value": "Values — choose one that aligns with the role requirements"}
          ]
        }
      }
    ]
  }'::jsonb,
  true
),

-- ══════════ PREMIUM SHEETS (Pro/Enterprise only) ══════════

(
  'Two Pointers & Sliding Window',
  'two-pointers-sliding-window',
  'Master these two patterns that solve 30% of all array interview questions at FAANG companies.',
  'dsa',
  'Arrays & Strings',
  'intermediate',
  true,
  ARRAY['arrays', 'two-pointers', 'sliding-window', 'patterns', 'strings'],
  15,
  '{
    "sections": [
      {
        "id": "1",
        "type": "text",
        "title": "When to Use Two Pointers",
        "content": {
          "body": "Use two pointers when: (1) the array is sorted or can be sorted, (2) you need to find pairs/triplets summing to a target, (3) you need to check palindromes, or (4) you need to merge two sorted arrays."
        }
      },
      {
        "id": "2",
        "type": "code",
        "title": "Two Pointers Template",
        "content": {
          "language": "python",
          "code": "def two_pointer_template(arr):\n    left, right = 0, len(arr) - 1\n    result = []\n    \n    while left < right:\n        current_sum = arr[left] + arr[right]\n        \n        if current_sum == target:\n            result.append([arr[left], arr[right]])\n            left += 1\n            right -= 1\n        elif current_sum < target:\n            left += 1   # need larger sum\n        else:\n            right -= 1  # need smaller sum\n    \n    return result",
          "explanation": "Always sort first if not already sorted. Move the pointer that gets you closer to your target."
        }
      },
      {
        "id": "3",
        "type": "text",
        "title": "When to Use Sliding Window",
        "content": {
          "body": "Use sliding window when: you need the longest/shortest subarray satisfying a condition, finding a fixed-size window maximum/minimum, or counting subarrays with a constraint."
        }
      },
      {
        "id": "4",
        "type": "code",
        "title": "Variable Size Sliding Window Template",
        "content": {
          "language": "python",
          "code": "def sliding_window(arr, k):\n    left = 0\n    window_sum = 0\n    max_length = 0\n    \n    for right in range(len(arr)):\n        # Expand window: add right element\n        window_sum += arr[right]\n        \n        # Shrink window: violates constraint\n        while window_sum > k:\n            window_sum -= arr[left]\n            left += 1\n        \n        # Update result\n        max_length = max(max_length, right - left + 1)\n    \n    return max_length",
          "explanation": "right pointer always moves forward. left pointer moves forward only when constraint is violated."
        }
      },
      {
        "id": "5",
        "type": "tips",
        "title": "Classic Problems by Pattern",
        "content": {
          "items": [
            "Two Pointers: Two Sum II (sorted), 3Sum, Container With Most Water, Trapping Rain Water",
            "Sliding Window Fixed: Max sum subarray of size k, Find all anagrams",
            "Sliding Window Variable: Longest substring without repeating chars, Minimum window substring",
            "Fast/Slow Pointers: Linked list cycle, Find middle node, Happy number"
          ]
        }
      },
      {
        "id": "6",
        "type": "complexity",
        "title": "Complexity Gain",
        "content": {
          "time": "O(n) instead of O(n²)",
          "space": "O(1) extra space",
          "note": "This pattern converts brute force nested loops into a single pass"
        }
      }
    ]
  }'::jsonb,
  true
),

(
  'Dynamic Programming — 7 Core Patterns',
  'dp-seven-patterns',
  'The 7 patterns that cover 90% of all DP problems asked in technical interviews.',
  'dsa',
  'Dynamic Programming',
  'advanced',
  true,
  ARRAY['dp', 'dynamic-programming', 'memoization', 'tabulation', 'patterns', 'advanced'],
  25,
  '{
    "sections": [
      {
        "id": "1",
        "type": "text",
        "title": "Is This a DP Problem?",
        "content": {
          "body": "Ask yourself: (1) Can I make choices at each step? (2) Does the problem ask for maximum, minimum, or count? (3) Are subproblems overlapping (same computation repeated)? If yes to all three — it is DP."
        }
      },
      {
        "id": "2",
        "type": "comparison",
        "title": "The 7 Patterns",
        "content": {
          "items": [
            {"label": "1. 0/1 Knapsack", "value": "Each item used at most once. dp[i][w] = max value using first i items with weight limit w"},
            {"label": "2. Unbounded Knapsack", "value": "Items can be reused. Coin change, rod cutting. dp[w] = min coins to make amount w"},
            {"label": "3. Fibonacci-style", "value": "f(n) depends on f(n-1) and f(n-2). Climbing stairs, house robber"},
            {"label": "4. Longest Common Subsequence", "value": "dp[i][j] = LCS of first i chars and first j chars. Edit distance, diff tools"},
            {"label": "5. Matrix Path DP", "value": "Min/max path through grid. dp[i][j] = best way to reach cell (i,j)"},
            {"label": "6. Interval DP", "value": "dp[i][j] = answer for subarray from i to j. Matrix chain, burst balloons"},
            {"label": "7. Bitmask DP", "value": "State = subset of items taken. TSP, assignment problems. dp[mask][i]"}
          ]
        }
      },
      {
        "id": "3",
        "type": "code",
        "title": "Pattern 1: 0/1 Knapsack Template",
        "content": {
          "language": "python",
          "code": "def knapsack(weights, values, capacity):\n    n = len(weights)\n    # dp[i][w] = max value using items 0..i with capacity w\n    dp = [[0] * (capacity + 1) for _ in range(n + 1)]\n    \n    for i in range(1, n + 1):\n        for w in range(capacity + 1):\n            # Don't take item i\n            dp[i][w] = dp[i-1][w]\n            # Take item i (if it fits)\n            if weights[i-1] <= w:\n                dp[i][w] = max(dp[i][w],\n                               dp[i-1][w - weights[i-1]] + values[i-1])\n    \n    return dp[n][capacity]",
          "explanation": "For each item, you decide: include it or skip it. This builds the solution bottom-up."
        }
      },
      {
        "id": "4",
        "type": "code",
        "title": "Pattern 3: Fibonacci-style (House Robber)",
        "content": {
          "language": "python",
          "code": "def rob(nums):\n    if not nums: return 0\n    if len(nums) == 1: return nums[0]\n    \n    # prev2 = dp[i-2], prev1 = dp[i-1]\n    prev2, prev1 = 0, 0\n    \n    for num in nums:\n        current = max(prev1, prev2 + num)\n        prev2 = prev1\n        prev1 = current\n    \n    return prev1",
          "explanation": "Space optimized from O(n) to O(1) by keeping only last 2 values."
        }
      },
      {
        "id": "5",
        "type": "tips",
        "title": "How to Approach Any DP Problem",
        "content": {
          "items": [
            "Step 1: Define state — what does dp[i] or dp[i][j] represent in words",
            "Step 2: Identify the recurrence — how does dp[i] relate to smaller subproblems",
            "Step 3: Identify base cases — smallest inputs with known answers",
            "Step 4: Code top-down (memoization) first — easier to get right",
            "Step 5: Optimize to bottom-up (tabulation) if needed for space"
          ]
        }
      }
    ]
  }'::jsonb,
  true
),

(
  'System Design Interview Blueprint',
  'system-design-blueprint',
  'The exact 8-step framework used by candidates who pass FAANG system design rounds.',
  'system-design',
  'Framework',
  'advanced',
  true,
  ARRAY['system-design', 'scalability', 'framework', 'faang', 'architecture'],
  30,
  '{
    "sections": [
      {
        "id": "1",
        "type": "comparison",
        "title": "The 8-Step Framework (45 min interview)",
        "content": {
          "items": [
            {"label": "1. Requirements (5 min)", "value": "Functional: what the system does. Non-functional: scale, latency, availability"},
            {"label": "2. Scale Estimation (3 min)", "value": "Users/day, requests/sec, storage needed, bandwidth"},
            {"label": "3. High-Level Design (8 min)", "value": "Draw the main components: client, load balancer, servers, DB, cache"},
            {"label": "4. Data Model (5 min)", "value": "Key tables/documents, relationships, choice of SQL vs NoSQL"},
            {"label": "5. Core API (5 min)", "value": "Main endpoints: POST /tweet, GET /feed, etc."},
            {"label": "6. Deep Dive (12 min)", "value": "Pick the hardest part: feed generation, search, real-time updates"},
            {"label": "7. Scale the Design (5 min)", "value": "Add sharding, replication, caching layers, CDN"},
            {"label": "8. Identify Bottlenecks (2 min)", "value": "What fails first? How would you fix it?"}
          ]
        }
      },
      {
        "id": "2",
        "type": "table",
        "title": "SQL vs NoSQL Decision Matrix",
        "content": {
          "headers": ["Need", "Use SQL", "Use NoSQL"],
          "rows": [
            ["Data structure", "Fixed schema, relations", "Flexible/nested documents"],
            ["Scale", "Vertical (up to a point)", "Horizontal (unlimited)"],
            ["Consistency", "Strong ACID needed", "Eventual consistency OK"],
            ["Query patterns", "Complex joins, aggregations", "Simple key-value lookups"],
            ["Examples", "User accounts, orders", "User activity feeds, logs"]
          ]
        }
      },
      {
        "id": "3",
        "type": "comparison",
        "title": "Caching Strategy Decision",
        "content": {
          "items": [
            {"label": "Cache-Aside (Lazy)", "value": "App checks cache first, loads from DB on miss. Best for read-heavy workloads"},
            {"label": "Write-Through", "value": "Write to cache + DB simultaneously. Consistent but slower writes"},
            {"label": "Write-Back", "value": "Write to cache only, async to DB. Fast writes but risk of data loss"},
            {"label": "Read-Through", "value": "Cache handles DB reads. Good for repeated reads of same data"}
          ]
        }
      },
      {
        "id": "4",
        "type": "tips",
        "title": "Numbers Every Engineer Must Know",
        "content": {
          "items": [
            "L1 cache: 1ns | L2: 4ns | RAM: 100ns | SSD: 100μs | Network: 150ms",
            "1 million req/day = ~12 req/sec (divide by 86,400)",
            "1 TB stored in 1,000 servers = 1 GB each",
            "Twitter: 500M tweets/day, 300K reads/sec, 6K writes/sec",
            "A single server handles ~10K concurrent connections",
            "A Postgres DB handles ~10K queries/second with indexes"
          ]
        }
      }
    ]
  }'::jsonb,
  true
),

(
  'Operating Systems — Complete Interview Guide',
  'os-interview-guide',
  'Processes, threads, memory management, scheduling, and deadlocks — everything OS for interviews.',
  'core-cs',
  'Operating Systems',
  'intermediate',
  true,
  ARRAY['os', 'operating-systems', 'processes', 'threads', 'scheduling', 'memory', 'deadlock'],
  20,
  '{
    "sections": [
      {
        "id": "1",
        "type": "table",
        "title": "Process vs Thread",
        "content": {
          "headers": ["Aspect", "Process", "Thread"],
          "rows": [
            ["Memory", "Own private address space", "Shares memory with other threads"],
            ["Creation cost", "Expensive (fork syscall)", "Cheap (within same process)"],
            ["Communication", "Needs IPC (pipes, sockets)", "Direct shared memory access"],
            ["Crash impact", "Isolated — others unaffected", "One crash can kill all threads"],
            ["Context switch", "Very expensive", "Cheaper (same address space"],
            ["Use case", "Independent programs", "Parallel tasks in one program"]
          ]
        }
      },
      {
        "id": "2",
        "type": "comparison",
        "title": "CPU Scheduling Algorithms",
        "content": {
          "items": [
            {"label": "FCFS", "value": "First Come First Served. Simple but convoy effect — short jobs wait behind long ones"},
            {"label": "SJF", "value": "Shortest Job First. Optimal average wait time. Problem: starvation of long jobs"},
            {"label": "Round Robin", "value": "Time quantum q for each process. Fair and responsive. Best for time-sharing systems"},
            {"label": "Priority", "value": "Highest priority runs first. Risk: starvation. Solution: aging (increase priority over time)"},
            {"label": "MLFQ", "value": "Multi-Level Feedback Queue. Used in real OS. Adapts based on behavior automatically"}
          ]
        }
      },
      {
        "id": "3",
        "type": "text",
        "title": "Deadlock — The 4 Conditions (Coffman)",
        "content": {
          "body": "Deadlock occurs when ALL 4 conditions hold simultaneously: (1) Mutual Exclusion — resource held by one process at a time, (2) Hold and Wait — process holds resource while waiting for another, (3) No Preemption — resources cannot be forcibly taken, (4) Circular Wait — P1 waits for P2, P2 waits for P1."
        }
      },
      {
        "id": "4",
        "type": "tips",
        "title": "Deadlock Prevention Strategies",
        "content": {
          "items": [
            "Break Mutual Exclusion: make resources shareable (read locks)",
            "Break Hold and Wait: request all resources at once upfront",
            "Allow Preemption: if blocked, release currently held resources",
            "Break Circular Wait: impose total ordering on resource acquisition"
          ]
        }
      },
      {
        "id": "5",
        "type": "table",
        "title": "Memory Management Comparison",
        "content": {
          "headers": ["Technique", "How it works", "Fragmentation", "Use case"],
          "rows": [
            ["Contiguous", "Single block of memory", "External fragmentation", "Simple systems"],
            ["Paging", "Fixed-size pages mapped to frames", "Internal fragmentation", "Modern OS"],
            ["Segmentation", "Variable-size segments", "External fragmentation", "Code/data/stack separation"],
            ["Virtual Memory", "Pages loaded on demand", "Minimal", "All modern systems"]
          ]
        }
      }
    ]
  }'::jsonb,
  true
),

(
  'Computer Networks — TCP/IP Deep Dive',
  'computer-networks-tcpip',
  'OSI layers, TCP vs UDP, DNS, HTTP/HTTPS, and all CN concepts asked in interviews.',
  'core-cs',
  'Computer Networks',
  'intermediate',
  true,
  ARRAY['networking', 'tcp', 'ip', 'http', 'dns', 'osi', 'protocols'],
  18,
  '{
    "sections": [
      {
        "id": "1",
        "type": "table",
        "title": "OSI Model — 7 Layers",
        "content": {
          "headers": ["Layer", "Name", "Protocol", "Unit", "Job"],
          "rows": [
            ["7", "Application", "HTTP, FTP, SMTP", "Data", "User-facing services"],
            ["6", "Presentation", "SSL, JPEG, ASCII", "Data", "Encryption, encoding"],
            ["5", "Session", "NetBIOS, RPC", "Data", "Session management"],
            ["4", "Transport", "TCP, UDP", "Segment", "End-to-end delivery"],
            ["3", "Network", "IP, ICMP", "Packet", "Routing between networks"],
            ["2", "Data Link", "Ethernet, Wi-Fi", "Frame", "Node-to-node delivery"],
            ["1", "Physical", "Cables, Radio", "Bits", "Physical transmission"]
          ]
        }
      },
      {
        "id": "2",
        "type": "comparison",
        "title": "TCP vs UDP",
        "content": {
          "items": [
            {"label": "Connection", "value": "TCP: Connection-oriented (3-way handshake) | UDP: Connectionless"},
            {"label": "Reliability", "value": "TCP: Guaranteed delivery, retransmission | UDP: Best effort, no guarantee"},
            {"label": "Order", "value": "TCP: In-order delivery guaranteed | UDP: May arrive out of order"},
            {"label": "Speed", "value": "TCP: Slower (overhead) | UDP: Faster (no overhead)"},
            {"label": "Use case", "value": "TCP: HTTP, Email, File transfer | UDP: Video streaming, Gaming, DNS"}
          ]
        }
      },
      {
        "id": "3",
        "type": "text",
        "title": "TCP 3-Way Handshake",
        "content": {
          "body": "Step 1 (SYN): Client sends SYN with sequence number x. Step 2 (SYN-ACK): Server responds with SYN-ACK, acknowledges x+1, sends own sequence y. Step 3 (ACK): Client acknowledges y+1. Connection established. If SYN-ACK lost: both client (after timeout) retransmits SYN AND server retransmits SYN-ACK."
        }
      },
      {
        "id": "4",
        "type": "comparison",
        "title": "HTTP vs HTTPS vs HTTP/2",
        "content": {
          "items": [
            {"label": "HTTP/1.1", "value": "Text protocol, one request per connection (unless keep-alive), no encryption"},
            {"label": "HTTPS", "value": "HTTP + TLS encryption. Uses certificates. Port 443. Prevents MITM attacks"},
            {"label": "HTTP/2", "value": "Binary protocol, multiplexing (multiple requests in one connection), header compression"},
            {"label": "HTTP/3", "value": "Uses QUIC (UDP-based), 0-RTT connection, built-in encryption, used by Google"}
          ]
        }
      }
    ]
  }'::jsonb,
  true
),

(
  'Trees & Graphs — Interview Patterns',
  'trees-graphs-patterns',
  'BFS, DFS, traversals, shortest path, and every tree/graph pattern that appears in FAANG interviews.',
  'dsa',
  'Trees & Graphs',
  'intermediate',
  true,
  ARRAY['trees', 'graphs', 'bfs', 'dfs', 'binary-tree', 'graph-traversal'],
  22,
  '{
    "sections": [
      {
        "id": "1",
        "type": "comparison",
        "title": "DFS vs BFS — When to Use",
        "content": {
          "items": [
            {"label": "Use DFS when", "value": "Finding any path, checking if path exists, topological sort, detecting cycles, tree traversals"},
            {"label": "Use BFS when", "value": "Finding SHORTEST path, level-order traversal, finding closest node, spreading problems (infections)"}
          ]
        }
      },
      {
        "id": "2",
        "type": "code",
        "title": "BFS Template",
        "content": {
          "language": "python",
          "code": "from collections import deque\n\ndef bfs(graph, start, target):\n    queue = deque([start])\n    visited = {start}\n    distance = {start: 0}\n    \n    while queue:\n        node = queue.popleft()\n        \n        if node == target:\n            return distance[node]\n        \n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                distance[neighbor] = distance[node] + 1\n                queue.append(neighbor)\n    \n    return -1  # target not reachable",
          "explanation": "Use deque for O(1) popleft. Always track visited to avoid cycles."
        }
      },
      {
        "id": "3",
        "type": "code",
        "title": "DFS Template (Iterative)",
        "content": {
          "language": "python",
          "code": "def dfs(graph, start):\n    stack = [start]\n    visited = set()\n    result = []\n    \n    while stack:\n        node = stack.pop()\n        if node in visited:\n            continue\n        visited.add(node)\n        result.append(node)\n        \n        # Add neighbors (reversed for left-to-right order)\n        for neighbor in reversed(graph[node]):\n            if neighbor not in visited:\n                stack.append(neighbor)\n    \n    return result",
          "explanation": "Stack-based DFS processes same order as recursive DFS when reversed."
        }
      },
      {
        "id": "4",
        "type": "tips",
        "title": "Most Common Tree Interview Problems",
        "content": {
          "items": [
            "Maximum depth of binary tree — DFS, count levels",
            "Level order traversal — BFS with level tracking",
            "Lowest Common Ancestor — DFS from root, track paths",
            "Binary tree is symmetric — compare left and right subtrees recursively",
            "Path sum equals target — DFS, subtract at each node",
            "Serialize and deserialize binary tree — preorder + null markers"
          ]
        }
      }
    ]
  }'::jsonb,
  true
),

(
  'DBMS & SQL — Complete Interview Guide',
  'dbms-sql-guide',
  'Normalization, ACID, indexes, joins, transactions — everything DBMS for software engineering interviews.',
  'core-cs',
  'DBMS',
  'intermediate',
  true,
  ARRAY['dbms', 'sql', 'normalization', 'acid', 'indexes', 'transactions', 'joins'],
  20,
  '{
    "sections": [
      {
        "id": "1",
        "type": "comparison",
        "title": "Normal Forms",
        "content": {
          "items": [
            {"label": "1NF", "value": "Atomic values only. No repeating groups. Each cell has one value."},
            {"label": "2NF", "value": "1NF + no partial dependency. Non-key attributes depend on ENTIRE primary key."},
            {"label": "3NF", "value": "2NF + no transitive dependency. Non-key attributes depend only on primary key."},
            {"label": "BCNF", "value": "Stricter 3NF. Every determinant must be a candidate key. Eliminates all anomalies."}
          ]
        }
      },
      {
        "id": "2",
        "type": "comparison",
        "title": "ACID Properties",
        "content": {
          "items": [
            {"label": "Atomicity", "value": "Transaction is all-or-nothing. If any part fails, entire transaction rolls back."},
            {"label": "Consistency", "value": "Transaction brings DB from one valid state to another. Constraints are maintained."},
            {"label": "Isolation", "value": "Concurrent transactions execute as if sequential. Dirty reads prevented."},
            {"label": "Durability", "value": "Committed transactions survive crashes. Written to disk, not just memory."}
          ]
        }
      },
      {
        "id": "3",
        "type": "table",
        "title": "SQL JOINs Explained",
        "content": {
          "headers": ["JOIN Type", "Returns", "Use when"],
          "rows": [
            ["INNER JOIN", "Rows matching in BOTH tables", "Need data present in both"],
            ["LEFT JOIN", "All left + matching right (NULL if none)", "Keep all from left table"],
            ["RIGHT JOIN", "All right + matching left (NULL if none)", "Keep all from right table"],
            ["FULL OUTER JOIN", "All rows from both tables", "Find all matches and non-matches"],
            ["CROSS JOIN", "Cartesian product (every combination)", "Generate combinations"]
          ]
        }
      },
      {
        "id": "4",
        "type": "tips",
        "title": "Index Cheat Sheet",
        "content": {
          "items": [
            "B-Tree index: default, good for =, <, >, BETWEEN, ORDER BY",
            "Hash index: only for =, faster than B-Tree for exact lookups",
            "Composite index: column order matters — most selective column first",
            "Index hurts writes: every INSERT/UPDATE/DELETE must update index",
            "When to index: columns in WHERE, JOIN ON, ORDER BY, high cardinality columns",
            "When NOT to index: small tables, columns with few distinct values, write-heavy tables"
          ]
        }
      }
    ]
  }'::jsonb,
  true
),

(
  'Python Interview Cheat Sheet',
  'python-interview-cheatsheet',
  'Python syntax, built-ins, comprehensions, and patterns every interviewer expects you to know.',
  'language',
  'Python',
  'beginner',
  true,
  ARRAY['python', 'syntax', 'built-ins', 'collections', 'interview'],
  12,
  '{
    "sections": [
      {
        "id": "1",
        "type": "code",
        "title": "Essential Built-in Functions",
        "content": {
          "language": "python",
          "code": "# Most used built-ins in interviews\nmax(arr)               # O(n)\nmin(arr)               # O(n)\nsum(arr)               # O(n)\nsorted(arr)            # O(n log n), returns new list\narr.sort()             # O(n log n), in-place\nreversed(arr)          # O(1) iterator\nzip(a, b)              # pairs elements together\nenumerate(arr)         # (index, value) pairs\nany(x > 0 for x in arr)   # True if any element satisfies\nall(x > 0 for x in arr)   # True if all elements satisfy\nabs(-5)                # 5\nlen(arr)               # O(1) for list, dict, set",
          "explanation": "Know the time complexity of each built-in cold."
        }
      },
      {
        "id": "2",
        "type": "code",
        "title": "Collections Module",
        "content": {
          "language": "python",
          "code": "from collections import defaultdict, Counter, deque\n\n# defaultdict — no KeyError\ngraph = defaultdict(list)\ngraph[''a''].append(''b'')  # works even if ''a'' not in dict\n\n# Counter — frequency counting\nfreq = Counter(''abracadabra'')\nfreq.most_common(3)  # [(''a'', 5), (''b'', 2), (''r'', 2)]\n\n# deque — O(1) appendleft and popleft\nq = deque([1, 2, 3])\nq.appendleft(0)  # [0, 1, 2, 3]\nq.popleft()      # 0, queue is [1, 2, 3]\nq.append(4)      # [1, 2, 3, 4]",
          "explanation": "These three are used in almost every medium/hard LeetCode problem."
        }
      },
      {
        "id": "3",
        "type": "tips",
        "title": "One-Liners That Impress",
        "content": {
          "items": [
            "Swap variables: a, b = b, a",
            "Flatten list: flat = [x for sub in nested for x in sub]",
            "Check palindrome: s == s[::-1]",
            "Count chars: freq = Counter(s)",
            "Sort by second element: sorted(pairs, key=lambda x: x[1])",
            "Max in dict by value: max(d, key=d.get)",
            "Remove duplicates keeping order: list(dict.fromkeys(arr))"
          ]
        }
      }
    ]
  }'::jsonb,
  true
);
`;

async function seed() {
    console.log("🌱 Starting Large Batch Seeding...");
    
    // First clear existing sheets to avoid duplicates if re-running
    await supabase.from('user_sheet_progress').delete().neq('user_id', 'none');
    await supabase.from('interview_sheets').delete().neq('slug', 'none');

    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
        console.error("❌ Seeding failed:", error.message);
    } else {
        console.log("✅ Successfully seeded all premium and free sheets.");
    }
}

seed().catch(console.error);
