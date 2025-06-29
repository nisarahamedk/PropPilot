# PRD to User Stories Generator

Generate comprehensive user stories from a Product Requirements Document with acceptance criteria and success metrics.

## Usage

```
Please generate user stories from the PRD at $ARGUMENTS
```

## Output Location

All generated user stories should be saved to: `.taskmaster/docs/user-stories/`

## Instructions

When generating user stories from the PRD at $ARGUMENTS:

1. **Extract Key Features**: Identify all major features and capabilities described in the PRD

2. **Create User Stories** following this format:

   ```
   As a [persona/user type]
   I want to [action/feature]
   So that [benefit/outcome]
   ```

3. **Add Acceptance Criteria** for each story:

   - Specific, measurable conditions
   - Clear definition of "done"
   - Edge cases and error handling
   - Performance requirements

4. **Include Success Metrics**:

   - How to measure if the story achieves its goal
   - KPIs that align with business objectives

5. **Prioritize Stories**:
   - P0: Critical for MVP
   - P1: Important but not blocking
   - P2: Nice to have

## Output Format

```markdown
# User Stories for [Product Name]

## Epic: [Feature Group Name]

### Story 1: [Story Title]

**Priority**: P0/P1/P2
**Persona**: [Target User]

**Story**:
As a [persona]
I want to [action]
So that [benefit]

**Acceptance Criteria**:

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Edge case handling

**Success Metrics**:

- Metric 1: [How to measure]
- Metric 2: [How to measure]

**Dependencies**:

- Other stories this depends on
- External dependencies

---

### Story 2: [Next Story]

...
```

## Best Practices

1. **Keep stories small**: Each story should be completable in 1-2 sprints
2. **User-focused language**: Avoid technical jargon in the story description
3. **Independent stories**: Minimize dependencies where possible
4. **Testable criteria**: Each acceptance criterion should be verifiable
5. **Business value**: Every story should clearly deliver value

## Tips

- Break down complex features into multiple smaller stories
- Include both happy path and error scenarios in acceptance criteria
- Consider accessibility and internationalization requirements
- Think about mobile vs desktop experiences if applicable
- Include performance and security considerations

## Command Examples

```bash
# Generate all user stories
@.claude/commands/prd-to-user-stories.md @docs/prd/proppilot_prd.md

# Generate stories for specific feature
@.claude/commands/prd-to-user-stories.md @docs/prd/proppilot_prd.md focusing on chat interface

# Generate P0 stories only
@.claude/commands/prd-to-user-stories.md @docs/prd/product.md for P0 stories only
```

## Output Instructions

1. Create the directory if it doesn't exist: `.taskmaster/docs/user-stories/`
2. Name the output file based on the feature or epic name (e.g., `chat-interface-stories.md`)
3. Save all generated user stories to this location
4. Include a table of contents at the top of the file for easy navigation
