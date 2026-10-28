// Hand-drawn flow for each skill, curated like section order and chapter titles.
// Reference nodes use `pr_` (principle), `pb_` (playbook), `sk_` (skill), or `ag_` (agent) plus the page slug;
// `pr_all`, `pb_all`, and `sk_all` stand for the whole shelf. Labels, shapes, and links are filled in when rendered,
// and any reference a skill's source makes that its chart leaves out is attached to the first step (or `%% attach: <id>`).
// Loops end in a `back_` node instead of an edge back up, because the layout scatters charts that contain cycles.

export const flowGroups: { title: string; blurb: string; skills: string[] }[] = [
  {
    title: 'Start and steer',
    blurb: 'The entry point, setup, and the short skills that restate or reshape a request.',
    skills: ['poteto-mode', 'poteto-help', 'setup-pstack', 'in-your-own-words', 'sharpen', 'bro'],
  },
  {
    title: 'Understand',
    blurb: 'Read-only skills that explain code, its history, and recent work.',
    skills: ['how', 'why', 'teach', 'recall', 'ketchup', 'ketchup-video', 'blast-radius'],
  },
  {
    title: 'Design',
    blurb: 'Parallel attempts, races, and adversaries before code settles.',
    skills: ['architect', 'arena', 'swarm', 'interrogate'],
  },
  {
    title: 'Build and clean',
    blurb: 'Rules applied while writing code, tests, prose, and numbers.',
    skills: ['tdd', 'typescript-best-practices', 'no-comments', 'unslop', 'technical-writing', 'benchmark-checklist'],
  },
  {
    title: 'Long runs',
    blurb: 'Designing a bespoke run and keeping a trail a human can audit.',
    skills: ['figure-it-out', 'show-me-your-work'],
  },
  {
    title: 'Verify',
    blurb: 'Project-local skills that drive the real app or check a property formally.',
    skills: ['create-verification-skill', 'maintain-verification-skill', 'create-formal-verification-skill', 'maintain-formal-verification-skill', 'statechart'],
  },
  {
    title: 'Make it yours',
    blurb: 'Turning habits, sessions, and repeated mistakes into durable changes.',
    skills: ['automate-me', 'reflect', 'correct', 'make-bot-ui'],
  },
  {
    title: 'Benny automation',
    blurb: 'The skills behind the Benny pack for Slack issue reports.',
    skills: ['setup-benny', 'triage-issue-reports', 'reproduce-and-fix-issues'],
  },
];

