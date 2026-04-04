# Competition Organizer

Documentation for the World of Floorcraft competition organizing, judging, and results system.

Linear epic: [WOF-13](https://linear.app/floorcraft/issue/WOF-13/competition-organizer)

## Implementation Status

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Foundation | Backend complete | Schema, routers, tests. Frontend not started. |
| Phase 2: Registration & Entries | Designed | Schema + router specs committed |
| Phase 3: Pre-comp Operations | Designed | Schema + router specs committed |
| Phase 4: Scoring Engine | Designed | Schema + router specs + test data committed |
| Phase 5: Judge UI | Designed | Schema + router specs committed |
| Phase 6: Comp Day Operations | Designed | Schema + router specs committed |
| Phase 7: Post-comp & Global | Designed | Schema + router specs committed |

## Documentation Structure

### [`technical/`](./technical/)
Architecture, data model, and implementation details for developers.

- [Design Document](./technical/design.md) — Feature design, page specs, and business rules
- [Implementation Phases](./technical/phases.md) — Phased breakdown with task checklists and implementation notes
- Schema docs: [Phase 1](./technical/schema-phase1.md) · [Phase 2](./technical/schema-phase2.md) · [Phase 3](./technical/schema-phase3.md) · [Phase 4](./technical/schema-phase4.md) · [Phase 5](./technical/schema-phase5.md) · [Phase 6](./technical/schema-phase6.md) · [Phase 7](./technical/schema-phase7.md)
- Router docs: [Phase 1](./technical/routers-phase1.md) · [Phase 2](./technical/routers-phase2.md) · [Phase 3](./technical/routers-phase3.md) · [Phase 5](./technical/routers-phase5.md) · [Phase 6](./technical/routers-phase6.md) · [Phase 7](./technical/routers-phase7.md)
- [Scoring Test Data](./technical/scoring-tests.md) — Comprehensive test cases from skating system PDF

### [`user-guide/`](./user-guide/)
End-user documentation organized by role.

- [Competition Organizer Guide](./user-guide/organizer.md) — Creating and managing competitions (Phase 1)
- Competitor Guide — *coming with Phase 2*
- Judge Guide — *coming with Phase 5*
- Scrutineer Guide — *coming with Phase 5/6*
- Day-of Staff Guide — *coming with Phase 6*
