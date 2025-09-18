---
title: "Meaning-Removed Steering Vectors for LLM Reasoning"
excerpt: "Developing novel techniques for calibrating large language model reasoning through sentence-level hidden-state interventions at MINE Lab, University of Notre Dame."
collection: portfolio
share: false
---

## Project Overview

At the MINE Lab (University of Notre Dame), I'm working on cutting-edge research into LLM reasoning calibration under the supervision of [Prof. Xiangliang Zhang](https://engineering.nd.edu/faculty/xiangliang-zhang/). This project focuses on developing meaning-removed steering vectors to improve reflective reasoning in large language models.

## Key Contributions

### Novel Methodology
- **Separated behavior from semantics** by constructing a meaning-removed control vector $\\mathbf{v}_r^{-}$ via position-matched rephrasing
- **Performed causal injections/ablations** across layers and validated with cosine-similarity structure and nearest-neighbor analyses
- **Demonstrated substantial improvements** in reflective reasoning (ΔR) while minimally affecting transition and execution behaviors (ΔT, ΔE)

### Technical Implementation
- **Released reproducible tooling** for vector extraction and layer-wise ablations
- **Developed re-sampling stability filter** to drop mixed-behavior positions
- **Created comprehensive validation framework** using cosine-similarity structure and nearest-neighbor analyses

### Broader Impact
- **Authored ML primers** and tutorial sections for educational purposes
- **Contributed to NSF C2D project** (Award #2321054) with tutorial development
- **Prepared co-first-author manuscript** under submission to EACL 2026

## Technical Skills Demonstrated
- PyTorch for deep learning model manipulation
- Advanced vector space operations and similarity analysis
- Causal intervention techniques in neural networks
- Statistical validation and stability analysis
- Scientific writing and research documentation

## Status
This work is currently under submission as a co-first-author (equal contribution) manuscript to EACL 2026, representing a significant contribution to the field of LLM interpretability and reasoning calibration.
