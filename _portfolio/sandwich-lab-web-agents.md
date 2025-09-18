---
title: "Trajectory-Level Web Agent Evaluation"
excerpt: "Developing comprehensive evaluation frameworks for web agents that assess both action sequences and value alignment at SaNDwich Lab (IBM–Notre Dame collaboration)."
collection: portfolio
share: false
---

## Project Overview

At the SaNDwich Lab, a collaboration between IBM and the University of Notre Dame, I'm working under [Prof. Toby Jia-Jun Li](https://toby.li/) to revolutionize how we evaluate web agents. Rather than simple success/failure metrics, we're developing trajectory-level evaluation that assesses the quality and value alignment of entire action sequences.

## Key Innovations

### Trajectory-Level Evaluation
- **Beyond binary success metrics** - scoring action sequences, not only end success
- **Value alignment assessment** - encoding user preferences (vegan, budget-conscious) and tracking adherence
- **Separate reasoning tracks** - logging value reasoning separately from action reasoning

### Controlled Testing Environment
- **Created replica testbeds** for retail, maps, and flight booking scenarios
- **Standardized browser automation** using browser-use framework (screenshots + DOM)
- **Avoided anti-bot drift** through controlled environments for reproducible evaluations

### Comprehensive Instrumentation
- **Completion-page checks** to prevent false continuation
- **Multi-factor analysis** including API vs. end-to-end performance
- **Environmental variables** such as recommender settings, pricing frames, and deceptive ads

## Technical Implementation
- Browser automation using screenshots and DOM manipulation
- Controlled environment replication for major web platforms
- Value encoding and preference tracking systems
- Comprehensive logging and analysis pipelines

## Impact and Applications
This framework enables more sophisticated evaluation of web agents across various domains:
- E-commerce platforms with budget and preference constraints
- Travel booking with personal preferences and restrictions
- Navigation systems with accessibility requirements
- General web automation with ethical considerations

## Publication Status
This work is being prepared for submission to IUI 2026, where it will contribute to advancing the field of human-AI interaction and web automation evaluation.
