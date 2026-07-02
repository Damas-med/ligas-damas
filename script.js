// ============================================
//  PESQUISA CIENTÍFICA – DAMAS
//  Edite apenas as variáveis abaixo
// ============================================

const CONFIG = {
  SHEET_ID:   "COLE_AQUI_O_ID_DA_PLANILHA",
  SHEET_NAME: "Artigos",
};

const LIMITE_ARTIGOS   = 8;
const LIMITE_DESTAQUES = 6;

let todosArtigos    = [];
let todosDestaques  = [];
let verTodosA       = false;
let verTodosD       = false;

// ── CARREGAR PLANILHA ──
async function carregar(){
  try {
    const url  = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(CONFIG.SHEET_NAME)}`;
    const res  = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)[1]);

    // Mapear colunas pelo índice (mais robusto que pelo nome)
    const rows = (json.table.rows || []);

    const dados = rows.map(row => {
      const v = i => (row.c[i] ? (row.c[i].f || row.c[i].v || "") : "");
      return {
        titulo:    v(0),
        tag:       v(1),
        data:      v(2),
        link:      v(3),
        imagem:    v(4),
        destaque:  (v(5)||"").toLowerCase().trim() === "sim",
        icone:     v(6) || "📌",
      };
    }).filter(a => a.titulo);

    todosArtigos   = dados;
    todosDestaques = dados.filter(a => a.destaque);

    renderizarArtigos();
    renderizarDestaques();

  } catch(e) {
    console.error(e);
    document.getElementById("artigos-grid").innerHTML =
      `<div class="loading-wrap">⚠️ Não foi possível carregar os artigos.<br><small>Verifique o SHEET_ID e se a planilha está compartilhada.</small></div>`;
    document.getElementById("destaques-grid").innerHTML = "";
  }
}

// ── CARD DE ARTIGO ──
function cardArtigo(a){
  const bg = a.imagem ? `style="background-image:url('${a.imagem}')"` : "";
  const href = a.link ? `href="${a.link}" target="_blank"` : "";
  return `
  <a class="artigo-card" ${href}>
    <div class="artigo-img" ${bg}></div>
    <div class="artigo-body">
      ${a.tag ? `<span class="artigo-tag">${a.tag}</span>` : ""}
      <div class="artigo-titulo">${a.titulo}</div>
      ${a.data ? `<div class="artigo-data">📅 ${a.data}</div>` : ""}
    </div>
  </a>`;
}

// ── CARD DE DESTAQUE ──
function cardDestaque(a){
  const href = a.link ? `href="${a.link}" target="_blank"` : "";
  return `
  <a class="destaque-card" ${href}>
    <div class="destaque-icone">${a.icone}</div>
    <div class="destaque-titulo">${a.titulo}</div>
    <div class="destaque-link">Saiba mais →</div>
  </a>`;
}

// ── RENDERIZAR ──
function renderizarArtigos(){
  const grid = document.getElementById("artigos-grid");
  const exibir = verTodosA ? todosArtigos : todosArtigos.slice(0, LIMITE_ARTIGOS);
  if(!exibir.length){
    grid.innerHTML = `<div class="loading-wrap">Nenhum artigo encontrado.</div>`;
    return;
  }
  grid.innerHTML = exibir.map(cardArtigo).join("");

  // Mostrar/ocultar botão "Ver todos"
  const btn = document.getElementById("btn-ver-todos");
  btn.style.display = (!verTodosA && todosArtigos.length > LIMITE_ARTIGOS) ? "" : "none";
}

function renderizarDestaques(){
  const grid = document.getElementById("destaques-grid");
  const exibir = verTodosD ? todosDestaques : todosDestaques.slice(0, LIMITE_DESTAQUES);
  if(!exibir.length){
    document.getElementById("destaques-section").style.display = "none";
    return;
  }
  grid.innerHTML = exibir.map(cardDestaque).join("");

  const btn = document.querySelector(".btn-ver-todos-dest");
  btn.style.display = (!verTodosD && todosDestaques.length > LIMITE_DESTAQUES) ? "" : "none";
}

function verTodosArtigos(){
  verTodosA = true;
  renderizarArtigos();
}

function verTodosDestaques(){
  verTodosD = true;
  renderizarDestaques();
}

// ── INICIAR ──
carregar();
