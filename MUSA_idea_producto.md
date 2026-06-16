# MUSA — Haptic Captions for Music

## One-liner

**MUSA convierte letras sincronizadas en una partitura táctil y visual para que personas sordas, hipoacúsicas o usuarias de implantes/audífonos puedan seguir la letra, el ritmo, la energía y la estructura de una canción desde el celular.**

Tagline:

> **Lyrics you can read. Rhythm you can feel. Music you can follow.**

En español:

> **Letra que podés leer. Ritmo que podés sentir. Música que podés seguir.**

---

## Idea central

No construir “otra app de letras”. Eso no gana.

MUSA tiene que ser **una capa sensorial diaria para música**. El producto toma letras sincronizadas de Musixmatch y las transforma en señales visuales y hápticas: taps, vibraciones, pausas, intensidades y cambios visuales que ayudan a seguir una canción aunque el audio no alcance.

La innovación no es subtitular. La innovación es crear:

## **Haptic Captions**

Subtítulos táctiles para música.

Un subtítulo común dice:

```text
I miss you tonight
```

MUSA agrega información musical:

```text
Nueva línea vocal
Pulso principal activo
Energía subiendo
Coro en 8 segundos
Vibración larga: frase emocional sostenida
```

La frase clave para el jurado:

> **MUSA no transcribe canciones. Traduce música a un lenguaje táctil y visual.**

---

## Problema que resuelve

La música está diseñada como si todos escucharan igual. Pero no es así.

Para una persona sorda, hipoacúsica, usuaria de audífono o implante coclear, una canción puede perder capas importantes:

- palabras difíciles de distinguir;
- entrada y salida de la voz;
- fraseo;
- ritmo fino;
- dinámica;
- cambios de sección;
- emoción;
- build-up antes de un coro o drop.

Los subtítulos muestran palabras, pero no transmiten el cuerpo de la música. Los dispositivos hápticos convierten audio en vibración, pero suelen depender de hardware caro o de señales brutas de audio. MUSA busca el espacio intermedio: **una experiencia accesible, diaria y barata desde el celular**, usando la letra sincronizada como columna vertebral.

---

## Usuario inicial

No apuntaría a “todo el mundo”. Para ganar, conviene enfocar.

### Usuario principal

Personas sordas o hipoacúsicas que ya tienen alguna relación con música, pero sienten que las apps actuales no les dan suficiente información para seguirla.

### Usuarios secundarios

- Personas con implante coclear que escuchan ritmo o voz, pero pierden matices.
- Personas con audífonos que perciben la música distorsionada o con poca claridad.
- Personas con pérdida auditiva progresiva que extrañan detalles de canciones conocidas.
- Músicos o estudiantes de música hipoacúsicos que necesitan apoyo visual/táctil para timing.
- Personas oyentes que están aprendiendo a vivir música de forma multisensorial junto a amigos/familiares sordos.

La tesis humana:

> **MUSA no intenta “arreglar” la sordera. Intenta que la música deje de depender únicamente del oído.**

---

## La feature que tiene que estar perfecta

## **Sensory Score**

Una pantalla única donde pasan cuatro cosas sincronizadas:

1. **Línea de letra actual**
2. **Ritmo visual**
3. **Eventos hápticos**
4. **Energía / sección de la canción**

Ejemplo de pantalla:

```text
MUSA

Song: Fix You — Coldplay
Mode: Cochlear Implant

[00:42]
When you try your best...

Voice active
Energy rising
Chorus in 8s
Pulse: medium
```

Abajo:

```text
Text   Haptics   Visual   Calibrate
```

La app no necesita 2000 funciones. Necesita una pantalla que haga que alguien diga:

> “Ahora entiendo qué está pasando en la canción aunque no escuche todo.”

---

## Lenguaje háptico inicial

Para el MVP, no inventaría un sistema complejo. Usaría un “alfabeto” simple y aprendible.

| Evento musical | Señal háptica | Señal visual | Por qué importa |
|---|---|---|---|
| Pulso/beat principal | Tap corto repetido | Punto o barra que late | Ayuda a mantener timing |
| Nueva línea vocal | Doble tap corto | Cambio de línea destacado | Marca cuándo empieza una frase |
| Frase larga/emocional | Vibración suave sostenida | Línea expandida / brillo lento | Transmite continuidad emocional |
| Pausa vocal | Silencio háptico | Espacio visual / respiración | Hace sentir ausencia y tensión |
| Coro próximo | Tres taps ascendentes | Countdown: “chorus in 8s” | Anticipación y estructura |
| Coro/drop | Impacto fuerte + pulso más intenso | Pantalla se abre / onda más grande | Momento de energía compartida |
| Fin de sección | Tap largo suave | División en timeline | Orientación dentro de la canción |

