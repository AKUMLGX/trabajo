# JustInsurance — support desk take-home

Documentación y scripts para el assessment. El código del starter debe extraerse del paquete oficial de Justin (`support-desk-test/`).

## Archivos

- `docs/CURSOR-BRIEF_6521.md` — brief completo para el agente
- `scripts/extract-starter-if-present.sh` — extrae el tarball cuando esté disponible

## Node 24

```bash
export PATH="/usr/local/bin:$PATH"
node -v
```

## Cuando tengas el starter

```bash
export PATH="/usr/local/bin:$PATH"
bash scripts/extract-starter-if-present.sh
cd starter/support-desk-test
npm run provider   # terminal A
npm start          # terminal B
npm test
```

Plan detallado en el Project store: `/cursor/stores/self/docs/justinsurance-support-desk-plan.md`.
