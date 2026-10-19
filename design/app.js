const vendors = {
  amaka: { name: "Amaka's kitchen", spot: "Abuja hall", letter: "A" },
  tunde: { name: "Tunde Threads", spot: "SUB", letter: "T" },
  zainab: { name: "Zainab Beauty", spot: "Queens hall", letter: "Z" },
  seun: { name: "Seun Gadgets", spot: "Faculty of Science", letter: "S" },
  ife: { name: "Ife Prints", spot: "Library", letter: "I" },
};

const products = [
  { id: "chops", name: "Small chops", price: 2000, cat: "Food", vendor: "amaka", hue: "#c45b38" },
  { id: "zobo", name: "Cold zobo", price: 500, cat: "Food", vendor: "amaka", hue: "#7d3040" },
  { id: "hoodie", name: "Faculty hoodie", price: 8500, was: 12000, cat: "Fashion", vendor: "tunde", hue: "#1d4e89" },
  { id: "slides", name: "Campus slides", price: 4500, cat: "Fashion", vendor: "tunde", hue: "#e07a3d" },
  { id: "wig", name: "Bob wig", price: 15000, was: 18000, cat: "Beauty", vendor: "zainab", hue: "#6b2d5b" },
  { id: "nails", name: "Gel set", price: 7000, cat: "Beauty", vendor: "zainab", hue: "#c45b7a" },
  { id: "charger", name: "Fast charger", price: 3500, cat: "Gadgets", vendor: "seun", hue: "#243038" },
  { id: "buds", name: "Earbuds", price: 9000, was: 11000, cat: "Gadgets", vendor: "seun", hue: "#2f5d50" },
  { id: "bind", name: "Spiral binding", price: 1500, cat: "Print", vendor: "ife", hue: "#2f4858" },
];

const CATS = ["All", "Food", "Fashion", "Beauty", "Gadgets", "Print"];
const SHOWS = [
  ["landing", "Landing", "First page on a laptop or phone"],
  ["signup", "Sign up", "A student opens a shop"],
  ["login", "Log in", "Come back to your stall"],
  ["market", "Market", "Every vendor, one grid"],
  ["item&id=hoodie", "Item", "Price, stall, pay or owe"],
  ["store&vendor=tunde", "Vendor shop", "Only that seller"],
  ["dash", "Dashboard", "Her money and her orders"],
  ["day", "Day", "Sold, in hand, still owed"],
];

const params = new URLSearchParams(location.search);
const screen = params.get("screen") || "landing";
const naira = (n) => "₦" + n.toLocaleString("en-NG");
const findProduct = (id) => products.find((item) => item.id === id) || products[2];
const off = (item) => (item.was ? Math.round((1 - item.price / item.was) * 100) : 0);

function header(searchValue) {
  return `<header class="site-header">
    <div class="wrap">
      <a class="logo" href="?screen=landing">Oja</a>
      <form class="searchbar" action="" method="get">
        <input type="hidden" name="screen" value="market" />
        <input name="q" placeholder="Search food, wigs, chargers, binding" value="${searchValue || ""}" />
        <button type="submit">Search</button>
      </form>
      <div class="header-actions">
        <a class="ghost desk-only" href="?screen=all">All screens</a>
        <a class="ghost" href="?screen=login">Log in</a>
        <a class="orange" href="?screen=signup">Sign up</a>
      </div>
    </div>
  </header>`;
}

function card(item) {
  const vendor = vendors[item.vendor];
  return `<a class="card" href="?screen=item&id=${item.id}">
    <div class="photo" style="background:${item.hue}">${item.name.split(" ")[0]}</div>
    <div class="card-body">
      ${item.was ? `<span class="badge">-${off(item)}%</span>` : ""}
      <p class="price">${naira(item.price)}${item.was ? `<span class="was">${naira(item.was)}</span>` : ""}</p>
      <h2>${item.name}</h2>
      <p class="by">${vendor.name}</p>
    </div>
  </a>`;
}

