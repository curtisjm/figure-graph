#!/usr/bin/env python3
"""Add turn_direction field to all figure YAML files.

turn_direction values:
  natural  = right/clockwise turn
  reverse  = left/counter-clockwise turn
  null     = no significant turn (walks, feather steps, etc.)
"""

import os
import sys

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

# Comprehensive mapping: relative path from data/ -> turn_direction value
# Values: "natural", "reverse", or None (for YAML null)
TURN_DIRECTIONS = {
    # === FOXTROT ===
    # Bronze
    "foxtrot/bronze/1-feather-step.yaml": None,
    "foxtrot/bronze/2-three-step.yaml": None,
    "foxtrot/bronze/3-natural-turn.yaml": "natural",
    "foxtrot/bronze/4-reverse-turn--incorporating-feather-finish.yaml": "reverse",
    "foxtrot/bronze/5-closed-impetus-and-feather-finish.yaml": "natural",
    "foxtrot/bronze/6-natural-weave.yaml": "natural",
    "foxtrot/bronze/7-change-of-direction.yaml": "reverse",
    "foxtrot/bronze/8-basic-weave.yaml": "reverse",
    # Silver
    "foxtrot/silver/9-closed-telemark.yaml": "reverse",
    "foxtrot/silver/12-hover-feather--taken-after-a-heel-pull.yaml": None,
    "foxtrot/silver/13-hover-telemark.yaml": "reverse",
    "foxtrot/silver/13-hover-telemark-to-pp.yaml": "reverse",
    "foxtrot/silver/14-natural-telemark.yaml": "natural",
    "foxtrot/silver/15-hover-cross.yaml": "natural",
    "foxtrot/silver/16-open-telemark-natural-turn-to-outside-swivel-and-feather-ending.yaml": "reverse",
    "foxtrot/silver/16-open-telemark-natural-turn-to-outside-swivel-and-feather-ending--cont.yaml": "reverse",
    "foxtrot/silver/17-open-impetus.yaml": "natural",
    "foxtrot/silver/18-weave-from-pp--leader.yaml": "reverse",
    "foxtrot/silver/19-reverse-wave--leader.yaml": "reverse",
    # Gold
    "foxtrot/gold/20-natural-twist-turn.yaml": "natural",
    "foxtrot/gold/20-natural-twist-turn-with-closed-impetus-and-feather-finish-ending--cont.yaml": "natural",
    "foxtrot/gold/20-natural-twist-turn-with-natural-weave-ending--cont.yaml": "natural",
    "foxtrot/gold/20-natural-twist-turn-with-open-impetus-ending--cont.yaml": "natural",
    "foxtrot/gold/21-curved-feather-to-back-feather.yaml": "natural",
    "foxtrot/gold/22-natural-zig-zag-from-promenade-position.yaml": "natural",
    "foxtrot/gold/23-fallaway-reverse-and-slip-pivot.yaml": "reverse",
    "foxtrot/gold/24-natural-hover-telemark.yaml": "natural",
    "foxtrot/gold/25-bounce-fallaway-with-weave-ending.yaml": "reverse",

    # === QUICKSTEP ===
    # Bronze
    "quickstep/bronze/0-change-of-direction--leader.yaml": "reverse",
    "quickstep/bronze/1-heel-pivot-quarter-turn-to-left.yaml": "reverse",
    "quickstep/bronze/1-quarter-turn-to-right.yaml": "natural",
    "quickstep/bronze/2-natural-turn-to-right.yaml": "natural",
    "quickstep/bronze/3-natural-turn-with-hesitation.yaml": "natural",
    "quickstep/bronze/4-natural-pivot-turn--leader.yaml": "natural",
    "quickstep/bronze/5-natural-spin-turn.yaml": "natural",
    "quickstep/bronze/6-progressive-chass--leader.yaml": None,
    "quickstep/bronze/7-chass-reverse-turn.yaml": "reverse",
    "quickstep/bronze/8-forward-lock.yaml": None,
    "quickstep/bronze/9-closed-impetus.yaml": "natural",
    "quickstep/bronze/10-back-lock.yaml": None,
    "quickstep/bronze/11-reverse-pivot.yaml": "reverse",
    "quickstep/bronze/12-progressive-chass-to-right.yaml": None,
    "quickstep/bronze/13-tipple-chass-to-right-at-corner.yaml": None,
    "quickstep/bronze/13-tipple-chass-to-right-cont--along-side-of-room.yaml": None,
    "quickstep/bronze/16-double-reverse-spin.yaml": "reverse",
    # Silver
    "quickstep/silver/17-quick-open-reverse.yaml": "reverse",
    "quickstep/silver/18-fishtail.yaml": "natural",
    "quickstep/silver/19-running-right-turn.yaml": "natural",
    "quickstep/silver/20-four-quick-run.yaml": "reverse",
    "quickstep/silver/21-v6.yaml": "reverse",
    "quickstep/silver/22-closed-telemark.yaml": "reverse",
    # Gold
    "quickstep/gold/23-cross-swivel.yaml": "reverse",
    "quickstep/gold/24-six-quick-run--leader.yaml": "reverse",
    "quickstep/gold/25-rumba-cross--leader.yaml": "natural",
    "quickstep/gold/26-tipsy-to-left--cont.yaml": "reverse",
    "quickstep/gold/26-tipsy-to-right.yaml": "natural",
    "quickstep/gold/27-hover-cort.yaml": "reverse",

    # === TANGO ===
    # Bronze
    "tango/bronze/0-the-tango-walk.yaml": None,
    "tango/bronze/1-open-finish.yaml": None,
    "tango/bronze/1-open-finish--back-into.yaml": None,
    "tango/bronze/1-open-finish--side-into.yaml": None,
    "tango/bronze/2-progressive-side-step.yaml": None,
    "tango/bronze/5-rock-turn.yaml": None,  # 1/4 R + 1/4 L = net zero
    "tango/bronze/6-open-reverse-turn-follower-outside.yaml": "reverse",
    "tango/bronze/7-back-cort.yaml": "reverse",
    "tango/bronze/8-open-reverse-turn-follower-in-line.yaml": "reverse",
    "tango/bronze/9-progressive-side-step-reverse-turn.yaml": "reverse",
    "tango/bronze/10-open-promenade.yaml": None,
    "tango/bronze/11-rock-back-on-lf.yaml": None,
    "tango/bronze/11-rock-back-on-rf.yaml": None,
    "tango/bronze/12-natural-twist-turn.yaml": "natural",
    "tango/bronze/13-natural-promenade-turn.yaml": "natural",
    "tango/bronze/13-natural-promenade-turn-following-the-fallaway-promenade.yaml": "natural",
    # Silver
    "tango/silver/14-promenade-link.yaml": None,
    "tango/silver/15-four-step.yaml": None,
    "tango/silver/16-back-open-promenade.yaml": None,
    "tango/silver/17-outside-swivel-method-1--taken-after-an-open-finish-and-incorpora.yaml": None,
    "tango/silver/17-outside-swivel-method-2--turning-to-left-after-an-open-finish-whi.yaml": "reverse",
    "tango/silver/17-reverse-outside-swivel-method.yaml": "reverse",
    "tango/silver/18-fallaway-promenade.yaml": None,
    "tango/silver/19-four-step-change.yaml": None,
    "tango/silver/20-brush-tap.yaml": None,
    # Gold
    "tango/gold/21-fallaway-four-step.yaml": None,
    "tango/gold/22-oversway.yaml": None,
    "tango/gold/23-basic-reverse-turn.yaml": "reverse",
    "tango/gold/24-the-chase.yaml": None,
    "tango/gold/24-the-chase--alternative-endings-after-step-5.yaml": None,
    "tango/gold/25-fallaway-reverse-and-slip-pivot.yaml": "reverse",
    "tango/gold/26-five-step.yaml": None,
    "tango/gold/27-contra-check.yaml": None,

    # === WALTZ ===
    # Bronze
    "waltz/bronze/0-drag-hesitation--leader.yaml": "reverse",
    "waltz/bronze/0-the-fallaway-whisk.yaml": None,
    "waltz/bronze/1-closed-change--lf-closed-change.yaml": None,
    "waltz/bronze/1-closed-change--rf-closed-change.yaml": None,
    "waltz/bronze/1-closed-change-natural-to-reverse.yaml": None,
    "waltz/bronze/2-natural-turn.yaml": "natural",
    "waltz/bronze/3-reverse-turn.yaml": "reverse",
    "waltz/bronze/4-natural-spin-turn.yaml": "natural",
    "waltz/bronze/5-whisk.yaml": None,
    "waltz/bronze/5-whisk--when-leader-turns-a-only-at-corner-to-en.yaml": None,
    "waltz/bronze/6-chass-from-pp.yaml": None,
    "waltz/bronze/7-closed-impetus.yaml": "natural",
    "waltz/bronze/8-hesitation-change.yaml": "natural",
    "waltz/bronze/9-outside-change.yaml": "reverse",
    "waltz/bronze/9-outside-change-ended-in-pp--cont.yaml": "reverse",
    "waltz/bronze/10-reverse-cort.yaml": "reverse",
    "waltz/bronze/10-reverse-cort-2.yaml": "reverse",
    "waltz/bronze/11-back-whisk.yaml": None,
    "waltz/bronze/12-basic-weave--taken-after-1-3-reverse-turn-ended-backi.yaml": "reverse",
    "waltz/bronze/13-double-reverse-spin.yaml": "reverse",
    "waltz/bronze/14-reverse-pivot.yaml": "reverse",
    "waltz/bronze/14-reverse-pivot--if-ended-dc.yaml": "reverse",
    "waltz/bronze/14-reverse-pivot--if-ended-dw.yaml": "reverse",
    "waltz/bronze/14-reverse-pivot--if-ended-lod.yaml": "reverse",
    "waltz/bronze/15-back-lock.yaml": None,
    "waltz/bronze/16-progressive-chass-to-right.yaml": "reverse",
    # Silver
    "waltz/silver/5-whisk--cont.yaml": None,
    "waltz/silver/17-weave-from-pp--take-after-a-whisk-ended-facing-dc.yaml": "reverse",
    "waltz/silver/18-closed-telemark.yaml": "reverse",
    "waltz/silver/19-open-telemark-and-cross-hesitation.yaml": "reverse",
    "waltz/silver/19-open-telemark-and-cross-hesitation--cross-hesitation-precede.yaml": "reverse",
    "waltz/silver/20-open-telemark-and-wing.yaml": "reverse",
    "waltz/silver/21-open-impetus-and-cross-hesitation.yaml": "natural",
    "waltz/silver/22-open-impetus-and-wing.yaml": "natural",
    "waltz/silver/23-outside-spin.yaml": "natural",
    "waltz/silver/24-turning-lock.yaml": "reverse",
    # Gold
    "waltz/gold/25-left-whisk.yaml": None,
    "waltz/gold/25-left-whisk-precedes-and-follows.yaml": None,
    "waltz/gold/26-contra-check.yaml": None,
    "waltz/gold/27-closed-wing.yaml": None,
    "waltz/gold/28-turning-lock-to-right.yaml": "natural",
    "waltz/gold/29-fallaway-reverse-and-slip-pivot.yaml": "reverse",
    "waltz/gold/30-hover-cort.yaml": "reverse",
    "waltz/gold/30-hover-cort--cont.yaml": "reverse",
}


