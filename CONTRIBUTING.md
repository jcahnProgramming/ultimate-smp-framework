# Contributing to Ultimate SMP Framework

Thank you for your interest in contributing.

This project provides a modular, script-driven foundation for SMP servers using KubeJS and FTB mods. The guidelines below keep changes consistent and easy to review.

---

## Development Setup

### 1) Clone the repository
```bash
git clone https://github.com/jcahnProgramming/ultimate-smp-framework.git
cd ultimate-smp-framework
```

### 2) Required Mods (NeoForge 1.21.1)
- KubeJS 7+
- FTB Teams
- FTB Chunks
- FTB Quests
- CustomNPCs Unofficial

### 3) Generate the KubeJS environment

Run the game or server once to create default kubejs/ folders.

Expected Structure:

kubejs/
  server_scripts/
  startup_scripts/
  client_scripts/
  data/ 

### 4) Live Reloading

To reload server scripts without restarting:

```/kubejs reload server_scripts```

### Code Guidelines

#### Syntax and Compatibility

- Use ES5 JavaScript (use var, not let/const).
- Avoid global variables; prefer event scopes (BlockEvents, PlayerEvents, ServerEvents).
- Keep files focused on one responsibility.

#### File Layout Suggestions

- kubejs/server_scripts/claim_wand.js — chunk purchase logic
- kubejs/server_scripts/modes.js — gamemode controller
- kubejs/startup_scripts/items.js — item definitions
- Additional systems may live alongside these, each in its own file.

#### Style Conventions

- 2-space indentation
- Lowercase file names with underscores
- camelCase for functions and variables
- Use concise comments that explain intent

#### Testing

Before opening a pull request please:

1. Launch a test world or server with the required mods.
2. Verify there are no console errors during world load and /kubejs reload.
3. Exercise core commands:
- /claimwanddebug on
- /claimwandreset
- /cwwhere
4. Test in multiplayer with FTB Teams enabled when possible.

### Submitting Changes

1. Fork the repository
2. Create a feature branch:
- git checkout -b feature/my-feature-name
3. Commit using clear, conventional messages:
- git commit -m "feat: add npc shop integration"
- git commit -m "fix: prevent chunk purchase exploit"
4. Push your branch and open a Pull Request to main.
Please keep PRs focused and small; large unrelated changes are harder to review.

### Bug Reports

Open an issue and include:
- Minecraft Version
- NeoForge Version
- Mod Versions
- Relevant server log excerpts
- Steps to reproduce on a clean setup

### Contact

Project Lead: Jamie PathPlays Cahn
GitHub: https://github.com/jcahnProgramming