La clave: no vibrar por vibrar. **Cada patrón tiene significado.**

---

## Diferenciación fuerte

### Contra subtítulos normales

Subtítulos = palabras.

MUSA = palabras + timing + tacto + estructura musical.

### Contra Apple Music Haptics

Apple valida que el mercado existe: Music Haptics permite experimentar música con taps, texturas y vibraciones sincronizadas con audio en iPhone.[^apple-haptics]

Pero MUSA se diferencia así:

- Apple es principalmente **audio-haptic**.
- MUSA sería **semantic-haptic**.

Es decir: MUSA no solo vibra porque hay sonido. Vibra porque empieza una línea, porque entra el coro, porque cambia la energía o porque la letra marca una frase importante.

### Contra SoundShirt / Music: Not Impossible / Woojer

Esas soluciones son potentes, pero dependen de hardware dedicado o experiencias live. MUSA apunta a lo diario y accesible:

> **solo celular + letras sincronizadas + haptics personalizados.**

---

## Cómo usa Musixmatch de forma central

Musixmatch no puede ser decorativo. Tiene que ser el motor.

Endpoints/superficies probables:

- `track.search`: buscar canción.
- `matcher.track.get`: matchear canción desde artista/título o metadata.
- `track.lyrics.get`: obtener letra para display en tiempo real.
- `track.subtitle.get`: obtener letra sincronizada / timestamps.
- `track.get`: metadata básica del track.

El dato clave es el timestamp de la letra. De ahí sale el **Sensory Score**.

Flujo:

```text
Usuario busca canción
→ Musixmatch track.search / matcher.track.get
→ MUSA obtiene synced lyrics con track.subtitle.get
→ Generador convierte timestamps + líneas en eventos hápticos
→ App reproduce Sensory Score en tiempo real
```

Regla importante del hackathon: no guardar, cachear ni redistribuir contenido de Musixmatch. MUSA debe usarlo en tiempo real. En base persistente solo guardaríamos:

```text
track_id
user_profile
haptic_preferences
session_id
non-lyric event metadata generated for the demo
```

No guardaríamos letras completas ni subtítulos descargados.

---

## Cómo usar LALAL.AI sin hacer una pavada

No usar LALAL para “sacar la voz” como feature final. Eso ya existe.

Usarlo para mejorar la traducción sensorial.

LALAL puede separar vocals, instrumental, drums, bass, guitar, piano y otros stems.[^lalal]

Uso dentro de MUSA:

```text
Audio demo
→ separar vocal / drums / bass
→ extraer energía por stem
→ mapear vocal a entrada de frase
→ mapear drums/bass a pulso háptico
→ combinar con timestamps de Musixmatch
```

El hito para el hackathon sería:

> “MUSA combina lyrics sincronizadas de Musixmatch con stems de LALAL para generar haptic captions más inteligentes.”

Si no llegamos a LALAL en 8 días, igual se puede ganar con Musixmatch + haptics si la demo está muy pulida.

---

## MVP para 8 días

### Must-have

1. App móvil o prototipo móvil con haptics reales.
2. Búsqueda de canción vía Musixmatch.
3. Obtención de synced lyrics / subtitles en tiempo real.
4. Pantalla Sensory Score.
5. Patrones hápticos para:
   - línea nueva;
   - beat simple;
   - coro próximo;
   - coro/drop;
   - pausa.
6. Calibración de intensidad: suave, medio, fuerte.
7. Modo demo de 60–90 segundos.
8. Repo público.
9. Video demo de 90 segundos.

### Nice-to-have

1. LALAL stems para mejorar pulso/energía.
2. Perfil de usuario: Deaf / HoH / CI / Hearing Aid.
3. Modo “learn haptic language” de 20 segundos.
4. Compatibilidad con Android e iOS.

### No hacer en el MVP

- Avatar automático de lengua de señas.
- Traducción completa a lengua de señas.
- Red social.
- Playlists.
- Streaming propio.
- 15 modos de accesibilidad.
- Dashboard para venues.
- Hardware externo.

