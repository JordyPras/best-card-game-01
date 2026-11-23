// Ember Duel — card definitions. Four original suits, each with its own
// colour and shape so a card is readable by colour AND shape, never text alone.
export const SUITS = {
  flame: { name: 'Flame', glyph: '▲', color: '#e5484d', dark: '#8f1d22' },
  tide: { name: 'Tide', glyph: '●', color: '#2f7fe0', dark: '#174a8a' },
  leaf: { name: 'Leaf', glyph: '◆', color: '#2fae5f', dark: '#14663a' },
  stone: { name: 'Stone', glyph: '■', color: '#8a7f6d', dark: '#4d463c' },
};

// Every card: id, name, suit, ember cost, attack, block, heal, draw, text.
// Attack hits the enemy life (reduced by their block first). Block soaks
// damage until its owner's next turn. Heal restores life, max 20.
export const CARD_DEFS = [
  { id: 'ember-spark', name: 'Ember Spark', suit: 'flame', cost: 1, attack: 3, block: 0, heal: 0, draw: 0, text: 'Deal 3 damage.' },
  { id: 'flare-burst', name: 'Flare Burst', suit: 'flame', cost: 2, attack: 6, block: 0, heal: 0, draw: 0, text: 'Deal 6 damage.' },
  { id: 'wildfire', name: 'Wildfire', suit: 'flame', cost: 3, attack: 9, block: 0, heal: 0, draw: 0, text: 'Deal 9 damage.' },
  { id: 'kindle', name: 'Kindle', suit: 'flame', cost: 1, attack: 2, block: 0, heal: 0, draw: 1, text: 'Deal 2. Draw a card.' },
  { id: 'tide-lash', name: 'Tide Lash', suit: 'tide', cost: 1, attack: 2, block: 2, heal: 0, draw: 0, text: 'Deal 2. Gain 2 block.' },
  { id: 'deep-current', name: 'Deep Current', suit: 'tide', cost: 2, attack: 4, block: 3, heal: 0, draw: 0, text: 'Deal 4. Gain 3 block.' },
  { id: 'moon-pool', name: 'Moon Pool', suit: 'tide', cost: 2, attack: 0, block: 0, heal: 5, draw: 0, text: 'Restore 5 life.' },
  { id: 'still-water', name: 'Still Water', suit: 'tide', cost: 1, attack: 0, block: 0, heal: 3, draw: 1, text: 'Restore 3. Draw a card.' },
  { id: 'thorn-volley', name: 'Thorn Volley', suit: 'leaf', cost: 1, attack: 3, block: 1, heal: 0, draw: 0, text: 'Deal 3. Gain 1 block.' },
  { id: 'bramble-wall', name: 'Bramble Wall', suit: 'leaf', cost: 2, attack: 0, block: 7, heal: 0, draw: 0, text: 'Gain 7 block.' },
  { id: 'root-feast', name: 'Root Feast', suit: 'leaf', cost: 2, attack: 2, block: 0, heal: 4, draw: 0, text: 'Deal 2. Restore 4.' },
  { id: 'spore-bloom', name: 'Spore Bloom', suit: 'leaf', cost: 1, attack: 0, block: 2, heal: 2, draw: 1, text: 'Block 2. Heal 2. Draw.' },
  { id: 'pebble-shot', name: 'Pebble Shot', suit: 'stone', cost: 1, attack: 2, block: 3, heal: 0, draw: 0, text: 'Deal 2. Gain 3 block.' },
  { id: 'granite-ram', name: 'Granite Ram', suit: 'stone', cost: 2, attack: 5, block: 2, heal: 0, draw: 0, text: 'Deal 5. Gain 2 block.' },
  { id: 'stone-skin', name: 'Stone Skin', suit: 'stone', cost: 1, attack: 0, block: 5, heal: 0, draw: 0, text: 'Gain 5 block.' },
  { id: 'avalanche', name: 'Avalanche', suit: 'stone', cost: 3, attack: 7, block: 4, heal: 0, draw: 0, text: 'Deal 7. Gain 4 block.' },
];

export function cardById(id) {
  return CARD_DEFS.find((c) => c.id === id);
}

// A shuffled 24-card deck: each definition twice, so combos repeat fairly.
export function buildDeck(shuffle) {
  const ids = [];
  for (const def of CARD_DEFS) ids.push(def.id, def.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(shuffle() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

export function drawCards(deck, hand, n) {
  for (let i = 0; i < n && deck.length > 0; i++) hand.push(deck.pop());
  return hand;
}
