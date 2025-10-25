# 🧾 Changelog  
All notable changes to the **Ultimate SMP Framework** will be documented here.  
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.0.0-alpha] — 2025-10-25
### Added
- ✨ **Chunk Claim System (`claim_wand.js`)**
  - Players can buy chunks using the Claim Wand.
  - Visual outline via End Rod particles.
  - Automatic team creation on first claim.
  - Refund-safe transaction rollback on payment failure.

- 💰 **Economy System**
  - Introduced `kubejs:money` item.
  - Supports earning currency via FTB Quests or NPCs.
  - Helper functions for money counting and transfers.

- 🧭 **Gamemode Controller (`modes.js`)**
  - Automatically toggles Adventure ↔ Survival based on owned chunks.
  - Creative/Spectator excluded from automation.
  - Adds tag `cw_in_own_chunk` for cross-script compatibility.

- 🧱 **Initial Project Structure**
  - Organized `kubejs/server_scripts/` and `kubejs/startup_scripts/`.
  - Added `.gitignore` for world, log, and mod folders.
  - Added `README.md` with full feature overview and setup guide.

---

## [Next Planned Release]
### Upcoming Features
- 🧩 Team-wide shared chunk ownership.
- 🧙 NPC shop + quest integration using CustomNPCs Unofficial.
- 🧾 Configurable land tax / upkeep system.
- 🌐 Cross-server synced economy.
- 🪄 GUI-based claim management menu.

---

**Legend:**  
🧭 = Gameplay logic 💰 = Economy 🧙 = NPC 🌐 = Systems 🪄 = UI 🧾 = Documentation  