---

## Arquitectura sugerida

### Frontend

**React Native + Expo**

Razón: Expo Haptics da acceso a haptics en iOS, vibración en Android y Web Vibration API en web.[^expo]

Pantallas:

1. `WelcomeScreen`
2. `ProfileSetupScreen`
3. `TrackSearchScreen`
4. `SensoryPlayerScreen`
5. `CalibrationScreen`
6. `DemoModeScreen`

### Backend

**Node/Express o Next.js API routes**

Responsabilidades:

- guardar la API key server-side;
- llamar a Musixmatch;
- normalizar respuesta de subtítulos;
- no persistir contenido de Musixmatch;
- devolver al cliente eventos de sesión efímeros.

### Generador de Sensory Score

Input:

```ts
type SyncedLine = {
  startMs: number;
  endMs?: number;
  text: string;
};
```

Output:

```ts
type HapticEvent = {
  t: number;
  type: 'beat' | 'line_start' | 'chorus_warning' | 'chorus' | 'pause' | 'sustain';
  intensity: 0.2 | 0.5 | 0.8 | 1.0;
  durationMs: number;
};
```

Algoritmo inicial:

```ts
for each lyric line:
  add doubleTap at line.startMs

if gap between lines > 1800ms:
  add silence/rest cue

if repeated phrase or high-density section appears:
  mark possible chorus
  add chorusWarning 8s before
  add stronger pattern at chorus start

if line duration > 3500ms:
  add sustain vibration
```

Para la demo, el beat puede ser aproximado por BPM estimado o por un patrón constante. Si LALAL entra, se reemplaza por envelope de drums/bass.

---

## UX del prototipo

### 1. Onboarding

```text
How do you want to follow music?

[ Deaf / mostly visual ]
[ Hard of hearing ]
[ Cochlear implant ]
[ Hearing aid ]
[ I want to feel more ]
```

No preguntar “qué tan sordo sos” de forma torpe. Preguntar cómo quiere recibir la música.

### 2. Calibración

```text
Choose your haptic strength

Soft      Medium      Strong

Test: line change
Test: chorus
Test: bass pulse
```

### 3. Search

```text
Search a song
Artist / title
```

### 4. Sensory Player

Una pantalla oscura, texto grande, alto contraste, mínimo ruido visual.

```text
[00:42]
Current line

Voice: active
Energy: rising
Chorus: 8s

●   ●   ●   ●
```

### 5. Haptic legend

Un mini tutorial:

```text
Double tap = new lyric line
Long pulse = emotional sustain
Triple ramp = chorus coming
Strong hit = drop / chorus
```

---

## Video demo de 90 segundos

### 0–10s: problema

Pantalla: persona con audífono/implante mirando una app de letras normal.

Voz/texto:

> Music captions give you words. But music is more than words.

### 10–25s: dolor

Mostrar tres capas que se pierden:

```text
rhythm
energy
structure
emotion
```

Texto:

> For many Deaf and hard-of-hearing listeners, lyrics help — but they don’t explain when the voice enters, when the chorus hits, or how the song moves.

### 25–40s: solución

Abrir MUSA. Buscar canción.

Texto:

> MUSA turns synced lyrics into haptic captions.

### 40–65s: demo real

Mostrar el celular vibrando en mano.

Pantalla:

```text
New lyric line
Energy rising
Chorus in 8 seconds
```

Se ven vibraciones/taps en la UI.

### 65–80s: Musixmatch + LALAL

Mostrar flujo:

```text
Musixmatch synced lyrics
+ optional LALAL stems
→ Sensory Score
```

### 80–90s: cierre

> **MUSA makes music accessible beyond hearing.**

---

## Por qué gana según criterios del Musicathon

### Originalidad — 25%

No es lyrics app, karaoke ni visualizer. Es **semantic-haptic accessibility**: usa el significado y timing de la letra para generar tacto.

### Craft — 25%

Una app móvil con haptics reales tiene más impacto que una web. El jurado puede sentir el producto en la mano.

### Uso de Musixmatch — 25%

Sin Musixmatch no existe. Los timestamps de lyrics son la columna vertebral del Sensory Score.

### Impacto — 25%

Ataca accesibilidad musical para personas sordas, hipoacúsicas y usuarias de tecnologías auditivas. No es productividad vacía ni recomendación genérica.

