# TaskListU

Aplicación de gestión de tareas y recordatorios.
Stack: React (Vite) + Node.js/Express + MySQL (Sequelize).

## 0. Requisitos previos (instalar una sola vez en tu PC)

1. **Node.js** (LTS) → https://nodejs.org
2. **MySQL Server** → https://dev.mysql.com/downloads/mysql
   (opcional: MySQL Workbench para ver las tablas visualmente)

Verifica que quedaron instalados:
```bash
node -v
npm -v
mysql --version
```

## 1. Crear la base de datos

Abre MySQL Workbench (o la terminal `mysql -u root -p`) y ejecuta el script:
```
database/taskListU.sql
```
Esto crea la base `tasklistu_db` con las tablas usuarios (incluye rol y estado activo/inactivo), tareas y recordatorios.

## 2. Backend (Express + Sequelize)

```bash
cd server
npm install
```

Copia `.env.example` a `.env` y pon tus datos reales de MySQL:
```bash
cp .env.example .env
```

Levanta el servidor:
```bash
npm run dev
```
Debe quedar corriendo en `http://localhost:4000`.

## 3. Frontend (React + Vite)

En **otra terminal** (deja la del backend corriendo):
```bash
cd client
npm install
npm run dev
```
Se abrirá en `http://localhost:5173`.

## 4. Flujo de trabajo diario

- Terminal 1: `cd server && npm run dev`
- Terminal 2: `cd client && npm run dev`
- MySQL corriendo en segundo plano (se inicia solo como servicio del sistema).

## 5. Estructura

```
TaskListU/
├── client/      → Frontend React
├── server/      → Backend Express (API REST)
└── database/    → Script SQL de creación de tablas
```

## 6. Preparar el despliegue (producción)

### 6.1 Crear la base de datos en el servidor de producción

Ejecuta `database/taskListU.sql` contra la base de datos de producción, igual que en local (paso 1). El script solo crea la **estructura** (tablas y columnas) — a propósito no incluye ningún usuario de prueba ni un admin con contraseña fija, para no dejar credenciales por defecto conocidas en un repositorio público.

### 6.2 Crear el primer usuario administrador (de forma segura)

Nunca guardes una contraseña de administrador en texto plano en el código ni en el script SQL — el hash de bcrypt solo se genera correctamente cuando el usuario se registra a través de la propia aplicación. Pasos:

1. Entra a la aplicación ya desplegada y **regístrate normalmente** como cualquier otro usuario (con tu correo real), usando el formulario de registro.
2. Conéctate a la base de datos de producción y ejecuta:
   ```sql
   UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu_correo@ejemplo.com';
   ```
3. Cierra sesión y vuelve a iniciar sesión — ahora deberías ver el ícono 👑 de "Panel admin" en la barra superior.

Repite este mismo proceso en cualquier entorno nuevo (local, staging, producción) — nunca hay un admin "de fábrica".

### 6.3 Variables de entorno en el hosting

En el panel del proveedor (Railway, Render, Vercel, etc.) configura las mismas variables que tienes en tus `.env` locales — nunca subas los archivos `.env` reales, solo los valores dentro del panel del proveedor:
- Backend: `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` (usa un valor distinto y más largo que el de desarrollo).
- Frontend: `VITE_API_URL` apuntando a la URL pública de tu backend ya desplegado (no a `localhost`).

## 7. Endpoints principales de la API

| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/usuarios/registro | Crear usuario |
| POST | /api/usuarios/login | Iniciar sesión (devuelve token JWT) |
| GET | /api/tareas | Listar tareas del usuario autenticado |
| POST | /api/tareas | Crear tarea |
| PUT | /api/tareas/:id | Editar tarea |
| DELETE | /api/tareas/:id | Eliminar tarea |
| PATCH | /api/tareas/:id/estado | Cambiar estado (pendiente/en_proceso/completada) |
| GET | /api/recordatorios | Listar recordatorios |
| POST | /api/recordatorios | Crear recordatorio |
| PUT | /api/recordatorios/:id | Editar recordatorio |
| DELETE | /api/recordatorios/:id | Eliminar recordatorio |
