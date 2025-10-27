// kubejs/server_scripts/modes.js
// Survival inside your OWN purchased chunks; Adventure elsewhere (ES5-safe)

var MODE_TICK_MS = 1000; // ~1s
var _lastTickMs = 0;
// Use a plain object instead of Map()
var _lastModeByUUID = {}; // { uuid: "survival" | "adventure" }

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
  if (now - _lastTickMs < MODE_TICK_MS) return;
  _lastTickMs = now;

  var server = e.server;
  server.players.forEach(function (p) {
    var gm = String(p.gameMode);
    if (gm === 'creative' || gm === 'spectator') return;

    var pos = p.blockPosition();
    var cx = Math.floor(pos.x / 16);
    var cz = Math.floor(pos.z / 16);
    var dim = p.level.dimension;

    var inside = ownsChunk(p, dim, cx, cz);

    // Maintain a tag other scripts can check to avoid fighting us
    var hasTag = p.tags.contains('cw_in_own_chunk');
    if (inside && !hasTag) p.tags.add('cw_in_own_chunk');
    if (!inside && hasTag) p.tags.remove('cw_in_own_chunk');

    var desired = inside ? 'survival' : 'adventure';
    var prev = _lastModeByUUID[p.uuid];

    if (prev === desired && gm === desired) return;

    // Apply via API; if unavailable in your env, you can switch to runCommandSilent
    p.setGameMode(desired);
    _lastModeByUUID[p.uuid] = desired;
  });
});