def add_turn_direction(filepath, direction):
    """Add turn_direction field after figure_number line in a YAML file."""
    with open(filepath, "r") as f:
        lines = f.readlines()

    # Check if turn_direction already exists
    for line in lines:
        if line.startswith("turn_direction:"):
            return False  # Already has field

    # Find the figure_number line and insert after it
    insert_idx = None
    for i, line in enumerate(lines):
        if line.startswith("figure_number:"):
            insert_idx = i + 1
            break

    if insert_idx is None:
        # Fallback: insert after figure_name line
        for i, line in enumerate(lines):
            if line.startswith("figure_name:"):
                insert_idx = i + 1
                break

    if insert_idx is None:
        print(f"  WARNING: Could not find insertion point in {filepath}")
        return False

    # Format the value
    if direction is None:
        value = "null"
    else:
        value = direction

    lines.insert(insert_idx, f"turn_direction: {value}\n")

    with open(filepath, "w") as f:
        f.writelines(lines)

    return True


def main():
    data_dir = os.path.abspath(DATA_DIR)
    modified = 0
    skipped = 0
    errors = 0

    for rel_path, direction in sorted(TURN_DIRECTIONS.items()):
        filepath = os.path.join(data_dir, rel_path)
        if not os.path.exists(filepath):
            print(f"  ERROR: File not found: {rel_path}")
            errors += 1
            continue

        if add_turn_direction(filepath, direction):
            label = direction if direction else "null"
            print(f"  {label:8s} {rel_path}")
            modified += 1
        else:
            print(f"  SKIP    {rel_path} (already has turn_direction)")
            skipped += 1

    print(f"\nDone: {modified} modified, {skipped} skipped, {errors} errors")
    print(f"Total files in mapping: {len(TURN_DIRECTIONS)}")

    # Verify we haven't missed any files
    actual_files = set()
    for root, dirs, files in os.walk(data_dir):
        # Skip extracted directory
        if "extracted" in root:
            continue
        for f in files:
            if f.endswith(".yaml"):
                rel = os.path.relpath(os.path.join(root, f), data_dir)
                actual_files.add(rel)

    mapped = set(TURN_DIRECTIONS.keys())
    missing = actual_files - mapped
    extra = mapped - actual_files

    if missing:
        print(f"\nWARNING: {len(missing)} files not in mapping:")
        for f in sorted(missing):
            print(f"  {f}")

    if extra:
        print(f"\nWARNING: {len(extra)} mapping entries with no file:")
        for f in sorted(extra):
            print(f"  {f}")

    return 0 if errors == 0 and not missing else 1


if __name__ == "__main__":
    sys.exit(main())
