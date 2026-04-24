"""
Greedy scheduling algorithm implementation.

This module provides the core greedy assignment logic used by the scheduling engine.
The algorithm iterates through slots sorted by date and time, assigning members
based on preference levels (high → medium → low) while respecting constraints.
"""
