# MUSA — Contexto, investigación y estrategia

## Resumen ejecutivo

MUSA debería atacar un problema concreto: **la música diaria todavía no está bien traducida para personas sordas, hipoacúsicas o usuarias de implantes/audífonos**.

El mercado ya tiene soluciones parciales:

- letras sincronizadas;
- subtítulos;
- captions para conversaciones;
- haptics de Apple Music;
- chalecos o prendas hápticas;
- apps de transcripción;
- hardware que convierte audio en vibración.

Pero casi todo cae en uno de dos extremos:

1. **Texto sin cuerpo musical**: subtítulos/lyrics que muestran palabras pero no ritmo, energía o estructura.
2. **Vibración sin significado**: hardware o haptics que transmiten audio/bajo/intensidad, pero no conectan con letra, secciones o intención.

La oportunidad para el Musicathon es construir algo intermedio:

## **MUSA = Haptic Captions for Music**

Una app móvil que usa letras sincronizadas de Musixmatch para crear una partitura sensorial: texto grande, ritmo visual y vibraciones con significado.

---

## Reglas del Musicathon que condicionan la idea

Según las reglas provistas para Musicathon 2026:

- cada proyecto debe usar al menos una superficie de la API de Musixmatch;
- se recomienda usar APIs de socios como Songstats, LALAL.AI y Replit, pero no es obligatorio;
- el envío debe tener título, one-liner, descripción, portada, demo funcional o video de 90 segundos y repo público;
- el jurado evalúa **Originality 25%, Craft 25%, Use of Musixmatch API 25%, Impact 25%**;
- los proyectos deben usar la API de Musixmatch de forma activa y significativa;
- no se puede descargar, cachear, almacenar ni redistribuir contenido de Musixmatch fuera del uso en tiempo real del proyecto.

Implicación para MUSA:

- Musixmatch no puede ser una integración decorativa.
- El producto debe depender de synced lyrics.
- No hay que guardar letras ni subtítulos en base persistente.
- Mejor hacer una demo móvil con haptics reales que una web genérica.

---

## Mercado y tamaño del problema

La pérdida auditiva no es un nicho chico. La OMS estima que más de **1.5 mil millones** de personas viven con algún grado de pérdida auditiva, y **430 millones** tienen pérdida auditiva discapacitante; además, para 2050 podrían ser más de **700 millones** con pérdida auditiva discapacitante.[^who]

Eso no significa que todos sean usuarios de MUSA. Pero sí valida que la accesibilidad auditiva es un mercado enorme y transversal.

Más importante: la pérdida auditiva es un espectro. No se trata solo de “sordos totales”. Hay personas con:

- sordera profunda;
- hipoacusia leve, moderada o severa;
- audífonos;
- implantes cocleares;
- pérdida auditiva progresiva;
- dificultades para distinguir letras;
- sensibilidad al ruido;
- procesamiento auditivo complejo.

Esto encaja bien con el diseño de MUSA: perfiles y calibración, no una experiencia única para todos.

---

## Qué dicen investigaciones sobre música y DHH

Un análisis de comunidades Deaf/Hard-of-Hearing en Reddit encontró que las personas DHH usan múltiples estrategias para vivir la música: señas, visuales, haptics, canciones familiares, música no lírica, música fuerte o con instrumentos marcados.[^arxiv-diversity]

Otro punto importante de ese trabajo: las letras son un elemento central para muchas personas d/Deaf, y el song signing puede sumar accesibilidad musical.[^arxiv-lyrics]

Sobre haptics, una revisión en Frontiers indica que la estimulación háptica puede mejorar la escucha en usuarios de implante coclear al aportar rasgos sonoros que el implante transmite mal; se mencionan mejoras en reconocimiento de melodía, discriminación de pitch, habla en ruido y localización sonora.[^frontiers-haptics]

Traducción práctica para MUSA:

- no alcanza con texto;
- no alcanza con vibración bruta;
- la experiencia debe ser multimodal;
- la personalización es clave;
- la letra sincronizada es una base potente porque conecta tiempo + significado.

---

## Señales desde foros y comunidades

Estas señales no son “datos científicos”, pero sirven para entender dolor real y lenguaje de usuario.

### 1. No hay una sola forma de vivir música

En r/deaf, usuarios repiten que las personas sordas o hipoacúsicas no son un grupo homogéneo: algunas usan residual hearing, otras prefieren vibraciones, otras leen letras, otras disfrutan música signada, y otras prefieren silencio.[^reddit-spectrum]

