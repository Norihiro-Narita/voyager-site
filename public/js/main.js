// お知らせはここを編集(新しいものを先頭に)
const NEWS = [
  { date: "2026-10-01", text: "【お知らせの例:ホームページをリニューアルしました】" },
  { date: "2026-09-01", text: "【お知らせの例:2027年卒の募集を開始しました】" },
];

const list = document.getElementById("news-list");
if (list) {
  list.innerHTML = NEWS.map(n =>
    `<li><time datetime="${n.date}">${n.date.replace(/-/g, ".")}</time><span>${n.text}</span></li>`
  ).join("");
}

// モバイルメニュー
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
nav.addEventListener("click", e => { if (e.target.tagName === "A") nav.classList.remove("open"); });

// 地図(data-src にURLを設定すると読み込む)
const frame = document.querySelector(".map iframe");
if (frame && frame.dataset.src && frame.dataset.src.startsWith("http")) frame.src = frame.dataset.src;

document.getElementById("year").textContent = new Date().getFullYear();
