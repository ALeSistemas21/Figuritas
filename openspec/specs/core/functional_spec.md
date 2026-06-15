# Especificación de Aplicación Web: FiguMatch 2026

## Resumen
**FiguMatch 2026** es una aplicación web SPA (Single Page Application) móvil-first que permite a los coleccionistas del álbum Panini de la Copa Mundial de la FIFA 2026 gestionar su inventario de figuritas (obtenidas y repetidas) y conectarse con otros coleccionistas cercanos para realizar intercambios presenciales de forma organizada.

---

## El Problema
El intercambio tradicional de figuritas suele organizarse de forma caótica a través de grupos de redes sociales o mensajería (WhatsApp, Telegram). Esto presenta los siguientes inconvenientes:
1. **Dificultad de Coincidencia (Matchmaking)**: Encontrar manualmente qué figurita repetida de un usuario le sirve a otro, y viceversa, requiere revisar listas largas de códigos en chats individuales.
2. **Falta de Filtro Geográfico o Institucional**: Los coleccionistas prefieren realizar intercambios con personas con las que comparten un espacio cotidiano (escuelas, clubes, barrios) para concretar el trato de manera rápida y segura.
3. **Falta de Seguimiento**: No hay un registro formal de las propuestas de intercambio pendientes, aceptadas o rechazadas, lo que genera confusiones e informalidad.

---

## Usuarios
* **Coleccionista (Usuario Final)**: Consulta su álbum, marca figuritas obtenidas/repetidas, visualiza coleccionistas ordenados por cercanía institucional/geográfica, propone intercambios, y administra sus tratos pendientes.
* **Administrador (Soporte)**: Monitorea las métricas de uso y puede realizar gestiones avanzadas en caso de reportes.

---

## Objetivo del MVP
Permitir que un coleccionista registre su ubicación (Provincia, Ciudad) y su Escuela, gestione su inventario de figuritas del Mundial 2026, vea coleccionistas sugeridos ordenados por cercanía con coincidencias automáticas de stock (repetidas vs faltantes), y envíe propuestas de intercambio para concretar de manera presencial.

---

## Fuera de Alcance para el MVP
* Chat integrado en tiempo real (se prefiere la coordinación presencial en los puntos de encuentro institucionales).
* Integración con mapas interactivos de geolocalización (se utiliza proximidad lógica por Escuela, Localidad y Provincia).
* Notificaciones push móviles.
* Gestión de álbumes de otras competiciones.

---

## Funcionalidades del MVP

### 1. Módulo de Perfil y Registro
* **Registro Inicial**: Obligatorio para utilizar la aplicación. Requiere:
  * Nombre o Apodo.
  * Provincia (seleccionada de un catálogo dinámico).
  * Localidad (filtrada reactivamente por la provincia seleccionada).
  * Escuela (buscador con autocompletado en tiempo real consultando la base de datos de escuelas de Argentina).
  * Opción "No asisto a ninguna escuela" para usuarios generales.
* **Edición de Perfil**: Posibilidad de modificar estos datos desde el encabezado en cualquier momento.

### 2. Módulo de Álbum Digital
* **Visualización Completa**: Grilla interactiva organizada por las 50 secciones oficiales (FWC, ARG, BRA, etc.) con sus respectivas figuritas (994 en total).
* **Control de Inventario**: Al presionar una figurita, el estado cicla:
  * **No obtenida** (Opacidad reducida, cantidad = 0).
  * **Obtenida** (Color sólido, cantidad = 1).
  * **Repetida** (Indicador numérico, cantidad >= 2).
* **Filtros rápidos**: Filtrar por "Faltantes", "Obtenidas" y "Repetidas".
* **Buscador**: Búsqueda por número o nombre de jugador estrella.

### 3. Módulo de Matchmaking (Coleccionistas)
* **Búsqueda por Cercanía**: Motor que lista otros coleccionistas activos ordenados bajo la siguiente prioridad:
  1. **Misma Escuela** (Coincidencia institucional - distancia simulada a pocos metros).
  2. **Misma Localidad** (Coincidencia local - distancia simulada < 3.5 km).
  3. **Misma Provincia** (Coincidencia regional - distancia simulada < 95 km).
  4. **Nivel Nacional** (Distancia simulada > 150 km).
* **Cruce de Inventario**: Muestra automáticamente:
  * Cuántas y cuáles figuritas tiene el coleccionista sugerido que a mí me faltan ("Te puede dar").
  * Cuántas y cuáles figuritas tengo yo repetidas que al coleccionista le faltan ("Le podés dar").
* **Visualización de Álbum Ajeno**: Modo lectura para ver el progreso del álbum del otro usuario.

### 4. Módulo de Propuestas de Intercambio
* **Configuración del Trato**: Interfaz interactiva donde el usuario selecciona de forma exacta qué figuritas de su stock de repetidas va a dar y cuáles del stock de repetidas del otro usuario desea recibir.
* **Bandeja de Tratos**:
  * **Recibidos**: Propuestas de otros usuarios. Acciones: Aceptar o Rechazar.
  * **Enviados**: Propuestas realizadas por el usuario. Acción: Cancelar.
