// kubejs/server_scripts/claim_wand.js
//
// Chunk purchase wand + visual preview + robust gamemode controller
// NeoForge 1.21.1 / KubeJS 7  (ES5-safe)

// ===== Config =====
var CLAIM_WAND_ID = 'kubejs:claim_wand';
var PRICE_PER_CHUNK = 55;
var CONFIRM_WINDOW_MS = 20000;
var CLICK_COOLDOWN_MS = 500;
var POST_CONFIRM_LOCK_MS = 800;
var MODE_CHECK_INTERVAL_TICKS = 20;      // ~1s
var MODE_APPLY_DELAY_TICKS = 1;          // apply 1 tick later so we override other scripts
var PREVIEW_DURATION_TICKS = 60;
var PREVIEW_STEP_TICKS = 10;
var MSG_PREFIX = '§6[Server]§r ';
var CW_DEBUG = false;

// ===== Helpers =====
function dimKey(level){ return String(level.dimension); }
function chunkOf(x,z,dim){ return { cx: Math.floor(x/16), cz: Math.floor(z/16), dim: dim }; }
function chunkKey(dim,cx,cz){ return dim + ':' + cx + ',' + cz; }
function now(){ return Date.now(); }

// ===== Persistent state =====
function readState(p){ var s=p.persistentData.getString('cw_state'); if(!s) return null; try{ return JSON.parse(s);}catch(_){return null;} }
function writeState(p,o){ p.persistentData.putString('cw_state', JSON.stringify(o||{})); }
function clearState(p){ p.persistentData.remove('cw_state'); }
function setCooldown(p, key, ms){ p.persistentData.putLong(key||'cw_last', now() + (ms||CLICK_COOLDOWN_MS)); }
function cooledDown(p, key){ var t=Number(p.persistentData.getLong(key||'cw_last')||0); return now() >= t; }

// Owned chunk tracking (local until we bridge to FTB claims/team)
function getOwned(p){ var s=p.persistentData.getString('cw_owned'); if(!s) return []; try{ return JSON.parse(s);}catch(_){return []; } }
function setOwned(p,arr){ p.persistentData.putString('cw_owned', JSON.stringify(arr||[])); }
function addOwned(p,dim,cx,cz){ var k=chunkKey(dim,cx,cz), list=getOwned(p); for(var i=0;i<list.length;i++){ if(list[i]===k) return;} list.push(k); setOwned(p,list); }
function owns(p,dim,cx,cz){ var k=chunkKey(dim,cx,cz), list=getOwned(p); for(var i=0;i<list.length;i++){ if(list[i]===k) return true;} return false; }

// ===== Money helpers (via /clear + verify) =====
function mCount(p){
  return (typeof moneyCount==='function') ? moneyCount(p) : p.inventory.count(Item.of('kubejs:money'));
}
function mTake(p,n){
  var before=mCount(p);
  if(before<n) return false;
  p.server.runCommandSilent('execute as ' + p.username + ' run clear @s kubejs:money ' + n);
  var after=mCount(p);
  return after === (before - n);
}
function mGive(p,n){ p.server.runCommandSilent('execute as ' + p.username + ' run give @s kubejs:money ' + n); }

// ===== FTB helpers (command fallbacks) =====
function ensureTeam(server, player){
  server.runCommandSilent('execute as ' + player.username + ' run ftbteams create');
}
function _execAtChunk(server, player, dim, cx, cz, sub){
  var x = cx*16 + 8, z = cz*16 + 8;
  server.runCommandSilent('execute as ' + player.username + ' in ' + dim + ' positioned ' + x + ' 64 ' + z + ' run ' + sub);
}
function claimChunk(server, player, dim, cx, cz){ _execAtChunk(server, player, dim, cx, cz, 'ftbchunks claim'); }
function unclaimChunk(server, player, dim, cx, cz){ _execAtChunk(server, player, dim, cx, cz, 'ftbchunks unclaim'); }
// Placeholder until we query FTB directly
function isClaimable(server, dim, cx, cz){ return true; }

