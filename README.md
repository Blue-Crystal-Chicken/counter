# BCC Cassa - Cashier Application

Questa è l'applicazione **Cassa (Counter)** del progetto **Blue Crystal Chicken (BCC)**, progettata per i cassieri del ristorante.
Consente ai cassieri di cercare gli ordini inserendo il relativo codice, verificare lo stato del pagamento, riscuotere pagamenti (se in contanti alla cassa), annullare gli ordini ed eventualmente modificare gli articoli dell'ordine (aggiungendo o rimuovendo prodotti o variandone le quantità).

L'applicazione è sviluppata in **React 19**, **TypeScript**, **Vite** e stilizzata con **Tailwind CSS v4** e componenti **shadcn/ui**, mantenendo l'esperienza e l'estetica coerenti con l'app `totem`.

---

## 🚀 Requisiti

- **Node.js** (versione 18 o superiore)
- **pnpm** (versione 10 o 11)

---

## ⚙️ Configurazione & Variabili d'Ambiente

Prima di avviare l'applicazione, verifica o crea il file `.env.local` nella cartella `counter`.

Esempio di `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_API_LOCATION_ID=1
VITE_API_LOCATION_NAME=Blue Crystal Torino
VITE_API_LOCATION_ADDRESS=Via Roma 10
VITE_API_LOCATION_CITY=Torino
```

### Dettaglio Variabili:
- `VITE_API_BASE_URL`: URL del backend Spring Boot (es. `http://localhost:8080`).
- `VITE_API_LOCATION_ID`: Identificatore del punto vendita.
- `VITE_API_LOCATION_NAME` / `ADDRESS` / `CITY`: Metadati del locale visualizzati nell'interfaccia.

---

## 🛠️ Istruzioni per l'Avvio

### 1. Installazione Dipendenze
Dalla cartella `counter`, installa i pacchetti:
```bash
pnpm install
```

### 2. Avvio del Server di Sviluppo
Avvia l'app localmente in modalità di sviluppo. Il server Vite è configurato per avviarsi sulla **porta 8081** per rispettare le policy CORS configurate nel backend:
```bash
pnpm dev
```
Apri il browser all'indirizzo `http://localhost:8081`.

### 3. Build per la Produzione
Compila i file ottimizzati e pronti per il deployment nella cartella `dist/`:
```bash
pnpm build
```

---

## 🔑 Credenziali di Accesso Demo

Per motivi di sicurezza, le azioni di scrittura (modifica ordine, eliminazione, pagamento) richiedono privilegi di **ADMIN** gestiti tramite token JWT.
Nel sistema è preconfigurato un utente amministratore se il database è inizializzato con i dati demo del backend:
- **Email:** `gspptesse@gmail.com`
- **Password:** `123456`

L'interfaccia di login contiene un pulsante **"Usa Admin Demo"** per una compilazione rapida e immediata in ambiente di sviluppo.

---

## 💻 Funzionalità Principali

1. **Autenticazione Sicura:** Login con JWT e controllo dei ruoli (`ROLE_ADMIN` richiesto).
2. **Dashboard di Ricerca:**
   - Campo di ricerca diretta per codice ordine (es. `001`, `002`).
   - Elenco dinamico in tempo reale di tutti gli ordini registrati nel sistema, con relativi badge di stato (`Da Pagare`, `In preparazione`, `Pronto`, `Consegnato`, `Annullato`) per una navigazione immediata.
3. **Gestione dell'Ordine:**
   - **Stato Pagato:** Se l'ordine è già stato pagato (`PREPARING`, `READY`, ecc.), viene mostrato un banner ben visibile che ne vieta le modifiche e la riscossione.
   - **Stato Da Pagare (`PENDING`):**
     - Possibilità di registrare il pagamento in contanti (conferma lo stato impostandolo in `PREPARING` nel backend).
     - Possibilità di annullare l'ordine (richiesta DELETE).
     - **Modifica dell'ordine in tempo reale:** pulsante per passare alla modalità editing, che mostra sulla destra il menu del locale ordinato per categoria per aggiungere articoli con un clic, e consente di variare le quantità o rimuovere prodotti calcolando il totale al volo.
