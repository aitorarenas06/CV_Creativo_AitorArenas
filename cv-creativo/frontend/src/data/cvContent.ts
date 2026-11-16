import type { RoomObject } from "@/lib/room";
import fotoCartera from "@/assets/foto-cartera.jpg";

// Contenido del CV: lo que se muestra al pasar el cursor por cada objeto y lo que sale en el PDF.
// Los saltos de línea (\n) se respetan; las líneas que empiezan por "-" son viñetas en el PDF.
export const CV_OBJECTS: RoomObject[] = [
  {
    key: "cartera",
    name: "Cartera",
    category: "Datos Personales",
    image: fotoCartera,
    entries: [
      { title: "Aitor Arenas González", description: "DNI: 05738395X\n03/07/2006\nNacionalidad: Española\nGénero: M\nTeléfono: (+34) 633657815\naitorarenasgonzalez06@gmail.com\nAvda. Ferrocarril, 5, 1B, 13004, Ciudad Real, España" },
    ],
  },
  {
    key: "claqueta",
    name: "Claqueta de cine",
    category: "Macroproducciones",
    image: null,
    entries: [
      { title: "Curso de Audiovisuales", description: "Artes y Humanidades\n08/09/2022 - 22/06/2023\nCiudad Real, España" },
    ],
  },
  {
    key: "flauta",
    name: "Flauta travesera",
    category: "Conservatorio Marcos Redondo",
    image: null,
    entries: [
      { title: "Formación en Lenguaje Musical e Instrumento", description: "Artes y Humanidades\n08/09/2015-22/06/2018\nCiudad Real, España" },
    ],
  },
  {
    key: "balon",
    name: "Balón",
    category: "Centro Juvenil Pozo don Gil",
    image: null,
    entries: [
      { title: "Monitor/ Animador de tiempo libre", description: "-Planificación y dinamización de actividades socioeducativas y de ocio para niños y jóvenes\n-Gestión de grupos y coordinación de dinámicas en campamentos y actividades juveniles\n08/10/2024 - Actual\nCiudad Real, España" },
    ],
  },
  {
    key: "maletin",
    name: "Maletín",
    category: "Experiencia laboral",
    image: null,
    entries: [
      { title: "Desarrollador de Software", description: "Indra\n01/03/2027-10/06/2027\nCiudad Real, España" },
      { title: "Desarrollador Web", description: " 01/03/2028-10/06/2027 \nCiudad Real, España" },
    ],
  },
  {
    key: "diccionario",
    name: "Diccionario de inglés",
    category: "IOS Prado de Alarcos",
    image: null,
    entries: [
      { title: "Competencias de Idiomas", description: "Lengua Materna: Español\nOtros Idiomas:\n   -Inglés: B2" },
    ],
  },
  {
    key: "coche",
    name: "Coche de juguete",
    category: "Autoescuela Cátedra",
    image: null,
    entries: [
      { title: "Permiso de Conducción", description: "Permiso de conducción: B" },
    ],
  },
  {
    key: "ordenador",
    name: "Ordenador",
    category: "Personal",
    image: null,
    entries: [
      { title: "Aficiones", description: "-Fan del cine y las series\n-Melómano. Escucho de todo un poco\n-He probado diversos deportes. Actualmente frecuento el gimnasio" },
    ],
  },
  {
    key: "apuntes",
    name: "Apuntes",
    category: "Educación y Formación",
    image: null,
    entries: [
      { title: "Título de Bachiller-Ciencias y Tecnología", description: "Salesianos Hermano Gárate\nTecnologías de la información y la comunicación\nNivel 4 EQF-MEC\n08/09/2022-22/06/2024\nCiudad Real, España" },
      { title: "Técnico Superior en DAM", description: "IES Maestre de Calatrava\nDesarrollo y análisis de software y aplicaciones\nNivel 5 EQF-MEC\nCiudad Real, España" },
      { title: "Técnico Superior en DAW", description: "IES Maestre de Calatrava\nDiseño y administración de redes y bases de datos\nNivel 5 EQF-MEC\n08/09/2027-12/03/2028\nCiudad Real, España" },
    ],
  },
  {
    key: "silla",
    name: "Silla",
    category: "Sobre mí",
    image: null,
    entries: [
      { title: "Capacidades", description: "Trabajo en equipo\nRespeto y amabilidad\nPuntualidad y asistencia\nEmpatía y asertividad\nFlexibilidad y adaptabilidad\nCreatividad e imaginación\nPaciencia y cercanía" },
    ],
  },
];