function sellerNav(active) {
  const link = (href, id, label) =>
    `<a class="${active === id ? "on" : ""}" href="${href}">${label}</a>`;
  const links = [
    link("?screen=market", "market", "Market"),
    link("?screen=store&vendor=amaka", "store", "My shop"),
    link("?screen=dash", "dash", "Dashboard"),
    link("?screen=day", "day", "Day"),
  ].join("");
  return `<aside class="sidenav">${links}</aside><nav class="bottomnav">${links}</nav>`;
}

function renderLanding() {
  return `${header("")}
    <section class="hero"><div class="wrap hero-grid">
      <div>
        <h1>Every stall on campus. One market.</h1>
        <p>Food, fashion, beauty, gadgets and print from students and vendors at your university. Pay now, or collect and pay later.</p>
        <div class="hero-actions">
          <a class="btn ink" href="?screen=market">Browse the market</a>
          <a class="btn ghost" href="?screen=signup">Open your shop</a>
        </div>
      </div>
      <div class="lottie" data-lottie="lottie/market.json" data-loop="true"></div>
    </div></section>
    <main class="wrap">
      <div class="section-title">On campus now <span>${products.length} items · 5 vendors</span></div>
      <div class="grid">${products.map(card).join("")}</div>
      <div class="section-title">How a seller uses Oja</div>
      <div class="steps">
        <article class="step"><strong>1. Open a shop</strong><p>Pick your university, name the stall, and say where buyers collect.</p></article>
        <article class="step"><strong>2. Show up in the market</strong><p>Your items sit beside every other vendor. Your dashboard stays yours.</p></article>
        <article class="step"><strong>3. See the day</strong><p>What sold, what is in hand, and who still owes you.</p></article>
      </div>
    </main>`;
}

function renderSignup() {
  const unis = ["University of Ibadan", "UNILAG", "Babcock", "UNIPORT"];
  return `${header("")}
    <main class="wrap auth">
      <div>
        <h1>Open your shop on Oja.</h1>
        <p class="lead">You keep selling on WhatsApp. The link you share lands in a shop the rest of campus can find.</p>
      </div>
      <form class="form" id="signup">
        <label>University
          <select name="university">${unis.map((name) => `<option>${name}</option>`).join("")}</select>
        </label>
        <label>Your name <input name="name" value="Amaka Adeyemi" required /></label>
        <label>Phone <input name="phone" value="0803 000 0000" required /></label>
        <label>Shop name <input name="shop" value="Amaka's kitchen" required /></label>
        <label>Where buyers collect <input name="spot" value="Abuja hall" required /></label>
        <button class="btn orange block" type="submit">Create my shop</button>
        <p class="fine">Already selling? <a href="?screen=login">Log in</a></p>
      </form>
    </main>`;
}

function renderLogin() {
  return `${header("")}
    <main class="wrap auth">
      <div>
        <h1>Welcome back.</h1>
        <p class="lead">Your dashboard, your orders, and the people who still owe you.</p>
      </div>
      <form class="form" id="login">
        <label>Phone <input name="phone" value="0803 000 0000" required /></label>
        <label>Password <input name="password" type="password" value="oja-demo" required /></label>
        <button class="btn orange block" type="submit">Log in</button>
        <p class="fine">New stall? <a href="?screen=signup">Sign up</a></p>
      </form>
    </main>`;
}

function renderMarket() {
  const cat = params.get("cat") || "All";
  const q = (params.get("q") || "").toLowerCase();
  const list = products.filter((item) => {
    const catOk = cat === "All" || item.cat === cat;
    const text = `${item.name} ${vendors[item.vendor].name}`.toLowerCase();
    return catOk && (!q || text.includes(q));
  });
  return `${header(params.get("q") || "")}
    <main class="wrap">
      <div class="cats">
        ${CATS.map((name) => `<button type="button" class="${name === cat ? "on" : ""}" data-cat="${name}">${name}</button>`).join("")}
      </div>
      <div class="section-title">University of Ibadan <span>${list.length} items from every vendor</span></div>
      <div class="grid">${list.map(card).join("") || `<p>Nothing matches.</p>`}</div>
    </main>`;
}

