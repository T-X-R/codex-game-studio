// Host compatibility fixture only, not a production policy or toolkit hook.
// It records events only inside the supplied disposable workspace.
const fs = require('node:fs');
const path = require('node:path');
try {
  const root = process.argv[2];
  const event = JSON.parse(fs.readFileSync(0, 'utf8'));
  if (!root || !path.isAbsolute(root)) throw new Error('An absolute fixture root is required');
  if (!['SessionStart', 'PreToolUse'].includes(event.hook_event_name)) throw new Error('Unsupported fixture event');
  if (event.hook_event_name === 'PreToolUse' && typeof event.tool_input?.command !== 'string') throw new Error('Missing tool_input.command');
  fs.appendFileSync(path.join(root, 'hook-events.jsonl'), JSON.stringify(event) + '\n', { mode: 0o600 });
  if (event.hook_event_name === 'SessionStart') {
    console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: 'GAME_STUDIO_HOOK_FIXTURE_LOADED' } }));
  } else if (event.tool_input.command.includes('blocked.txt')) {
    console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny',
      permissionDecisionReason: 'GAME_STUDIO_FIXTURE_DENIED: blocked.txt must remain unchanged in this test.' } }));
  } else {
    console.log('{}');
  }
} catch (error) {
  console.error(`Invalid host fixture input: ${error.message}`);
  process.exitCode = 2;
}
