# 🔐 Password Autofill Extension

Rozszerzenie dla przeglądarek opartych na Chromium do automatycznego wypełniania formularzy logowania danymi testowymi.

Wersja: 0.2.0 (Alpha)

## Funkcjonalności
- ✓ Automatyczne wykrywanie pól formularzy (login/hasło)  
- ✓ Przyciski "🔐 AutoFill" nad wykrytymi formularzami  
- ✓ Wypełnianie danymi testowymi: `testLogin` / `testPassword`  
- ✓ Inteligentne wykrywanie pól (działa z niestandardowymi nazwami)  
- ✓ Interfejs popup z opisem wtyczki  
- ✓ Przygotowanie pod przyszły panel zarządzania hasłami

---

## Instalacja dla programistów

Wymagania:
- Node.js (>= 14)
- npm

Kroki:
```bash
# sklonuj repozytorium
git clone <url-repozytorium>
cd autofill-login-ts

# zainstaluj zależności
npm install

# skompiluj TypeScript
npm run build
```

Załaduj w Chrome/Chromium:
1. Otwórz `chrome://extensions/`
2. Włącz "Tryb dewelopera"
3. Kliknij "Załaduj rozpakowane rozszerzenie"
4. Wybierz folder `dist` z projektu

Weryfikacja:
- Ikona rozszerzenia powinna pojawić się na pasku narzędzi.
- Kliknij ikonę → powinien otworzyć się popup z danymi testowymi.

---

## Testowanie

Przykładowe strony:
- https://account.booking.com/sign-in
- https://www.twitch.tv/ (przycisk "zaloguj się" w prawym górnym rogu)
- https://practicetestautomation.com/practice-test-login/
- dowolna strona z formularzem logowania

Jak używać:
1. Wejdź na stronę z formularzem logowania.
2. Nad formularzem pojawi się przycisk "🔐 AutoFill".
3. Kliknij przycisk → pola wypełnią się danymi testowymi.
4. Pojawi się zielony komunikat potwierdzenia.

---

## Struktura projektu
```
autofill-login-ts/
├── src/
│   ├── background.ts          # service worker rozszerzenia
│   ├── content.ts             # skrypt wstrzykiwany na strony
│   ├── globals.d.ts           # definicje TypeScript
│   └── popup/
│       ├── popup.html         # interfejs popup
│       ├── popup.css          # style popup
│       └── popup.ts           # logika popup
├── icons/                     # ikony rozszerzenia
├── dist/                      # skompilowane pliki (tworzone automatycznie)
├── manifest.json              # konfiguracja rozszerzenia
├── package.json
├── tsconfig.json
└── webpack.config.js
```

---

## Development

Dostępne komendy npm:
- `npm run build` — kompilacja projektu
- `npm run dev` — kompilacja w trybie watch (automatyczne przy zmianach)

Aktualizacja:
1. Wprowadź zmiany w `src/`
2. Uruchom `npm run build`
3. Na `chrome://extensions/` kliknij ikonę odświeżania przy wtyczce

---

## Dane testowe
- Login: `testLogin`  
- Hasło: `testPassword`

Dane są używane tylko w celach testowych i wypełniane na stronach po kliknięciu "AutoFill".

---

## Uwagi
- Rozszerzenie jest w fazie rozwojowej.  
- Obecnie używane są wyłącznie dane testowe.  
- Docelowo zostanie rozszerzone o pełen menedżer haseł.

---

## Rozwiązywanie problemów
Jeśli wtyczka nie działa:
- Sprawdź konsolę (F12 → Console).  
- Sprawdź czy folder `dist` zawiera kompletne pliki.  
- Przeładuj rozszerzenie na `chrome://extensions/`.

Jeśli przycisk "AutoFill" nie pojawia się:
- Upewnij się, że strona ma formularz z polami login i hasło.  
- Sprawdź atrybuty pól (`name`, `id`, `type`).
