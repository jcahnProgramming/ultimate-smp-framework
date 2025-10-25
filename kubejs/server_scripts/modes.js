// kubejs/server_scripts/modes.js
//
// Survival when inside your OWN purchased chunks; Adventure elsewhere.
// Compatible with claim_wand.js which writes player.persistentData.cw_owned.
// ES5-safe for KubeJS 7 / NeoForge 1.21.x.

var MODE_TICK_MS = 1000; // 1s
var _lastTick = 0;
var lastMode = new Map(); // uuid -> 'adventure'|'survival'

// Read the player's owned chunk list written by claim_wand.js
function getOwnedList(player) {
  var s = player.persistentData.getString('cw_owned');
  if (!s) return [];
  try { return JSON.parse(s); } catch (_) { return []; }
}

function chunkKey(dim, cx, cz) { return String(dim) + ':' + cx + ',' + cz; }

function ownsChunk(player, dim, cx, cz) {
  var k = chunkKey(dim, cx, cz);
  var list = getOwnedList(player);
  for (var i = 0; i < list.length; i++) if (list[i] === k) return true;
  return false;
}

ServerEvents.tick(function (e) {
  var now = Date.now();
  if (now - _lastTick < MODE_TICK_MS) return;
  _lastTick = now;

  var server = e.server;
  server.players.forEach(function (p) {
    // Don’t fight Creative/Spectator
    var gm = String(p.gameMode); // "survival" | "adventure" | "creative" | "spectator"
    if (gm === 'creative' || gm === 'spectator') return;

    // Where am I?
    var pos = p.blockPosition();
    var cx = Math.floor(pos.x / 16);
    var cz = Math.floor(pos.z / 16);
    var dim = p.level.dimension;

    // Inside one of *my* owned chunks?
    var inside = ownsChunk(p, dim, cx, cz);

    // Expose a tag other scripts can respect (e.g., only force Adventure if tag is absent)
    var hasTag = p.tags.contains('cw_in_own_chunk');
    if (inside && !hasTag) p.tags.add('cw_in_own_chunk');
    if (!inside && hasTag) p.tags.remove('cw_in_own_chunk');

    var desired = inside ? 'survival' : 'adventure';
    var prev = lastMode.get(p.uuid);
    if (prev === desired && gm === desired) return;

    // Optional: light debounce if needed (block breaking, etc.)
    // if (p.isBreakingBlock) return;

    // Apply via API (or swap to runCommandSilent if you prefer)
    p.setGameMode(desired);
    lastMode.set(p.uuid, desired);
  });
});
