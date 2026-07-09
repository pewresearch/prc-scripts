# `labelLayout/`

**What lives here:** Framework-agnostic label layout compute — declutter simulation, canvas measurement, label builders, leader-line geometry/store. Kinds: engine, types. **No JSX.**

**Dependency rule:** May import `../types/`, `../utilities/`, `../compute/`, and npm packages (`d3-force`, `@visx/scale`). Must **not** import React or `hooks/`.

**Consumers:** `@prc/charting-library` label components/hooks import via `@prc/charting-utilities` package exports.