// ===== Visuals: outline + actionbar =====
function renderChunkOutlineOnce(player, dim, cx, cz){
  var y = Math.floor(player.y) + 0.2;
  var x0 = cx*16, z0 = cz*16, x1 = x0 + 15, z1 = z0 + 15;
  function p(x,z){
    player.server.runCommandSilent('execute as ' + player.username + ' in ' + dim +
      ' run particle minecraft:end_rod ' + x + ' ' + y + ' ' + z + ' 0 0 0 0 1 force @s');
  }
  for(var x=x0; x<=x1; x++){ p(x,z0); p(x,z1); }
  for(var z=z0; z<=z1; z++){ p(x0,z); p(x1,z); }
}
function previewChunk(player, dim, cx, cz, price){
  var title = '["",{"text":"Chunk (' + cx + ', ' + cz + ')  ","color":"yellow"},{"text":"Price: ' + price + '","color":"green"}]';
  player.server.runCommandSilent('execute as ' + player.username + ' run title @s actionbar ' + title);
  var ticks = 0;
  (function repeatBurst(){
    renderChunkOutlineOnce(player, dim, cx, cz);
    ticks += PREVIEW_STEP_TICKS;
    if (ticks < PREVIEW_DURATION_TICKS){
      player.server.scheduleInTicks(PREVIEW_STEP_TICKS, repeatBurst);
    }
  })();
}

// ===== Wand: target chunk, then confirm to buy =====
BlockEvents.rightClicked(function(e){
  var held = e.player.mainHandItem;
  if(!held || held.id !== CLAIM_WAND_ID) return;
  if(!cooledDown(e.player, 'cw_last')) return;
  setCooldown(e.player, 'cw_last', CLICK_COOLDOWN_MS);

  var server = e.level.server;
  var s = readState(e.player);

  // Confirm path (air or block)
  if(s && s.pending && s.until && now() <= s.until){
    if(s.processing){ if(CW_DEBUG) e.player.tell('§8[CW] confirm ignored (processing)'); return; }
    s.processing = true; writeState(e.player, s);

    var dim=s.pending.dim, cx=s.pending.cx, cz=s.pending.cz, cost=PRICE_PER_CHUNK;
    ensureTeam(server, e.player);
    claimChunk(server, e.player, dim, cx, cz);

    var paid = mTake(e.player, cost);
    if(!paid){
      unclaimChunk(server, e.player, dim, cx, cz);
      e.player.tell(MSG_PREFIX + '§cNot enough Money. Purchase cancelled.');
      clearState(e.player);
      setCooldown(e.player, 'cw_last', POST_CONFIRM_LOCK_MS);
      return;
    }

    addOwned(e.player, dim, cx, cz);
    e.player.tell(MSG_PREFIX + '§aPurchased & claimed chunk §f(' + cx + ', ' + cz + ')§a in §f' + dim + '§a.');
    clearState(e.player);
    setCooldown(e.player, 'cw_last', POST_CONFIRM_LOCK_MS);
    return;
  }

  // Need a block to locate the chunk
  if(!e.block){ e.player.tell(MSG_PREFIX + '§eAim at a block in the chunk you want to buy.'); return; }

  var dimStr = dimKey(e.level);
  var c = chunkOf(e.block.x, e.block.z, dimStr);

  if(owns(e.player, c.dim, c.cx, c.cz)){ e.player.tell(MSG_PREFIX + '§eYou already own this chunk.'); return; }
  if(!isClaimable(server, c.dim, c.cx, c.cz)){ e.player.tell(MSG_PREFIX + '§cThat chunk is already claimed.'); return; }

  previewChunk(e.player, c.dim, c.cx, c.cz, PRICE_PER_CHUNK);
  var have = mCount(e.player);
  writeState(e.player, { pending: { dim:c.dim, cx:c.cx, cz:c.cz }, until: now() + CONFIRM_WINDOW_MS, processing:false });
  e.player.tell(
    MSG_PREFIX +
    'Chunk §f(' + c.cx + ', ' + c.cz + ')§r in §f' + c.dim + '§r.\n' +
    'Price: §a' + PRICE_PER_CHUNK + ' Money§r. You have ' + have + '.\n' +
    '§eRight-click anywhere within ' + Math.floor(CONFIRM_WINDOW_MS/1000) + 's to confirm.'
  );
});

