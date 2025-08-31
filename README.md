# WebBuilder - Modern Webbplatsbyggare

En ren, modern webbplatsbyggare byggd med React, TypeScript och Firebase. Skapa vackra webbplatser med enkelhet.

## Funktioner

- ✅ Användarautentisering (registrering/inloggning)
- ✅ Modern, responsiv design
- ✅ Dashboard för webbplatshantering
- ✅ Rent, intuitivt gränssnitt
- ✅ Firebase backend-integration
- ✅ Skyddade rutter

## Teknisk Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore)
- **Build Tool**: Vite
- **Icons**: Lucide React

## Snabbstart

### 1. Installera beroenden

```bash
npm install
```

### 2. Starta utvecklingsservern

```bash
npm run dev
```

Applikationen kommer att öppnas automatiskt på `http://localhost:3000`

### 3. Testa applikationen

1. **Registrera dig** - Skapa ett konto med din e-post
2. **Logga in** - Få tillgång till din dashboard
3. **Skapa webbplatser** - Bygg och hantera dina webbplatser
4. **Utforska funktioner** - Testa all funktionalitet

## Projektstruktur

```
src/
├── components/          # React-komponenter
│   └── ProtectedRoute.tsx
├── config/             # Konfiguration
│   └── firebase.ts     # Firebase-inställningar
├── contexts/           # React Context
│   └── AuthContext.tsx # Autentisering
├── pages/              # Sidor
│   ├── Home.tsx        # Startsida
│   ├── Login.tsx       # Autentisering
│   └── Dashboard.tsx   # Användardashboard
├── App.tsx             # Huvudapp
├── main.tsx            # Ingångspunkt
└── index.css           # Globala stilar
```

## Firebase-inställningar

Applikationen använder följande Firebase-tjänster:
- **Authentication**: Användarhantering
- **Firestore**: Databas för webbplatsdata

Firebase-konfigurationen är redan inställd i `src/config/firebase.ts`.

## Utveckling

Detta är en ren, modern webbplatsbyggare med fokus på enkelhet och användarupplevelse. Kodbasen har optimerats och alla oanvända filer och kod har tagits bort.

### Bygga för produktion

```bash
npm run build
```

### Förhandsvisning av produktionsbygg

```bash
npm run preview
```

## Support

För frågor eller problem, kontakta utvecklingsteamet.