function renderItem() {
  const item = findProduct(params.get("id"));
  const vendor = vendors[item.vendor];
  return `${header("")}
    <main class="wrap pdp">
      <div class="hero-photo" style="background:${item.hue}">${item.name}</div>
      <section class="buybox">
        ${item.was ? `<span class="badge">-${off(item)}%</span>` : ""}
        <p class="price">${naira(item.price)}${item.was ? `<span class="was">${naira(item.was)}</span>` : ""}</p>
        <h1>${item.name}</h1>
        <p class="by">${item.cat} · Collect at the stall</p>
        <a class="vendor-row" href="?screen=store&vendor=${item.vendor}">
          <div class="avatar">${vendor.letter}</div>
          <div><strong>${vendor.name}</strong><span>${vendor.spot} · See this vendor only</span></div>
        </a>
        <div class="buy-actions">
          <button class="btn ghost" type="button" id="owe">Pay on pickup</button>
          <button class="btn orange" type="button" id="pay">Pay now</button>
        </div>
        <div id="toast" class="toast" hidden></div>
        <div class="lottie small" id="pay-lottie" data-lottie="lottie/shop-open.json" data-loop="false" hidden></div>
      </section>
    </main>`;
}

function renderStore() {
  const id = params.get("vendor") || "amaka";
  const vendor = vendors[id];
  const list = products.filter((item) => item.vendor === id);
  return `${header("")}
    <main class="wrap shell">
      ${id === "amaka" ? sellerNav("store") : ""}
      <div>
        <header class="store-banner">
          <p>Vendor shop</p>
          <h1>${vendor.name}</h1>
          <div class="spot">${vendor.spot} · ${list.length} items on Oja</div>
        </header>
        <div class="section-title">From this stall</div>
        <div class="grid">${list.map(card).join("")}</div>
      </div>
    </main>`;
}

