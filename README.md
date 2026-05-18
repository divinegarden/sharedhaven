# ★ Shared Haven ★ ✉

> ✦ Un rincón acogedor y estético para compartir pensamientos, juegos, eventos y archivos con tus mejores amigos. ♡ ✦

![Shared Haven](https://img.shields.io/badge/Shared-Haven-ffB7C5?style=for-the-badge&logo=heart&logoColor=white) ![Status](https://img.shields.io/badge/Status-Online-88C0D0?style=for-the-badge)

Shared Haven es una aplicación web diseñada para ser un espacio social privado o semi-privado. ¡Cuenta con una interfaz súper personalizable con muchos temas, cambio de idioma y un sistema conectado a base de datos para posts, eventos y archivos! 🌸✨

---

## ✦ Características Especiales ✦

- 🎨 **Temas Dinámicos**: Elige entre más de 20 temas hermosos (¡incluyendo Rosa Pastel, Modo Oscuro, Rave, y más!). 🎀
- 🌐 **Multilingüe**: Soporte completo para **Español** e **Inglés**, cambiable al instante. ✉
- 🎮 **Descubrimiento de Medios**: Explora una lista de juegos con filtros y ordenamiento, todo seguro a través de nuestro proxy. ☆
- 📅 **Agenda Comunitaria**: Mantén un registro de los próximos eventos y planes del grupo. ✦
- 💾 **Compartir Archivos**: Sube y comparte archivos (hasta 50MB) con una interfaz de arrastrar y soltar súper linda. ♡
- 🔔 **Notificaciones Premium**: Sistema de avisos globales en pantalla para una experiencia fluida. ★
- 👤 **Perfiles y Panel Admin**: Gestiona tu perfil y crea nuevos usuarios si eres administrador. ✉

---

## 🛠️ Tecnologías Usadas

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

---

## 🚀 Cómo Empezar

### Prerrequisitos ✦

- Node.js (v18+ recomendado)
- Base de datos PostgreSQL

### Instalación ☆

1. Clona el repositorio:
   ```bash
   git clone https://github.com/divinegarden/sharedhaven.git
   cd sharedhaven
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura tus variables de entorno. Crea un archivo `.env` en la carpeta raíz:
   ```env
   DATABASE_URL="postgresql://usuario:contraseña@localhost:5401/sharedhaven?schema=public"
   ```
   *(¡Ajusta el puerto y las credenciales según tu base de datos!)*

4. Empuja la base de datos (si es necesario):
   ```bash
   npx prisma db push
   ```

5. ¡Inicia el servidor de desarrollo! ♡:
   ```bash
   npm run dev
   ```

---

## 📜 Licencia ✉

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

## 💖 Créditos ☆

Creado con mucho amor para ser un refugio compartido. ✦
