---
title: 'Software engineering: a decade later'
subtitle: AI can write the code. It can’t feel when the interface is wrong.
date: 2026-08-22
tags: []
---

I’m one month into my transition from engineering management and product to hands-on software engineering after nearly a decade away from it. The biggest change is the role of AI in software development. Here’s what I’ve noticed so far.

One of my first assignments was to create a generic library for building search facets from a dataset: given a table, determine which columns are usable as discrete filters and what their distinct values are. I used frontier AI models to plan and implement it, but I found that this produced a confusing class structure and functions that were difficult to use. This would have been immediately obvious to any human actually trying to use it. I started noticing this same pattern elsewhere.

**AI works better for me as a sounding board than as a primary author for designing systems, control flows, and software interfaces** (like class structures and function signatures). A good interface depends on a feedback loop where the pain of a bad design decision makes it back to its designer. A bad interface becomes painfully obvious the moment you use it. AI is immune to this pain, breaking that feedback loop. Better prompting seems to help, but only to a point. Lived pain is the best teacher.

**For me, no amount of reviewing code produces the same richness of understanding and joy that coauthoring it does.** While it certainly feels productive for AI to generate everything for me to review, it also feels hollow. And it defeats the whole point I moved from management back into hands-on engineering: to create, not only manage. I've already started to see experienced engineers I respect move completely away from agentic coding because of this. For me, then, authoring key class structures and function signatures but delegating their internal implementations gives me the best balance of speed, quality, and creativity. This reminds me of README-driven development: define _how_ you want consumers to be able to use your library/class/function, and then design and implement it to achieve that.

The broader lesson I’m seeing is that a human should make the decision when it directly affects another human, or when making the decision is how you get better at making them.
