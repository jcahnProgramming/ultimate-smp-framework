// Server-side helpers for Money (no constants shared globally)
function moneyCount(player){ return player.inventory.count(Item.of('kubejs:money')); }
function moneyGive(player,n){ player.give(Item.of('kubejs:money', n)); }
function moneyTake(player,n){
  let left = n;
  player.inventory.clear(Item.of('kubejs:money'), stack => {
    if (left <= 0) return true;
    const take = Math.min(stack.count, left);
    stack.count -= take;
    left -= take;
    return left <= 0;
  });
  return left === 0;
}
