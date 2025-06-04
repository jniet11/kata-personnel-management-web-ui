# Gestión de Personal y Recursos TI 🚀

Este proyecto es una interfaz de usuario web construida con Next.js para gestionar ingresos de personal, solicitudes de acceso y asignaciones de computadoras dentro de un equipo u organización.

## Descripción General 📝

La aplicación permite a los administradores o personal encargado:
*   **Registrar nuevos miembros del equipo**: Crear perfiles para nuevos ingresos.
*   **Gestionar Solicitudes de Acceso**: Crear y editar solicitudes para diversos sistemas (GitHub, AWS, etc.).
*   **Administrar Asignaciones de Computadoras**: Asignar equipos de cómputo a los usuarios y editar dichas asignaciones.
*   **Visualizar un Dashboard Centralizado**: Ver un resumen de todas las solicitudes recientes (creación de usuarios, accesos, asignación de computadoras) con sus respectivos estados.

La interfaz interactúa con un backend (presumiblemente en `http://localhost:4000`) para persistir y recuperar la información.

## Tecnologías Utilizadas 💻

*   **Framework**: Next.js (utilizando el App Router)
*   **Lenguaje**: TypeScript
*   **Librería UI**: React
*   **Estilos**: Tailwind CSS
*   **Peticiones HTTP**: Axios
*   **Gestión de Estado**: Hooks de React (`useState`, `useEffect`)
*   **Autenticación**: JSON Web Tokens (JWT) para la protección de rutas y acciones.
*   **Routing**: `next/navigation` (`useRouter`, `useParams`)

## Versiones ℹ️

Para conocer las versiones específicas de las dependencias, por favor, consulta el archivo `package.json` en la raíz del proyecto.

## Estructura del Proyecto y Flujo de Páginas 🗺️

El proyecto sigue la estructura del **App Router** de Next.js, donde cada carpeta dentro de `app/` puede definir una ruta.

*   **`app/layout.tsx`**: Define el layout principal de la aplicación.
*   **`app/page.tsx`**: Podría ser la página de inicio (no provista en el contexto, pero típicamente es la raíz).
*   **`app/login/page.tsx`**: Página de inicio de sesión para la autenticación de usuarios.
*   **`app/team-management/page.tsx`**:  Dashboard principal.
    *   Muestra tarjetas para acciones rápidas (Crear Usuario, Solicitar Acceso, Asignar Computador).
    *   Presenta una tabla de "Solicitudes Recientes" que consolida:
        *   Solicitudes de creación de usuarios.
        *   Solicitudes de acceso.
        *   Solicitudes de asignación de computadoras.
    *   Permite editar o eliminar cada solicitud listada, redirigiendo a la página de edición correspondiente.
*   **Formularios de Creación**:
    *   `app/create-user/page.tsx`: Formulario para registrar un nuevo miembro.
    *   `app/access-request/page.tsx`: Formulario para crear una nueva solicitud de acceso.
    *   `app/computer-assignment/page.tsx`: Formulario para asignar un computador a un usuario.
*   **Formularios de Edición (Rutas Dinámicas)**:
    *   `app/edit-user/[id]/page.tsx`: Permite editar los detalles de un usuario existente. El `[id]` es el ID del usuario.
    *   `app/edit-access-request/[id]/page.tsx`: Permite editar una solicitud de acceso existente. El `[id]` es el ID de la solicitud de acceso.
    *   `app/edit-computer-assignment/[id]/page.tsx`: Permite editar una asignación de computadora existente. El `[id]` es el ID de la asignación.

**Flujo Típico**:
1.  El usuario navega a la aplicación. Si no está autenticado y intenta acceder a una ruta protegida, es redirigido a `/login`.
2.  En `/login`, el usuario ingresa sus credenciales.
3.  Tras una autenticación exitosa contra el backend (endpoint `/login`), se recibe un JWT.
4.  El JWT se almacena en `localStorage` del navegador.
5.  El usuario es redirigido a `/team-management`.
6.  Para todas las operaciones subsecuentes (cargar datos, crear, editar, eliminar), el JWT se adjunta en el encabezado `Authorization: Bearer <token>` de las solicitudes HTTP.
7.  Si el token es inválido o expira, el backend responderá con un error `401 Unauthorized`. El frontend detecta este error, elimina el token de `localStorage` y redirige al usuario a `/login`.
8.  Al cargar cualquier página protegida, se verifica la existencia del token en `localStorage`; si no existe, se redirige al login.

## API Endpoints (Backend) 🌐

La aplicación frontend interactúa con un backend que se espera esté disponible en `http://localhost:4000/personnel-management/`. Los principales endpoints consumidos son:

