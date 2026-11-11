FICHAS D&D 3.5 · HOJAS ILUSTRADAS (funciona sin internet)

ESTRUCTURA
index.html          índice de personajes (lee personajes.js)
personajes.js       lista de carpetas de personajes que aparecen en el índice
app.js, styles.css, theme.css, indice.js   código y estilos comunes
caelan/             un personaje:
  index.html                ficha + presentación/historia (selector «Preludio»)
  ficha/index.html          solo la ficha
  presentacion/index.html   solo la presentación (resumen de 1 hoja)
  historia/index.html       solo la historia completa
  personaje/                todo lo propio del personaje:
    heroe.png          retrato de la ficha (se recorta en círculo; fondo blanco recomendado)
    heroe-full.png     figura de cuerpo entero para presentación e historia
    character-data.js  datos, reglas de clase, armas, habilidades, textos de la ficha
                       y encuadre de las imágenes (images)
    presentacion.js    textos en Markdown sencillo (# título, ## capítulo, ### sección,
    historia.js        **negrita**, *cursiva*, ---). Se paginan solos.
    notas.txt          notas libres (no se muestran)

AÑADIR UN PERSONAJE
1. Copia la carpeta caelan/ con otro nombre (por ejemplo, miriel/).
2. Sustituye los archivos de miriel/personaje/ (mismos nombres).
   Los HTML de la carpeta son genéricos y no hay que tocarlos.
3. Añade 'miriel' a la lista de personajes.js.
Si la figura nueva es distinta, ajusta images.figureShape en character-data.js
(contorno de la silueta para que el texto la rodee) y el encuadre del retrato.

USO
1. Abre index.html y elige personaje y página.
2. Edita los archivos de personaje/ y recarga. También puedes modificar textos
   haciendo clic en ellos (esos cambios no se guardan).
3. Pulsa «Imprimir / Guardar PDF»: A4, escala 100 %, márgenes ninguno,
   gráficos de fondo activados.