function renderDash() {
  return `${header("")}
    <main class="wrap shell">
      ${sellerNav("dash")}
      <div>
        ${
          params.get("welcome") === "1"
            ? `<div class="welcome"><div class="lottie small" data-lottie="lottie/shop-open.json" data-loop="false"></div><div><strong>Your shop is open.</strong><span>Amaka's kitchen is on the University of Ibadan market.</span></div></div>`
            : ""
        }
        <header class="dash-hero">
          <p class="who">Amaka's kitchen · Abuja hall</p>
          <h1>${naira(13340)}</h1>
          <p class="hint">In hand today, after the Oja cut. Other vendors are not in this number.</p>
        </header>
        <div class="stats">
          <div class="stat"><span>Orders</span><strong>7</strong></div>
          <div class="stat"><span>Paid</span><strong class="good">4</strong></div>
          <div class="stat"><span>Owed</span><strong class="owe">${naira(3000)}</strong></div>
        </div>
        <div class="section-title">Your orders</div>
        <article class="order">
          <div><h2>Tobi · Small chops</h2><p>Collected at Abuja hall</p><span class="pill paid">Paid</span></div>
          <strong>${naira(2000)}</strong>
        </article>
        <article class="order">
          <div>
            <h2>Tola · Small chops</h2><p>Waiting to collect</p>
            <div><span class="pill owes">Owes you</span></div>
            <button class="ask" type="button" data-ask="Tola">Ask Tola for ${naira(2000)}</button>
          </div>
          <strong class="owe">${naira(2000)}</strong>
        </article>
        <article class="order">
          <div>
            <h2>Seun · Fast charger</h2><p>Waiting to collect</p>
            <div><span class="pill owes">Owes you</span></div>
            <button class="ask" type="button" data-ask="Seun">Ask Seun for ${naira(1000)}</button>
          </div>
          <strong class="owe">${naira(1000)}</strong>
        </article>
        <div id="toast" class="toast" hidden></div>
      </div>
    </main>`;
}

function renderDay() {
  return `${header("")}
    <main class="wrap shell">
      ${sellerNav("day")}
      <div>
        <header class="dash-hero">
          <p class="who">Tuesday · Amaka's kitchen</p>
          <h1>7 sold</h1>
          <p class="hint">Your stall only.</p>
        </header>
        <div class="lines">
          <div class="line"><span>In hand</span><span class="good">${naira(13340)}</span></div>
          <div class="line"><span>Oja cut</span><span class="muted">${naira(1160)}</span></div>
          <div class="line"><span>Still owed</span><span class="owe">${naira(3000)}</span></div>
        </div>
        <div class="section-title">Who owes you</div>
        <article class="order"><div><h2>Tola</h2><p>Small chops</p></div><strong class="owe">${naira(2000)}</strong></article>
        <article class="order"><div><h2>Seun</h2><p>Fast charger</p></div><strong class="owe">${naira(1000)}</strong></article>
      </div>
    </main>`;
}

function renderAll() {
  return `${header("")}
    <main class="wrap board">
      <h1>All screens</h1>
      <p class="fine">Same pages on a phone or a laptop. Open any one.</p>
      <div class="previews">
        ${SHOWS.map(
          ([id, title, caption]) => `<a class="preview" href="?screen=${id}">
            <div class="frame"><iframe title="${title}" src="?screen=${id}&embed=1"></iframe></div>
            <figcaption><strong>${title}</strong><span>${caption}</span></figcaption>
          </a>`
        ).join("")}
      </div>
    </main>`;
}

const views = {
  landing: renderLanding,
  signup: renderSignup,
  login: renderLogin,
  market: renderMarket,
  item: renderItem,
  store: renderStore,
  dash: renderDash,
  day: renderDay,
  all: renderAll,
};

function mount() {
  const stage = document.getElementById("stage");
  stage.innerHTML = (views[screen] || renderLanding)();
  const signup = document.getElementById("signup");
  const login = document.getElementById("login");
  if (signup) signup.addEventListener("submit", (event) => { event.preventDefault(); location.href = "?screen=dash&welcome=1"; });
  if (login) login.addEventListener("submit", (event) => { event.preventDefault(); location.href = "?screen=dash"; });
  stage.onclick = (event) => {
    const cat = event.target.closest("[data-cat]");
    if (cat) {
      location.href = `?screen=market&cat=${encodeURIComponent(cat.dataset.cat)}`;
      return;
    }
    const toast = document.getElementById("toast");
    if (!toast) return;
    const ask = event.target.closest("[data-ask]");
    const pay = event.target.closest("#pay, #owe");
    if (ask) toast.textContent = `WhatsApp opened for ${ask.dataset.ask}.`;
    if (pay) {
      toast.textContent = pay.id === "pay" ? "Paid. It shows on this vendor's dashboard only." : "Your name is now on what you owe this vendor.";
      const burst = document.getElementById("pay-lottie");
      if (burst) {
        burst.hidden = false;
        playLottie(burst, true);
      }
    }
    if (ask || pay) toast.hidden = false;
  };
  document.querySelectorAll("[data-lottie]:not([hidden])").forEach((node) => playLottie(node));
}

function playLottie(node, replay) {
  if (!window.lottie) return;
  if (node.dataset.ready === "1") {
    if (replay && node.animation) node.animation.goToAndPlay(0, true);
    return;
  }
  node.dataset.ready = "1";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  node.animation = window.lottie.loadAnimation({
    container: node,
    renderer: "svg",
    loop: node.dataset.loop === "true",
    autoplay: !reduce,
    path: node.dataset.lottie,
  });
}

if (params.get("embed") === "1") document.body.classList.add("embed");
mount();
