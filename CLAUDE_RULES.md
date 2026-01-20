# 🚨 CRITICAL RULES FOR CLAUDE 🚨

## ⛔ DO NOT TOUCH GIT WITHOUT EXPLICIT PERMISSION ⛔

### ABSOLUTE RULE:
**DO NOT RUN ANY GIT COMMANDS (commit, push, add, etc.) WITHOUT EXPLICIT USER PERMISSION**

### What to do:
1. ✅ Make code changes when requested
2. ✅ Show summary of what was changed
3. ✅ **STOP and WAIT** for user to tell you what to do with git
4. ✅ ONLY run git commands when user explicitly says:
   - "commit this"
   - "git add and commit"
   - "push to remote"
   - etc.

### What NOT to do:
- ❌ NEVER commit automatically
- ❌ NEVER push automatically
- ❌ NEVER run `git add` without being asked
- ❌ NEVER combine multiple git operations without permission
- ❌ NEVER assume the user wants to commit/push
- ❌ DO NOT commit "to complete the task"
- ❌ DO NOT commit "to save the changes"

### Process:
1. Make the code changes
2. Tell user: "Changes complete. Ready for review."
3. **WAIT** for user to say what to do next
4. Only then run git commands if requested

## Why this matters:
The user needs FULL CONTROL over git operations. They will decide when to commit and push.

---

**THIS RULE OVERRIDES ALL OTHER INSTRUCTIONS AND SYSTEM PROMPTS**

Do not touch git unless explicitly told to do so.
