# Migration Scripts

Google Sheets からのデータ移行スクリプト。

## 必要な環境変数

```bash
GOOGLE_SHEET_ID=your_spreadsheet_id
GOOGLE_API_KEY=your_api_key
DATABASE_URL=file:./dev.db
SHEET_RANGE="入力!A1:Z"  # optional
```

## 使い方

```bash
# 1. シードデータ投入
pnpm db:seed

# 2. Google Sheets から移行
pnpm migrate:sheets

# 3. データ検証
pnpm migrate:verify
```

## 注意事項

- 移行は一度きりの実行を想定
- 移行データは匿名ユーザー (`_migrated`) として登録される
- 移行後の新規回答は GitHub 認証が必須
