# 🧱 Ultimate SMP Framework
*A modern Minecraft 1.21.1 SMP foundation powered by NeoForge, KubeJS, and FTB Mods.*

---

## 📜 Overview
The **Ultimate SMP Framework** is a modular, server-ready foundation for survival and multiplayer packs.  
It includes systems for **chunk claiming, player economy, quest integration, and automatic gamemode control**,  
making it perfect for building structured SMPs, adventure servers, or RPG-style modpacks.

---

## ⚙️ Core Features

### 🧭 Chunk Claim System (`claim_wand.js`)
- Players can purchase **individual chunks** using a special *Claim Wand*.  
- Each claim:
  - Costs a configurable amount of in-game currency (`kubejs:money`).
  - Automatically creates an FTB Team if the player doesn't already have one.
  - Uses `ftbchunks claim` to claim the chunk.
  - Rolls back automatically if payment fails (no free claims or exploits).
- Visual **UI feedback**:
  - End Rod particle outline shows the chunk being purchased.
  - Actionbar displays chunk coordinates + price.
- Safe transactional flow with cooldowns and anti-spam logic.

### 💰 Economy System (`money.js`)
- Currency item: `kubejs:money`
- Obtained via quests (FTB Quests), trading, or NPCs.
- Integrated helpers:
  - `moneyCount(player)`
  - `moneyGive(player, amount)`
  - `moneyTake(player, amount)`

### 🧍 Gamemode Controller (`modes.js`)
- Automatically switches players between:
  - **Survival** when inside their owned chunks.
  - **Adventure** everywhere else.
- Ignores Creative & Spectator.
- Adds tag `cw_in_own_chunk` so other scripts can respect ownership.
- Works seamlessly with the claim wand’s local claim data (`cw_owned`).
- Supports future integration with **FTB Teams/Chunks API** for team-wide claims.

### 🌍 Configurable Systems
- Fully data-driven via KubeJS scripts.
- Supports live reloads for tuning prices, cooldowns, and logic.
- Designed to be extended with:
  - NPC interactions (CustomNPCs Unofficial)
  - FTB Quests integration (quest-driven land or economy systems)
  - KubeJS event scripting for custom rewards or penalties

---

## 🧩 Tech Stack

| Component | Purpose |
|------------|----------|
| **Minecraft 1.21.1 (NeoForge)** | Base engine |
| **KubeJS 7** | Custom scripting (economy, game logic, UI) |
| **FTB Teams / FTB Chunks / FTB Quests** | Player ownership, chunk management, and quests |
| **CustomNPCs (Unofficial)** | NPC shops and quest givers |
| **End Rod Particle UI** | Visual feedback for chunk targeting |
| **Adventure ↔ Survival Mode Sync** | Immersive claim-based control |

---

## 🚀 Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/jcahnProgramming/ultimate-smp-framework.git
