# FiguMatch 🏆

FiguMatch es una aplicación web moderna diseñada para modernizar y facilitar el intercambio de figuritas coleccionables. Ayuda a los coleccionistas a organizar su álbum digitalmente, encontrar compañeros con quienes intercambiar, y enviar o recibir propuestas de trato en tiempo real.

## 🚀 Funcionalidades Principales

*   **Álbum Digital Interactivo:** Mantén un registro exacto de las figuritas que tienes ("Obtenidas") y las que te faltan ("Faltantes"). Navega por tu álbum filtrando por categorías y utiliza una barra de búsqueda para encontrar figuritas específicas al instante.
*   **Algoritmo de Matching:** Encuentra automáticamente a los coleccionistas de tu red que tienen exactamente las figuritas que necesitas, y a quienes les sirven tus repetidas. El sistema calcula un "Porcentaje de Compatibilidad" para recomendarte los mejores tratos.
*   **Red de Coleccionistas:** Añade amigos mediante un código único de 6 cifras. Construye tu propia red de contactos para hacer intercambios seguros dentro de tu escuela, trabajo o grupo de amigos.
*   **Gestión de Propuestas en Tiempo Real (Realtime):** Envía propuestas de intercambio seleccionando qué ofreces y qué pides a cambio. Recibe notificaciones al instante cuando te envían una propuesta, y acepta o rechaza tratos directamente desde el "Centro de Intercambios".
*   **Autenticación Segura:** Sistema de registro e inicio de sesión protegido, asegurando que cada coleccionista tenga su inventario privado y seguro.

## 💻 Tecnologías Utilizadas

*   **Frontend:** [Next.js 14](https://nextjs.org/) con App Router y React.
*   **Estilos y UI:** [Tailwind CSS](https://tailwindcss.com/) para un diseño responsivo, estético y con soporte para Dark Mode.
*   **Iconos:** [Lucide React](https://lucide.dev/).
*   **Backend & Base de Datos:** [Supabase](https://supabase.com/) (PostgreSQL) para almacenamiento de perfiles, colecciones, amistades y propuestas.
*   **Autenticación:** Firebase Authentication (Email y Contraseña).
*   **Tiempo Real:** Supabase Realtime (WebSockets) para actualización instantánea de colecciones y notificaciones de propuestas/amistades.
*   **Testing:** [Playwright](https://playwright.dev/) para pruebas End-to-End (E2E).

## 🛠️ Instalación y Uso Local

Sigue estos pasos para clonar y ejecutar el proyecto en tu entorno local:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/figumatch.git
    cd figumatch
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto y agrega tus claves de Supabase y Firebase:
    ```env
    NEXT_PUBLIC_SUPABASE_URL="tu_supabase_url"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="tu_supabase_anon_key"
    
    NEXT_PUBLIC_FIREBASE_API_KEY="tu_firebase_api_key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="tu_firebase_auth_domain"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="tu_firebase_project_id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="tu_firebase_storage_bucket"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="tu_firebase_messaging_sender_id"
    NEXT_PUBLIC_FIREBASE_APP_ID="tu_firebase_app_id"
    ```

4.  **Configurar la Base de Datos (Supabase):**
    Dado que el proyecto utiliza Supabase, las tablas de la base de datos no se crean automáticamente al arrancar el proyecto. Debes crearlas manualmente.
    - Abre tu panel de control de Supabase (SQL Editor).
    - Copia todo el contenido del archivo `schema.sql` (incluido en la raíz de este proyecto).
    - Pégalo en el editor SQL de Supabase y ejecútalo. Esto creará las tablas `perfiles`, `colecciones`, `amistades` y `propuestas`, y habilitará el *Realtime* en ellas.

5.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

6.  **Abrir en el navegador:**
    Visita [http://localhost:3000](http://localhost:3000) para ver la aplicación en funcionamiento.

## 🧪 Ejecutar Pruebas (Testing)

El proyecto incluye una suite completa de pruebas E2E. Para ejecutarlas:

```bash
# Ejecutar en consola
npx playwright test

# Ejecutar con interfaz gráfica
npx playwright test --ui
```

## 📸 Capturas de Pantalla

*(Nota: Agrega aquí las imágenes reales de tu aplicación una vez desplegada)*

| Pantalla Principal (Dashboard) | Álbum Virtual |
| :---: | :---: |
| *(Reemplazar con imagen dashboard.png)* | *(Reemplazar con imagen album.png)* |
| **Búsqueda de Matches** | **Gestión de Propuestas** |
| *(Reemplazar con imagen matches.png)* | *(Reemplazar con imagen propuestas.png)* |

---
*Desarrollado como Trabajo Final Integrador para el curso "Desarrollo de Aplicaciones Web con Inteligencia Artificial".*
