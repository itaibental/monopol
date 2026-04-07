# 🎲 בגרות מונופול — תקשורת וחברה תשפ"ו

משחק לוח אינטראקטיבי ללימוד 33 מושגי מפתח בתקשורת וחברה לקראת בחינת הבגרות.

## מבנה הפרויקט

```
├── index.html    # מבנה הדף (HTML)
├── styles.css    # עיצוב (CSS)
├── data.js       # נתוני המושגים, אזורים וחידונים
├── board.js      # לוגיקת הלוח, פריסה ומיקום תאים
├── game.js       # ניהול המשחק, קוביות, מודאלים וחידונים
├── .nojekyll     # תמיכה ב-GitHub Pages
└── README.md
```

## הפעלה מקומית

פשוט פתח את `index.html` בדפדפן, או הפעל שרת מקומי:

```bash
npx serve .
```

## GitHub Pages

1. העלה את כל הקבצים ל-repository ב-GitHub
2. הגדרות → Pages → Source: `main` branch, folder: `/ (root)`
3. האתר יהיה זמין בכתובת: `https://<username>.github.io/<repo-name>/`
