// STARTUP — correct place to register items
StartupEvents.registry('item', e => {
  e.create('money').displayName('Money').maxStackSize(9999);
  e.create('claim_wand').displayName('Claim Wand').maxStackSize(1);
});
