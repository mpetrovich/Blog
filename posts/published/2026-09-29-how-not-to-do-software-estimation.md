---
title: How (not) to do software estimation
subtitle: Use orders of magnitude, not story points.
date: 2026-09-29
topics: [engineering, process, decision-making]
---

Hofstadter's Law: It always takes longer than you expect, even when you take into account Hofstadter's Law.

This is true in life, and especially in software engineering. I've been doing this for more than 20 years and I still cannot tell you with any certainty how long it would take to do anything of reasonable complexity. Hell, I'd probably be off by at least half.

## Why even estimate?

So why bother estimating at all, then? I tried that for a while too. And it works. Until someone else depends on you completing that thing in order to do their thing. Their thing could be anything: building other systems that rely on yours, planning marketing campaigns to promote your thing, or the most common case: deciding whether your thing is worth doing now, later, or even at all.

Three main reasons:

1. **To help decide whether something is worth doing.** Building software costs a lot of money, so any business that knows what they're doing will try to get the most value out of it for the least amount of engineering effort. Without having a way to estimate the effort, half of the ROI equation is missing and the business cannot make the most efficient bets. A product or feature that is expected to drive $500K in annual sales makes sense to build if it takes 2 engineers only a month to do it. If it takes 10 engineers 6 months, less so.
2. **To forecast when something will be done**, so downstream dependencies can sequence their work accordingly.
3. **The act of estimating helps identify risks and unknowns** that otherwise might have been discovered later during development. Estimating together also helps share knowledge and train participants in how to break complex things down into smaller, simpler pieces. If two people disagree on how much effort something is, that's a great opportunity to share missing information and perspective.

## How (not) to estimate

Ok, so how should you estimate, then? There are a few popular options, each with their flaws.

**As raw time.** This estimates effort in development hours or days. "This work will take 10 hours", "3 days", "2 weeks", etc. Seems straightforward and intuitive but is deeply flawed because (a) humans are notoriously bad at estimating anything remotely complex, (b) it's common to mistake development time for actual calendar time, and (c) it implies a degree of precision that is just not there. A "10-day" task may take 14 calendar days one time, 8 days another, and 18 a third time. Estimates are bets, and bets should be expressed as ranges.

**As an abstract complexity estimate.** Every task is assigned a number that represents its complexity relative to some agreed-upon example. For instance, a 1-point task would be the simplest change possible, like a trivial copy change on a website. A 2-point task would be a proportionally more complex change, like changing the appearance or behavior of an existing button. A 3 might be adding a contact form to the site. And so on.

Many teams use point values from the Fibonacci sequence (1, 2, 3, 5, 8, 13, etc.) so that as things increase in complexity, the values increase faster than linearly (and also because nobody wants to argue whether something is an 8 or 9). But using Fibonacci is flawed, too, because in practice these estimates cannot be easily added. 8 individual 1-point text changes will never be the same amount of effort as one 8-point feature that takes two weeks to implement, but using Fibonacci treats them as equivalent. This makes it difficult to reliably measure the workload of a team over time since sums cannot be compared.

## How to estimate

To meet the goals of estimation, a estimation methodology should have the following properties:

- **Have estimates that can be added.** Comparing the total cost of one body of work to another can only be done if the cost of individual items can be summed into a total. Otherwise, you're left comparing individual items in each set or the distribution of estimates in each, which becomes messy and hard to do well.
- **Be directly proportional to cost.** A set of tasks that has twice the total estimated effort of another set should actually cost twice the development effort of the other.
- **Map to time.** Since engineers are effectively paid by the hour, engineering cost is directly proportional to engineering time. A feature that takes 2 months to build costs twice as much in staff pay as one that takes the same contributors only 1 month. I'm deliberately omitting other factors like opportunity costs, technical debt, etc. to keep things simple and focused on the primary factor here: time.

After many of my own experiments, I've landed on methodology that exhibits the properties above and seems to work well. Interestingly, it's a fusion of the two flawed approaches above:

1. **Estimate how long it would take 1 person, working on nothing else, to complete it.** You're still estimating time but the (im)precision of the estimate better reflects how inaccurate it might be.
2. **Use a scale of minutes, hours, days, weeks, months** and map them to values that reflect those differences in magnitude. Each label represents a time range, not a specific duration. For instance:
   - Minutes (0.1)
   - Hours (1)
   - Days (5)
   - Weeks (25)
   - Months (100)

For example, a task that takes a couple hours to do would be a 1. Another that takes a day or two would be a 5. A week: 25. A few months: 100.

The point is less about the specific values used and more about their differences in order of magnitude. In the example scale above, most values are 4-5x the previous, which maps relatively accurately to those same time ranges (~5 useful hours in a workday, 5 days in a work week, 4 weeks in a month).

The time labels make them easier to remember, and the values make them additive so they still make sense when summed. In contrast to the Fibonacci example, 5 individual days-long tasks do feel comparable to one weeks-long one.

The benefits of this approach become pretty clear once in use:

- **Estimates no longer need to be translated for non-technical folks.** "What is an 8, again? How long will that actually take?"
- **The estimate range scales proportionally with each step in the scale**, which is a more accurate reflection of uncertainty in the estimate. A feature estimated as "months" could take one month. Or three. Knowing which one it is isn't possible without breaking it down into weeks-long tasks, which is the whole point.
- **Large tasks within a body of work dominate the overall estimate.** This is good, because it reflects the high level of uncertainty and complexity from it. It's a sign to reduce uncertainty and complexity by breaking down the work into smaller, simpler pieces. Dozens of cheap, well-known tasks should not drown out the effects of a single large, uncertain task.
- **The steps in the scale are far enough apart to avoid bikeshedding debates** that happen with other scales (even Fibonacci). It's rare for there to be disagreement about whether something should take days vs. weeks.

In the end, Hofstadter's Law still wins. You'll still be wrong. But less wrong than before, because you won't be pretending your guesses are more precise than they really are.
