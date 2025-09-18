---
title: 'Understanding LLM Reasoning Through Meaning-Removed Steering Vectors'
date: 2024-12-01
permalink: /posts/2024/12/meaning-removed-steering-vectors/
tags:
  - machine learning
  - llm reasoning
  - interpretability
  - research
---

Large Language Models (LLMs) have shown remarkable capabilities in reasoning tasks, but understanding and controlling their internal reasoning processes remains a significant challenge. In my ongoing research at the MINE Lab (University of Notre Dame), I'm working on a novel approach to this problem: **meaning-removed steering vectors**.

## The Challenge

Traditional approaches to understanding LLM reasoning often struggle to separate the *semantic content* of what models are processing from the *behavioral patterns* of how they process it. When we intervene in a model's hidden states, are we changing what it "thinks about" or how it "thinks"? This fundamental question has important implications for both interpretability and control.

## Our Approach: Meaning-Removed Control Vectors

Our key innovation is constructing control vectors that isolate behavioral patterns from semantic content. Here's how it works:

### 1. Position-Matched Rephrasing
We create pairs of sentences that have the same syntactic structure and reasoning requirements but different semantic content. For example:
- Original: "If all roses are flowers, and this is a rose, then..."
- Rephrased: "If all cars are vehicles, and this is a car, then..."

### 2. Vector Construction
By comparing the hidden state representations of these matched pairs, we extract what we call "meaning-removed control vectors" (v_r^-). These vectors capture the reasoning *process* while factoring out the specific *content*.

### 3. Causal Interventions
We then inject or ablate these vectors at different layers of the model to observe their effects on reasoning behavior.

## Key Findings

Our preliminary results show that these interventions can:
- **Substantially improve reflective reasoning (ΔR)** - the model becomes better at double-checking its own logic
- **Minimally affect transition and execution behaviors (ΔT, ΔE)** - the model's basic language generation remains intact
- **Provide interpretable insights** into where and how reasoning happens in transformer architectures

## Validation and Reproducibility

We've implemented rigorous validation through:
- **Cosine similarity analysis** to verify that our vectors capture meaningful patterns
- **Nearest-neighbor analyses** to understand the semantic space around our interventions
- **Re-sampling stability filters** to ensure robustness across different examples
- **Layer-wise ablation studies** to map reasoning processes across the model

## Broader Impact

This work has implications beyond just understanding LLMs:
- **AI Safety**: Better control over reasoning processes could help prevent hallucinations
- **Education**: Understanding how models reason could inform how we teach reasoning to humans
- **Tool Development**: More controllable reasoning could enable better AI assistants

## Open Science

As part of our commitment to reproducible research, we're releasing:
- Complete tooling for vector extraction and analysis
- Comprehensive tutorials and documentation
- Example datasets and validation scripts

This work is also contributing to the NSF C2D project (Award #2321054), where I've been developing educational materials and tutorials to help other researchers understand these techniques.

## What's Next?

We're currently preparing our manuscript for submission to EACL 2026. The next steps include:
- Expanding to more diverse reasoning tasks
- Testing on larger model architectures
- Developing real-time intervention techniques for practical applications

## Conclusion

Understanding how LLMs reason is one of the most important challenges in modern AI research. By separating the "what" from the "how" of reasoning, meaning-removed steering vectors offer a new lens for both interpreting and controlling these powerful systems.

If you're interested in learning more about this work or discussing potential collaborations, feel free to reach out at [hyoo@nd.edu](mailto:hyoo@nd.edu).

---

*This blog post describes ongoing research at the MINE Lab, University of Notre Dame, under the supervision of Prof. Xiangliang Zhang. The work is currently under submission for peer review.*