Implicación:

> MUSA debe ser configurable. No existe “modo sordo” universal.

### 2. Las letras siguen siendo una necesidad fuerte

En r/hardofhearing, una persona cuenta que escucha música pero suele tener problemas para entender letras; menciona que puede tardar días o años en descifrarlas y que busca lyrics para cantar o aprender canciones.[^reddit-lyrics]

Implicación:

> Musixmatch debe estar visible: letra grande, timing claro, línea actual, no texto pequeño estilo karaoke.

### 3. Las vibraciones ayudan, pero suelen ser pobres

En r/deaf, una persona explica que las vibraciones por sí solas son “bass, beat, tempo, general sound”, pero no necesariamente significado o letra.[^reddit-vibrations]

Implicación:

> MUSA tiene que dar **vibración con significado**, no solo vibración por volumen.

### 4. Algunos usuarios crean sus propios setups táctiles

En r/deaf, un usuario cuenta que usa plataformas, una silla metálica, cajón y otros recursos físicos para sentir bass/drums y mantenerse en ritmo.[^reddit-diy]

Implicación:

> La necesidad táctil existe; la gente ya hackea soluciones. MUSA puede llevar una versión simple al celular.

### 5. Los audífonos pueden empeorar o distorsionar música

En r/hardofhearing, usuarios mencionan que los programas de audífonos están optimizados para habla y que la música puede sonar distorsionada, mezclada o con poca claridad; uno dice que las letras desaparecen muy rápido con la pérdida auditiva.[^reddit-hearing-aids]

Implicación:

> MUSA no compite con audífonos. Los complementa con tacto, visuales y timing.

### 6. Músicos hipoacúsicos también tienen dolor

En r/hardofhearing, un usuario músico cuenta que tocar guitarra le cuesta porque no distingue tonos/frecuencias y pregunta cómo otros lo resuelven.[^reddit-musician]

Implicación:

> En el futuro, MUSA puede tener un modo practice/learning. Para el hackathon, no lo construiría, pero sirve como expansión.

---

## Competidores y plataformas relacionadas

### Apple Music Haptics

Apple Music Haptics permite experimentar música en iPhone con taps, texturas y vibraciones refinadas sincronizadas con el audio; funciona para millones de canciones en Apple Music, Music Classical, Shazam y apps compatibles.[^apple-haptics]

**Qué valida:**

- el mercado existe;
- Apple considera música háptica una feature de accesibilidad real;
- el celular puede ser una interfaz táctil musical.

**Hueco para MUSA:**

- Apple está atado al ecosistema Apple;
- el enfoque es audio-haptic;
- MUSA puede diferenciarse con semantic-haptics: letra + timing + estructura + tacto.

### GalaPro

GalaPro entrega closed captions, audio description y traducción en el celular para performances en vivo.[^galapro]

**Qué valida:**

- usar el celular como capa de accesibilidad es una idea real;
- captions móviles para eventos tienen mercado.

**Hueco para MUSA:**

- GalaPro está orientado a teatro/performance;
- no es una app diaria de música;
- no se centra en tacto/ritmo/estructura musical.

### Google Live Transcribe & Sound Notifications

Google Live Transcribe & Sound Notifications hace conversaciones y sonidos del entorno más accesibles para personas sordas o hipoacúsicas usando Android.[^google-live]

**Qué valida:**

- el teléfono ya es una herramienta de accesibilidad auditiva;
- sound notification y transcripción tienen adopción.

**Hueco para MUSA:**

- Live Transcribe es para habla/entorno, no para música;
- no explica canciones ni genera haptics musicales.

### Ava

Ava ofrece captions en vivo para personas sordas o hipoacúsicas, incluyendo transcripción AI y servicios humanos.[^ava]

**Qué valida:**

- captions en tiempo real son un mercado real;
- hay demanda en educación, trabajo y comunicación.

**Hueco para MUSA:**

- Ava resuelve conversación, no experiencia musical.

### Music: Not Impossible

Music: Not Impossible es una experiencia wearable vibrotáctil que traduce música en sensaciones físicas con 24 puntos de sincronización en tiempo real, pensada originalmente con comunidades Deaf/HoH y escalada a eventos live.[^mni]

**Qué valida:**

- la música táctil emociona y se entiende;
- hay interés institucional y de eventos.

**Hueco para MUSA:**

- depende de hardware dedicado;
- está más orientado a eventos;
- MUSA intenta llevar una versión diaria y barata al celular.

