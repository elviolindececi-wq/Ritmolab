import type { Lesson, Module, RhythmOption } from "./types";

export const badges = [
  { key: "primer-pulso", name: "Primer Pulso", description: "Completaste tu primera lección.", icon: "🥁" },
  { key: "pulso-firme", name: "Pulso firme", description: "Llegaste al nivel Pulso Firme.", icon: "🔥" },
  { key: "lector-ritmico", name: "Lector rítmico", description: "Completaste el bloque de lectura.", icon: "🎼" },
  { key: "oido-activo", name: "Oído activo", description: "Aprobaste un dictado rítmico.", icon: "👂" },
  { key: "metronomo-humano", name: "Metrónomo humano", description: "Lograste 85% de estabilidad de pulso.", icon: "⏱️" },
  { key: "amigo-del-ritmo", name: "Amigo del ritmo", description: "Compartiste tu progreso o invitaste a alguien.", icon: "🤝" },
  { key: "maestro-del-compas", name: "Maestro del compás", description: "Superaste un desafío avanzado.", icon: "🏆" }
];

const rhythmOptions: RhythmOption[] = [
  {
    label: "Negras parejas",
    abc: "X:1\nM:4/4\nL:1/4\nQ:1/4=80\nK:C\n| C C C C |",
    syllables: ["TA", "TA", "TA", "TA"],
    defaultNote: "C4",
    hits: [
      { beat: 0, note: "C4", accent: true, label: "TA" },
      { beat: 1, note: "C4", label: "TA" },
      { beat: 2, note: "C4", label: "TA" },
      { beat: 3, note: "C4", label: "TA" }
    ]
  },
  {
    label: "Negra y corcheas",
    abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=84\nK:C\n| C2 D E F2 G2 |",
    syllables: ["TA", "TA-KA", "TA", "TA"],
    defaultNote: "C4",
    hits: [
      { beat: 0, note: "C4", accent: true, label: "TA" },
      { beat: 1, note: "C4", label: "TA" },
      { beat: 1.5, note: "D4", label: "KA" },
      { beat: 2, note: "C4", label: "TA" },
      { beat: 3, note: "C4", label: "TA" }
    ]
  },
  {
    label: "Silencio de negra",
    abc: "X:1\nM:4/4\nL:1/4\nQ:1/4=72\nK:C\n| C z C C |",
    syllables: ["TA", "silencio", "TA", "TA"],
    defaultNote: "C4",
    hits: [
      { beat: 0, note: "C4", accent: true, label: "TA" },
      { beat: 1, rest: true, label: "silencio" },
      { beat: 2, note: "C4", label: "TA" },
      { beat: 3, note: "C4", label: "TA" }
    ]
  },
  {
    label: "Tresillo inicial",
    abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=76\nK:C\n| (3CDE F2 G2 A2 |",
    syllables: ["TA-KI-TA", "TA", "TA", "TA"],
    defaultNote: "C4",
    hits: [
      { beat: 0, note: "C4", accent: true, label: "TA" },
      { beat: 1 / 3, note: "D4", label: "KI" },
      { beat: 2 / 3, note: "E4", label: "TA" },
      { beat: 1, note: "C4", label: "TA" },
      { beat: 2, note: "C4", label: "TA" },
      { beat: 3, note: "C4", label: "TA" }
    ]
  },
  {
    label: "Semicorcheas",
    abc: "X:1\nM:4/4\nL:1/16\nQ:1/4=68\nK:C\n| CDEF G4 A4 B4 |",
    syllables: ["TA-KA-DI-MI", "TA", "TA", "TA"],
    defaultNote: "C4",
    hits: [
      { beat: 0, note: "C4", accent: true, label: "TA" },
      { beat: 0.25, note: "D4", label: "KA" },
      { beat: 0.5, note: "E4", label: "DI" },
      { beat: 0.75, note: "F4", label: "MI" },
      { beat: 1, note: "C4", label: "TA" },
      { beat: 2, note: "C4", label: "TA" },
      { beat: 3, note: "C4", label: "TA" }
    ]
  },
  {
    label: "Síncopa básica",
    abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=86\nK:C\n| C2 D2- D E F2 G2 |",
    syllables: ["TA", "TA-a", "KA", "TA"],
    defaultNote: "C4",
    hits: [
      { beat: 0, note: "C4", accent: true, label: "TA" },
      { beat: 1, note: "D4", accent: true, label: "TA-a" },
      { beat: 1.5, note: "D4", label: "ligadura" },
      { beat: 2, note: "E4", label: "KA" },
      { beat: 3, note: "C4", label: "TA" }
    ]
  },
  {
    label: "Solo corcheas",
    abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:C\n| C D E F G A B c |",
    syllables: ["TA-KA", "TA-KA", "TA-KA", "TA-KA"],
    defaultNote: "C4",
    hits: [
      { beat: 0, note: "C4", accent: true, label: "TA" }, { beat: 0.5, note: "D4", label: "KA" },
      { beat: 1, note: "E4", label: "TA" }, { beat: 1.5, note: "F4", label: "KA" },
      { beat: 2, note: "G4", label: "TA" }, { beat: 2.5, note: "A4", label: "KA" },
      { beat: 3, note: "B4", label: "TA" }, { beat: 3.5, note: "C5", label: "KA" }
    ]
  },
  {
    label: "Silencio al final",
    abc: "X:1\nM:4/4\nL:1/4\nQ:1/4=76\nK:C\n| C C C z |",
    syllables: ["TA", "TA", "TA", "silencio"],
    defaultNote: "C4",
    hits: [
      { beat: 0, note: "C4", accent: true, label: "TA" },
      { beat: 1, note: "C4", label: "TA" },
      { beat: 2, note: "C4", label: "TA" },
      { beat: 3, rest: true, label: "silencio" }
    ]
  },
  {
    label: "Dos tresillos",
    abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=74\nK:C\n| (3CDE (3FGA B2 c2 |",
    syllables: ["TA-KI-TA", "TA-KI-TA", "TA", "TA"],
    defaultNote: "C4",
    hits: [
      { beat: 0, note: "C4", accent: true, label: "TA" }, { beat: 1/3, note: "D4", label: "KI" }, { beat: 2/3, note: "E4", label: "TA" },
      { beat: 1, note: "F4", label: "TA" }, { beat: 1+1/3, note: "G4", label: "KI" }, { beat: 1+2/3, note: "A4", label: "TA" },
      { beat: 2, note: "B4", label: "TA" },
      { beat: 3, note: "C5", label: "TA" }
    ]
  },
  {
    label: "Corchea + silencio",
    abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=78\nK:C\n| C z D z E z F z |",
    syllables: ["TA", "—", "TA", "—", "TA", "—", "TA", "—"],
    defaultNote: "C4",
    hits: [
      { beat: 0, note: "C4", accent: true, label: "TA" }, { beat: 0.5, rest: true, label: "—" },
      { beat: 1, note: "D4", label: "TA" }, { beat: 1.5, rest: true, label: "—" },
      { beat: 2, note: "E4", label: "TA" }, { beat: 2.5, rest: true, label: "—" },
      { beat: 3, note: "F4", label: "TA" }, { beat: 3.5, rest: true, label: "—" }
    ]
  },
  {
    label: "Síncopa en 2",
    abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=82\nK:C\n| C2 z2 D2- D E |",
    syllables: ["TA", "silencio", "TA-a", "KA"],
    defaultNote: "C4",
    hits: [
      { beat: 0, note: "C4", accent: true, label: "TA" },
      { beat: 1, rest: true, label: "silencio" },
      { beat: 2, note: "D4", accent: true, label: "TA-a" },
      { beat: 2.5, note: "D4", label: "ligadura" },
      { beat: 3, note: "E4", label: "KA" }
    ]
  },
  {
    label: "Negra puntillo + corchea",
    abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=72\nK:C\n| C3 D E3 F |",
    syllables: ["TA.", "KA", "TA.", "KA"],
    defaultNote: "C4",
    hits: [
      { beat: 0, note: "C4", accent: true, label: "TA." },
      { beat: 1.5, note: "D4", label: "KA" },
      { beat: 2, note: "E4", label: "TA." },
      { beat: 3.5, note: "F4", label: "KA" }
    ]
  },
  {
    label: "Semicorcheas + negra",
    abc: "X:1\nM:4/4\nL:1/16\nQ:1/4=66\nK:C\n| CDEF G4 A4 B4 |",
    syllables: ["TA-KA-DI-MI", "TA", "TA", "TA"],
    defaultNote: "C4",
    hits: [
      { beat: 0, note: "C4", accent: true, label: "TA" }, { beat: 0.25, note: "D4", label: "KA" },
      { beat: 0.5, note: "E4", label: "DI" }, { beat: 0.75, note: "F4", label: "MI" },
      { beat: 1, note: "G4", label: "TA" },
      { beat: 2, note: "A4", label: "TA" },
      { beat: 3, note: "B4", label: "TA" }
    ]
  },
  {
    label: "Contratiempo simple",
    abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:C\n| z C z D z E z F |",
    syllables: ["—", "KA", "—", "KA", "—", "KA", "—", "KA"],
    defaultNote: "C4",
    hits: [
      { beat: 0, rest: true, label: "—" }, { beat: 0.5, note: "C4", label: "KA" },
      { beat: 1, rest: true, label: "—" }, { beat: 1.5, note: "D4", label: "KA" },
      { beat: 2, rest: true, label: "—" }, { beat: 2.5, note: "E4", label: "KA" },
      { beat: 3, rest: true, label: "—" }, { beat: 3.5, note: "F4", label: "KA" }
    ]
  },
];

// ─── Teoría específica por lección ───────────────────────────────────────────

const lessonTheories: Record<string, string[]> = {
  "memoria-ritmica-intro": [
    "La memoria rítmica es la capacidad de escuchar un patrón, retenerlo internamente y reproducirlo sin ver la partitura. Es la habilidad que separa al músico que 'toca lo que lee' del músico que 'toca lo que escucha'. Todo el jazz, el blues y la música popular se construye sobre esta capacidad.",
    "El ejercicio de call & response (pregunta y respuesta) es el método de entrenamiento más antiguo de la música: el maestro toca un patrón (la pregunta), el alumno lo reproduce de memoria (la respuesta). Este intercambio existe en la música africana, el jazz de Nueva Orleans, los coros gospel y las aulas de percusión del mundo entero.",
    "La dificultad cognitiva: el cerebro debe hacer tres cosas simultáneas — escuchar activamente, almacenar en memoria de trabajo, y ejecutar con precisión temporal. Ninguna de las tres puede fallar. El entrenamiento sistemático de esta habilidad mejora la musicalidad global más que cualquier otro ejercicio."
  ],
  "call-response-basico": [
    "En el call & response básico, el patrón tiene 1 compás de duración y usa solo negras y silencios. La simplicidad del patrón permite que el foco esté en la memoria y el timing, no en la complejidad rítmica.",
    "Estrategia de memorización: no intentes memorizar nota por nota. Escucha el patrón completo como una 'figura' o 'forma'. ¿Tiene más notas al principio o al final? ¿Hay un silencio en el medio? Esas características globales son más fáciles de retener que la secuencia individual de figuras.",
    "Error frecuente: empezar a reproducir demasiado rápido después de escuchar, antes de que el patrón esté consolidado en la memoria. Tomá 1-2 segundos de pausa consciente entre escuchar y reproducir. Ese momento de pausa es el momento de consolidación."
  ],
  "call-response-corcheas": [
    "Con corcheas, el patrón tiene el doble de densidad que con negras. La memoria de trabajo debe procesar más eventos en el mismo espacio temporal. Este salto de densidad es uno de los mayores desafíos del entrenamiento auditivo.",
    "La técnica para patrones con corcheas: vocalizá internamente el patrón con sílabas (TA-KA) mientras lo escuchás. La voz interna actúa como segundo canal de memoria — además de la imagen sonora, tenés una imagen verbal. Los dos canales juntos son mucho más confiables que uno solo.",
    "Referencia de dificultad: un músico que puede reproducir 1 compás de corcheas mezcladas después de escucharlo una sola vez tiene un nivel de memoria rítmica equivalente al Nivel 4 de solfeo del Conservatorio. No es una habilidad menor."
  ],
  "blanca-intro": [
    "La blanca (𝅗𝅥) dura exactamente dos pulsos — el doble que una negra. Si la negra es un paso, la blanca es dos pasos sin levantar el pie: el sonido comienza en el primer pulso y sigue resonando durante el segundo.",
    "Para sentirla: tocá un sonido y contá internamente '1-2' mientras mantenés el sonido. La blanca ocupa ese espacio completo. Si soltás antes del '2', estás tocando una negra — no una blanca.",
    "Error frecuente: 'levantar' mentalmente el sonido en el pulso 2 aunque físicamente siga resonando. El cuerpo tiene que sentir que ese tiempo pertenece a la nota anterior. Cantá 'TA-aa' donde el 'aa' representa el segundo pulso sostenido."
  ],
  "redonda-intro": [
    "La redonda (𝅝) dura cuatro pulsos — ocupa un compás entero de 4/4. Es la nota más larga del sistema tonal básico. Mientras una redonda suena, el pulso avanza cuatro veces por dentro.",
    "La redonda exige el mayor trabajo de pulso interno porque no hay otro ataque que lo ancle durante los 4 tiempos. Muchos estudiantes sienten incertidumbre en el tiempo 3 y 4 — ese es exactamente el momento de mantener el conteo activo.",
    "Referencia musical: el 'La' sostenido al inicio de 'With or Without You' (U2) es una redonda retenida. El bajo sigue tocando negras — eso es exactamente el ejercicio de redonda sobre pulso activo."
  ],
  "duraciones-mixtas": [
    "Mezclar blancas y negras en el mismo compás exige que el cuerpo cambie de modo: a veces un pulso es un ataque nuevo (negra), a veces es la continuación de un sonido anterior (segundo pulso de blanca).",
    "La estrategia para leer duraciones mixtas: primero contá los pulsos del compás completo (1-2-3-4), después ubicá dónde hay ataques y dónde hay continuaciones. Un ataque en el 1 seguido de continuación en el 2 = blanca. Dos ataques seguidos = dos negras.",
    "Error frecuente: tocar la blanca como dos negras iguales. La blanca es un solo ataque con sostenimiento — si escuchás dos golpes separados, no es blanca. Practicá primero con piano o cualquier objeto que resuene naturalmente."
  ],
  "pulso-y-negra": [
    "La negra (♩) dura exactamente un pulso. En 4/4 hay cuatro por compás y es la unidad de referencia de casi toda la música occidental: la negra es el pulso. Caminá a tempo estable — cada paso es una negra.",
    "El objetivo no es tocar rápido sino que el intervalo entre cada golpe sea siempre idéntico. Un pulso estable a 70 BPM vale más que uno irregular a 120. La regularidad es la base de todo lo que viene después.",
    "Error frecuente: acelerar inconscientemente en los primeros tiempos del compás y desacelerar al final. El metrónomo no miente — si el pie se desordena, bajá el tempo hasta encontrar el punto donde el pulso fluye solo."
  ],
  "silencios-basicos": [
    "Un silencio no es una pausa: es una duración activa. El pulso interno sigue corriendo durante el silencio — el silencio se cuenta, no se ignora. En partitura, el silencio de negra (𝄽) ocupa exactamente el mismo espacio que una negra.",
    "Pensalo así: si en 4/4 tocás TA — TA TA, el '—' no es tiempo muerto sino un tiempo de espera consciente. El cuerpo debe sentir ese hueco con la misma precisión que siente el golpe.",
    "Referencia musical: el inicio de 'Smoke on the Water' (Deep Purple) tiene silencios de negra entre los riffs. La nota anterior resuena pero el pulso avanza. El silencio crea tensión — llenarlo apresuradamente destruye ese efecto."
  ],
  "corcheas": [
    "La corchea (♪) dura la mitad de una negra. Dos corcheas equivalen a una negra. En sílabas rítmicas: TA-KA, donde TA cae exactamente en el pulso y KA cae en la subdivisión — el 'y' entre dos tiempos consecutivos.",
    "La subdivisión binaria (dividir cada pulso en dos) es la base de toda música en 4/4, 2/4 y 3/4. Ese 'y' entre tiempos es el espacio donde viven los contratiempos, las síncopas y el groove. Dominar las corcheas es dominar el sistema métrico binario.",
    "Error frecuente: las dos corcheas no son iguales en peso. La primera (TA) tiene acento natural por caer en el pulso; la segunda (KA) es débil. Tocarlas con igual intensidad aplana el ritmo y lo hace mecánico. El acento diferencia el ritmo de un metrónomo."
  ],
  "negras-corcheas": [
    "Cuando mezclas negras y corcheas en el mismo compás, el cerebro tiende a igualar todas las figuras o a acelerar en los grupos de corcheas. El secreto está en mantener el pulso interno constante independientemente de cuántas notas entren en cada tiempo.",
    "Antes de tocar, leé el compás completo y anticipá dónde cambia la densidad rítmica. Una negra en el tiempo 1, corcheas en el tiempo 2, negra en el 3: el tiempo 2 tiene más eventos pero ocupa exactamente el mismo espacio temporal que los otros.",
    "Referencia musical: la introducción de 'Yesterday' (Beatles) alterna negras y corcheas naturalmente. El secreto del fraseo expresivo es saber cuándo apretar y cuándo soltar sin perder el pulso subyacente."
  ],
  "compas-cuatro-cuatro": [
    "El compás 4/4 organiza los pulsos en grupos de cuatro con una jerarquía clara de acentos: FUERTE - débil - medio - débil. El tiempo 1 es el más fuerte, el 3 es medio-fuerte, los tiempos 2 y 4 son débiles. Esta jerarquía es la arquitectura de la música occidental.",
    "Sentir esa jerarquía es más importante que contarla. El acento en el tiempo 1 le da al compás su sensación de 'inicio'; el acento en el 3 crea una sensación de 'impulso hacia el 1 siguiente'. La música popular suele acentuar los tiempos 2 y 4 (backbeat) creando tensión con la métrica natural.",
    "Ejercicio de conciencia: escuchá cualquier canción en 4/4 y marcá solo los tiempos fuertes (1 y 3) con el pie. Luego solo los débiles (2 y 4) con la mano. Esa separación de planos métricos es la base de la coordinación rítmica."
  ],
  "dictado-simple": [
    "El dictado rítmico entrena el oído para reconocer figuras sin ver la partitura — el proceso inverso a la lectura. El cerebro debe convertir duraciones sonoras en representaciones mentales de figuras. Es el puente entre escuchar y leer.",
    "Estrategia efectiva: al escuchar, no intentes transcribir todo de una vez. Primero identificá el pulso. Luego determiná si hay subdivisiones. Finalmente ubicá dónde caen los sonidos dentro del pulso. Esa secuencia (pulso → subdivisión → posición) es el método.",
    "El error más común es querer adivinar rápido antes de escuchar completo. En dictado, escuchar el primer pulso y anticipar el grupo rítmico antes de responder vale más que múltiples escuchas sin foco. La escucha activa se entrena deliberadamente."
  ],
  "tresillos-intro": [
    "El tresillo divide un pulso binario en tres partes iguales. No son tres corcheas (que dividirían en dos): el tresillo crea una tercera división independiente. En sílabas: TA-KI-TA, tres golpes perfectamente iguales dentro del espacio de una negra.",
    "El tresillo es la base del swing en jazz (las 'corcheas de swing' son en realidad tresillos con la primera más larga), del blues, del 12/8 africano y de todos los ritmos de shuffle. Cuando lo dominás, entendés por qué algunos ritmos 'balancean' y otros no.",
    "Error frecuente: tocarlo como corchea-semicorchea (larga-corta-corta) en lugar de tres partes iguales. Cantá 'cho-co-la-te' en un tiempo para sentir el tresillo verdadero. Si los tres sonidos no suenan igual de largos, no es tresillo — es swing descontrolado."
  ],
  "semicorcheas-intro": [
    "La semicorchea (♬) dura la mitad de una corchea y la cuarta parte de una negra. En un solo pulso entran cuatro semicorcheas: TA-KA-DI-MI. Esta subdivisión cuaternaria es el nivel de detalle que permite el funk, el jazz rápido y la música clásica de virtuosismo.",
    "TA cae en el pulso exacto. KA cae en el primer octavo 'y'. DI cae en el segundo 'y' (la mitad del pulso). MI cae en el tercer octavo. Juntas forman una cuadrícula precisa de cuatro puntos equidistantes por cada pulso del metrónomo.",
    "Error frecuente: acelerar el grupo de cuatro para 'caber' en el pulso, en lugar de espaciarlos uniformemente. Practicá primero muy lento (50 BPM) hasta que los cuatro puntos sean equidistantes. La precisión a 50 BPM es más valiosa que la velocidad caótica a 90."
  ],
  "sincopa-intro": [
    "La síncopa es el desplazamiento del acento hacia una posición débil del compás. En lugar de caer en el pulso, el acento cae entre pulsos (contratiempo) o se prolonga desde una parte débil hasta una fuerte mediante ligaduras. El oyente siente tensión porque el acento contradice la métrica.",
    "La síncopa es el mecanismo central del reggae (acento en el 'y' del 2 y del 4), la salsa, el funk de James Brown y la bossa nova. La tensión entre el pulso interno estable y el acento desplazado es exactamente lo que genera el groove — esa sensación de que la música 'jala'.",
    "Error frecuente y grave: mover el pulso interno para que coincida con la síncopa. El pulso debe permanecer fijo como un ancla invisible — la síncopa 'flota' sobre él creando tensión. Si el pie se mueve para acompañar la síncopa, el groove desaparece y la música pierde su swing."
  ],
  "compas-seis-ocho": [
    "El 6/8 es un compás de subdivisión ternaria: hay dos pulsos grandes, y cada uno se subdivide en tres. No son seis tiempos iguales sino dos grupos de tres. El pulso real lo sentís cada tres corcheas, no en cada una.",
    "La sensación de 6/8 es de balanceo o mecedora: UN-dos-tres-DOS-dos-tres. Es la base de las barcarolas, las jigs irlandesas, el compás de 'We Are the Champions' (Queen) y de innumerables canciones de cuna en toda cultura musical. El ternario aporta fluidez que el binario no tiene.",
    "La trampa del 6/8: estudiantes que vienen del 4/4 tienden a leerlo como seis pulsos iguales, creando una sensación rígida. La clave es sentir DOS pulsos grandes primero y subdivir internamente en tres. Empezá siempre marcando los dos pulsos principales."
  ],
  "lectura-con-metronomo": [
    "Leer ritmo con metrónomo es diferente a tocar con metrónomo: implica convertir símbolos visuales en duraciones físicas mientras mantenés el pulso externo como referencia constante. El cerebro hace tres cosas simultáneas: decodificar, sincronizar y ejecutar.",
    "La estabilidad del pulso bajo presión — cuando el patrón es complejo o el tempo es más rápido — es el indicador más confiable del nivel rítmico real. Es fácil mantener el pulso con negras solas; el desafío real es mantenerlo con síncopa y figuras mixtas.",
    "Estrategia profesional: antes de tocar un compás desconocido, escaneá todas las figuras, identificá la más compleja y mentalmente subdividí ese tiempo primero. Luego tocá el compás completo. Este 'escaneo previo' es lo que separa la lectura fluida de la lectura tropezada."
  ],
  "examen-final-ritmico": [
    "Un examen rítmico integral mide tres capacidades diferentes: lectura (decodificar símbolos en tiempo real), dictado (reconocer figuras de oído) y pulso (mantener estabilidad bajo presión). Son habilidades relacionadas pero entrenadas por separado — su combinación revela el nivel real.",
    "La memoria muscular rítmica se construye por capas: primero el pulso estable, luego la subdivisión consciente, luego la lectura, luego el dictado. En este punto del camino ya tenés todas esas capas — el examen las integra y revela cuál necesita más trabajo.",
    "Después del examen, la siguiente etapa no es 'más velocidad' sino musicalidad: fraseo, dinámica, rubato. La técnica rítmica sólida es el fundamento desde el cual la expresión musical tiene sentido. Lo que aprendiste aquí es para siempre."
  ]
};

function lessonTheory(item: { slug: string; skills: string[]; objective: string }): string[] {
  return lessonTheories[item.slug] ?? [
    `Este módulo trabaja ${item.skills.join(", ")} con una progresión corta y repetible. Primero entendés el concepto, después lo escuchás, lo ves en partitura y finalmente lo ejecutás.`,
    "Usá sílabas rítmicas: TA para negras, TA-KA para corcheas, TA-KI-TA para tresillos y TA-KA-DI-MI para semicorcheas. Las sílabas ayudan a que el cuerpo entienda la duración antes que la cabeza la memorice.",
    "La regla de oro de RitmoLab es no subir la velocidad hasta que el pulso sea estable. La precisión vale más que la rapidez."
  ];
}

// ─── Distractores pedagógicos por lección ────────────────────────────────────

const lessonDistractors: Record<string, string[]> = {
  "memoria-ritmica-intro": [
    "La memoria rítmica es la capacidad de escuchar un patrón, retenerlo internamente y reproducirlo sin ver la partitura. Es la habilidad que separa al músico que 'toca lo que lee' del músico que 'toca lo que escucha'. Todo el jazz, el blues y la música popular se construye sobre esta capacidad.",
    "El ejercicio de call & response (pregunta y respuesta) es el método de entrenamiento más antiguo de la música: el maestro toca un patrón (la pregunta), el alumno lo reproduce de memoria (la respuesta). Este intercambio existe en la música africana, el jazz de Nueva Orleans, los coros gospel y las aulas de percusión del mundo entero.",
    "La dificultad cognitiva: el cerebro debe hacer tres cosas simultáneas — escuchar activamente, almacenar en memoria de trabajo, y ejecutar con precisión temporal. Ninguna de las tres puede fallar. El entrenamiento sistemático de esta habilidad mejora la musicalidad global más que cualquier otro ejercicio."
  ],
  "call-response-basico": [
    "En el call & response básico, el patrón tiene 1 compás de duración y usa solo negras y silencios. La simplicidad del patrón permite que el foco esté en la memoria y el timing, no en la complejidad rítmica.",
    "Estrategia de memorización: no intentes memorizar nota por nota. Escucha el patrón completo como una 'figura' o 'forma'. ¿Tiene más notas al principio o al final? ¿Hay un silencio en el medio? Esas características globales son más fáciles de retener que la secuencia individual de figuras.",
    "Error frecuente: empezar a reproducir demasiado rápido después de escuchar, antes de que el patrón esté consolidado en la memoria. Tomá 1-2 segundos de pausa consciente entre escuchar y reproducir. Ese momento de pausa es el momento de consolidación."
  ],
  "call-response-corcheas": [
    "Con corcheas, el patrón tiene el doble de densidad que con negras. La memoria de trabajo debe procesar más eventos en el mismo espacio temporal. Este salto de densidad es uno de los mayores desafíos del entrenamiento auditivo.",
    "La técnica para patrones con corcheas: vocalizá internamente el patrón con sílabas (TA-KA) mientras lo escuchás. La voz interna actúa como segundo canal de memoria — además de la imagen sonora, tenés una imagen verbal. Los dos canales juntos son mucho más confiables que uno solo.",
    "Referencia de dificultad: un músico que puede reproducir 1 compás de corcheas mezcladas después de escucharlo una sola vez tiene un nivel de memoria rítmica equivalente al Nivel 4 de solfeo del Conservatorio. No es una habilidad menor."
  ],
  "blanca-intro": [
    "La blanca (𝅗𝅥) dura exactamente dos pulsos — el doble que una negra. Si la negra es un paso, la blanca es dos pasos sin levantar el pie: el sonido comienza en el primer pulso y sigue resonando durante el segundo.",
    "Para sentirla: tocá un sonido y contá internamente '1-2' mientras mantenés el sonido. La blanca ocupa ese espacio completo. Si soltás antes del '2', estás tocando una negra — no una blanca.",
    "Error frecuente: 'levantar' mentalmente el sonido en el pulso 2 aunque físicamente siga resonando. El cuerpo tiene que sentir que ese tiempo pertenece a la nota anterior. Cantá 'TA-aa' donde el 'aa' representa el segundo pulso sostenido."
  ],
  "redonda-intro": [
    "La redonda (𝅝) dura cuatro pulsos — ocupa un compás entero de 4/4. Es la nota más larga del sistema tonal básico. Mientras una redonda suena, el pulso avanza cuatro veces por dentro.",
    "La redonda exige el mayor trabajo de pulso interno porque no hay otro ataque que lo ancle durante los 4 tiempos. Muchos estudiantes sienten incertidumbre en el tiempo 3 y 4 — ese es exactamente el momento de mantener el conteo activo.",
    "Referencia musical: el 'La' sostenido al inicio de 'With or Without You' (U2) es una redonda retenida. El bajo sigue tocando negras — eso es exactamente el ejercicio de redonda sobre pulso activo."
  ],
  "duraciones-mixtas": [
    "Mezclar blancas y negras en el mismo compás exige que el cuerpo cambie de modo: a veces un pulso es un ataque nuevo (negra), a veces es la continuación de un sonido anterior (segundo pulso de blanca).",
    "La estrategia para leer duraciones mixtas: primero contá los pulsos del compás completo (1-2-3-4), después ubicá dónde hay ataques y dónde hay continuaciones. Un ataque en el 1 seguido de continuación en el 2 = blanca. Dos ataques seguidos = dos negras.",
    "Error frecuente: tocar la blanca como dos negras iguales. La blanca es un solo ataque con sostenimiento — si escuchás dos golpes separados, no es blanca. Practicá primero con piano o cualquier objeto que resuene naturalmente."
  ],
  "memoria-ritmica-intro": [
    "La memoria rítmica es la capacidad de escuchar un patrón, retenerlo internamente y reproducirlo sin ver la partitura. Es la habilidad que separa al músico que 'toca lo que lee' del músico que 'toca lo que escucha'. Todo el jazz, el blues y la música popular se construye sobre esta capacidad.",
    "El ejercicio de call & response (pregunta y respuesta) es el método de entrenamiento más antiguo de la música: el maestro toca un patrón (la pregunta), el alumno lo reproduce de memoria (la respuesta). Este intercambio existe en la música africana, el jazz de Nueva Orleans, los coros gospel y las aulas de percusión del mundo entero.",
    "La dificultad cognitiva: el cerebro debe hacer tres cosas simultáneas — escuchar activamente, almacenar en memoria de trabajo, y ejecutar con precisión temporal. Ninguna de las tres puede fallar. El entrenamiento sistemático de esta habilidad mejora la musicalidad global más que cualquier otro ejercicio."
  ],
  "call-response-basico": [
    "En el call & response básico, el patrón tiene 1 compás de duración y usa solo negras y silencios. La simplicidad del patrón permite que el foco esté en la memoria y el timing, no en la complejidad rítmica.",
    "Estrategia de memorización: no intentes memorizar nota por nota. Escucha el patrón completo como una 'figura' o 'forma'. ¿Tiene más notas al principio o al final? ¿Hay un silencio en el medio? Esas características globales son más fáciles de retener que la secuencia individual de figuras.",
    "Error frecuente: empezar a reproducir demasiado rápido después de escuchar, antes de que el patrón esté consolidado en la memoria. Tomá 1-2 segundos de pausa consciente entre escuchar y reproducir. Ese momento de pausa es el momento de consolidación."
  ],
  "call-response-corcheas": [
    "Con corcheas, el patrón tiene el doble de densidad que con negras. La memoria de trabajo debe procesar más eventos en el mismo espacio temporal. Este salto de densidad es uno de los mayores desafíos del entrenamiento auditivo.",
    "La técnica para patrones con corcheas: vocalizá internamente el patrón con sílabas (TA-KA) mientras lo escuchás. La voz interna actúa como segundo canal de memoria — además de la imagen sonora, tenés una imagen verbal. Los dos canales juntos son mucho más confiables que uno solo.",
    "Referencia de dificultad: un músico que puede reproducir 1 compás de corcheas mezcladas después de escucharlo una sola vez tiene un nivel de memoria rítmica equivalente al Nivel 4 de solfeo del Conservatorio. No es una habilidad menor."
  ],
  "memoria-ritmica-intro": ["La memoria rítmica se entrena memorizando partituras, no escuchando", "Reproducir un patrón de memoria es solo para músicos avanzados", "En call & response el alumno toca al mismo tiempo que el maestro"],
  "call-response-basico": ["Reproducir inmediatamente sin pausa mejora la memoria", "La memoria rítmica es independiente del pulso interno", "Memorizar nota por nota es la estrategia más efectiva"],
  "call-response-corcheas": ["Con más notas hay que tocar más rápido para caber", "La voz interna interfiere con la ejecución física", "Escuchar dos veces siempre es mejor que escuchar una"],
  "blanca-intro": ["La blanca dura 1 pulso igual que la negra", "La blanca se toca dos veces en el mismo compás", "La blanca solo aparece al final del compás"],
  "redonda-intro": ["La redonda dura 2 pulsos como la blanca", "La redonda se cuenta igual que 4 negras separadas", "La redonda no necesita pulso interno porque es muy larga"],
  "duraciones-mixtas": ["Todas las figuras tienen la misma duración", "La blanca y la negra suenan igual, solo se escriben diferente", "En un compás mixto hay que tocar todo a la misma velocidad"],
  "pulso-y-negra": ["Tocar más notas para llenar el espacio", "Acelerar gradualmente para mejorar la fluidez", "Ignorar el metrónomo y tocar 'a gusto'"],
  "silencios-basicos": ["Tocar una nota suave en lugar del silencio", "Acelerar para 'saltar' el silencio rápido", "El silencio no tiene duración, es solo una pausa"],
  "corcheas": ["Subdivido en tres partes iguales (tresillo)", "La segunda corchea cae en el mismo lugar que la primera", "Las corcheas solo se usan en música rápida"],
  "negras-corcheas": ["Acelerar cuando aparecen las corcheas para caber mejor", "Todas las figuras deben tocarse con igual velocidad", "Primero aprendo negras solas, luego corcheas solas"],
  "compas-cuatro-cuatro": ["Los cuatro tiempos tienen el mismo peso dinámico", "El acento siempre cae en el tiempo 2 y 4", "En 4/4 hay cuatro corcheas por compás"],
  "dictado-simple": ["Intentar transcribir todo en la primera escucha", "Contar las notas antes de identificar las figuras", "El dictado y la lectura son exactamente lo mismo"],
  "tresillos-intro": ["El tresillo son dos corcheas tocadas rápido", "Tresillo y 6/8 son lo mismo en diferentes métricas", "Los tres golpes del tresillo son largo-corto-corto"],
  "semicorcheas-intro": ["Semicorcheas = corcheas tocadas más fuerte", "Cuatro semicorcheas no caben en un solo tiempo", "Hay que acelerar para ejecutar TA-KA-DI-MI"],
  "sincopa-intro": ["Mover el pulso interno para que coincida con el acento", "La síncopa es un error rítmico que se debe corregir", "Síncopa solo existe en música afroamericana"],
  "compas-seis-ocho": ["6/8 tiene seis pulsos iguales por compás", "6/8 es igual a 3/4 con más notas", "El balanceo del 6/8 viene de tocar fuerte y piano alternado"],
  "lectura-con-metronomo": ["Ignorar el clic del metrónomo cuando el patrón es complejo", "Leer más lento que el metrónomo para asegurar precisión", "El metrónomo es solo para principiantes"],
  "examen-final-ritmico": ["La velocidad máxima indica el nivel más alto", "El dictado es más fácil que la lectura porque no hay partitura", "Con suficiente repetición el examen se puede aprobar sin entender"]
};

function getDistractors(slug: string, correctAnswer: string): string[] {
  const custom = lessonDistractors[slug] ?? [];
  if (custom.length >= 3) return custom.slice(0, 3);
  const fallback = ["Tocar más fuerte sin contar", "Memorizar canciones sin pulso", "Subir velocidad antes de entender"];
  return [...custom, ...fallback].filter(d => d !== correctAnswer).slice(0, 3);
}

const rawLessons: Array<{
  slug: string;
  title: string;
  stage: string;
  difficulty: Lesson["difficulty"];
  level: number;
  description: string;
  objective: string;
  skills: string[];
  visualPattern: string[];
  bpm: number;
  xp: number;
  rhythmIndex: number;
}> = [
  { slug: "pulso-y-negra", title: "Pulso y negras", stage: "Pulso", difficulty: "Inicial", level: 1, description: "Sentí el pulso estable y leé negras en 4/4.", objective: "Mantener 16 pulsos sin acelerar.", skills: ["pulso", "negra", "4/4"], visualPattern: ["1", "2", "3", "4"], bpm: 76, xp: 50, rhythmIndex: 0 },
  { slug: "silencios-basicos", title: "Silencios básicos", stage: "Pulso", difficulty: "Inicial", level: 1, description: "Reconocé pausas sin perder el tempo.", objective: "Contar silencios con seguridad.", skills: ["silencio", "conteo", "pulso interno"], visualPattern: ["TA", "silencio", "TA", "TA"], bpm: 72, xp: 55, rhythmIndex: 2 },
  { slug: "corcheas", title: "Corcheas", stage: "Pulso", difficulty: "Inicial", level: 1, description: "Dividí el pulso en dos partes iguales.", objective: "Alternar TA y TA-KA sin perder tempo.", skills: ["corcheas", "subdivisión", "binario"], visualPattern: ["1", "y", "2", "y", "3", "y", "4", "y"], bpm: 82, xp: 60, rhythmIndex: 1 },
  { slug: "blanca-intro", title: "La blanca", stage: "Duraciones", difficulty: "Inicial", level: 1, description: "Un sonido que dura dos pulsos.", objective: "Sostener la blanca durante exactamente 2 pulsos.", skills: ["blanca", "duración", "sostenimiento"], visualPattern: ["TA-aa", "——", "TA-aa", "——"], bpm: 70, xp: 45, rhythmIndex: 0 },
  { slug: "redonda-intro", title: "La redonda", stage: "Duraciones", difficulty: "Inicial", level: 1, description: "Un sonido que ocupa todo el compás.", objective: "Contar 4 pulsos internos mientras un sonido resuena.", skills: ["redonda", "duración", "pulso interno"], visualPattern: ["TA-aa-aa-aa", "——", "——", "——"], bpm: 68, xp: 45, rhythmIndex: 2 },
  { slug: "duraciones-mixtas", title: "Blancas y negras mezcladas", stage: "Duraciones", difficulty: "Inicial", level: 1, description: "Alternár duraciones cortas y largas.", objective: "Leer un compás con blancas y negras sin confundir duraciones.", skills: ["blanca", "negra", "lectura"], visualPattern: ["TA-aa", "——", "TA", "TA"], bpm: 72, xp: 52, rhythmIndex: 13 },
  { slug: "negras-corcheas", title: "Negras + corcheas", stage: "Lectura", difficulty: "Básico", level: 2, description: "Alterná figuras sin acelerar.", objective: "Leer un compás mixto a primera vista.", skills: ["lectura", "mezcla", "control"], visualPattern: ["TA", "TA-KA", "TA", "TA"], bpm: 84, xp: 65, rhythmIndex: 1 },
  { slug: "compas-cuatro-cuatro", title: "Compás 4/4", stage: "Lectura", difficulty: "Básico", level: 2, description: "Agrupá pulsos y acentos de forma musical.", objective: "Sentir fuerte-débil-medio-débil.", skills: ["compás", "acento", "grupo"], visualPattern: ["FUERTE", "débil", "medio", "débil"], bpm: 80, xp: 70, rhythmIndex: 0 },
  { slug: "dictado-simple", title: "Dictado simple", stage: "Dictado", difficulty: "Básico", level: 2, description: "Escuchá y elegí la partitura correcta.", objective: "Reconocer negras y corcheas de oído.", skills: ["dictado", "oído", "partitura"], visualPattern: ["escuchá", "compará", "elegí"], bpm: 82, xp: 80, rhythmIndex: 1 },
  { slug: "tresillos-intro", title: "Tresillos intro", stage: "Subdivisión", difficulty: "Básico", level: 2, description: "Sentí tres sonidos en un pulso.", objective: "Diferenciar tresillo de dos corcheas.", skills: ["tresillo", "ternario", "subdivisión"], visualPattern: ["TA-KI-TA", "TA", "TA", "TA"], bpm: 74, xp: 85, rhythmIndex: 3 },
  { slug: "semicorcheas-intro", title: "Semicorcheas intro", stage: "Subdivisión", difficulty: "Intermedio", level: 3, description: "Subdividí el pulso en cuatro.", objective: "Decir TA-KA-DI-MI de forma pareja.", skills: ["semicorcheas", "takadimi", "velocidad"], visualPattern: ["TA", "KA", "DI", "MI"], bpm: 68, xp: 90, rhythmIndex: 4 },
  { slug: "sincopa-intro", title: "Síncopa intro", stage: "Musicalidad", difficulty: "Intermedio", level: 4, description: "Sentí acentos fuera del pulso.", objective: "Mantener el pulso cuando el acento se desplaza.", skills: ["síncopa", "acento", "groove"], visualPattern: ["1", "y", "2", "Y", "3", "y", "4", "Y"], bpm: 86, xp: 100, rhythmIndex: 5 },
  { slug: "compas-seis-ocho", title: "Compás 6/8", stage: "Musicalidad", difficulty: "Avanzado", level: 5, description: "Entrá al pulso compuesto.", objective: "Sentir dos pulsos grandes con tres subdivisiones.", skills: ["6/8", "ternario", "balanceo"], visualPattern: ["1", "la", "li", "2", "la", "li"], bpm: 70, xp: 115, rhythmIndex: 3 },
  { slug: "memoria-ritmica-intro", title: "Memoria rítmica", stage: "Memoria", difficulty: "Intermedio", level: 4, description: "Escuchá un patrón y reproducilo de memoria.", objective: "Escuchar, retener y reproducir sin ver la partitura.", skills: ["memoria", "oído", "reproducción"], visualPattern: ["escuchá", "retené", "reproducí"], bpm: 76, xp: 95, rhythmIndex: 0 },
  { slug: "call-response-basico", title: "Call & response — negras", stage: "Memoria", difficulty: "Intermedio", level: 4, description: "Pregunta y respuesta con patrones de negras.", objective: "Reproducir 1 compás de negras después de escucharlo.", skills: ["call-response", "negra", "memoria"], visualPattern: ["call", "→", "response"], bpm: 72, xp: 100, rhythmIndex: 2 },
  { slug: "call-response-corcheas", title: "Call & response — corcheas", stage: "Memoria", difficulty: "Avanzado", level: 5, description: "Patrones con corcheas que hay que memorizar y reproducir.", objective: "Reproducir 1 compás de corcheas mezcladas de memoria.", skills: ["call-response", "corcheas", "memoria"], visualPattern: ["escuchá", "TA-KA", "reproducí"], bpm: 78, xp: 115, rhythmIndex: 1 },
  { slug: "lectura-con-metronomo", title: "Lectura con metrónomo", stage: "Desafío", difficulty: "Desafío", level: 6, description: "Mantené estabilidad bajo presión.", objective: "Medir consistencia de pulso en una sesión completa.", skills: ["precisión", "lectura", "pulso"], visualPattern: ["TA", "TA-KA", "TA-KI-TA", "TA"], bpm: 92, xp: 130, rhythmIndex: 5 },
  { slug: "examen-final-ritmico", title: "Examen final rítmico", stage: "Desafío", difficulty: "Desafío", level: 7, description: "Evaluación integral de lectura, dictado y pulso.", objective: "Aprobar lectura y dictado con 85%.", skills: ["examen", "memoria", "musicalidad"], visualPattern: ["leer", "escuchar", "tocar", "compartir"], bpm: 96, xp: 150, rhythmIndex: 5 }
];

function makeLesson(item: (typeof rawLessons)[number]): Lesson {
  const rhythm = rhythmOptions[item.rhythmIndex % rhythmOptions.length];
  // Pick 3 distinct wrong options from the rest of the bank
  const others = rhythmOptions.filter((_, i) => i !== item.rhythmIndex % rhythmOptions.length);
  const shuffledOthers = [...others].sort(() => Math.random() - 0.5);
  const wrongOptions = shuffledOthers.slice(0, 3);
  const rhythmList = [rhythm, ...wrongOptions];
  const correctIndex = 0; // will be re-shuffled in DictationExercise at runtime
  const distractors = getDistractors(item.slug, item.objective);
  return {
    slug: item.slug,
    title: item.title,
    description: item.description,
    objective: item.objective,
    theory: lessonTheory(item),
    teacherTip: "Marcá el pulso con el pie mientras resolvés. Si el pie se desordena, bajá el tempo y volvé al patrón más simple.",
    commonMistake: "Querer adivinar rápido. En ritmo conviene escuchar el primer pulso, anticipar el grupo y recién después responder.",
    realMusicExample: "Buscá una canción de tempo medio. Marcá el pulso con el pie y tratá de ubicar qué figura aparece más: negras, corcheas o grupos ternarios.",
    videoTitle: `Video guiado sugerido: ${item.title}`,
    youtubeId: item.level <= 2 ? "0fM4iVA5tcc" : item.level <= 4 ? "60zNKscHUWg" : "I2EjEvsYkrY",
    visualPattern: item.visualPattern,
    reflection: "¿Qué parte fue más difícil: entender, escuchar, leer o sostener el pulso?",
    xp: item.xp,
    access: "free",
    difficulty: item.difficulty,
    level: item.level,
    estimatedMinutes: 5 + item.level * 2,
    skills: item.skills,
    exercises: [
      {
        type: "quiz",
        title: "Teoría nutritiva",
        prompt: `¿Cuál es el objetivo principal de ${item.title}?`,
        options: [item.objective, ...distractors],
        answer: item.objective,
        explanation: `El foco de esta etapa es: ${item.objective}`,
        xp: 10
      },
      {
        type: "human_metronome",
        title: "Metrónomo humano",
        prompt: `Tocá ${Math.max(8, item.level * 4)} pulsos a ${item.bpm} BPM. Buscá estabilidad real, no velocidad.`,
        bpm: item.bpm,
        beats: Math.max(8, item.level * 4),
        passScore: 72,
        rhythm,
        xp: 15 + item.level * 3
      },
      {
        type: "dictation",
        title: "Dictado con partitura",
        prompt: "Escuchá el patrón, mirá las partituras y elegí la que corresponde.",
        rhythmOptions: rhythmList,
        correctIndex,
        explanation: rhythm.label,
        xp: 20 + item.level * 4
      },
      {
        type: "takadimi",
        title: "Decilo antes de tocar",
        prompt: "Leé las sílabas en voz alta. Cuando se sienta natural, tocá el patrón con palmas.",
        pattern: rhythm.syllables,
        xp: 10 + item.level * 2
      }
    ]
  };
}

function addCallResponseExercise(lesson: Lesson, item: (typeof rawLessons)[number]): Lesson {
  if (item.stage !== "Memoria") return lesson;
  const rhythm = rhythmOptions[item.rhythmIndex % rhythmOptions.length];
  const callResponseExercise = {
    type: "call_response" as const,
    title: "Call & Response",
    prompt: "Escuchá el patrón, esperá el countdown y reproducilo de memoria. Sin partitura, sin trampas.",
    bpm: item.bpm,
    rhythm,
    xp: 25 + item.level * 5,
  };
  return {
    ...lesson,
    exercises: [lesson.exercises[0], callResponseExercise, ...lesson.exercises.slice(1)],
  };
}


const stages = ["Pulso", "Duraciones", "Lectura", "Dictado", "Subdivisión", "Musicalidad", "Memoria", "Desafío"];
const colors = ["bg-brand-500", "bg-teal-500", "bg-[#1cb0f6]", "bg-yellow-400", "bg-[#ce82ff]", "bg-[#ff4b4b]", "bg-purple-600", "bg-zinc-900"];
const stageMascots = ["Compasito", "Duro", "Taka", "Oído Activo", "Dimi", "Sincopín", "Memo", "Maestro Pulso"];

export const modules: Module[] = stages.map((stage, index) => {
  const lessons = rawLessons.filter((lesson) => lesson.stage === stage).map((item) => addCallResponseExercise(makeLesson(item), item));
  const highest = lessons.reduce((max, lesson) => Math.max(max, lesson.level), 1);
  return {
    slug: stage.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-"),
    title: stage === "Pulso" ? "Mundo 1: Pulso interno" : stage === "Duraciones" ? "Mundo 2: Duraciones" : stage === "Lectura" ? "Mundo 3: Lectura rítmica" : stage === "Dictado" ? "Mundo 4: Oído rítmico" : stage === "Subdivisión" ? "Mundo 5: Subdivisión" : stage === "Musicalidad" ? "Mundo 6: Groove y compás" : stage === "Memoria" ? "Mundo 7: Memoria rítmica" : "Mundo 8: Desafíos finales",
    description: stage === "Pulso" ? "La base: pulso, silencios y negras sin perder estabilidad." : stage === "Duraciones" ? "Blanca, redonda y duraciones largas antes de subdividir." : stage === "Lectura" ? "Lectura progresiva con figuras combinadas y acentos." : stage === "Dictado" ? "Escuchá ritmos y elegí la partitura correcta." : stage === "Subdivisión" ? "Tresillos, semicorcheas y coordinación vocal-corporal." : stage === "Musicalidad" ? "Síncopa, compás compuesto y patrones aplicados." : stage === "Memoria" ? "Escuchá, retenés y reproducís — el músico real." : "Exámenes integrales con lectura, oído y metrónomo humano.",
    mascot: stageMascots[index],
    color: colors[index],
    xp: lessons.reduce((sum, lesson) => sum + lesson.xp, 0),
    access: "free",
    stage,
    level: highest,
    difficulty: lessons[0]?.difficulty ?? "Inicial",
    lessons
  };
});

export const allLessons = modules.flatMap((module) => module.lessons.map((lesson) => ({ module, lesson })));
export const rhythmBank = rhythmOptions;

export const mascots = [
  { name: "Compasito", emoji: "🥁", role: "Guía de pulso", text: "te recuerda que primero va la estabilidad" },
  { name: "Taka", emoji: "🎵", role: "Entrenadora de lectura", text: "convierte figuras en juego" },
  { name: "Dimi", emoji: "🎶", role: "Coach de subdivisión", text: "ordena corcheas, tresillos y semicorcheas" },
  { name: "Sincopín", emoji: "⚡", role: "Personaje de groove", text: "enseña desplazamientos sin perder el pulso" }
];
