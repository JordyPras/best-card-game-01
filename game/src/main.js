// Ember Duel — bootstrap: read ?scene= for screenshots, wire clicks and
// keys, and keep the table re-rendered after every move.
import { newDuel, playCard, runAiTurn, startPlayerTurn, demoPlayState, demoEndState } from './game.js';
import { render } from './render.js';

const root = document.getElementById('app');
const params = new URLSearchParams(location.search);
const scene = params.get('scene');

let state;
if (scene === 'play') state = demoPlayState();
else if (scene === 'win') state = demoEndState(true);
else if (scene === 'loss') state = demoEndState(false);
else state = newDuel();

function draw() {
  render(state, root, {
    onStart: () => { state.phase = 'play'; draw(); },
    onRestart: () => { state = newDuel(); draw(); },
    onPlayCard: (id) => {
      if (playCard(state, 'player', id)) draw();
    },
    onEndTurn: () => {
      if (state.phase !== 'play') return;
      runAiTurn(state, draw);
      draw();
    },
  });
}

document.addEventListener('keydown', (e) => {
  if (state.phase === 'title' && (e.key === 'Enter' || e.key === ' ')) {
    state.phase = 'play';
    draw();
    return;
  }
  if (state.phase === 'play') {
    if (e.key === 'Enter') {
      runAiTurn(state, draw);
      draw();
    } else if (/^[1-9]$/.test(e.key)) {
      const id = state.player.hand[Number(e.key) - 1];
      if (id && playCard(state, 'player', id)) draw();
    }
  } else if ((state.phase === 'win' || state.phase === 'loss') && e.key === 'Enter') {
    state = newDuel();
    state.phase = 'play';
    draw();
  }
});

draw();