* **Resolución de Trato (Aceptación)**: Al aceptar una propuesta, se ejecutan las siguientes operaciones:
  * Se transfieren los cromos: el receptor obtiene las figuritas solicitadas y descuenta las ofrecidas de su colección (y viceversa para el solicitante).
  * El estado de la propuesta cambia a `aceptado` y se desencadena una animación de confeti en pantalla.

---

## Modelo de Datos (Relacional)

### Provincias
* `id` (SERIAL PRIMARY KEY)
* `nombre` (VARCHAR(100) UNIQUE)

### Localidades
* `id` (SERIAL PRIMARY KEY)
* `nombre` (VARCHAR(150))
* `provincia_id` (INTEGER REFERENCES provincias)

### Escuelas
* `id` (SERIAL PRIMARY KEY)
* `cueanexo` (VARCHAR(20) UNIQUE)
* `nombre` (VARCHAR(255))
* `domicilio` (VARCHAR(255))
* `sector` (VARCHAR(50))
* `ambito` (VARCHAR(50))
* `localidad_id` (INTEGER REFERENCES localidades)

### Perfiles
* `id` (UUID PRIMARY KEY)
* `nombre` (VARCHAR(100))
* `provincia_id` (INTEGER REFERENCES provincias)
* `localidad_id` (INTEGER REFERENCES localidades)
* `escuela_id` (INTEGER REFERENCES escuelas NULL)
* `completitud` (INTEGER DEFAULT 0)

### Colecciones
* `perfil_id` (UUID REFERENCES perfiles)
* `sticker_id` (VARCHAR(10))
* `cantidad` (INTEGER DEFAULT 0)
* **Clave Primaria Compuesta**: `(perfil_id, sticker_id)`

### Propuestas
* `id` (UUID PRIMARY KEY)
* `solicitante_id` (UUID REFERENCES perfiles)
* `receptor_id` (UUID REFERENCES perfiles)
* `ofrece` (TEXT[] - Array de IDs de figuritas)
* `solicita` (TEXT[] - Array de IDs de figuritas)
* `estado` (VARCHAR(20) CHECK IN ('pendiente', 'aceptado', 'rechazado', 'cancelado'))

---

## Reglas de Negocio
1. **Consistencia Geográfica**: El selector de localidades debe limitarse únicamente a aquellas pertenecientes a la provincia elegida.
2. **Autocompletado de Escuelas**: La búsqueda de escuelas debe ejecutarse tras ingresar al menos 2 caracteres y estar restringida a la localidad seleccionada del perfil.
3. **Propiedades de Stock**: Un usuario solo puede ofrecer figuritas si las posee en cantidad mayor o igual a 2 (es decir, tiene al menos una repetida).
4. **Validación de Propuestas**: No se puede proponer un intercambio vacío (debe ofrecer al menos una figurita o solicitar al menos una).
5. **Transaccionalidad en Aceptación**: Al aceptar una propuesta, la base de datos debe descontar las unidades ofrecidas del stock de repetidas del emisor y sumarlas al receptor. Si el emisor ya no tiene la figurita repetida (porque la intercambió en otro trato en el intermedio), la aceptación debe alertar al usuario y cancelar o invalidar la propuesta.
6. **Mapeo de CUE**: La importación inicial debe validar la integridad territorial: los dos primeros dígitos del CUE de la escuela determinan su provincia asignada.

---

## Criterios de Aceptación
1. **Dado** un usuario no registrado, **cuando** accede a la aplicación, **entonces** se le presenta el modal de registro y no puede navegar por las demás secciones hasta completar su perfil.
2. **Dado** un usuario completando su perfil en Rosario (Santa Fe), **cuando** escribe "ESCUELA" en el buscador de escuelas, **entonces** el autocompletado muestra sugerencias locales del padrón oficial que corresponden a Rosario.
3. **Dado** un coleccionista con la figurita `ARG10` en cantidad = 2 (repetida), **cuando** otro coleccionista que no posee la `ARG10` busca matches en la misma escuela, **entonces** el primer coleccionista figura en el tope de su lista con el tag "Misma Escuela" indicando "Te puede dar: ARG10".
4. **Dado** un trato recibido en estado `pendiente`, **cuando** el receptor hace clic en "Aceptar", **entonces** se restan/suman las figuritas de ambas colecciones, el estado pasa a `aceptado` y se muestra confeti.

---

## Casos de Prueba
1. Registrar un perfil seleccionando Provincia, Localidad y buscando su Escuela mediante el autocompletado en tiempo real.
2. Incrementar la cantidad de una figurita en el álbum hasta que figure como repetida (cantidad >= 2) y verificar que se actualicen las estadísticas de Dashboard.
3. Simular coleccionistas y verificar que el algoritmo ordene la lista según el nivel de proximidad (Escuela > Ciudad > Provincia > Nacional).
4. Crear una propuesta de intercambio eligiendo figuritas de la columna "Le podés dar" y de la columna "Te puede dar", enviarla y validar que aparezca en la pestaña "Mis Tratos" como enviada pendiente.
5. Simular la aceptación de una propuesta y validar que las figuritas se descuenten y sumen correctamente en el inventario personal.
