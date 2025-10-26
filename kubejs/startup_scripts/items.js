// kubejs/startup_scripts/items.js

StartupEvents.registry('item', event => {

  // Currency
  event.create('money')
    .displayName('Money')
    .texture('kubejs:item/money')
    .maxStackSize('9999'); // references kubejs/assets/kubejs/textures/item/money.png

  // Claim Wand
  event.create('claim_wand')
    .displayName('Claim Wand')
    .tooltip('Used to purchase land chunks')
    .texture('kubejs:item/claim_wand'); // references kubejs/assets/kubejs/textures/item/claim_wand.png
});
