// Ember Duel — DOM rendering: the table, the hands, the cards and the
// title / win / loss screens. Pure drawing; game.js owns the rules.
import { SUITS, cardById } from './cards.js';

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function lifeBar(side) {
  const wrap = el('div', 'life');
  const label = el('span', 'life-label', `${side.name} — ♥ ${side.life} / 20`);
  const bar = el('div', 'life-bar');
  const fill = el('div', 'life-fill');
  fill.style.width = `${(side.life / 20) * 100}%`;
  if (side.life <= 6) fill.classList.add('low');
  bar.appendChild(fill);
  const block = el('span', 'block-label', side.block ? `🛡 Block ${side.block}` : '');
  wrap.append(label, bar, block);
  return wrap;
}

export function cardElement(card, opts = {}) {
  const suit = SUITS[card.suit];
  const c = el('div', 'card suit-' + card.suit + (opts.playable === false ? ' dim' : ''));
  c.style.setProperty('--suit', suit.color);
  c.style.setProperty('--suit-dark', suit.dark);
  const cost = el('div', 'cost', String(card.cost));
  cost.title = `Costs ${card.cost} ember`;
  const name = el('div', 'card-name', card.name);
  const glyph = el('div', 'card-glyph', suit.glyph);
  const suitName = el('div', 'card-suit', suit.name);
  const stats = el('div', 'card-stats');
  if (card.attack) stats.append(el('span', 'stat atk', `⚔ ${card.attack}`));
  if (card.block) stats.append(el('span', 'stat blk', `🛡 ${card.block}`));
  if (card.heal) stats.append(el('span', 'stat heal', `♥ ${card.heal}`));
  if (card.draw) stats.append(el('span', 'stat draw', `↻ ${card.draw}`));
  const text = el('div', 'card-text', card.text);
  c.append(cost, name, glyph, suitName, stats, text);
  if (opts.onClick) c.addEventListener('click', opts.onClick);
  if (opts.key) c.tabIndex = 0;
  return c;
}

function backElement() {
  const c = el('div', 'card back');
  c.append(el('div', 'card-back-glyph', '✦'), el('div', 'card-back-name', 'EMBER DUEL'));
  return c;
}

export function render(state, root, handlers) {
  root.innerHTML = '';
  const table = el('div', 'table');

  // Opponent row: name + life on the left, face-down hand on the right.
  const foeRow = el('div', 'foe-row');
  foeRow.append(lifeBar(state.foe));
  const foeHand = el('div', 'hand foe-hand');
  for (const id of state.foe.hand) foeHand.appendChild(backElement());
  foeRow.appendChild(foeHand);
  table.appendChild(foeRow);

  // Middle: played cards + the duel log + turn controls.
  const mid = el('div', 'mid');
  const played = el('div', 'played');
  if (state.played.length === 0) {
    played.appendChild(el('div', 'played-empty', 'No cards on the table yet — play one!'));
  } else {
    for (const p of state.played) {
      const card = cardById(p.cardId);
      if (card) played.appendChild(cardElement(card, { playable: false }));
    }
  }
  const side = el('div', 'side');
  const mana = el('div', 'mana', `Embers: ${'●'.repeat(state.mana)}${'○'.repeat(3 - state.mana)}  (${state.mana}/3)`);
  const msg = el('div', 'message', state.message);
  const endBtn = el('button', 'end-turn', 'End Turn ⏎');
  endBtn.disabled = state.phase !== 'play';
  endBtn.addEventListener('click', handlers.onEndTurn);
  const log = el('div', 'log');
  for (const line of state.log.slice(-6)) log.appendChild(el('div', 'log-line', line));
  side.append(mana, msg, endBtn, log);
  mid.append(played, side);
  table.appendChild(mid);

  // Player row: hand of real cards, clickable on your turn.
  const youRow = el('div', 'you-row');
  youRow.append(lifeBar(state.player));
  const hand = el('div', 'hand you-hand');
  state.player.hand.forEach((id, i) => {
    const card = cardById(id);
    if (!card) return;
    const playable = state.phase === 'play' && card.cost <= state.mana;
    const node = cardElement(card, {
      playable,
      key: i + 1,
      onClick: () => handlers.onPlayCard(id),
    });
    node.title = `${card.name} — press ${i + 1} to play`;
    hand.appendChild(node);
  });
  youRow.appendChild(hand);
  table.appendChild(youRow);

  const turnTag = el('div', 'turn-tag', `EMBER DUEL · Turn ${state.turn}`);
  table.appendChild(turnTag);
  root.appendChild(table);

  // Overlays: title, win, loss.
  if (state.phase === 'title') {
    const ov = el('div', 'overlay title-screen');
    ov.append(
      el('div', 'title-kicker', 'A DUEL OF EMBERS AND WITS'),
      el('h1', 'title', 'EMBER DUEL'),
      el('p', 'subtitle', 'Outplay Ash, Warden of Cinders. Life 20 vs 20 — spend 3 embers a turn on Flame, Tide, Leaf and Stone cards. Attack through block, heal, draw, and drop Ash to 0 before your own embers fade.'),
      el('div', 'title-cards', '▲ Flame hits hard   ● Tide heals   ◆ Leaf guards   ■ Stone endures'),
    );
    const btn = el('button', 'big-btn', '▶  Start Duel');
    btn.addEventListener('click', handlers.onStart);
    ov.appendChild(btn);
    ov.appendChild(el('p', 'hint', 'Click a card to play it · keys 1–5 play · Enter ends your turn'));
    root.appendChild(ov);
  }
  if (state.phase === 'win' || state.phase === 'loss') {
    const won = state.phase === 'win';
    const ov = el('div', 'overlay ' + (won ? 'win-screen' : 'loss-screen'));
    ov.append(
      el('h1', 'end-title', won ? '🏆 YOU WIN!' : '💀 YOU LOSE'),
      el('p', 'end-sub', won
        ? 'Ash is spent — the embers are yours!'
        : 'Your embers fade — Ash keeps the table.'),
      el('p', 'end-score', `You ♥ ${state.player.life}  ·  Ash ♥ ${state.foe.life}  ·  Turn ${state.turn}`),
    );
    const btn = el('button', 'big-btn', '↻  Play Again');
    btn.addEventListener('click', handlers.onRestart);
    ov.appendChild(btn);
    root.appendChild(ov);
  }
}
