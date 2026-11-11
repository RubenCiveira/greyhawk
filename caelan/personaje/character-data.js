// =====================================================================
//  DATOS DEL PERSONAJE · D&D 3.5
//  Todo lo que es propio del personaje está en esta carpeta:
//    heroe.png         retrato de la ficha (se recorta en círculo)
//    heroe-full.png    figura de cuerpo entero para la presentación/historia
//    character-data.js este archivo
//    presentacion.js   resumen de una hoja (Markdown)
//    historia.js       historia completa (Markdown)
//  Para imprimir otro personaje basta con sustituir los archivos de esta carpeta.
// =====================================================================
window.CHARACTER = {

  // ---------- Identidad ----------
  name: 'Caelan',
  subtitle: 'El último juramento',
  race: 'Humano illuskano',
  className: 'Explorador',
  level: 1,
  alignment: 'Neutral Bueno',
  background: 'Soldado / reconocimiento',
  player: '',
  xp: 0,

  // ---------- Imágenes y encuadre ----------
  images: {
    portrait: 'heroe.png',
    portraitAlt: 'Caelan, explorador humano con su perro',
    portraitTop: 150,        // px: posición vertical de la ventana circular del retrato
    portraitSize: '90%',     // ancho de la imagen dentro del círculo
    portraitOffset: 4,       // px: desplaza la imagen hacia abajo dentro del círculo

    figure: 'heroe-full.png',
    figureAlt: 'Caelan con su perro',
    figureWidth: 440,        // px
    figureHeight: 660,       // px: alto de la zona donde el texto rodea la figura
    // Contorno de la silueta (borde derecho) para que el texto la rodee; % del tamaño de la figura
    figureShape: 'polygon(0 0,60% 0,63% 9%,74% 14%,79% 22%,87% 33%,89% 50%,91% 64%,92% 78%,95% 90%,94% 100%,0 100%)'
  },

  // ---------- Clase (reglas 3.5) ----------
  hitDie: 8,                     // d8
  bab: 'full',                   // progresión de ataque base: 'full' | 'medium' | 'poor'
  goodSaves: ['fort', 'ref'],    // salvaciones buenas: 'fort', 'ref', 'will'

  // ---------- Características ----------
  abilities: { str: 15, dex: 15, con: 14, int: 12, wis: 12, cha: 9 },

  hp: 10,                        // null = dado de golpe máximo + CON (nivel 1)
  speed: 30,                     // pies

  armor:  { name: 'Cuero tachonado', bonus: 3, maxDex: 5, checkPenalty: -1 },
  shield: { name: 'Escudo ligero',   bonus: 1, checkPenalty: -1 },

  // ---------- Recuadros de la ficha ----------
  spotlightSkill: 'Avistar',     // habilidad que se muestra en el círculo del ojo
  extraField: { label: 'Enemigo predilecto', value: 'Pendiente de elegir' },

  // ---------- Dotes, rasgos y progresión ----------
  feats: [
    'Desenvainado rápido',
    'Disparo a bocajarro',
    'Rastreo (explorador)'
  ],
  features: [
    'Enemigo predilecto (elegir tipo de criatura)',
    'Empatía salvaje',
    'Competencia con armas sencillas y marciales, armaduras ligeras y escudos (excepto pavés)'
  ],
  progression: 'Nivel 2: Disparo rápido (estilo arquería). Nivel 3: Disparo preciso (dote general) y Aguante (explorador).',

  // ---------- Armas ----------
  //  rangeIncrement: incremento de alcance en pies (solo armas a distancia).
  //  maxIncrements: 5 arrojadizas, 10 proyectiles. Sin rangeIncrement el arma es cuerpo a cuerpo.
  //  bonuses: { source, attack, damage, minRange, maxRange } (pies; opcionales).
  //    Se aplican solo a los alcances dentro de [minRange, maxRange]. Sin rangos, siempre.
  weapons: [
    {
      name: 'Daga arrojadiza', critical: '19–20/×2',
      ability: 'dex', damage: '1d4', damageAbility: 'str',
      rangeIncrement: 10, maxIncrements: 5,
      bonuses: [{ source: 'Disparo a bocajarro', attack: 1, damage: 1, maxRange: 30 }]
    },
    {
      name: 'Espada larga', critical: '19–20/×2',
      ability: 'str', damage: '1d8', damageAbility: 'str',
      bonuses: []
    }
  ],
  weaponsNote: 'Armas a distancia: −2 al ataque por cada incremento de alcance tras el primero (arrojadizas, máximo 5 incrementos).',

  equipment: [
    'Espada larga',
    '6 dagas arrojadizas',
    'Escudo ligero',
    'Cuero tachonado',
    'Capa de viaje',
    'Mochila y equipo de explorador'
  ],

  // ---------- Habilidades ----------
  //  armorCheck: true aplica el penalizador por armadura (armadura + escudo).
  //  Rangos propuestos: 32 puntos de habilidad, todas de clase.
  skills: [
    { name: 'Avistar',                   ability: 'wis', ranks: 4 },
    { name: 'Escuchar',                  ability: 'wis', ranks: 4 },
    { name: 'Supervivencia',             ability: 'wis', ranks: 4 },
    { name: 'Esconderse',                ability: 'dex', ranks: 4, armorCheck: true },
    { name: 'Moverse sigilosamente',     ability: 'dex', ranks: 4, armorCheck: true },
    { name: 'Buscar',                    ability: 'int', ranks: 4 },
    { name: 'Trato con animales',        ability: 'cha', ranks: 2 },
    { name: 'Conocimiento (naturaleza)', ability: 'int', ranks: 4 },
    { name: 'Sanar',                     ability: 'wis', ranks: 2 }
  ],

  // ---------- Textos ----------
  campaignNotes: [
    'Perro de compañía (sin estadísticas de compañero animal hasta nivel 4).',
    'Enemigo predilecto pendiente de elegir.'
  ],
  story: 'Antiguo soldado de reconocimiento de la Compañía del Norte. Una expedición secreta fue traicionada y sus integrantes abandonados. Caelan sobrevivió, pero fue declarado muerto. Cuando regresó, compañeros de otros destacamentos le advirtieron que los nobles implicados conspiraban contra él. Desapareció antes de que su supervivencia se hiciera pública. Desde entonces viaja con su perro y ha jurado no abandonar a quienes dependan de él.'
};
