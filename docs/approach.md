# Approach and architecture

Companion to the application. Written for the AI/ML engineering team and the portfolio office at GSK after the 9 October 2026 call.

## What we heard on 9 October

**What GSK has today.** Excel and SharePoint lists hold the AI initiative data. There is no system of record. Devon built the current version herself and adds capability weekly, so the product has to fit a release-as-you-go rhythm rather than a long pilot.

**The real constraint.** Her words: the hard part is getting the agents access to the right information in the right way. The question is not what Microsoft can do, it is what Microsoft can do at GSK, inside corporate guardrails that often force bespoke workarounds.

**Who it serves.** A unified intelligence layer across the Enterprise Data and AI organisation, covering business units that work differently. Primary users are AI leadership and business sponsors. Ownership between Devon's team and the AI/ML engineering team (Madhu) is still being settled.

**What it must answer.** Progress and readiness (lifecycle stage, blockers, decision gates). Dependencies and reuse (datasets, models, specialist resources). Value and cost (outcomes against investment, adoption). Devon added two more: governance vetting status, and who is funding what in a matrix funding model.

## Recommendation

1. Build the governed context layer first and treat it as the product. Every other capability (agents, Teams chat, the workspace) reads from it. This is the one thing that fixes Devon's stated blocker, and it is the piece GSK does not have today.
2. Run the agents on Azure AI Foundry, not inside Copilot Studio. Foundry already sits in the AI/ML engineering team's approved footprint, gives approved tools with an audit trail, and lets the same agent answer in Teams and in the workspace.
3. Deliver the stakeholder workspace as a web app with role-based views (this prototype). Copilot Studio in Teams stays as the conversational front door for quick questions and nudges, with cards that link into the workspace. Teams alone cannot carry a portfolio matrix, a dependency graph or versioned findings.
4. Ship weekly against the current Excel and SharePoint lists. Do not wait for a system of record. Week one reads the lists Devon already maintains; each later week adds a connector (finance actuals, governance tracker, model registry) and retires a manual field.
5. Keep definitions, materiality rules and briefing templates as configuration owned by Devon's team, so business units that work differently can be onboarded without engineering changes.

## Two Microsoft routes and the preferred hybrid

| Aspect | Route A: Copilot Studio agents in Teams | Route B: custom build on Azure Foundry and Graph | Preferred: governed context layer, Foundry agents, two channels |
| --- | --- | --- | --- |
| Where the user works | Inside Teams, as a Copilot Studio agent chat | A separate web workspace with role-based views | Both. Workspace for review and briefing; Teams agent for questions and nudges |
| Context and data | SharePoint lists, Teams sites, Dataverse tables, Graph connectors | Governed context store on Azure (SQL or Fabric Lakehouse) fed by Graph API, finance and registry connectors | One governed context layer on Azure; Copilot Studio reads it through a connector, the workspace reads it directly |
| Agent runtime | Copilot Studio topics and generative answers, Power Automate flows | Azure AI Foundry Agent Service with approved tools, orchestrated by Durable Functions or Logic Apps | Foundry agents behind both channels, so one set of approved operations and one audit trail |
| Interactive visuals | Adaptive Cards only; no matrices, graphs or timelines | Full matrix, dependency graph, timelines, comparison tray | Full visuals in the workspace; cards in Teams link back to them |
| Findings, versions and owner responses | Possible with Dataverse but awkward; version checks and evidence anchors are custom work | First-class records with version checks and evidence anchors | Records live in the context layer, visible from both channels |
| Guardrail fit at GSK | Fastest to approve; limited by tenant policies on connectors and generative answers | Needs Azure landing zone, private endpoints, data access approvals | Reuses the Foundry footprint the AI/ML engineering team already has; one approval path for data access |
| Time to first weekly release | 1 to 2 weeks | 4 to 6 weeks | 2 to 3 weeks (workspace on current SharePoint lists first, connectors added weekly) |
| Who owns it afterwards | Devon's team, low code | AI/ML engineering team | Context layer and agents with engineering; workspace configuration and definitions with Devon's team |

## Reference architecture on Microsoft

Sources (SharePoint lists and Excel, finance and governance exports, Copilot Studio release log, Foundry model registry, data catalog) flow through ingestion and validation (Graph API, Fabric pipelines, Logic Apps) into the portfolio context and evidence store (Azure SQL or Fabric Lakehouse: typed records, versions, provenance, permissions). Portfolio application services (App Service API, Entra ID, role filtering) serve the stakeholder workspace, the Copilot Studio agent in Teams and versioned briefings. A workflow orchestrator (Durable Functions) runs the investigation agent on Azure AI Foundry Agent Service with approved tools (retrieve, compare, trace, calculate; AI Search) against scoped facts in the context store, and returns findings and briefing status to the application services. A graph visualisation does not need a graph database; Azure SQL with typed relationship tables is enough for the first implementation.

## What is different about this approach

**Evidence before interpretation.** Every statement in the workspace resolves to a source record with a version. Reported facts, calculations and AI interpretations are labelled differently and never blended.

**Built for weekly releases.** The product matches the way Devon already ships: small usable increments, carried-forward items, snapshots at each review, no long pilot.

**Works inside the guardrails.** Agents only use approved operations. Source system changes stay in their designated systems. The workspace records decisions; it does not execute them.

**Done this before.** Portfolio and change-management work for a global technology company (about 10 billion dollars of partner spend tracked) and for Groninger (engineering-to-manufacturing change across pharma and CPG plants).

## Weekly release plan

| Week | Scope |
| --- | --- |
| Week 1 | Read the AI Initiative Register and programme plans as they are. Portfolio overview, directory, project detail with reported positions. |
| Week 2 | Findings and owner responses. Evidence viewer with versions. Weekly review screen with carried-forward items. |
| Week 3 | Release records from the Copilot Studio release log. Availability and adoption separated. Teams agent answers basic questions from the context layer. |
| Week 4 | Finance actuals connector and cost column with allocation rules. Funding attribution by business unit. |
| Week 5 | Dependency graph from typed relationships. Governance intake tracker and vetting gates on every project. |
| Week 6 | Contextual investigation with approved tools, run history and cancellation. Briefing preparation with versions. |
| Week 7 | Sources and quality view, reconciliation decisions, definitions with effect preview. Second business unit onboarded through configuration. |
| Week 8 | Hardening: permissions parity across views, investigations and briefings; recovery of interrupted runs; handover to AI/ML engineering. |

## Open questions for GSK

Whether the AI/ML engineering team already has a context layer or an Azure Foundry footprint we should build on. Whether agent-mediated access to derived clinical and finance data has a policy owner. Which business unit goes second, so the configuration model is tested early. Who owns definitions once the portfolio lead and engineering split responsibilities.
