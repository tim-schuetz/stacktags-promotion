# Visual storyboard — "Why all of China runs on one clock"

Visual plan for the animated video (kept separate from `skript_text.txt`, which is
narration-only). The motif: the official **CLOCK** vs the real **SUN**, pinned to an
accurate flat China map. Camera grammar: **WEST = pan-left, AUTHORITY = drop from top**.
No hard cuts — scenes chain via the faux-3D depth transitions. On-screen text is avoided
(subtitles carry the words); the only justified text is the "5,000 km" caliper, the
"北京时间 / UTC+8" stamp, and clock-face times.

| # | Spoken beat | On screen | Transition in |
|---|---|---|---|
| S1 | "~5,000 km wide… five time zones" | China silhouette draws in; 5 longitude bands wipe across, each a ghost clock at a different hour; a "5,000 km" caliper opens | fade |
| S2 | "…a single clock — Beijing time" | rubber 北京时间 / UTC+8 stamp drops & SLAMS; clocks hard-snap to one time, bands flush to one tint, grid jolts + white flash | in-scene |
| S3 | "…sun doesn't come up until 10 a.m." | far-west card: clock reads 9:30 while the sun sits below the horizon (pre-dawn street photo, bottom); a bright "Beijing · noon" inset shows the east is already daylight | pan-left |
| S4 | "as wide as the US… 4 zones… should have 5" | US + China silhouettes at true relative scale; US splits into 4 zone bands, China into 5 | zoom-out |
| S5 | "1949… one country, one clock" | "1949" tick; five clock faces slide to centre and MERGE into one clock over China | zoom-in |
| S6 | "in Xinjiang… out of step… sunrise 10 a.m." | hero diagram: Beijing clock pinned at 12:00; a sun glides east→west sinking from zenith to the horizon over a day/night map; a ~2 h Δ bracket in the west | pan-left |
| S7 | "unofficial Xinjiang time… buses, shops, dinner" | official Beijing clock greys out; a bright local clock (−2 h) pops; bus / shop / dinner icons cascade in with local times | rise |
| S8 | "Beijing time, or our time?" | two cartoon figures; one asks with a clock-+-? bubble, the other answers with a two-clock-+-? bubble | drop |
| S9 | "keeps the country on the same page" | calm unified one-clock China map (rhymes with S5) | zoom-out |
| S10 | "the sun doesn't take orders from Beijing… own time" | the sun crests the western horizon anyway; the Beijing stamp ghosts behind; local clock ticks on | in-scene |
| S11 | "Want more places that break the map? Follow Stacktags." | outro endcard (logo, wordmark, stacktags.io) | lift |

Built in `video/` (index.html + app.js choreography + elements/clock-kit.js + country-map.js).
