// Ember Duel — the rival's brain. Ash, the Warden of Cinders, picks cards
// you can read and counter: hurt when you are weak, guard when it is weak,
// and spend every ember it can before it passes.
import { cardById } from './cards.js';

// Score one card in the AI's current situation. Higher is better.
export function scoreAiCard(card, ai, you) {
  let score = card.attack * 2 + card.block * 1.4 + card.heal * 1.2 + card.draw * 1.5;
  if (ai.life <= 8) score += card.heal * 3 + card.block * 2;
  if (you.life <= 6) score += card.attack * 3;
  if (you.block >= 6 && card.attack <= 3) score -= 3;
  if (ai.life >= 18) score -= card.heal * 1.5;
  return score;
}

// Choose the AI's plays for its turn, in order, within its 3 embers.
// Returns the list of card ids it will play (hand is mutated by caller).
export function chooseAiPlays(hand, ai, you) {
  let mana = 3;
  const plays = [];
  const pool = [...hand];
  while (true) {
    let best = -1;
    let bestScore = 0;
    for (let i = 0; i < pool.length; i++) {
      const card = cardById(pool[i]);
      if (!card || card.cost > mana) continue;
      const s = scoreAiCard(card, ai, you);
      if (s > bestScore) { bestScore = s; best = i; }
    }
    if (best < 0) break;
    const card = cardById(pool[best]);
    mana -= card.cost;
    plays.push(pool.splice(best, 1)[0]);
  }
  return plays;
}
