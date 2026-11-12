# Voyager コーポレートサイト

HTMLテンプレートからビルドする静的サイト。Node.js 18以上があれば動き、追加パッケージのインストールは不要です。
GitHub Pages へは、push するだけで自動ビルド・公開されます。

## 構成
```
src/
  layout.html          全ページ共通の骨組み(head・ヘッダー・フッター・script)
  partials/
    header.html        ヘッダー
    footer.html        フッター
  data/site.json       サイト名・メニュー・フッターリンク
  pages/               各ページの本文(1ファイル=1ページ)
    index.html  business.html  recruit.html  company.html  privacy.html
public/                css / js / assets(そのまま dist/ にコピーされる)
build.mjs              ビルドスクリプト(src + public → dist)
dist/                  ビルド結果(Git管理外。公開される実体)
.github/workflows/pages.yml  push で自動ビルド・公開
```

## よく行う編集
| やりたいこと | 編集する場所 |
|---|---|
| 社名を変える | `src/data/site.json` の `name` |
| メニューの項目・順番を変える | `src/data/site.json` の `nav` / `footerNav` |
| ヘッダー・フッターのデザイン・構造 | `src/partials/header.html` / `footer.html` |
| 各ページの文章(`【 】` を置き換える) | `src/pages/*.html` |
| お知らせ | `public/js/main.js` 先頭の `NEWS` |
| 色・フォント | `public/css/style.css` 冒頭の `:root` |

## ページを追加する
1. `src/pages/xxx.html` を作成し、先頭に front matter を書く
   ```
   ---
   heading: ページ名          (パンくず・見出し・<title>に使われる)
   description: ページの説明   (meta description)
   current: xxx               (メニューの強調表示に使うキー)
   ---
   <section class="section"> …本文… </section>
   ```
   トップのようにタイトルを直接指定したい場合は `heading` の代わりに `title:` を使います。
2. `src/data/site.json` の `nav`(必要なら `footerNav`)に項目を追加。`key` に `current` と同じ値を指定すると、そのページでメニューが強調されます。

## ローカルで確認
```bash
node serve.mjs    # ビルドして http://localhost:8000 で配信(停止: Ctrl+C)
```
`npm run serve` でも同じです。ビルドだけ行う場合は `node build.mjs`(`dist/` を生成し、リンク切れもチェック)。
Python は不要です。

## GitHub での管理・公開
```bash
git init -b main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```
GitHub の **Settings → Pages → Source を "GitHub Actions"** にすると、`main` への push ごとにビルドして公開されます。`dist/` はコミット不要です。
独自ドメインは Settings → Pages の Custom domain で設定します。

## 運用ルール(推奨)
- 変更は `feature/xxx` ブランチ → Pull Request → `main` にマージ
- 公開前に PR のレビューで文言・数値を確認
- お問い合わせフォームは [Formspree](https://formspree.io/) 等のURLを `src/pages/index.html` の `action` に設定
