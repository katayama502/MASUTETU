const MAX_TURNS = 12;
const initialItems = ['よりみち切符'];

const eventDeck = [
  { title: '商店街スタンプの日', body: '今日立ち寄った店舗の紹介をじっくり読んだ。文化ポイント +1。', score: 1, funds: 0 },
  { title: '雨やどり休憩', body: '川沿いで少し休憩。移動費が増えたが、次の目的地を再確認できた。', score: 0, funds: -200 },
  { title: '地元作家の展示案内', body: '作品紹介カードを受け取った。文化ポイント +2。', score: 2, funds: 0 },
  { title: 'おみやげ好評', body: '紹介した特産品が話題に。旅資金 +500。', score: 0, funds: 500 }
];

const state = {
  board: [],
  position: 0,
  dice: null,
  turn: 1,
  funds: 3000,
  score: 0,
  items: [...initialItems],
  moveBonus: 0,
  visited: new Set(),
  event: { title: '旅のはじまり', body: 'サイコロを振って益田市内のスポットを巡りましょう。', score: 0, funds: 0 }
};

function createBoard(spotsList) {
  return spotsList.map((spot, index) => {
    const angle = (index / spotsList.length) * Math.PI * 2 - Math.PI / 2;
    return {
      ...spot,
      index,
      x: 50 + Math.cos(angle) * 39,
      y: 50 + Math.sin(angle) * 31
    };
  });
}

function applySpotEffect(effect) {
  if (effect.type === 'fund') state.funds += effect.amount;
  if (effect.type === 'score') state.score += effect.amount;
  if (effect.type === 'item' && !state.items.includes(effect.item)) state.items.push(effect.item);
  if (effect.type === 'move') state.moveBonus += effect.amount;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[character]);
}

