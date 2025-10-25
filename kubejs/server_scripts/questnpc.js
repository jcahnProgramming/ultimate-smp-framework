// Simple NPC↔Quest linker using basic commands
// Store file
const STORE_PATH = 'kubejs/data/kubejs/questnpcs.json';
var LINKS = JsonIO.read(STORE_PATH) || {}; // { npcId: { questId, chapterId } }
function save(){ JsonIO.write(STORE_PATH, LINKS); }

// Open Quests GUI (command fallback; swap to API later if desired)
function openQuestsGUI(player){
  player.server.runCommandSilent('execute as ' + player.username + ' run ftbquests open');
}

// Start/show quest (GUI fallback)
function startOrShowQuest(player, questId){ openQuestsGUI(player); }
// Claim rewards (GUI fallback)
function claimQuestRewards(player, questId){ openQuestsGUI(player); }

// /questnpclink <npcId> <questId>
ServerEvents.basicCommand('questnpclink', e => {
  const parts = (e.input || '').trim().split(/\s+/).filter(s => s.length);
  if (parts.length < 2){ e.player.tell('§6[Server]§r Usage: /questnpclink <npcId> <questId>'); return; }
  const npc = parts[0], qid = parts[1];
  if (!LINKS[npc]) LINKS[npc] = {};
  LINKS[npc].questId = qid;
  save();
  e.server.tell('§6[Server]§r Linked NPC ' + npc + ' to quest ' + qid + '.');
});

// /questnpcunlink <npcId>
ServerEvents.basicCommand('questnpcunlink', e => {
  const npc = (e.input || '').trim();
  if (!npc){ e.player.tell('§6[Server]§r Usage: /questnpcunlink <npcId>'); return; }
  delete LINKS[npc];
  save();
  e.server.tell('§6[Server]§r Unlinked NPC ' + npc + '.');
});

// /questnpcinteract <npcId>
ServerEvents.basicCommand('questnpcinteract', e => {
  const npc = (e.input || '').trim();
  if (!npc){ e.player.tell('§6[Server]§r Usage: /questnpcinteract <npcId>'); return; }
  const link = LINKS[npc];
  if (!link){ e.player.tell('§6[Server]§r §eThis NPC is not linked to any quest.'); return; }
  if (link.questId) startOrShowQuest(e.player, link.questId);
  else if (link.chapterId) openQuestsGUI(e.player);
  else openQuestsGUI(e.player);
});
