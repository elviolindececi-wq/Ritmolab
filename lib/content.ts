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
    syllables: ["TA", "TA", "TA", "TA"]
  },
  {
    label: "Negra y corcheas",
    abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=84\nK:C\n| C2 D E F2 G2 |",
    syllables: ["TA", "TA-KA", "TA", "TA"]
  },
  {
    label: "Silencio de negra",
    abc: "X:1\nM:4/4\nL:1/4\nQ:1/4=72\nK:C\n| C z C C |",
    syllables: ["TA", "silencio", "TA", "TA"]
  },
  {
    label: "Tresillo inicial",
    abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=76\nK:C\n| (3CDE F2 G2 A2 |",
    syllables: ["TA-KI-TA", "TA", "TA", "TA"]
  },
  {
    label: "Semicorcheas",
    abc: "X:1\nM:4/4\nL:1/16\nQ:1/4=68\nK:C\n| CDEF G4 A4 B4 |",
    syllables: ["TA-KA-DI-MI", "TA", "TA", "TA"]
  },
  {
    label: "Síncopa básica",
    abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=86\nK:C\n| C2 D2- D E F2 G2 |",
    syllables: ["TA", "TA-a", "KA", "TA"]
  },
  {
    label: "Solo corcheas",
    abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:C\n| C D E F G A B c |",
    syllables: ["TA-KA", "TA-KA", "TA-KA", "TA-KA"]
  },
  {
    label: "Silencio al final",
    abc: "X:1\nM:4/4\nL:1/4\nQ:1/4=76\nK:C\n| C C C z |",
    syllables: ["TA", "TA", "TA", "silencio"]
  },
  {
    label: "Dos tresillos",
    abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=74\nK:C\n| (3CDE (3FGA B2 c2 |",
    syllables: ["TA-KI-TA", "TA-KI-TA", "TA", "TA"]
  },
  {
    label: "Corchea + silencio",
    abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=78\nK:C\n| C z D z E z F z |",
    syllables: ["TA", "—", "TA", "—", "TA", "—", "TA", "—"]
  },
  {
    label: "Síncopa en 2",
    abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=82\nK:C\n| C2 z2 D2- D E |",
    syllables: ["TA", "silencio", "TA-a", "KA"]
  },
  {
    label: "Negra puntillo + corchea",
    abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=72\nK:C\n| C3 D E3 F |",
    syllables: ["TA.", "KA", "TA.", "KA"]
  },
  {
    label: "Semicorcheas + negra",
    abc: "X:1\nM:4/4\nL:1/16\nQ:1/4=66\nK:C\n| CDEF G4 A4 B4 |",
    syllables: ["TA-KA-DI-MI", "TA", "TA", "TA"]
  },
  {
    label: "Contratiempo simple",
    abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:C\n| z C z D z E z F |",
    syllables: ["—", "KA", "—", "KA", "—", "KA", "—", "KA"]
  }
];

const lessonTheories: Record<string, string[]> = {
  "pulso-y-negra": [
    "La negra dura exactamente un pulso. En 4/4, cuatro negras llenan un compás completo. Este es el punto de partida de toda lectura rítmica: poder sentir un tiempo regular y convertirlo en sonido.",
    "El pulso no es una nota: es una referencia interna. Puede sonar o no sonar, pero siempre está. Cuando caminás de forma pareja, cada paso puede funcionar como una negra.",
    "El objetivo no es tocar rápido. El objetivo es que todos los intervalos sean iguales. Una negra estable a 70 BPM vale más que una negra insegura a 120 BPM."
  ],
  "silencios-basicos": [
    "Un silencio no es un vacío: es una duración activa. Si hay un silencio de negra, el pulso sigue avanzando exactamente igual que si hubiese una negra sonando.",
    "La diferencia entre tocar y callar debe estar controlada por el mismo pulso. El error típico es saltar el silencio como si no contara.",
    "Para practicar, decí TA en los sonidos y pensá internamente 'uno' durante el silencio. El cuerpo debe sentir que el silencio ocupa espacio."
  ],
  "corcheas": [
    "Dos corcheas equivalen a una negra. Dividen el pulso en dos partes iguales: TA-KA. TA cae en el pulso; KA cae entre pulsos.",
    "La subdivisión binaria es la base de la música en 2/4, 3/4 y 4/4. Cuando dominás corcheas, podés entender contratiempos, síncopas y acompañamientos populares.",
    "No aceleres al ver corcheas. Hay más sonidos, pero el espacio temporal es el mismo. El pulso no cambia: solo se subdivide."
  ],
  "blanca-intro": [
    "La blanca dura dos pulsos. Es un solo ataque que continúa durante el segundo pulso. Si tocás dos golpes separados, ya no es blanca: son dos negras.",
    "Pensala como TA-aa: el TA inicia el sonido y el aa sostiene el segundo pulso. El cuerpo debe sentir continuidad, no repetición.",
    "La blanca entrena una habilidad clave: sostener el pulso interno cuando no hay ataques nuevos."
  ],
  "redonda-intro": [
    "La redonda dura cuatro pulsos y suele ocupar un compás entero de 4/4. Es un solo sonido que atraviesa todo el compás.",
    "Aunque el sonido sea largo, el conteo interno no se detiene. Tenés que seguir sintiendo 1, 2, 3 y 4 por dentro.",
    "Esta figura entrena paciencia rítmica: tocar menos, pero sostener mejor el tiempo."
  ],
  "duraciones-mixtas": [
    "Cuando mezclás negras, blancas y redondas, cada pulso puede funcionar de dos maneras: como inicio de un sonido o como continuación de uno anterior.",
    "La lectura mejora cuando primero ubicás los pulsos del compás y después decidís dónde hay ataques. No mires figura por figura: mirá el mapa completo.",
    "Error frecuente: tocar todo con la misma duración. La escritura rítmica existe justamente para diferenciar duraciones."
  ],
  "negras-corcheas": [
    "Mezclar negras y corcheas obliga a mantener el mismo pulso mientras cambia la densidad de sonidos. La negra ocupa un pulso; las dos corcheas también ocupan un pulso.",
    "Antes de tocar, cantá el patrón completo. Si podés decirlo con estabilidad, después será más fácil ejecutarlo con manos o instrumento.",
    "El pulso manda. Las figuras entran dentro del pulso, pero no lo modifican."
  ],
  "compas-cuatro-cuatro": [
    "El 4/4 agrupa cuatro pulsos. Su jerarquía más común es: fuerte, débil, medio fuerte, débil. Esta organización ayuda a que la música tenga dirección.",
    "El tiempo 1 suele sentirse como llegada o inicio. El tiempo 3 da equilibrio. Los tiempos 2 y 4 pueden funcionar como respuesta o impulso.",
    "En muchos estilos populares se acentúan 2 y 4 para crear backbeat. Eso funciona porque el pulso fuerte de fondo sigue existiendo."
  ],
  "dictado-simple": [
    "El dictado rítmico convierte lo que escuchás en una representación visual o mental. Es el camino inverso de la lectura.",
    "Primero encontrá el pulso. Después detectá si hay subdivisiones. Por último, ubicá los ataques dentro de esa grilla.",
    "No intentes adivinar desde la primera nota. Escuchá el patrón completo y reconocé su forma general."
  ],
  "tresillos-intro": [
    "El tresillo divide un pulso en tres partes iguales: TA-KI-TA. No es tocar tres notas rápidas sin control: es dividir exactamente el mismo espacio en tres.",
    "La sensación ternaria aparece en swing, blues, 6/8, shuffle y muchas músicas folklóricas. Da una sensación de balanceo diferente a la subdivisión binaria.",
    "La dificultad está en que las tres partes sean iguales. Si una queda más larga o más corta, el tresillo pierde su forma."
  ],
  "semicorcheas-intro": [
    "La semicorchea divide el pulso en cuatro partes iguales: TA-KA-DI-MI. Es una grilla más fina que la corchea.",
    "Para tocar semicorcheas limpias, primero hay que poder decirlas lento. Si la voz se desordena, la mano también se va a desordenar.",
    "El error más común es acelerar para que entren. No tienen que entrar por fuerza: tienen que distribuirse de forma pareja."
  ],
  "sincopa-intro": [
    "La síncopa desplaza el acento hacia una parte débil o prolonga un sonido débil sobre una parte fuerte. Genera tensión porque contradice la expectativa métrica.",
    "El pulso interno debe seguir fijo. La síncopa flota sobre ese pulso, pero no lo reemplaza.",
    "Si movés el pie para seguir la síncopa, perdés el ancla. El groove aparece cuando el cuerpo sostiene el pulso y la mano desplaza el acento."
  ],
  "compas-seis-ocho": [
    "El 6/8 no se siente como seis pulsos iguales, sino como dos pulsos grandes divididos en tres: UNO-la-li DOS-la-li.",
    "Es un compás compuesto porque cada pulso principal tiene subdivisión ternaria. Su sensación es de balanceo o movimiento circular.",
    "La trampa es leerlo como 3/4 o como seis corcheas iguales. Primero sentí los dos pulsos grandes."
  ],
  "lectura-con-metronomo": [
    "Leer con metrónomo exige decodificar símbolos, sostener un pulso externo y ejecutar con precisión al mismo tiempo.",
    "La estabilidad bajo presión revela tu nivel real. Es fácil tocar negras con metrónomo; el desafío es no perderlo con síncopas, silencios o subdivisiones.",
    "Antes de tocar, escaneá el compás y localizá la figura más difícil. Después tocá todo el patrón."
  ],
  "memoria-ritmica-intro": [
    "La memoria rítmica es la capacidad de escuchar un patrón, retenerlo internamente y reproducirlo sin ver la partitura.",
    "Es una habilidad central en músicas de tradición oral, improvisación, jazz, música popular y entrenamiento auditivo.",
    "El cerebro debe escuchar, guardar y ejecutar. Por eso conviene entrenarla con patrones cortos y claros."
  ],
  "call-response-basico": [
    "Call & response significa pregunta y respuesta. La app toca un patrón y vos lo repetís de memoria.",
    "Al principio los patrones deben ser simples: negras, silencios y pocos eventos. El foco está en recordar el orden y sostener el pulso.",
    "No memorices nota por nota. Escuchá la forma: dónde empieza, dónde respira, dónde termina."
  ],
  "call-response-corcheas": [
    "Cuando aparecen corcheas, aumenta la densidad de eventos dentro del mismo compás. La memoria tiene que guardar más información en el mismo tiempo.",
    "Una buena estrategia es repetir internamente TA-KA mientras escuchás. La voz interna ayuda a fijar el patrón.",
    "Si fallás, no subas la velocidad. Reducí el patrón, cantalo y después volvé a tocarlo."
  ],
  "examen-final-ritmico": [
    "Un examen rítmico integral combina lectura, dictado, memoria y pulso. No mide solo si sabés conceptos: mide si podés aplicarlos.",
    "El objetivo no es responder rápido, sino mantener precisión bajo presión. La musicalidad nace de esa base estable.",
    "Después de esta etapa, el próximo paso es fraseo, dinámica, rubato y aplicación musical real."
  ]
};

function lessonTheory(item: { slug: string; skills: string[]; objective: string }): string[] {
  return lessonTheories[item.slug] ?? [
    `Este módulo trabaja ${item.skills.join(", ")} con una progresión corta y repetible. Primero entendés el concepto, después lo escuchás, lo ves en partitura y finalmente lo ejecutás.`,
    "Usá sílabas rítmicas: TA para negras, TA-KA para corcheas, TA-KI-TA para tresillos y TA-KA-DI-MI para semicorcheas. Las sílabas ayudan a que el cuerpo entienda la duración antes que la cabeza la memorice.",
    "La regla de oro de RitmoLab es no subir la velocidad hasta que el pulso sea estable. La precisión vale más que la rapidez."
  ];
}

const lessonDistractors: Record<string, string[]> = {
  "pulso-y-negra": ["Tocar más notas para llenar el espacio", "Acelerar gradualmente para mejorar la fluidez", "Ignorar el metrónomo y tocar a gusto"],
  "silencios-basicos": ["Tocar una nota suave en lugar del silencio", "Acelerar para saltar el silencio rápido", "El silencio no tiene duración, es solo una pausa"],
  "corcheas": ["Subdivido en tres partes iguales como un tresillo", "La segunda corchea cae en el mismo lugar que la primera", "Las corcheas solo se usan en música rápida"],
  "blanca-intro": ["La blanca dura 1 pulso igual que la negra", "La blanca se toca dos veces en el mismo compás", "La blanca solo aparece al final del compás"],
  "redonda-intro": ["La redonda dura 2 pulsos como la blanca", "La redonda se cuenta igual que 4 negras separadas", "La redonda no necesita pulso interno porque es muy larga"],
  "duraciones-mixtas": ["Todas las figuras tienen la misma duración", "La blanca y la negra suenan igual, solo se escriben diferente", "En un compás mixto hay que tocar todo a la misma velocidad"],
  "negras-corcheas": ["Acelerar cuando aparecen las corcheas", "Todas las figuras deben tocarse con igual velocidad", "Primero ignoro el pulso y después lo acomodo"],
  "compas-cuatro-cuatro": ["Los cuatro tiempos tienen el mismo peso dinámico", "El acento siempre cae en el tiempo 2 y 4", "En 4/4 hay cuatro corcheas por compás"],
  "dictado-simple": ["Intentar transcribir todo en la primera escucha", "Contar las notas antes de identificar el pulso", "El dictado y la lectura son exactamente lo mismo"],
  "tresillos-intro": ["El tresillo son dos corcheas tocadas rápido", "Tresillo y 6/8 son exactamente lo mismo", "Los tres golpes del tresillo son largo-corto-corto"],
  "semicorcheas-intro": ["Semicorcheas significa tocar corcheas más fuerte", "Cuatro semicorcheas no caben en un solo tiempo", "Hay que acelerar para ejecutar TA-KA-DI-MI"],
  "sincopa-intro": ["Mover el pulso interno para que coincida con el acento", "La síncopa es un error rítmico que se debe corregir", "La síncopa solo existe en música afroamericana"],
  "compas-seis-ocho": ["6/8 tiene seis pulsos iguales por compás", "6/8 es igual a 3/4 con más notas", "El balanceo del 6/8 viene de tocar fuerte y piano alternado"],
  "lectura-con-metronomo": ["Ignorar el clic cuando el patrón es complejo", "Leer más lento que el metrónomo para asegurar precisión", "El metrónomo es solo para principiantes"],
  "memoria-ritmica-intro": ["La memoria rítmica se entrena memorizando partituras, no escuchando", "Reproducir de memoria es solo para músicos avanzados", "En call & response se toca al mismo tiempo que el maestro"],
  "call-response-basico": ["Reproducir inmediatamente sin pausa siempre es mejor", "La memoria rítmica es independiente del pulso interno", "Memorizar nota por nota es la estrategia más efectiva"],
  "call-response-corcheas": ["Con más notas hay que tocar más rápido para caber", "La voz interna interfiere con la ejecución física", "Escuchar sin contar es suficiente"],
  "examen-final-ritmico": ["La velocidad máxima indica el nivel más alto", "El dictado es más fácil porque no hay partitura", "Con repetición se aprueba sin entender"]
};

function getDistractors(slug: string, correctAnswer: string): string[] {
  const custom = lessonDistractors[slug] ?? [];
  const fallback = ["Tocar más fuerte sin contar", "Memorizar canciones sin pulso", "Subir velocidad antes de entender"];
  return [...custom, ...fallback].filter((d) => d !== correctAnswer).slice(0, 3);
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
  { slug: "blanca-intro", title: "La blanca", stage: "Duraciones", difficulty: "Inicial", level: 1, description: "Un sonido que dura dos pulsos.", objective: "Sostener la blanca durante exactamente 2 pulsos.", skills: ["blanca", "duración", "sostenimiento"], visualPattern: ["TA-aa", "—", "TA-aa", "—"], bpm: 70, xp: 45, rhythmIndex: 0 },
  { slug: "redonda-intro", title: "La redonda", stage: "Duraciones", difficulty: "Inicial", level: 1, description: "Un sonido que ocupa todo el compás.", objective: "Contar 4 pulsos internos mientras un sonido resuena.", skills: ["redonda", "pulso interno", "sostenimiento"], visualPattern: ["TAaaaa", "2", "3", "4"], bpm: 66, xp: 50, rhythmIndex: 0 },
  { slug: "duraciones-mixtas", title: "Duraciones mixtas", stage: "Duraciones", difficulty: "Básico", level: 2, description: "Combiná negras, blancas y silencios.", objective: "Diferenciar ataque y continuación dentro del compás.", skills: ["duración", "lectura", "figuras"], visualPattern: ["TA", "TA-aa", "silencio", "TA"], bpm: 74, xp: 60, rhythmIndex: 7 },
  { slug: "negras-corcheas", title: "Negras + corcheas", stage: "Lectura", difficulty: "Básico", level: 2, description: "Alterná figuras sin acelerar.", objective: "Leer un compás mixto a primera vista.", skills: ["lectura", "mezcla", "control"], visualPattern: ["TA", "TA-KA", "TA", "TA"], bpm: 84, xp: 65, rhythmIndex: 1 },
  { slug: "compas-cuatro-cuatro", title: "Compás 4/4", stage: "Lectura", difficulty: "Básico", level: 2, description: "Agrupá pulsos y acentos de forma musical.", objective: "Sentir fuerte-débil-medio-débil.", skills: ["compás", "acento", "grupo"], visualPattern: ["FUERTE", "débil", "medio", "débil"], bpm: 80, xp: 70, rhythmIndex: 0 },
  { slug: "dictado-simple", title: "Dictado simple", stage: "Dictado", difficulty: "Básico", level: 2, description: "Escuchá y elegí la partitura correcta.", objective: "Reconocer negras y corcheas de oído.", skills: ["dictado", "oído", "partitura"], visualPattern: ["escuchá", "compará", "elegí"], bpm: 82, xp: 80, rhythmIndex: 1 },
  { slug: "tresillos-intro", title: "Tresillos intro", stage: "Subdivisión", difficulty: "Básico", level: 2, description: "Sentí tres sonidos en un pulso.", objective: "Diferenciar tresillo de dos corcheas.", skills: ["tresillo", "ternario", "subdivisión"], visualPattern: ["TA-KI-TA", "TA", "TA", "TA"], bpm: 74, xp: 85, rhythmIndex: 3 },
  { slug: "semicorcheas-intro", title: "Semicorcheas intro", stage: "Subdivisión", difficulty: "Intermedio", level: 3, description: "Subdividí el pulso en cuatro.", objective: "Decir TA-KA-DI-MI de forma pareja.", skills: ["semicorcheas", "takadimi", "velocidad"], visualPattern: ["TA", "KA", "DI", "MI"], bpm: 68, xp: 90, rhythmIndex: 4 },
  { slug: "sincopa-intro", title: "Síncopa intro", stage: "Musicalidad", difficulty: "Intermedio", level: 4, description: "Sentí acentos fuera del pulso.", objective: "Mantener el pulso cuando el acento se desplaza.", skills: ["síncopa", "acento", "groove"], visualPattern: ["1", "y", "2", "Y", "3", "y", "4", "Y"], bpm: 86, xp: 100, rhythmIndex: 5 },
  { slug: "compas-seis-ocho", title: "Compás 6/8", stage: "Musicalidad", difficulty: "Avanzado", level: 5, description: "Entrá al pulso compuesto.", objective: "Sentir dos pulsos grandes con tres subdivisiones.", skills: ["6/8", "ternario", "balanceo"], visualPattern: ["1", "la", "li", "2", "la", "li"], bpm: 70, xp: 115, rhythmIndex: 3 },
  { slug: "lectura-con-metronomo", title: "Lectura con metrónomo", stage: "Desafío", difficulty: "Desafío", level: 6, description: "Mantené estabilidad bajo presión.", objective: "Medir consistencia de pulso en una sesión completa.", skills: ["precisión", "lectura", "pulso"], visualPattern: ["TA", "TA-KA", "TA-KI-TA", "TA"], bpm: 92, xp: 130, rhythmIndex: 5 },
  { slug: "memoria-ritmica-intro", title: "Memoria rítmica", stage: "Memoria", difficulty: "Intermedio", level: 4, description: "Escuchá un patrón y retenelo antes de tocar.", objective: "Recordar un patrón corto sin mirar la partitura.", skills: ["memoria", "escucha", "reproducción"], visualPattern: ["escuchar", "retener", "repetir"], bpm: 78, xp: 105, rhythmIndex: 8 },
  { slug: "call-response-basico", title: "Call & response básico", stage: "Memoria", difficulty: "Intermedio", level: 4, description: "La app toca una pregunta y vos respondés.", objective: "Reproducir patrones de 1 compás con negras y silencios.", skills: ["call response", "memoria", "pulso"], visualPattern: ["pregunta", "pausa", "respuesta"], bpm: 76, xp: 110, rhythmIndex: 9 },
  { slug: "call-response-corcheas", title: "Call & response con corcheas", stage: "Memoria", difficulty: "Avanzado", level: 5, description: "Memorizá patrones con mayor densidad rítmica.", objective: "Reproducir corcheas de memoria sin acelerar.", skills: ["corcheas", "memoria", "densidad"], visualPattern: ["TA-KA", "TA", "TA-KA", "silencio"], bpm: 82, xp: 120, rhythmIndex: 6 },
  { slug: "examen-final-ritmico", title: "Examen final rítmico", stage: "Desafío", difficulty: "Desafío", level: 7, description: "Evaluación integral de lectura, dictado y pulso.", objective: "Aprobar lectura y dictado con 85%.", skills: ["examen", "memoria", "musicalidad"], visualPattern: ["leer", "escuchar", "tocar", "compartir"], bpm: 96, xp: 150, rhythmIndex: 5 }
];

function makeLesson(item: (typeof rawLessons)[number]): Lesson {
  const rhythm = rhythmOptions[item.rhythmIndex % rhythmOptions.length];
  const wrongA = rhythmOptions[(item.rhythmIndex + 1) % rhythmOptions.length];
  const wrongB = rhythmOptions[(item.rhythmIndex + 2) % rhythmOptions.length];
  const rhythmList = [rhythm, wrongA, wrongB];
  const correctIndex = 0;

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
        options: [item.objective, ...getDistractors(item.slug, item.objective)],
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

const stages = ["Pulso", "Duraciones", "Lectura", "Dictado", "Subdivisión", "Memoria", "Musicalidad", "Desafío"];
const colors = ["bg-brand-500", "bg-lime-500", "bg-sky", "bg-yellow-400", "bg-grape", "bg-purple-500", "bg-coral", "bg-zinc-900"];
const stageMascots = ["Compasito", "Blanquita", "Taka", "Oído Activo", "Dimi", "Eco", "Sincopín", "Maestro Pulso"];

function moduleTitle(stage: string) {
  if (stage === "Pulso") return "Mundo 1: Pulso interno";
  if (stage === "Duraciones") return "Mundo 2: Duraciones";
  if (stage === "Lectura") return "Mundo 3: Lectura rítmica";
  if (stage === "Dictado") return "Mundo 4: Oído rítmico";
  if (stage === "Subdivisión") return "Mundo 5: Subdivisión";
  if (stage === "Memoria") return "Mundo 6: Memoria rítmica";
  if (stage === "Musicalidad") return "Mundo 7: Groove y compás";
  return "Mundo 8: Desafíos finales";
}

function moduleDescription(stage: string) {
  if (stage === "Pulso") return "La base: pulso, silencios y corcheas sin perder estabilidad.";
  if (stage === "Duraciones") return "Blancas, redondas y combinaciones de duración.";
  if (stage === "Lectura") return "Lectura progresiva con figuras combinadas y acentos.";
  if (stage === "Dictado") return "Escuchá ritmos y elegí la partitura correcta.";
  if (stage === "Subdivisión") return "Tresillos, semicorcheas y coordinación vocal-corporal.";
  if (stage === "Memoria") return "Call & response, retención auditiva y reproducción rítmica.";
  if (stage === "Musicalidad") return "Síncopa, compás compuesto y patrones aplicados.";
  return "Exámenes integrales con lectura, oído y metrónomo humano.";
}

export const modules: Module[] = stages.map((stage, index) => {
  const lessons = rawLessons.filter((lesson) => lesson.stage === stage).map(makeLesson);
  const highest = lessons.reduce((max, lesson) => Math.max(max, lesson.level), 1);
  return {
    slug: stage.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-"),
    title: moduleTitle(stage),
    description: moduleDescription(stage),
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
  { name: "Sincopín", emoji: "⚡", role: "Personaje de groove", text: "enseña desplazamientos sin perder el pulso" },
  { name: "Eco", emoji: "🗣️", role: "Coach de memoria", text: "te ayuda a escuchar, retener y responder" }
];
