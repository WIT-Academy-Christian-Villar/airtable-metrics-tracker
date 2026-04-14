# Airtable Metrics Sync API

API backend modular en `Node.js + TypeScript + Express 5` para recolectar metricas desde multiples fuentes externas, procesarlas como eventos de tracking y agregarlas en Airtable.

## Objetivo

Consolidar por ruta y dimensiones UTM:

- `route`
- `visits`
- `registrations`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`

La arquitectura esta pensada para crecer por adaptadores: nuevas fuentes de analytics, formularios, CRM, webhooks, exports o APIs propias se agregan como providers, sin tocar el orquestador central.

## Filosofia

Inspirada en la organizacion de `lautaroschenfeld/airtable-proxy-api`:

- capas claras por responsabilidad
- validacion fuerte con `zod`
- logging estructurado con `pino`
- respuestas HTTP uniformes
- separacion estricta entre HTTP, negocio, integraciones y persistencia
- preparada para retries, chunking, upsert y futuras colas o procesos batch

## Estructura

```txt
src/
  config/
  controllers/
  middleware/
  providers/
  routes/
  schemas/
  services/
  types/
  utils/
  app.ts
  server.ts
```

## Flujo principal de tracking

1. La pagina o un integrador externo envia un evento a `POST /events/visit`, `POST /events/registration`, `GET /c/v.gif` o `GET /c/r.gif`.
2. La API valida el payload con `zod`.
3. El normalizador convierte `route/url + dateBucket + UTMs` a una clave estable (`syncKey`).
4. El evento entra a una cola serial por `syncKey`.
5. El worker lee Airtable:
   - si no existe registro, crea uno
   - si existe, incrementa `Visits` o `Registrations`
6. La respuesta devuelve el resultado del procesamiento y un `runId`.

## Flujo batch secundario

1. `POST /sync` o `POST /sync/:siteKey` dispara un run batch.
2. El orquestador resuelve la configuracion del sitio.
3. Cada provider recolecta datos crudos desde su origen externo.
4. El normalizador convierte esos datos a un modelo comun.
5. El consolidador mergea visitas + registros por ruta y UTM.
6. El writer hace `upsert` en Airtable por clave compuesta.
7. La API devuelve un resultado uniforme y el run queda consultable en `GET /runs/:runId`.

## Endpoints iniciales

- `GET /health`
- `GET /c/v.gif`
- `GET /c/r.gif`
- `POST /events/visit`
- `POST /events/registration`
- `POST /sync`
- `POST /sync/:siteKey`
- `GET /sites`
- `GET /providers`
- `GET /runs/:runId`

## Configuracion por sitio

Cada sitio define:

- provider de visitas
- provider de registros
- reglas de ruta
- mapeo de UTM
- destino Airtable

La configuracion puede vivir en `src/config/sites.catalog.ts` o venir por `SITES_CONFIG_JSON`.

## Payload esperado por eventos

Ejemplo de evento de visita:

```json
{
  "siteKey": "marketing-main",
  "route": "/registro",
  "eventId": "visit_01HSXYZ",
  "source": "first-party-browser",
  "utmSource": "facebook",
  "utmMedium": "paid_social",
  "utmCampaign": "abril",
  "capturedAt": "2026-04-14T13:15:00.000Z"
}
```

Ejemplo de evento de registro:

```json
{
  "siteKey": "marketing-main",
  "route": "/registro",
  "eventId": "lead_01HSXYZ",
  "source": "custom-form",
  "utmSource": "facebook",
  "utmMedium": "paid_social",
  "utmCampaign": "abril",
  "capturedAt": "2026-04-14T13:16:00.000Z"
}
```

Notas:

- `increment` es opcional y default `1`
- `route` o `url` es obligatorio
- `eventId` es opcional, pero muy recomendable para deduplicacion
- la deduplicacion del MVP es en memoria por instancia

## Tracking pixel para visitas

Si queres instrumentar visitas con una sola linea y sin depender del hosting, podes usar:

```html
<script>new Image().src='https://tu-api.com/c/v.gif?siteKey=marketing-main&url='+encodeURIComponent(location.href)</script>
```

Opcionalmente podes sumar el referrer:

```html
<script>const q='siteKey=marketing-main&url='+encodeURIComponent(location.href)+'&referrer='+encodeURIComponent(document.referrer);new Image().src='https://tu-api.com/c/v.gif?'+q</script>
```

El endpoint:

- valida `siteKey` y `url` o `route`
- deriva la `route` desde `url`
- infiere las UTMs desde el query string de `url`
- procesa el incremento en Airtable
- responde un `1x1 gif` transparente

## Tracking pixel para registros

Si queres instrumentar `registration` con una minima intervencion del lado pagina, el endpoint equivalente es:

```html
<script>new Image().src='https://tu-api.com/c/r.gif?siteKey=marketing-main&url='+encodeURIComponent(location.href)</script>
```

Uso recomendado con un flujo como `submitLead`:

- dispararlo solo despues de que el submit respondio `success: true`
- hacerlo antes del redirect, asi la `url` sigue siendo la landing original con sus UTMs

Si ya tenes `sourcePath` disponible en el front, tambien lo podes mandar:

```html
<script>new Image().src='https://tu-api.com/c/r.gif?siteKey=marketing-main&sourcePath='+encodeURIComponent(tracking.sourcePath)+'&url='+encodeURIComponent(location.href)</script>
```

Fallback con pagina de confirmacion:

- si `/confirmar-registro/` conoce o recibe el `sourcePath` original, puede disparar el pixel usando `sourcePath`
- si la pagina de confirmacion no sabe desde que landing vino el usuario, el registro no se puede atribuir correctamente solo con `location.href`

## Payload esperado por los providers JSON batch

Los adapters de ejemplo consumen arrays JSON o respuestas tipo `{ "data": [...] }`.

Ejemplo de visitas:

```json
{
  "data": [
    {
      "path": "/landing/pricing",
      "visits": 145,
      "capturedAt": "2026-04-14T10:00:00.000Z",
      "dateBucket": "2026-04-14"
    }
  ]
}
```

Ejemplo de registros:

```json
{
  "data": [
    {
      "path": "/form",
      "registrations": 3,
      "utm_source": "google",
      "utm_medium": "cpc",
      "utm_campaign": "brand",
      "capturedAt": "2026-04-14T10:05:00.000Z",
      "dateBucket": "2026-04-14"
    }
  ]
}
```

Campos alternativos soportados:

- visitas: `visits`, `count`, `pageviews`
- registros: `registrations`, `count`, `submissions`, `conversions`
- ruta: `route`, `path`, `pathname`
- url: `url`, `pageUrl`, `page_url`

## Tabla sugerida en Airtable

Crear una tabla como `Traffic Metrics` con estos campos:

- `Site Key` (single line text)
- `Route` (single line text)
- `Date Bucket` (date)
- `Visits` (number)
- `Registrations` (number)
- `UTM Source` (single line text)
- `UTM Medium` (single line text)
- `UTM Campaign` (single line text)
- `UTM Term` (single line text)
- `UTM Content` (single line text)
- `Sources` (long text)
- `Captured At` (date time)
- `Sync Key` (single line text, idealmente unico)

Se recomienda usar `Sync Key` como concatenacion estable de:

`siteKey + route + utm_source + utm_medium + utm_campaign + utm_term + utm_content + dateBucket`

## Cola y concurrencia

El sistema serializa procesamiento por `syncKey`, para evitar carreras de `read-modify-write` contra Airtable en la misma combinacion de ruta/fecha/UTM.

En este MVP:

- la cola es en memoria
- la serializacion es por clave de agregacion
- funciona de forma segura en una sola instancia del proceso

Si despues queres escalar a multiples instancias, el siguiente paso natural es mover esta cola a Redis, SQS o BullMQ.

## Desarrollo

```bash
npm install
cp .env.example .env
npm run dev
```

## Estado

Este repo deja un MVP funcional y extensible:

- ingesta event-driven para visitas y registros
- cola serial por `syncKey`
- incremento seguro en Airtable por combinacion de negocio
- provider HTTP JSON para visitas
- provider HTTP JSON para registros
- normalizacion centralizada
- consolidacion por clave de negocio
- writer Airtable incremental y writer batch via REST API
- store en memoria de runs

Si mas adelante queres, el siguiente paso natural es sumar:

- provider GA4
- provider Plausible
- ingestion por webhook
- colas por sitio
- scheduler
- persistencia durable para runs