function render() {
  const root = document.getElementById('root');
  const currentSpot = state.board[state.position];
  const progress = Math.min(100, Math.round((state.turn - 1) / MAX_TURNS * 100));
  const gameEnded = state.turn > MAX_TURNS;

  root.innerHTML = `
    <main class="app-shell">
      <section class="hero" aria-labelledby="game-title">
        <div>
          <p class="eyebrow">益田市の店舗・作家情報を遊んで知る</p>
          <h1 id="game-title">ます鉄 <span>益田市電鉄</span></h1>
          <p class="hero-copy">
            サイコロで益田市内のスポットを巡り、止まったマスの店舗・作家情報を即時表示する
            オリジナル設計のブラウザすごろくです。
          </p>
        </div>
        <aside class="safety-card">
          <strong>権利セーフティライン</strong>
          <p>名称・キャラクター・カード名・UI表現は独自制作。一般的なサイコロ移動だけを利用します。</p>
        </aside>
      </section>

      <section class="game-layout" aria-label="ゲーム画面">
        <div class="board-panel">
          <div class="board" role="img" aria-label="益田市を抽象化した周遊ボード">
            <svg viewBox="0 0 100 100" class="route" aria-hidden="true">
              <ellipse cx="50" cy="50" rx="39" ry="31"></ellipse>
              <path d="M18 50 C32 24, 68 24, 82 50 C68 76, 32 76, 18 50Z"></path>
            </svg>
            ${state.board.map((spot) => `
              <button
                class="space ${spot.index === state.position ? 'active' : ''} ${state.visited.has(spot.id) ? 'visited' : ''}"
                style="left: ${spot.x}%; top: ${spot.y}%"
                data-space-index="${spot.index}"
                aria-label="${escapeHtml(spot.name)}を表示"
              ><span>${spot.index + 1}</span></button>
            `).join('')}
            <div class="mascot" style="left: ${currentSpot.x}%; top: ${currentSpot.y}%">🚃</div>
          </div>

          <div class="controls">
            <button class="primary" id="roll-dice" ${gameEnded ? 'disabled' : ''}>${gameEnded ? '旅程終了' : 'サイコロを振る'}</button>
            <button class="secondary" id="reset-game">最初から</button>
            <div class="dice" aria-live="polite">${state.dice ?? '–'}</div>
          </div>
        </div>

        <aside class="status-panel">
          <div class="meters">
            <div><span>ターン</span><strong>${Math.min(state.turn, MAX_TURNS)} / ${MAX_TURNS}</strong></div>
            <div><span>旅資金</span><strong>${state.funds.toLocaleString()} 円</strong></div>
            <div><span>文化ポイント</span><strong>${state.score} pt</strong></div>
            <div><span>訪問スポット</span><strong>${state.visited.size} / ${state.board.length}</strong></div>
            <div><span>次回移動補助</span><strong>+${state.moveBonus} マス</strong></div>
          </div>
          <div class="progress"><span style="width: ${progress}%"></span></div>
          <div class="event-card">
            <p class="eyebrow">地域イベント</p>
            <h2>${escapeHtml(state.event.title)}</h2>
            <p>${escapeHtml(state.event.body)}</p>
          </div>
          <div class="item-list">
            <p class="eyebrow">所持アイテム（独自名称）</p>
            ${state.items.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}
          </div>
        </aside>
      </section>

      <section class="spot-card" aria-labelledby="spot-title">
        <div class="spot-badge">${escapeHtml(currentSpot.kind)}</div>
        <div>
          <p class="eyebrow">${escapeHtml(currentSpot.district)}</p>
          <h2 id="spot-title">${escapeHtml(currentSpot.name)}</h2>
          <p>${escapeHtml(currentSpot.summary)}</p>
          <dl>
            <div><dt>営業時間</dt><dd>${escapeHtml(currentSpot.hours)}</dd></div>
            <div><dt>情報提供・作家</dt><dd>${escapeHtml(currentSpot.artist)}</dd></div>
            <div><dt>停止効果</dt><dd>${escapeHtml(currentSpot.effect.label)}</dd></div>
          </dl>
          <a href="${escapeHtml(currentSpot.url)}" target="_blank" rel="noreferrer">公式・関連情報を見る</a>
        </div>
      </section>

      <section class="ops-grid" aria-label="運用設計">
        <article>
          <h3>フェーズ1: DBレス運用</h3>
          <p>店舗データはJSONで管理し、Netlifyの静的配信に載せる構成です。Pull Requestで更新履歴を残せます。</p>
        </article>
        <article>
          <h3>フェーズ2: 即時反映</h3>
          <p>更新頻度が上がったらFirestoreやSupabaseへ差し替え、承認ロールと監査ログを追加します。</p>
        </article>
        <article>
          <h3>掲載ガバナンス</h3>
          <p>店舗同意、画像権利、撤去SLAを明文化し、実在情報の安全な公開フローを前提にします。</p>
        </article>
      </section>
    </main>
  `;

  document.getElementById('roll-dice').addEventListener('click', rollDice);
  document.getElementById('reset-game').addEventListener('click', resetGame);
  document.querySelectorAll('[data-space-index]').forEach((button) => {
    button.addEventListener('click', () => {
      state.position = Number(button.dataset.spaceIndex);
      render();
    });
  });
}

function rollDice() {
  if (state.turn > MAX_TURNS) return;

  const roll = Math.floor(Math.random() * 6) + 1;
  const totalSteps = roll + state.moveBonus;
  state.moveBonus = 0;
  const nextPosition = (state.position + totalSteps) % state.board.length;
  const nextSpot = state.board[nextPosition];
  const deckEvent = eventDeck[(state.turn + roll + nextPosition) % eventDeck.length];

  state.dice = roll;
  state.position = nextPosition;
  applySpotEffect(nextSpot.effect);
  state.funds += deckEvent.funds;
  state.score += deckEvent.score;
  state.visited.add(nextSpot.id);
  state.event = deckEvent;
  state.turn += 1;
  render();
}

function resetGame() {
  state.position = 0;
  state.dice = null;
  state.turn = 1;
  state.funds = 3000;
  state.score = 0;
  state.items = [...initialItems];
  state.moveBonus = 0;
  state.visited = new Set([state.board[0].id]);
  state.event = { title: '旅のはじまり', body: 'サイコロを振って益田市内のスポットを巡りましょう。', score: 0, funds: 0 };
  render();
}

async function init() {
  const response = await fetch('/src/data/spots.json');
  if (!response.ok) throw new Error('店舗データを読み込めませんでした。');
  const spots = await response.json();
  state.board = createBoard(spots);
  state.visited = new Set([state.board[0].id]);
  render();
}

init().catch((error) => {
  document.getElementById('root').innerHTML = `<main class="app-shell"><section class="hero"><h1>読み込みエラー</h1><p>${escapeHtml(error.message)}</p></section></main>`;
});
