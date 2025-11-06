# Autofill — TypeScript Chrome Extension 

wtyczka Chrome napisana w TypeScript do autouzupełniania chaseł danymi testowymi.

Zawartość:
- `manifest.json` — manifest MV3
- `src/` — źródła TypeScript: `background.ts`, `content.ts`, `popup.html`, `popup.ts`
Szybki start (Windows PowerShell):

1) Zainstaluj zależności:

```powershell
npm install
```

2) Tryb deweloperski (Vite dev server — plugin obsługuje manifest):

```powershell
npm run dev
```

3) Zbuduj produkcyjnie:

```powershell
npm run build
```

4) Załaduj wtyczkę do Chrome (Unpacked):
 - Otwórz chrome://extensions/
 - Włącz "Developer mode"
 - Kliknij "Load unpacked" i wybierz katalog `dist` po zbudowaniu

Uwaga: Manifest odnosi ścieżki do plików w `src/` (plugin Vite przetworzy je do `dist` podczas budowania).

Następne kroki, które mogę wykonać:
- Dodać ESLint i Prettier
- Dodać opcje i stronę opcji
- Uruchomić `npm install` teraz
- `src/` — źródła TypeScript: `background.ts`, `content.ts`, `popup.html`, `popup.ts`
