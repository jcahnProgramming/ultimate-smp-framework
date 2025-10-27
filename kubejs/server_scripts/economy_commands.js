// kubejs/server_scripts/economy_commands.js
// ES5-safe. Money helpers and player/admin commands.
// Reuses kubejs:money item so balance = item count.

function _moneyCount(p){
  return (typeof moneyCount === 'function') ? moneyCount(p) : p.inventory.count(Item.of('kubejs:money'));
}
function _moneyGive(p, n){
  if (n <= 0) return 0;
  p.server.runCommandSilent('execute as ' + p.username + ' run give @s kubejs:money ' + n);
  return n;
}
function _moneyTake(p, n){
  if (n <= 0) return true;
  var before = _moneyCount(p);
  if (before < n) return false;
  p.server.runCommandSilent('execute as ' + p.username + ' run clear @s kubejs:money ' + n);
  var after = _moneyCount(p);
  return after === (before - n);
}

function _parseIntSafe(s){
  var n = Math.floor(Number(s));
  return isFinite(n) ? n : NaN;
}

// /money [balance]
// /money pay <player> <amount>
ServerEvents.basicCommand('money', function(e){
  var args = (e.input || '').trim().split(/\s+/).filter(function(s){return s.length;});
  if (args.length === 0 || args[0] === 'balance') {
    e.player.tell('§6[Money]§r Balance: §a' + _moneyCount(e.player));
    return;
  }

  if (args[0] === 'pay' && args.length >= 3) {
    var targetName = args[1];
    var amount = _parseIntSafe(args[2]);
    if (!isFinite(amount) || amount <= 0) { e.player.tell('§6[Money]§r Invalid amount.'); return; }
    var target = e.server.getPlayer(targetName);
    if (!target) { e.player.tell('§6[Money]§r Player not found: ' + targetName); return; }
    if (!_moneyTake(e.player, amount)) { e.player.tell('§6[Money]§r Not enough funds.'); return; }
    _moneyGive(target, amount);
    e.player.tell('§6[Money]§r Sent §a' + amount + '§r to §e' + target.username + '§r.');
    target.tell('§6[Money]§r You received §a' + amount + '§r from §e' + e.player.username + '§r.');
    return;
  }

  e.player.tell('§6[Money]§r Usage: /money [balance] | /money pay <player> <amount>');
});

// Admin: /moneygive <player> <amount>
ServerEvents.basicCommand('moneygive', function(e){
  if (!e.server.isOp(e.player)) { e.player.tell('§cNo permission.'); return; }
  var args = (e.input || '').trim().split(/\s+/);
  if (args.length < 2) { e.player.tell('§6[Money]§r Usage: /moneygive <player> <amount>'); return; }
  var target = e.server.getPlayer(args[0]);
  var amount = _parseIntSafe(args[1]);
  if (!target) { e.player.tell('§6[Money]§r Player not found.'); return; }
  if (!isFinite(amount) || amount <= 0) { e.player.tell('§6[Money]§r Invalid amount.'); return; }
  _moneyGive(target, amount);
  e.player.tell('§6[Money]§r Gave §a' + amount + '§r to §e' + target.username + '§r.');
});

// Admin: /moneytake <player> <amount>
ServerEvents.basicCommand('moneytake', function(e){
  if (!e.server.isOp(e.player)) { e.player.tell('§cNo permission.'); return; }
  var args = (e.input || '').trim().split(/\s+/);
  if (args.length < 2) { e.player.tell('§6[Money]§r Usage: /moneytake <player> <amount>'); return; }
  var target = e.server.getPlayer(args[0]);
  var amount = _parseIntSafe(args[1]);
  if (!target) { e.player.tell('§6[Money]§r Player not found.'); return; }
  if (!isFinite(amount) || amount <= 0) { e.player.tell('§6[Money]§r Invalid amount.'); return; }
  if (!_moneyTake(target, amount)) { e.player.tell('§6[Money]§r Target does not have enough.'); return; }
  e.player.tell('§6[Money]§r Took §c' + amount + '§r from §e' + target.username + '§r.');
});

// /claim info  -> shows price/limits and owned count
ServerEvents.basicCommand('claim', function(e){
  var args = (e.input || '').trim().split(/\s+/).filter(function(s){return s.length;});
  var sub = (args[0] || 'info').toLowerCase();

  if (sub === 'info') {
    // Count owned chunks
    var listJson = e.player.persistentData.getString('cw_owned');
    var list = [];
    if (listJson) { try { list = JSON.parse(listJson); } catch (_) { list = []; } }
    var owned = list.length;

    var price = (global && global.getClaimPrice) ? global.getClaimPrice() : 55;
    var maxP = (global && global.getMaxClaimsPlayer) ? global.getMaxClaimsPlayer() : 64;
    e.player.tell('§6[Claims]§r Price per chunk: §a' + price +
      '§r | Owned: §b' + owned + '§r / §b' + maxP + '§r (player limit)');
    return;
  }

  e.player.tell('§6[Claims]§r Usage: /claim info');
});