### SoundShirt

SoundShirt traduce sonido en tacto en tiempo real con micro-actuadores integrados en una prenda.[^soundshirt]

**Qué valida:**

- el cuerpo puede ser interfaz musical;
- hay interés cultural e institucional.

**Hueco para MUSA:**

- hardware caro/especializado;
- difícil de desplegar en la vida diaria;
- no está centrado en letras sincronizadas.

### Woojer / SUBPAC

Woojer convierte audio en vibraciones físicas y se presenta como útil para personas sordas o hipoacúsicas.[^woojer] SUBPAC se enfoca en sentir bass/low-frequency physical sound.[^subpac]

**Qué valida:**

- la gente paga por sentir audio físicamente;
- el bass físico es una experiencia deseada.

**Hueco para MUSA:**

- estos dispositivos transmiten principalmente cuerpo/bajo/intensidad;
- MUSA agrega significado, línea vocal, lyric timing y estructura.

### Neosensory

Neosensory Buzz usa una pulsera con motores que traducen sonidos ambientales a patrones de vibración; también se ha presentado como herramienta de sound awareness y tinnitus.[^neosensory]

**Qué valida:**

- la sustitución sensorial por vibración es viable;
- el wrist-based haptics puede aportar información auditiva.

**Hueco para MUSA:**

- Neosensory no está enfocado en música con lyrics sincronizadas;
- MUSA puede especializarse en canciones.

---

## Tabla de mercado

| Solución | Qué hace bien | Límite | Oportunidad de MUSA |
|---|---|---|---|
| Apple Music Haptics | Haptics nativos sincronizados con audio | Ecosistema Apple; audio-haptic | Semantic-haptic con lyrics/timing |
| Musixmatch app | Lyrics sincronizadas y traducciones | Principalmente visual/textual | Convertir lyrics en tacto |
| GalaPro | Captions/audio description para shows | Live/theater, no música diaria | Experiencia diaria con canciones |
| Ava / Live Transcribe | Conversaciones y captions | No música | Haptic captions musicales |
| Music: Not Impossible | Full-body haptics impactantes | Hardware/eventos | Celular, barato, diario |
| SoundShirt | Haptic wearable avanzado | Prenda dedicada | Phone-first |
| Woojer / SUBPAC | Bass físico inmersivo | Poca semántica/lyrics | Tacto con significado |
| Neosensory | Sound-to-touch wearable | No centrado en canciones | Lyrics + touch + structure |

---

## Brecha real del mercado

El mercado ya tiene:

- letras;
- traducciones;
- audio haptics;
- hardware táctil;
- captions;
- live transcription.

Lo que no está bien resuelto:

## **Una experiencia diaria, accesible desde celular, que traduzca canciones en significado táctil y visual.**

Esa es la brecha de MUSA.

La idea no es “sentir bajo”.
La idea no es “leer lyrics”.
La idea es:

> **seguir la canción como estructura viva: línea, pausa, pulso, coro, energía y emoción.**

---

## Por qué Musixmatch es ideal para esto

Musixmatch es fuerte en lyrics y lyrics sincronizadas. La API documentada públicamente incluye superficies como `track.lyrics.get`, `track.subtitle.get`, `track.search` y matching de tracks.[^musixmatch-api]

Para MUSA, `track.subtitle.get` es la pieza más importante, porque los timestamps permiten construir la partitura háptica.

Sin Musixmatch, MUSA se vuelve un visualizer. Con Musixmatch, MUSA se vuelve:

> **un traductor sensorial de lyrics sincronizadas.**

---

## Cómo entra LALAL.AI

LALAL.AI permite separar vocals, instrumental, drums, bass, guitar, piano y otros stems.[^lalal]

En MUSA puede servir para mejorar la parte de energía y ritmo:

- `vocals` → entrada/salida de voz;
- `drums` → pulso principal;
- `bass` → vibración fuerte;
- `instrumental` → energía general;
- `silences/gaps` → pausas y respiración visual.

Pero no conviene que LALAL sea el centro. El centro debe ser Musixmatch + haptic captions.

---

## Factibilidad técnica

### Web sola no alcanza

La Web Vibration API existe, pero MDN la marca como “Limited availability” porque no funciona en algunos browsers ampliamente usados.[^mdn-vibration]

Por eso, para una demo seria conviene una app móvil o Expo/React Native.

### React Native / Expo

Expo Haptics provee acceso a efectos de vibración en Android, haptics engine en iOS y Web Vibration API en web.[^expo]

