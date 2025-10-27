// kubejs/server_scripts/claim_config.js
// ES5-safe global config for claim/economy values

console.log('[KJS] claim_config: starting');

(function () {
  // Always use the real JS global object
  var G = (typeof globalThis !== 'undefined') ? globalThis : this;

  // Initialize config if missing
  if (!G.CLAIMCFG) {
    G.CLAIMCFG = {
      pricePerChunk: 55,      // cost to buy one chunk
      refundPercent: 50,      // placeholder for future /unclaim refund
      maxClaimsPerPlayer: 64, // placeholder for future limits
      maxClaimsPerTeam: 256,  // placeholder for future team support
      spawnNoClaimRadius: 0,  // 0 disables (placeholder for future spawn protection)
      confirmSeconds: 20      // mirrors the wand confirm window (seconds)
    };
  }

  // Read helpers
  G.getClaimPrice      = function(){ return G.CLAIMCFG.pricePerChunk; };
  G.getRefundPercent   = function(){ return G.CLAIMCFG.refundPercent; };
  G.getMaxClaimsPlayer = function(){ return G.CLAIMCFG.maxClaimsPerPlayer; };
  G.getMaxClaimsTeam   = function(){ return G.CLAIMCFG.maxClaimsPerTeam; };
})();

console.log('[KJS] claim_config: loaded');
