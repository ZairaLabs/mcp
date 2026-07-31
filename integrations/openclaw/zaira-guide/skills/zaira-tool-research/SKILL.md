---
name: zaira-tool-research
description: Research, evaluate, and compare developer tools using the current Zaira Guide catalog. Use before selecting a library, API, platform, infrastructure service, or agent tool; when checking price, deployment, compliance, MCP, self-hosting, or agent-readiness constraints; and when an existing shortlist needs a sourced comparison.
---

# Zaira Tool Research

Use the bundled read-only `zaira-guide` MCP server to ground developer-tool
recommendations in the current Zaira Guide rather than model memory alone. It
requires network access to `https://zairalabs.ai/guide/mcp` and no credentials.

## Workflow

1. Turn the user's goal into explicit decision criteria. Preserve hard
   constraints such as budget, language, hosting model, compliance, deployment
   target, MCP support, or autonomous-agent use.
2. Call `zaira_search_tools` to discover candidates. Include the user's
   constraints as filters when the tool supports them.
3. Call `zaira_get_tool` for every serious candidate before recommending it.
   Verify constraints, health, `last_verified`, agent-readiness evidence, and
   source links. Do not infer missing fields.
4. When two or three candidates remain, call `zaira_compare_tools` for the
   final side-by-side comparison. Split larger shortlists into focused groups.
5. Recommend one option only when the evidence supports it. State the decisive
   criteria, important tradeoffs, and any material unknowns. Offer a conditional
   recommendation when different constraints produce different winners.

## Tool selection

- `zaira_search_tools`: discovery, category exploration, and constraint
  filtering. Start here unless the user supplied exact tool names.
- `zaira_get_tool`: one tool's full decision record. Use for due diligence on
  each finalist or for a direct question about one named tool.
- `zaira_compare_tools`: structured comparison of two or three known tools.
  Use after discovery, not as a substitute for searching an open-ended market.
- `zaira_list_categories`: clarify the available category vocabulary or browse
  the catalog when the user's need is broad.
- `zaira_get_docs`: retrieve schema, endpoint, error, or usage guidance when a
  tool call or field is unclear.

## Evidence rules

- Treat Zaira Guide results as current catalog evidence, not a universal claim
  that unlisted products do not exist.
- Preserve dates and source links when recency or verification matters.
- Distinguish catalog facts from your own inference.
- Never fabricate scores, pricing, features, alternatives, or verification
  dates. Say what is missing and suggest how to verify it.
- Do not install, purchase, create accounts, change infrastructure, or make
  other external commitments merely because a tool is recommended.
- The MCP service is read-only, but queries are sent to Zaira Labs. Avoid
  including secrets, personal data, unpublished source code, or unnecessary
  customer details in search text.

## Response pattern

Keep the answer decision-oriented:

1. Recommendation or shortlist.
2. Why it fits the stated constraints.
3. Tradeoffs and disqualifiers.
4. Evidence recency or important unknowns.
5. A practical next validation step when uncertainty remains.

If the user provided exact tool names, skip discovery and begin with detail
lookups, then compare. If no catalog match exists, say so plainly rather than
substituting a similarly named product.