Para hackathon, esto permite construir rápido y demostrar haptics reales.

### iOS / Android nativo

- iOS tiene Core Haptics para patrones custom.[^corehaptics]
- Android tiene `VibrationEffect` y APIs para patrones/waveforms.[^android-vibration]

Para el MVP, Expo alcanza. Para el futuro, una versión nativa permitiría patrones más finos.

---

## Diseño responsable

### No prometer “hacer oír”

MUSA no debe decir “los sordos ahora escuchan música”. Eso es paternalista y falso.

Mejor:

> **MUSA ayuda a seguir, sentir y entender música más allá del oído.**

### No tratar a la comunidad DHH como monolito

La comunidad es diversa. Hay usuarios que aman música, otros que no; algunos prefieren vibración, otros lyrics, otros señas, otros audífonos/implantes.

Producto:

- perfiles;
- calibración;
- opt-in de haptics;
- modo visual-only;
- modo minimal.

### No hacer avatar ASL automático

La interpretación musical en lengua de señas es cultural, performativa y compleja. Un avatar automático puede salir mal, ser poco natural o directamente ofensivo. Para 8 días, no vale el riesgo.

### Co-diseñar aunque sea rápido

Validación mínima en 48 horas:

- hablar con 3–5 personas sordas/hipoacúsicas;
- mostrarles el haptic alphabet;
- preguntar qué señales sobran/faltan;
- ajustar intensidad y lenguaje.

Preguntas útiles:

1. ¿Qué parte de una canción se te pierde más?
2. ¿Usás lyrics cuando escuchás música?
3. ¿Te ayuda sentir vibraciones o te molesta?
4. ¿Preferís información mínima o detallada?
5. ¿Qué patrón táctil te resulta intuitivo para “entra el coro”?

---

## Cliente y distribución posible

### Usuario consumidor

- Personas sordas/hipoacúsicas que escuchan música desde el celular.
- Usuarios de audífonos/implantes que quieren apoyo visual/táctil.
- Familias o parejas mixtas DHH/hearing.

### Instituciones futuras

- Universidades con programas de inclusión.
- Escuelas de música.
- Conservatorios.
- Centros culturales.
- Clínicas/audiología como herramienta complementaria.
- Apps de streaming como feature de accesibilidad.
- Museos/exhibiciones musicales.

### Modelo futuro posible

No para el hackathon, pero como visión:

- B2C freemium;
- B2B SDK para apps musicales;
- licencias a instituciones educativas/culturales;
- plugin accesible para plataformas de lyrics/music.

Para Musicathon, no hablaría demasiado de monetización. Enfocaría en impacto y demo.

---

## Qué tendría que mostrar la demo para ganar

El jurado tiene que entender tres cosas en segundos:

1. El problema no son “lyrics faltantes”; es música incompleta para quien no recibe todo por audio.
2. MUSA usa Musixmatch de forma central: synced lyrics → haptic events.
3. La app se siente literalmente en la mano.

La mejor demo:

- una persona activa MUSA;
- busca una canción;
- aparece Sensory Score;
- se ve el celular vibrando;
- cambian los patrones cuando entra una línea/coro;
- el cierre muestra el mapping de Musixmatch → haptics.

---

## Por qué no hacer otras ideas ahora

### No hacer solo captions

Ya existe mucha infraestructura de captions. Además, captions solos no transmiten ritmo o energía.

### No hacer solo visualizer

Los visualizers son lindos pero no necesariamente accesibles. Si no están atados a significado, son decoración.

### No hacer solo vibration by volume

Eso ya lo hacen hardware y algunas features. La ventaja de MUSA es vibración semántica.

### No hacer ASL automático

Demasiado sensible y difícil para 8 días.

### No hacer una app de recitales

Es válido, pero el día a día es más amplio y original: música en casa, transporte, estudio, práctica, vínculos, memoria.

---

## Posicionamiento final

MUSA debe posicionarse así:

> **A phone-first accessibility layer that turns synced lyrics into haptic captions, helping Deaf and hard-of-hearing listeners follow music through text, touch and visual rhythm.**

En español:

> **Una capa de accesibilidad móvil que convierte letras sincronizadas en subtítulos táctiles, para que personas sordas e hipoacúsicas puedan seguir música con texto, tacto y ritmo visual.**

---

## Top insight

La idea ganadora no es “hacer música más linda”.

Es esto:

