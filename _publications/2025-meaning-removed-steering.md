---
title: "Meaning-Removed Steering Vectors for Calibrating LLM Reasoning"
collection: publications
category: manuscripts
excerpt: 'We demonstrate that sentence-level hidden-state interventions substantially improve reflective reasoning while minimally affecting transition and execution behaviors through meaning-removed control vectors.'
date: 2025-01-01
venue: 'Submitting to EACL'
citation: 'Yoo, H.*, Zhuang, H.* (2025). Meaning-Removed Steering Vectors for Calibrating LLM Reasoning. Submitting to EACL.'
---

**Status**: Under submission (co-first author, equal contribution)

**Abstract**: This work introduces novel techniques for calibrating large language model reasoning through sentence-level hidden-state interventions. We demonstrate that meaning-removed control vectors, constructed via position-matched rephrasing, can substantially improve reflective reasoning (ΔR) while minimally affecting transition and execution behaviors (ΔT, ΔE).

**Key Contributions**:
- Separated behavior from semantics by constructing meaning-removed control vector v_r^- via position-matched rephrasing
- Performed causal injections/ablations across layers and validated with cosine-similarity structure and nearest-neighbor analyses
- Released reproducible tooling for vector extraction, re-sampling stability filter, and layer-wise ablations
- Authored ML primers and tutorial section for NSF C2D project (Award #2321054)

**Impact**: This work provides new insights into the internal mechanisms of LLM reasoning and offers practical tools for improving model reliability and interpretability.
