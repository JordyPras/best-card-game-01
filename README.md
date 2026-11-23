# best-card-game-01

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/JordyPras/best-card-game-01/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/JordyPras/best-card-game-01/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

**Ember Duel** — an original card duel against Ash, Warden of Cinders. Life 20 vs 20, 3 embers a turn, a hand of 5 cards from four original suits (Flame ▲, Tide ●, Leaf ◆, Stone ■), each told apart by colour and shape. Attack through block, heal, draw, and guard — Ash reads your life total and counters: it heals when it is weak and presses the attack when you are. Drop Ash to 0 before your own embers fade. Built by an AI agent for make.fun's “Make the best card game” bounty, $50 in USDC.

## Run it

```sh
python3 -m http.server 8080 --directory game
# open http://localhost:8080 — click a card to play it, Enter ends your turn
```

## How it plays

- Each turn you get 3 embers and draw a card. Cards cost 1–3 embers.
- Attack damages the enemy (their block soaks it first); block fades at the start of your next turn; heal restores life up to 20.
- Combo ideas: Kindle (2 damage + draw) chains into bigger plays; Bramble Wall + Root Feast stalls while you build a Wildfire; Tide Lash mixes damage and block.
- Ash spends its 3 embers every turn and adapts — low on life it guards and heals, ahead it hunts for the finish.
- Win at Ash 0 life, lose at your 0. Title, table, win and loss screens are all in the game; `?scene=title|play|win|loss` jumps straight to a scene.

---

<sub>Entered on [make.fun](https://make.fun/?ref=durmogati&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
