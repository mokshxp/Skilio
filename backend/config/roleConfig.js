/**
 * ROLE_CONFIG: The single source of truth for role-specific interview DNA.
 * Defines core topics, system design focus, DSA priorities, and behavioral themes.
 */
const ROLE_CONFIG = {
  "ML Engineer": {
    coreTopics: [
      "Supervised vs Unsupervised Learning",
      "Gradient Descent & Backpropagation",
      "Overfitting, Regularization (L1/L2, Dropout)",
      "CNN, RNN, LSTM, Transformers",
      "Model Evaluation: Precision, Recall, F1, AUC-ROC",
      "Feature Engineering & Selection",
      "Bias-Variance Tradeoff",
      "MLOps: Model Serving, Monitoring, Drift Detection",
    ],
    systemDesignTopics: [
      "Design a real-time recommendation engine",
      "Design a fraud detection pipeline",
      "Feature store architecture",
      "ML model serving at scale (latency vs throughput)",
      "Data versioning and experiment tracking (MLflow)",
    ],
    dsaFocus: [
      "Matrix operations & graph problems",
      "Dynamic Programming for sequence modeling",
      "Sliding window for time-series",
      "Heap-based top-K problems (e.g., top-K similar items)",
    ],
    behavioralFocus: [
      "Handling model failure in production",
      "Collaborating with data engineers and PMs",
      "Explaining model decisions to non-technical stakeholders",
      "Dealing with insufficient or biased training data",
    ],
    realWorldContext: "FAANG/top-tier ML team hiring for production ML systems",
  },

  "Frontend Engineer": {
    coreTopics: [
      "React lifecycle, hooks, reconciliation",
      "Browser rendering pipeline & Critical Rendering Path",
      "Web performance: LCP, FID, CLS, TTI",
      "Accessibility (WCAG 2.1)",
      "CSS: specificity, flexbox, grid, animations",
      "State management: Redux, Zustand, Context API",
      "TypeScript generics and utility types",
      "Security: XSS, CSRF, CSP headers",
    ],
    systemDesignTopics: [
      "Design a scalable design system",
      "Micro-frontend architecture",
      "Infinite scroll vs pagination",
      "Real-time collaborative editor (like Figma)",
      "Offline-first PWA architecture",
    ],
    dsaFocus: [
      "DOM tree traversal (tree problems)",
      "Debounce/throttle implementation",
      "Event delegation patterns",
      "Trie for autocomplete",
    ],
    behavioralFocus: [
      "Balancing design fidelity with engineering constraints",
      "Cross-browser compatibility war stories",
      "Collaborating with backend teams",
      "Performance optimization wins",
    ],
    realWorldContext: "Senior frontend role at a product-first tech company",
  },

  "Backend Engineer": {
    coreTopics: [
      "REST vs GraphQL vs gRPC",
      "Database indexing, query optimization, ACID transactions",
      "Caching strategies: write-through, write-back, LRU",
      "Message queues: Kafka, RabbitMQ, SQS",
      "API rate limiting & throttling",
      "Microservices vs monolith trade-offs",
      "Container orchestration: Docker, Kubernetes",
      "Security: SQL injection, OAuth2, JWT",
    ],
    systemDesignTopics: [
      "Design a URL shortener",
      "Design a distributed job scheduler",
      "Design a notification system at scale",
      "Rate limiter design",
      "Design Twitter's timeline feed",
    ],
    dsaFocus: [
      "Hash maps for caching problems",
      "Graph BFS/DFS for dependency resolution",
      "Consistent hashing",
      "LRU cache implementation",
    ],
    behavioralFocus: [
      "Handling production outages",
      "Technical debt decisions",
      "Mentoring junior engineers",
      "Cross-team API contract negotiations",
    ],
    realWorldContext: "Backend engineering role at a high-scale SaaS company",
  },

  "Full Stack Engineer": {
    coreTopics: [
      "Full web stack: Frontend rendering to Database persistence",
      "React/Next.js and Node.js synchronization",
      "Database schema design & migrations",
      "API design and authentication (JWT/OAuth)",
      "Deployment pipelines (CI/CD)",
      "Web sockets & real-time updates",
    ],
    systemDesignTopics: [
      "Design an E-commerce platform",
      "Design a real-time chat application",
      "Design a collaboration tool (Trello/Jira clone)",
      "Payment gateway integration patterns",
    ],
    dsaFocus: [
      "Arrays, HashMaps, and basic Graphs",
      "Concurrency and async performance",
      "Object-oriented design patterns",
    ],
    behavioralFocus: [
      "Shipping MVP vs perfect code",
      "Full-stack debugging war stories",
      "Communicating between design and infrastructure",
    ],
    realWorldContext: "High-impact role at a fast-growing startup",
  },

  "Data Scientist": {
    coreTopics: [
      "Probability & Statistics",
      "Hypothesis testing & P-values",
      "Data visualization & Storytelling",
      "Exploratory Data Analysis (EDA)",
      "SQL for data extraction",
      "Machine Learning basics: Regression, Classification, Clustering",
    ],
    systemDesignTopics: [
      "Designing A/B tests at scale",
      "Data pipeline for analytics",
      "Dashboard latency optimization",
    ],
    dsaFocus: [
      "Data manipulation using Pandas/NumPy",
      "Sorting and searching algorithms",
      "Mathematical optimization algorithms",
    ],
    behavioralFocus: [
      "Presenting insights to non-technical executives",
      "Handling missing or messy data",
      "Deciding which metric to optimize",
    ],
    realWorldContext: "Analytics role at a data-driven enterprise",
  },

  "DevOps Engineer": {
    coreTopics: [
      "Infrastructure as Code (Terraform, CloudFormation)",
      "CI/CD pipeline automation (GitHub Actions, Jenkins)",
      "Containerization & Orchestration (Docker, K8s)",
      "Cloud platforms (AWS/Azure/GCP)",
      "Monitoring & Observability (Prometheus, Grafana)",
      "Linux internals and networking",
      "Site Reliability Engineering (SRE) principles",
    ],
    systemDesignTopics: [
      "Design a zero-downtime deployment strategy",
      "Design a multi-region disaster recovery plan",
      "Infrastructure scaling based on traffic",
      "Centralized logging architecture",
    ],
    dsaFocus: [
      "Graph-based dependency resolution",
      "String parsing for log monitoring",
      "Automated cleanup and resource management logic",
    ],
    behavioralFocus: [
      "Managing high-pressure production incidents",
      "Convincing devs to prioritize reliability",
      "Building a culture of automation",
    ],
    realWorldContext: "Platform/SRE role at a technology-first scaling company",
  },
  
  "Product Manager": {
    coreTopics: [
      "Product discovery & Market fit",
      "Roadmap prioritization frameworks (RICE/MOSCOW)",
      "Data-informed decision making",
      "Defining North Star metrics",
      "UI/UX principles for PMs",
      "Stakeholder management",
    ],
    systemDesignTopics: [
      "High-level architecture awareness (Frontend vs Backend vs Mobile)",
      "Scalability impact on user experience",
      "Defining technical requirements for a new feature",
      "Feature rollout strategies (A/B, Canary)",
    ],
    dsaFocus: [
      "Logical reasoning and quantitative analysis",
      "Understanding complexity trade-offs for feature builds",
    ],
    behavioralFocus: [
      "Dealing with engineering pushback",
      "Influencing without authority",
      "Pivoting based on user feedback",
      "Handling feature failures",
    ],
    realWorldContext: "Product role at a top-tier consumer or B2B tech firm",
  }
};

module.exports = { ROLE_CONFIG };
