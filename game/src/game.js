// Ember Duel — the duel itself: life, mana, block, turns and the win/loss.
// No DOM here; render.js draws whatever this state holds.
import { buildDeck, cardById, drawCards } from './cards.js';
import { chooseAiPlays } from './ai.js';

export const MAX_LIFE = 20;
export const HAND_SIZE = 5;
export const MANA_PER_TURN = 3;

export function newDuel(seedRandom) {
  const rng = seedRandom || Math.random;
  const state = {
    phase: 'title', // title | play | ai | win | loss
    turn: 1,
    mana: MANA_PER_TURN,
    player: { name: 'You', life: MAX_LIFE, block: 0, hand: [], deck: buildDeck(rng) },
    foe: { name: 'Ash, Warden of Cinders', life: MAX_LIFE, block: 0, hand: [], deck: buildDeck(rng) },
    played: [], // cards on the table this round, newest last
    log: ['The duel begins. Both duelists draw five cards.'],
    message: 'Your turn — play a card, then End Turn.',
  };
  drawCards(state.player.deck, state.player.hand, HAND_SIZE);
  drawCards(state.foe.deck, state.foe.hand, HAND_SIZE);
  return state;
}

function dealDamage(target, amount, log, attackerName) {
  if (amount <= 0) return;
  const soaked = Math.min(target.block, amount);
  target.block -= soaked;
  const hurt = amount - soaked;
  target.life = Math.max(0, target.life - hurt);
  const verb = attackerName === 'You' ? 'You deal' : `${attackerName} deals`;
  log.push(`${verb} ${amount}${soaked ? ` (${soaked} soaked by block)` : ''}.`);
}

// Apply one card from `owner` onto `enemy`. Returns false when illegal.
export function playCard(state, ownerKey, cardId) {
  const owner = state[ownerKey];
  const enemy = ownerKey === 'player' ? state.foe : state.player;
  const idx = owner.hand.indexOf(cardId);
  if (idx < 0) return false;
  const card = cardById(cardId);
  if (!card) return false;
  if (ownerKey === 'player') {
    if (state.phase !== 'play' || card.cost > state.mana) return false;
    state.mana -= card.cost;
  }
  owner.hand.splice(idx, 1);
  owner.block += card.block;
  if (card.heal) owner.life = Math.min(MAX_LIFE, owner.life + card.heal);
  dealDamage(enemy, card.attack, state.log, owner.name);
  if (card.heal) state.log.push(`${owner.name} restores ${card.heal} life.`);
  if (card.block) state.log.push(`${owner.name} gains ${card.block} block.`);
  if (card.draw) {
    drawCards(owner.deck, owner.hand, card.draw);
    state.log.push(`${owner.name} draws ${card.draw} card${card.draw > 1 ? 's' : ''}.`);
  }
  state.played.push({ cardId, by: ownerKey });
  if (state.played.length > 4) state.played.shift();
  checkEnd(state);
  return true;
}

export function checkEnd(state) {
  if (state.foe.life <= 0) {
    state.phase = 'win';
    state.message = 'Ash is spent. The embers are yours!';
    state.log.push('Ash falls to 0 life — you win the duel!');
  } else if (state.player.life <= 0) {
    state.phase = 'loss';
    state.message = 'Your embers fade. Ash keeps the table.';
    state.log.push('You fall to 0 life — Ash wins the duel.');
  }
}

// The AI takes its turn, one card at a time so the player can watch it.
// `onStep` is called after every card (and at the end) to re-render.
export function runAiTurn(state, onStep) {
  state.phase = 'ai';
  state.message = 'Ash is thinking…';
  state.foe.block = 0;
  const plays = chooseAiPlays(state.foe.hand, state.foe, state.player);
  let i = 0;
  const step = () => {
    if (state.phase === 'win' || state.phase === 'loss') { onStep(); return; }
    if (i < plays.length) {
      const id = plays[i++];
      state.log.push(`Ash plays ${cardById(id).name}.`);
      playCard(state, 'foe', id);
      onStep();
      if (state.phase !== 'win' && state.phase !== 'loss') setTimeout(step, 650);
    } else {
      startPlayerTurn(state);
      onStep();
    }
  };
  setTimeout(step, 650);
}

export function startPlayerTurn(state) {
  state.turn += 1;
  state.mana = MANA_PER_TURN;
  state.player.block = 0;
  drawCards(state.player.deck, state.player.hand, 1);
  drawCards(state.foe.deck, state.foe.hand, 1);
  state.phase = 'play';
  state.message = `Turn ${state.turn} — your move. ${MANA_PER_TURN} embers to spend.`;
  state.log.push(`Turn ${state.turn}: you draw a card.`);
}

// Fixed mid-game table for the play screenshot (?scene=play).
export function demoPlayState() {
  const s = newDuel(() => 0.5);
  s.phase = 'play';
  s.turn = 4;
  s.mana = 2;
  s.player.life = 14;
  s.player.block = 3;
  s.foe.life = 11;
  s.foe.block = 2;
  s.player.hand = ['flare-burst', 'tide-lash', 'bramble-wall', 'kindle', 'granite-ram'];
  s.foe.hand = ['x', 'x', 'x', 'x', 'x'];
  s.played = [{ cardId: 'ember-spark', by: 'player' }, { cardId: 'pebble-shot', by: 'foe' }];
  s.log = [
    'Turn 3: Ash plays Pebble Shot.',
    'Ash deals 2 (1 soaked by block).',
    'You play Ember Spark.',
    'You deal 3.',
    'Turn 4: you draw a card.',
  ];
  s.message = 'Turn 4 — your move. 2 embers left. Flare Burst can finish this… almost.';
  return s;
}

export function demoEndState(win) {
  const s = demoPlayState();
  if (win) {
    s.phase = 'win';
    s.foe.life = 0;
    s.foe.block = 0;
    s.message = 'Ash is spent. The embers are yours!';
    s.log.push('You play Wildfire. Ash falls to 0 life — you win the duel!');
  } else {
    s.phase = 'loss';
    s.player.life = 0;
    s.player.block = 0;
    s.message = 'Your embers fade. Ash keeps the table.';
    s.log.push('Ash plays Wildfire. You fall to 0 life — Ash wins the duel.');
  }
  return s;
}