// ===== Robust Gamemode Controller =====
// - Sets tag "cw_in_own_chunk" when inside an owned chunk
// - Applies gamemode with a 1-tick delay (after other handlers), so we win conflicts
// - Only sends a command if a change is needed
PlayerEvents.tick(function(e){
  var p = e.player;
  if(p.age % MODE_CHECK_INTERVAL_TICKS !== 0) return;

  var gm = String(p.gameMode);
  if(gm === 'creative' || gm === 'spectator') return;

  var dim = dimKey(p.level);
  var c = chunkOf(p.x, p.z, dim);
  var inside = owns(p, c.dim, c.cx, c.cz);

  // tag reflects inside/outside; other scripts can respect this to avoid conflicts
  var hasTag = p.tags.contains('cw_in_own_chunk');
  if(inside && !hasTag) p.tags.add('cw_in_own_chunk');
  if(!inside && hasTag) p.tags.remove('cw_in_own_chunk');

  var desired = inside ? 'survival' : 'adventure';
  if (gm === desired) return;

  // apply after other tick scripts
  p.server.scheduleInTicks(MODE_APPLY_DELAY_TICKS, function(){
    // Re-check before changing (maybe something else already did it)
    var gm2 = String(p.gameMode);
    if (gm2 === 'creative' || gm2 === 'spectator') return;
    var dim2 = dimKey(p.level);
    var c2 = chunkOf(p.x, p.z, dim2);
    var inside2 = owns(p, c2.dim, c2.cx, c2.cz);
    var desired2 = inside2 ? 'survival' : 'adventure';
    if (String(p.gameMode) !== desired2) {
      p.server.runCommandSilent('gamemode ' + desired2 + ' ' + p.username);
      if (CW_DEBUG) p.tell('§8[CW] mode -> ' + desired2 + ' (inside=' + inside2 + ')');
    }
  });
});

// ===== QoL / Debug =====
ServerEvents.basicCommand('claimwandreset', function(e){
  clearState(e.player);
  e.player.tell(MSG_PREFIX + 'Selection cleared.');
});
ServerEvents.basicCommand('claimwanddebug', function(e){
  var arg = (e.input || '').trim().toLowerCase();
  if(arg==='on'){ CW_DEBUG=true; e.player.tell(MSG_PREFIX + 'Debug: §aON'); }
  else if(arg==='off'){ CW_DEBUG=false; e.player.tell(MSG_PREFIX + 'Debug: §cOFF'); }
  else { e.player.tell(MSG_PREFIX + 'Debug is ' + (CW_DEBUG?'§aON':'§cOFF') + '§r. Use: /claimwanddebug on|off'); }
});
ServerEvents.basicCommand('cwwhere', function(e){
  var p = e.player, dim = dimKey(p.level);
  var c = chunkOf(p.x, p.z, dim);
  var inside = owns(p, c.dim, c.cx, c.cz);
  e.player.tell(MSG_PREFIX + 'You are at ' + Math.floor(p.x) + ', ' + Math.floor(p.y) + ', ' + Math.floor(p.z) +
    ' in ' + dim + ' | chunk (' + c.cx + ',' + c.cz + ') | insideOwned=' + inside +
    ' | gm=' + String(p.gameMode) + ' | tag=' + p.tags.contains('cw_in_own_chunk'));
});