---

## Pitch de 30 segundos

> Music apps assume everyone experiences music through hearing. But for Deaf and hard-of-hearing people, captions only provide words, while haptic devices mostly provide raw vibration. MUSA creates haptic captions for music: it uses Musixmatch synced lyrics to turn every lyric line, chorus, pause and energy shift into a tactile and visual score on your phone. With MUSA, music becomes something you can read, feel and follow — beyond hearing.

---

## Descripción para submission

**MUSA** is a mobile accessibility layer that turns synced lyrics into haptic captions. Using the Musixmatch API, MUSA transforms lyric timestamps into a real-time sensory score: readable lyrics, visual rhythm, and meaningful phone vibrations for lyric changes, choruses, pauses and energy shifts. It helps Deaf and hard-of-hearing listeners follow not just the words of a song, but its structure, rhythm and emotional movement. Optional LALAL.AI stem separation can improve rhythm and energy mapping. MUSA is not another lyrics app — it is music accessibility through touch.

---

## Plan de 8 días

### Día 1 — Definir demo

- Elegir 1–2 canciones para la demo.
- Diseñar el haptic alphabet.
- Definir screens en Figma o directo en código.

### Día 2 — Musixmatch wrapper

- Server-side API wrapper.
- `track.search`.
- `track.subtitle.get`.
- Normalización de timestamps.

### Día 3 — Sensory Score engine

- Convertir líneas en eventos.
- Calcular gaps, line changes y chorus aproximado.
- Crear JSON de sesión efímero.

### Día 4 — App mobile

- React Native / Expo.
- Player screen.
- Letra sincronizada.
- Timer.

### Día 5 — Haptics

- Expo Haptics.
- Patrones por evento.
- Calibración suave/medio/fuerte.

### Día 6 — Polish

- UI accesible.
- Alto contraste.
- Texto grande.
- Tutorial de haptic language.

### Día 7 — LALAL opcional + demo

- Separar stems para una canción demo.
- Usar drums/bass para mejorar pulso si da el tiempo.

### Día 8 — Video + submission

- Video de 90 segundos.
- README.
- Repo público.
- Descripción final.

---

## Riesgos y cómo evitarlos

### Riesgo 1: parecer “solo letras con vibración”

Solución: insistir en **semantic haptics**. La vibración comunica eventos musicales, no ruido.

### Riesgo 2: accesibilidad tratada superficialmente

Solución: incluir lenguaje respetuoso y validación rápida con usuarios. No decir “les damos música a los sordos”. Decir: “la música no debería depender solo del oído”.

### Riesgo 3: web haptics débil

Solución: app móvil con Expo/React Native, no solo web.

### Riesgo 4: problemas de copyright

Solución: no almacenar letras, no redistribuir contenido Musixmatch, no montar un streaming propio. El demo muestra datos en tiempo real y guarda solo IDs/preferencias.

### Riesgo 5: avatar ASL malo

Solución: no hacer avatar. La lengua de señas musical es cultural y performativa; automatizarla mal puede ser ofensivo.

---

## Narrativa de marca

MUSA puede venderse como “el Aleph sensorial de una canción”: un punto donde letra, ritmo, energía y emoción se vuelven visibles y táctiles.

No hace falta explicar Borges en el pitch si no suma. Pero como narrativa interna es fuerte: **MUSA condensa una canción en una experiencia multisensorial.**

---

## Decisión final

El proyecto que yo construiría para ganar:

# **MUSA — Haptic Captions for Music**

Una aplicación móvil que convierte letras sincronizadas de Musixmatch en una partitura táctil y visual para que personas sordas, hipoacúsicas y usuarias de implantes/audífonos puedan seguir canciones desde el celular.

La demo ganadora tiene que hacer una sola cosa perfectamente:

> **El jurado toca el teléfono, ve la letra, siente el coro y entiende inmediatamente que esto no es una app de lyrics: es una nueva forma de acceso musical.**

---

## Fuentes clave

[^apple-haptics]: Apple Support — “Play music on iPhone as taps, textures, and more”. https://support.apple.com/en-il/guide/iphone/iphff2ceeb16/ios
[^lalal]: LALAL.AI — Vocal Remover & Stem Splitter. https://www.lalal.ai/
[^expo]: Expo Documentation — Haptics. https://docs.expo.dev/versions/latest/sdk/haptics/
