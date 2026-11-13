---
title: Treat process like product
subtitle: The best teams are deliberate about changing how they work, not just what they ship.
date: 2026-11-13
topics: [process]
---

The most effective teams are the ones who learn the fastest:

1. What their customers need
2. How to best deliver it

To learn #1, many teams are deliberate about how they change their customer-facing products. Before making a change, they identify the problem, why it matters, evidence of its impact, and how they'll evaluate the success of the solution.

But for #2, far fewer teams seem to be as rigorous when making changes to _how_ they work. Too often, they make changes based on instinct, what worked on another team, or a desire to prove themselves. This is problematic just as it would be if they did the same for #1: they're less likely to notice whether the changes actually made things worse or had unintended downstream effects, and they won't learn from them.

In my experience, the most effective teams are the ones who follow the same evidence-driven process for both #1 and #2:

1. Prove the existence and impact of the problem with evidence
2. Identify the underlying causes to address, not just the symptoms
3. Design a solution
4. Define success criteria and the actions you'll take based on results
5. Implement and test the solution
6. Evaluate the results and do the planned actions

This shows up whether changing team rituals, tools, or controls. A few examples:

### Copying another team's delivery process

Team delivery feels unpredictable and stakeholders keep asking for delivery dates, so the manager wholesale copies a two-week sprint process with story points and sprint commitments because that's what they did before on another team. But these become Agile theater with no material improvement to actual delivery.

What was skipped was gaining a deeper understanding of where time actually goes (blocked vs. building vs. rework), which of those are more unpredictable than others and why, and what the measurable outcomes actually are.

A better approach would be to measure cycle time first, change only the parts that are problematic, and evaluate whether these changes actually show up as more predictable delivery.

### Mandating AI to ship faster

The team feels pressure to ship faster with AI, so AI usage is mandated or incentivized with usage-based metrics. The team drowns in code reviews, changes become more difficult because fewer people understand the systems, and rework goes up due to AI amplifying poor practices.

What was skipped was investigating whether coding speed was actually the bottleneck in all cases, whether amplifying current habits would help or hurt, and what the delayed effects on quality and understanding would be.

A better path would be to pilot AI usage across specific use cases and measure its impact on outcomes such as lead time and defect/rework rates before deciding whether and where to adopt AI more broadly.

### Adding approvals after an incident

A bad change caused an incident, so a heavier change control process was instituted globally: two approvals for every change. Change review queue expands dramatically, rubber-stamping increases, and real bugs still ship anyway.

What was skipped was understanding and addressing the root causes of that specific incident.

A better solution is tighter testing, verification, and review for that area and similar ones, measuring escaped defects vs. review wait time as the success criteria.

---

The failure mode is the same across all three: if you can't identify what would make you revert the change, you're making it blindly and won't learn from it. Instead, use the same rigor for changing _how_ you work as you do for _what_ you ship.