export const flows: Record<string, string> = {
  'poteto-mode': `flowchart TD
  %% attach: D
  A[Task arrives] --> B[Restate the goal and the smallest change]
  B --> C{Match a playbook}
  pb_all -.-> C
  C -->|cross-cutting or none fits| sk_figure-it-out
  C -->|multi-day program| pb_orchestrate
  C -->|one fits| D[Copy its steps into the todolist]
  sk_setup-pstack -.->|models per role| D
  D --> E[Understand and design]
  E -.-> sk_how
  E -.-> sk_architect
  E -.-> sk_interrogate
  E --> F[Build and measure]
  F -.->|subagents| ag_poteto-agent
  F -.->|fan-out| sk_swarm
  F -.->|bakeoff| sk_arena
  F -.-> sk_benchmark-checklist
  F --> G[Prepare for review]
  G -.-> sk_no-comments
  G -.-> sk_technical-writing
  G -.->|long runs| sk_show-me-your-work
  G --> H[Reply naming each principle used]
  pr_all -.-> H
  H -.-> sk_unslop
  H --> pb_opening-a-pr`,

  'poteto-help': `flowchart TD
  A[Question about pstack] --> B{Help or work?}
  B -->|work| sk_poteto-mode
  B -->|help| C[Check state: model rule, verify skills]
  C --> D{What do they need?}
  D -->|get set up| sk_setup-pstack
  D -->|pick a skill| sk_all
  D -->|playbooks and principles| pb_all
  D -->|run went wrong| E[Symptom and fix table]
  D -->|make it theirs| sk_automate-me
  D -->|make it theirs| sk_reflect
  sk_all --> R[Answer, one example prompt, source link]
  pb_all --> R
  E --> R`,

  'setup-pstack': `flowchart TD
  A[Detect model slugs this session can use] --> B[Load the current rule or the defaults]
  B --> C[Ask for a budget]
  C --> D[Set every role's effort from the budget]
  D --> E[Show roles, confirm changes]
  E --> F{Every slug available?}
  F -->|no| back_E[↩ Back to confirming roles]
  F -->|yes| G[Write pstack-models.mdc]
  G --> H[Offer to generate a verify skill]
  H -.-> sk_create-verification-skill
  H --> I[Offer a formal verification skill]
  I -.-> sk_create-formal-verification-skill`,

  'in-your-own-words': `flowchart TD
  A[The user's request] --> B[Restate their goal]
  A --> C[Restate the problem they are solving]
  B --> D[The user corrects or confirms]
  C --> D`,

  sharpen: `flowchart LR
  A[Your prompt] --> B[What a top professional would add]
  A --> C[The rawest material they start from]
  A --> D[Their methods and tools]
  A --> E[What outside check proves it right]
  B --> F[Rewritten prompt, deeper not bigger]
  C --> F
  D --> F
  E --> F
  F --> G[Your choices left open]`,

  bro: `flowchart TD
  A[The last message] --> B[Drop the jargon]
  B --> C[Say it simply, one person to another]`,

  how: `flowchart TD
  A{Simple or complex?} -->|simple| B[One explainer explores and explains]
  A -->|complex| C[Split into 2 to 4 angles]
  C --> D[Explorers run in parallel]
  D --> E[One explainer synthesizes the findings]
  B --> F[Overview, key concepts, how it works, where things live, gotchas]
  E --> F`,

  why: `flowchart TD
  A[Pin the target and the question] --> B[Code anchor: blame, log, PRs, tickets]
  B --> C[Map available MCPs to evidence categories]
  C --> D[Source control, always]
  C --> E[Tickets, docs, team chat]
  C --> F[Observability, errors, analytics]
  D --> S[Synthesizer keeps confidence levels]
  E --> S
  F --> S
  S --> P[Found, inferred, unknown, sources consulted]
  P -->|about to change it| K[Preserve, change, avoid, risk]`,

  teach: `flowchart TD
  A[Pick what they should walk away knowing] --> sk_how
  A --> sk_why
  sk_how --> B[Plain definition, tied to this case]
  sk_why --> B
  B --> C[Smallest complete answer, then stop]
  C --> D{They want more?}
  D -->|yes| E[Add one layer and redraw the diagram]
  E --> back_D[↩ Back to: they want more?]
  D -->|no| F[Done]`,

  recall: `flowchart TD
  A{Classify the ask} -->|resume one chat| pb_session-pickup
  A -->|habits into a skill| sk_automate-me
  A -->|load recent context| B[Lock the scope: window, topic, workspace]
  B --> C[Fan out over chat history]
  B --> D[Sweep the shared record]
  sk_why -.->|source investigators| D
  C --> E[Check PRs and branches live]
  D --> E
  E --> F[Capsule, threads, problems, next move]`,

  ketchup: `flowchart TD
  A[Everything since the user's last message] --> B[Gather read-only: work, subagents, PR and CI state]
  B --> C[Check every number against its source]
  C --> D[Find calls only the user can make]
  D --> E[One line on what waits on them]
  E --> F[Pictures, then one line per ask]
  F --> G[Action items with picks and risks]
  sk_bro -.->|voice| E`,

  'ketchup-video': `flowchart TD
  sk_ketchup -->|same window and calls| A[One takeaway, one line per slide]
  A --> B[At most 10 slides on one evolving picture]
  B --> C[A subtitle strip under each slide]
  C --> D[Render a silent landscape video]
  D --> E{Every slide readable in its hold?}
  E -->|no| back_D[↩ Fix and render again]
  E -->|yes| F[Opening line, video, action items]`,

  'blast-radius': `flowchart TD
  A[Read the change, including what the diff doesn't say] --> B[Find the one fact it's safe because of]
  sk_why -.->|PR and commits| A
  B --> C[Look where grep stops: libraries, timing, wire formats]
  C --> D[Rate each risk by chance and cost]
  D --> E[Prove the fact by running real code]
  E --> F{Big or wide change?}
  F -->|yes| sk_arena
  F -->|no| G[Writeup with the fact proven or unproven]
  sk_arena --> G`,

  architect: `flowchart TD
  sk_how -.-> A[Ground: model every system touched]
  sk_why -.->|ownership changes| A
  A --> B[Sketch: design it twice]
  B -.-> sk_arena
  B -.-> pr_exhaust-the-design-space
  B --> C[Screen against design red flags]
  C --> D{Checkpoint requested?}
  D -->|yes| E[Show the sketch, wait for sign-off]
  E -.->|optional pressure| sk_interrogate
  E -->|pushback| back_A[↩ Re-ground, then sketch again]
  D -->|no| F[Implement against the sketch]
  E --> F
  F -.->|scaffold first| pr_foundational-thinking
  F -.-> pr_outcome-oriented-execution
  F --> G{Same friction keeps recurring?}
  G -->|no| H[Design package and rationale]
  G -->|yes| S[Scrap and redesign smaller]
  S -.-> pr_redesign-from-first-principles
  S -.-> pr_fix-root-causes
  S -.-> pr_subtract-before-you-add
  S --> back_B[↩ Back to the sketch, re-run arena]`,

  arena: `flowchart TD
  A[Frame: task, rubric, runners] --> B[Fan out N candidates]
  pr_separate-before-serializing-shared-state -.->|own worktree each| B
  B --> C1[Candidate 1]
  B --> C2[Candidate 2]
  B --> CN[Candidate N]
  C1 --> J[Cross-judge from another model family]
  C2 --> J
  CN --> J
  J --> D[Read all, pick a base]
  pr_laziness-protocol -.->|tie goes to the smaller API| D
  D --> E[Graft the best parts by hand]
  pr_redesign-from-first-principles -.-> E
  E --> F[Verify the result]
  pr_prove-it-works -.-> F
  F -->|frame was wrong| back_A[↩ Reframe and re-run]
  F -->|missed a graft| back_E[↩ Back to grafting]
  F --> O[Artifact and synthesis note]`,

  swarm: `flowchart TD
  A[Frame: done predicate and report] --> S{Shape}
  S -->|partition| P[Slice the work]
  S -->|race| R[N workers, identical briefs, rule declared up front]
  P --> B[Fan out cloud workers in one message]
  R --> B
  B --> C[Each reports PASS, ISSUES, or BLOCKED]
  C --> D[Aggregate: respawn a bad result once, else a gap]
  D --> E[One consolidated report]`,

  interrogate: `flowchart TD
  A[Scope: branch diff by default] --> B[State the intent]
  sk_in-your-own-words -.-> B
  B --> C[Fan out adversaries, each in its own worktree]
  sk_arena -.->|phases A and B| C
  C --> D[Each proves findings with a real run]
  D --> E[Rerun every finding's command]
  E -->|breaks the intent| K[Keep, merge shared root causes]
  E -->|doesn't reproduce| X[Drop]
  K --> O[Intent, verified findings, drops, no fixes]
  X --> O`,

  tdd: `flowchart TD
  A[Understand the bug] --> B{Cheap test path?}
  B -->|no| X[Closest executable check instead]
  B -->|yes| C[Write the failing test]
  C --> D{Fails for the right reason?}
  D -->|no| back_C[↩ Fix the test first]
  D -->|yes| E[Smallest production fix]
  X --> E
  E --> F[Rerun: it passes]
  F --> G[Report fail-before and pass-after evidence]`,

  'typescript-best-practices': `flowchart TD
  pr_type-system-discipline -->|apply first| A[Discriminated unions, not optional-field bags]
  A --> B[Brand primitives, parse at the boundary]
  pr_boundary-discipline -.-> B
  B --> C[unknown over any, no as casts]
  C --> D[Exhaustive switches, satisfies]
  D --> E[Real tests, structured telemetry]`,

  'no-comments': `flowchart TD
  A[Scope: diff against main] --> ag_comment-sicko
  ag_comment-sicko --> C[Audit its report, reject overreach]
  sk_how -.->|thin keeps and kills| C
  sk_why -.-> C
  C -->|rejected twice| X[Fail and report it open]
  C --> D{Fix needs a new shape?}
  D -->|no| E[Delete the dead path, use the real API]
  D -->|yes| sk_architect
  sk_architect -->|sketch only| F[Smallest root-cause fix in scope]
  E --> F
  pr_fix-root-causes -.-> F
  pr_redesign-from-first-principles -.-> F
  F --> G[Offer to encode constraint comments]
  G --> H[Report deletions, fixes, open work]`,

  unslop: `flowchart TD
  A[Draft text] --> B[Scan the pattern catalog]
  B --> C[Content]
  B --> D[Language]
  B --> E[Style]
  B --> F[Filler and jargon]
  B --> G[Plain speech]
  C --> R[Rewrite, keeping meaning and tone]
  D --> R
  E --> R
  F --> R
  G --> R`,

  'technical-writing': `flowchart TD
  A[Draft] --> M{Pick one mode}
  M --> T[Tutorial]
  M --> H[How-to]
  M --> R[Reference]
  M --> X[Explanation]
  T --> S[Sentences to the reader]
  H --> S
  R --> S
  X --> S
  S --> U[One statement at a time]
  U --> G[One reading only]
  G --> V[Vary the rhythm]
  sk_unslop -.-> V`,

  'benchmark-checklist': `flowchart TD
  A[Write the claim you expect to ship] --> B[Read the script, check machine load]
  B --> Q1[Why not double? Name the limiter]
  Q1 --> Q2[Was every side tuned?]
  Q2 --> Q3[Did it break physical limits?]
  Q3 --> Q4[Did it error?]
  Q4 --> Q5[Does it reproduce over 5 alternating runs?]
  Q5 --> Q6[Does it matter end to end?]
  Q6 --> Q7[Did the work even happen?]
  Q7 --> V[Verdict, number, runs, range, limiter]
  V -.->|one number in the PR| pb_opening-a-pr
  pb_perf-issue -.->|baseline vetted here| A
  pb_hillclimb -.->|harness vetted here| A`,

  'figure-it-out': `flowchart TD
  sk_poteto-mode -->|read its principles| A[Frame: done predicate, scope, rigor]
  A -.-> pr_prove-it-works
  A -.-> pr_never-block-on-the-human
  A --> B[Design the workflow: units, riskiest first, harness first]
  B -.-> pr_foundational-thinking
  B -.-> pr_separate-before-serializing-shared-state
  B -.->|one-way doors| sk_architect
  sk_architect -.-> sk_arena
  sk_architect -.->|skip for settled designs| pr_laziness-protocol
  B --> C[Run a unit as an experiment]
  C -.-> pr_sequence-verifiable-units
  C --> D{Moved the predicate?}
  D -->|yes| K[Keep]
  D -->|no| R[Revert]
  K --> L[Log a row]
  R --> L
  sk_show-me-your-work -.-> L
  L -->|next unit| back_C[↩ Next unit]
  L -->|all units done| E[Verify the whole on the real product]
  pr_encode-lessons-in-structure -.-> E
  E --> O[Playbook, rigor, trail, what's open]`,

  'show-me-your-work': `flowchart TD
  A[Start decisions.tsv from the template] --> B[One row per decision: what, why, evidence, result]
  sk_unslop -.->|plain words| B
  pr_encode-lessons-in-structure -.->|evidence from scripts| B
  B --> C[Append only, supersede wrong rows]
  C --> D[Audit rows against the transcript]
  D -->|gap or wrong row| E[Add superseding rows]
  E --> F[Cross-model review of the trail]
  D --> F
  F --> G[Reply ends with an Attention section]`,

  'create-verification-skill': `flowchart TD
  A[Interview the repo: surface, run, drive, observe, isolate] --> B{Builds and starts?}
  B -->|no| X[Fix it or report it first]
  B -->|yes| C[Generate verify skill: launch, doctor, drive, evidence, cleanup]
  C --> D[Seed a feature map with the top features]
  D --> E[Run it end to end on one feature]
  E --> F{Evidence survives cleanup?}
  E -->|fails| back_C[↩ Fix the skill, run again]
  F -->|no| back_C
  F -->|yes| G[Offer the maintenance loop]
  G -.-> sk_maintain-verification-skill`,

  'maintain-verification-skill': `flowchart TD
  A[Locate the verify skill] --> B[Fix the feature map index]
  sk_create-verification-skill -.->|none found| A
  B --> C[Source wave: one read-only subagent per feature]
  C --> D[Reconcile recipes, spot-check drift]
  D --> E[Live pass: drive every feature, doctor between drives]
  E --> F{Triage each gap}
  F -->|doc drift| G[Fix the map]
  F -->|harness gap| H[Fix the harness, drive it again]
  F -->|product bug| I[Report it, keep it out of the PR]
  G --> S[One PR of proven fixes, or clean or blocked]
  H --> S
  I --> S`,

  'create-formal-verification-skill': `flowchart TD
  A[Pick a promise where a break hurts users] --> B[Let the question pick the tool]
  B --> C[Verify one property, true to the code]
  C --> D[Show it fail on a broken variant]
  D --> G[Generate a verify skill with coverage and sync commit]
  sk_statechart -.->|read TLA+ results| G
  G --> P{Catches a scratch break?}
  P -->|no| back_G[↩ Fix the skill or the check]
  P -->|yes| H[Hand off: property, tool, bounds, findings]
  H -.-> sk_maintain-formal-verification-skill`,

  'maintain-formal-verification-skill': `flowchart TD
  A[Find verify skills and their sync commit] --> B[Run each check as it is]
  sk_create-formal-verification-skill -.->|none found| A
  B --> C[Read every change to covered code]
  C --> D{What did the change do?}
  D -->|no effect| G[Update the verify skill and sync commit]
  D -->|changed shape| U[Update the model from the code]
  D -->|promise changed on purpose| P[Change the property, cite evidence]
  D -->|promise may be broken| U
  U --> R{Rerun}
  P --> R
  R -->|pass| K[Break the code, confirm the check still fails]
  R -->|fail| X[Replay the counterexample on real code]
  X -->|a step can't happen| back_U[↩ Fix the model, rerun]
  X -->|every step happens| BUG[Report a bug with its commit]
  K --> G
  BUG --> G
  G --> O[Each check: in sync, updated, bug, or blocked]`,

  statechart: `flowchart TD
  A[TLA+ spec: the reader's rules as invariants] --> B[View: state and step labels in the reader's words]
  B --> C[Run the statechart command]
  C --> D[TLC checks each rule, re-runs past breaks]
  D --> E{About 20 arrows or fewer?}
  E -->|too busy| back_B[↩ Coarser labels or hidden steps]
  E -->|yes| F[Show chart.mmd and one line per bug]
  F --> G[Replay each bug path on real code]`,

  'automate-me': `flowchart TD
  A{Existing -mode skill?} -->|yes| U[Mine history since its last edit]
  A -->|no| M[Mine recent transcripts in parallel slices]
  U --> Q[Ask structured questions]
  M --> Q
  Q --> C[Cluster signals into sections]
  sk_poteto-mode -.->|shape, not content| C
  C --> D[Draft with create-skill]
  D --> I[Iterate the prose with the user]
  sk_unslop -.-> I
  I --> L[Land it through a worktree and PR]`,

  reflect: `flowchart TD
  A[Locate this chat's transcript] --> J[Judgment reviewer]
  A --> T[Tooling reviewer]
  A --> V[Divergent reviewer]
  J --> S[Synthesizer: accepted, rejected, backlog]
  T --> S
  V --> S
  S --> E[Move lint-able items to backlog]
  pr_encode-lessons-in-structure -.-> E
  E --> B[File backlog items now]
  E --> W{User approves edits?}
  W -->|approved subset| P[Copy the skill locally, then edit]
  P --> O[Summary of edits, backlog, drops]
  B --> O`,

  correct: `flowchart TD
  A[Read commits, reverts, reviews, workaround comments] --> B[Group mistakes into classes seen twice]
  B --> L1{Architecture can remove it?}
  L1 -->|no| L2{Types or a lint can block it?}
  L2 -->|no| L3{A behavior test can catch it?}
  L3 -->|no| L4[Docs or an agent rule, last]
  L1 -->|yes| F[Fix it, one commit per class]
  L2 -->|yes| F
  L3 -->|yes| F
  L4 --> F
  F --> P[Prove the check fails on a real past mistake]
  P --> T[Update the rule table]
  T -->|operator corrects again| back_B[↩ Fix and add the rule]`,

  'make-bot-ui': `flowchart TD
  A[Create a webhook routine] --> B[User copies the URL and sender key]
  B --> C[Request the key with a secret card, never in chat]
  C --> D[Local server stores the URL and key]
  D --> E[Expose it on the tailnet over HTTP]
  E --> F[Probe with a harmless payload]
  F --> G[Page buttons POST to the local server]
  G --> H[Server POSTs JSON to the webhook]
  H --> I[Bot wakes and treats the body as data]`,

  'setup-benny': `flowchart TD
  %% attach: C
  A[Copy the pack into the target repo] --> B[Enable pstack in project settings]
  B --> C{Shared pstack skills resolve?}
  C -->|no| X[Stop and explain]
  C -->|yes| D[Adapt config, feature map, routing map]
  sk_how -.-> C
  sk_why -.-> C
  sk_tdd -.-> C
  sk_unslop -.-> C
  D --> E[Fill required choices, check integrations]
  E --> F[Verify the control adapter]
  F --> G[Prepare the two live automations]
  G --> H[Test thread safety]`,

  'triage-issue-reports': `flowchart TD
  A[Freeze the source thread coordinates] --> B[Read the whole report and attachments]
  pr_separate-before-serializing-shared-state -.-> A
  B --> C[Trace the cause before routing]
  sk_how -.-> C
  sk_why -.->|regressions| C
  C --> D{Classify}
  D -->|bug or performance| E[Route, dedupe, file if new]
  D -->|feature, question, reroute| F[Preflight the parent, post one verdict]
  E --> F
  sk_unslop -.-> F
  pr_minimize-reader-load -.-> F
  F --> G[Watch one follow-up window]`,

  'reproduce-and-fix-issues': `flowchart TD
  A[Freeze source coordinates] --> B[Wait for a trusted triage marker]
  B -->|other or timeout| Z[Stop silently]
  B -->|bug or performance| C{Someone fixing it, or a fix exists?}
  C -->|person owns it| Z
  C -->|fix artifact| V[Verify the existing fix]
  C -->|neither| D[Study the report and trace the code]
  D -.-> sk_how
  D -.-> sk_why
  D -.->|read-only workers| pr_guard-the-context-window
  D --> E[Reproduce twice through the real UI]
  E -->|no repro| N[Report could not reproduce]
  E -->|confirmed| F[Capture evidence, post the repro]
  F -.-> sk_unslop
  F --> G[Root-cause and implement a bounded fix]
  G -.-> pr_fix-root-causes
  G -.-> sk_tdd
  G --> H[Prove the fix through the same UI path]
  H -.-> pr_prove-it-works
  H -.-> pr_sequence-verifiable-units
  H --> I[Open a draft PR]`,
};
