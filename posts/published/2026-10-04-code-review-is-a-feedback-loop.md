---
title: Code review is a feedback loop
subtitle: Encode what the system values, automate what you can, and keep humans for the rest.
date: 2026-10-04
topics: [engineering, process]
---

We're trying to improve our code review practices at my current company, so I've been thinking about the purpose of code review—and what it means for coding, too.

David Poll, lead for GitHub's Code & Review org, [recently wrote](https://davidpoll.com/2026/02/code-review-is-not-about-catching-bugs/) that code review is not only for catching bugs. It's a chance to review whether a proposed change should be made to a product based on criteria that cover intent, taste, and coherence. I agree, and I believe there's a more generalizable conclusion that's worth exploring: **Code review is a feedback loop.**

Writing software is part of a broader system that produces value for someone. Viewed through a systems-thinking lens, code review acts as a feedback loop that tries to align the code with the needs of the rest of the system. The system’s needs, often encoded as values and rules, are explicitly set or inferred from feedback. This looks like precommit rules, developer docs that state preferences (e.g. immutability), and tribal knowledge shared via PR comments ("we avoid business logic in the API layer").

To discover and encode these needs, ask:

- What things does the system value?
- What rules can and should be used to enforce these values? How?
- For values that cannot be enforced with rules, how should feedback be sourced and applied?
- How should this affect how the software is actually produced? e.g. processes and tools like pairing, QA, AI

These answers describe the shape of the code writing and review processes that are needed.