> **La música tiene información que hoy está atrapada en el audio. MUSA libera parte de esa información en otra modalidad: tacto y visión.**

Eso es profundo, simple y demoable.

---

## Recomendación final

Construir **MUSA — Haptic Captions for Music**.

No intentar hacer la app definitiva completa. Para el hackathon, resolver solo esto:

1. Musixmatch synced lyrics.
2. Haptic events derivados de lyrics/timing.
3. Visual Sensory Score.
4. Calibración de intensidad.
5. Demo móvil que se pueda sentir.

Si el jurado puede agarrar el teléfono y sentir la diferencia entre una línea, un coro y una pausa, el proyecto deja de ser una presentación y se convierte en una experiencia.

---

## Fuentes

[^who]: WHO — Deafness and hearing loss. https://www.who.int/health-topics/hearing-loss
[^arxiv-diversity]: “Exploring the Diversity of Music Experiences for Deaf and Hard of Hearing People” — arXiv. https://arxiv.org/html/2401.09025v1
[^arxiv-lyrics]: “Exploring the Diversity of Music Experiences for Deaf and Hard of Hearing People” — lyrics as central element. https://arxiv.org/html/2401.09025v1
[^frontiers-haptics]: Frontiers — “Can Haptic Stimulation Enhance Music Perception in Hearing-Impaired Listeners?” https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2021.723877/full
[^reddit-spectrum]: Reddit r/deaf — discussion on diverse ways Deaf/HoH people experience music. https://www.reddit.com/r/deaf/comments/uur4ha/ok_so_how_do_deaf_people_listen_to_music_for_like/
[^reddit-lyrics]: Reddit r/hardofhearing — user perspective on difficulty understanding lyrics. https://www.reddit.com/r/hardofhearing/comments/10s42xi/looking_for_a_hohdeaf_persons_point_of_view_on/
[^reddit-vibrations]: Reddit r/deaf — discussion on feeling music through vibrations. https://www.reddit.com/r/deaf/comments/rzhf3c/how_do_you_feel_music_through_vibrations/
[^reddit-diy]: Reddit r/deaf — user describing tactile setups to feel bass/drums. https://www.reddit.com/r/deaf/comments/1lygwf2/do_all_of_you_still_enjoy_music/
[^reddit-hearing-aids]: Reddit r/hardofhearing — hearing aids and music sound quality discussion. https://www.reddit.com/r/hardofhearing/comments/f46j59/does_music_sound_worse_with_hearing_aids/
[^reddit-musician]: Reddit r/hardofhearing — musician struggling with tones/frequencies. https://www.reddit.com/r/hardofhearing/comments/1i5g1aa/does_anyone_else_play_an_instrument_and_struggle/
[^apple-haptics]: Apple Support — Music Haptics on iPhone. https://support.apple.com/en-il/guide/iphone/iphff2ceeb16/ios
[^galapro]: GalaPro — captions/audio description for performances. https://www.galapro.com/
[^google-live]: Google Play — Live Transcribe & Sound Notifications. https://play.google.com/store/apps/details?id=com.google.audio.hearing.visualization.accessibility.scribe
[^ava]: Ava — captions for Deaf and HoH. https://www.ava.me/
[^mni]: Music: Not Impossible — haptic live music experience. https://www.notimpossible.com/music-not-impossible
[^soundshirt]: CuteCircuit — SoundShirt. https://cutecircuit.com/soundshirt/
[^woojer]: Woojer — haptic wearables. https://www.woojer.com/
[^subpac]: SUBPAC — tactile audio system. https://subpac.com/
[^neosensory]: ENT & Audiology News — Neosensory Buzz review. https://www.entandaudiologynews.com/reviews/tech-reviews/post/neosensory-buzz-can-a-wristband-really-help-with-sound-awareness-and-tinnitus
[^musixmatch-api]: Musixmatch API reference via OpenAPI Catalog. https://openapicatalog.com/docs/5e9da91c-2fb5-4f1a-9565-e0abb1282a30/index.html
[^lalal]: LALAL.AI — Vocal Remover & Stem Splitter. https://www.lalal.ai/
[^mdn-vibration]: MDN — Vibration API limited availability. https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
[^expo]: Expo — Haptics documentation. https://docs.expo.dev/versions/latest/sdk/haptics/
[^corehaptics]: Apple Developer — Core Haptics. https://developer.apple.com/documentation/corehaptics
[^android-vibration]: Android Developers — VibrationEffect. https://developer.android.com/reference/android/os/VibrationEffect