*   **Autenticación**:
    *   `POST /login`: Endpoint para autenticar al usuario y obtener un JWT.
*   **Usuarios (Protegido por JWT)**:
    *   `GET /get-users`: Obtiene la lista de todos los usuarios (usado también para poblar selectores y para editar).
    *   `POST /create-user`: Crea un nuevo usuario.
    *   `PUT /update-user/:id`: Actualiza un usuario existente.
    *   `DELETE /delete-user/:id`: Elimina un usuario (o su solicitud de creación).
*   **Solicitudes de Acceso (Protegido por JWT)**:
    *   `GET /get-access-requests`: Obtiene todas las solicitudes de acceso.
    *   `GET /get-access-request-by-id/:id`: Obtiene una solicitud de acceso específica.
    *   `POST /create-access-request`: Crea una nueva solicitud de acceso.
    *   `PUT /update-access-request/:id`: Actualiza una solicitud de acceso.
    *   `DELETE /delete-access-request/:id`: Elimina una solicitud de acceso.
*   **Asignaciones de Computadoras (Protegido por JWT)**:
    *   `GET /get-assignments`: Obtiene todas las asignaciones de computadoras.
    *   `GET /get-assignment-by-id/:id`: Obtiene una asignación de computadora específica.
    *   `POST /create-assignment`: Crea una nueva asignación de computadora.
    *   `PUT /update-assignment/:id`: Actualiza una asignación de computadora.
    *   `DELETE /delete-assignment/:id`: Elimina una asignación de computadora.

## Implementación de Autenticación por JWT (Frontend)

La autenticación de usuarios se ha implementado utilizando JSON Web Tokens (JWT) para garantizar un acceso seguro a las funcionalidades de la aplicación.

### Flujo Detallado:

1.  **Página de Login (`/login/page.tsx`):**
    *   Presenta un formulario para que el usuario ingrese su correo electrónico y contraseña.
    *   Al enviar, `Axios` realiza una solicitud `POST` al endpoint `/login` del backend.
2.  **Recepción y Almacenamiento del Token:**
    *   Si la autenticación es exitosa, el backend responde con un JWT.
    *   Este token se almacena en el `localStorage` del navegador.
    *   El usuario es redirigido a `/team-management` usando `useRouter` de Next.js.
3.  **Protección de Rutas y Envío del Token:**
    *   En cada componente de página protegida (ej. `team-management`, `create-user`, formularios de edición), un `useEffect` verifica al montar si existe un `jwtToken` en `localStorage`. Si no, redirige al usuario a `/login`.
    *   Para todas las solicitudes `Axios` a endpoints protegidos del backend:
        *   Se recupera el token de `localStorage`.
        *   Se incluye en el encabezado `Authorization` de la solicitud HTTP con el esquema `Bearer <token>`.
4.  **Manejo de Errores de Autenticación:**
    *   Si una solicitud a un endpoint protegido falla con un estado HTTP `401 Unauthorized` (indicando que el token es inválido, ha expirado, o no se proporcionó correctamente):
        *   Se muestra una alerta al usuario.
        *   El token (si existe) se elimina de `localStorage`.
        *   El usuario es redirigido a la página de `/login`.

Esta estrategia asegura que solo los usuarios autenticados puedan acceder a las funcionalidades de gestión y que las interacciones con el backend estén debidamente autorizadas.

## Cómo Ejecutar el Proyecto ▶️

1.  **Prerrequisitos**:
    *   Node.js (se recomienda la última versión LTS).
    *   npm o yarn.
    *   Un backend corriendo y accesible en `http://localhost:4000` que exponga los endpoints mencionados.

2.  **Clonar el Repositorio**:
    ```bash
    git clone git@github.com:jniet11/kata-personnel-management-web-ui.git
    cd kata-personnel-management-web-ui
    ```

3.  **Instalar Dependencias**:
    ```bash
    npm install
    # o
    yarn install
    ```

4.  **Ejecutar el Servidor de Desarrollo**:
    ```bash
    npm run dev
    # o
    yarn dev
    ```
    La aplicación estará disponible en `http://localhost:3000` (o el puerto que Next.js indique).

## Consideraciones Adicionales ✨

*   **Manejo de Errores**: Se implementa un manejo básico de errores para las llamadas a la API, mostrando mensajes al usuario.
*   **Carga de Datos**: Se utilizan estados de carga (`isLoading...`) para mejorar la experiencia del usuario mientras se obtienen datos.
*   **Componentes Reutilizables**: Aunque no se detalla explícitamente, se podrían crear componentes reutilizables para elementos comunes de la UI (botones, inputs, modales, etc.) para mejorar la mantenibilidad.
