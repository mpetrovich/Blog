---
title: What not to delegate to AI
subtitle: Delegating these things to AI leads to unsustainable systems.
date: 2026-08-29
topics: [ai, engineering]
---

My opinions on AI in software engineering are starting to crystallize. In particular, I now strongly believe that delegating the following things to AI leads to unsustainable systems:

**1. Root cause analysis.** Bugs are the result of when your understanding of how you *think* a system works is different from how it actually works. Debugging is how you discover which part of your understanding was wrong. Reading someone else’s root cause analysis is far worse of a teacher than lived experience.

**2. Defining software interfaces and test cases.** Defining what “good” looks like requires judgement, critical thinking, and empathy for the user (of whatever you’re testing), none of which AI has. Furthermore, relying on AI to write the tests for the code that it’s also writing is like asking a student to write the questions for their own exam. How effective do you think that would be?

**3. Writing nontrivial code comments, commit messages, and PR descriptions.** Unless you believe that Gas Town is a sustainable software engineering practice, then you must assume the humans will still need to read the code, especially the prose that explains what and why things exist. AI is still terrible at writing things both clearly and accurately (especially Opus 5, dear god). And having to explain what something does and why forces you to understand it, which is far more important than the minutes saved by delegating it to AI.

The common thread here is that delegating these things to AI avoids needing to actually understand the systems you own. Writing the code used to be the implicit forcing function that generated understanding. But now that AI can do that, we need to be deliberate about keeping that incentive alive in some other form.
