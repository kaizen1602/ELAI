# Guía de Exposición: Backend (Tour Guiado)

*Tiempo estimado: 7-8 minutos*
*Objetivo: Explicar el sistema "mostrando", no solo "hablando".*

## 🏁 Antes de Empezar (Preparación)

Ten abiertas las siguientes pestañas en VS Code en este orden para no perder tiempo buscando:
1.  `backend/docker-compose.yml`
2.  `backend/prisma/schema.prisma`
3.  `backend/src/modules/citas/citas.routes.ts`
4.  `backend/src/modules/citas/citas.controller.ts`

---

## 🏗️ Paso 1: Infraestructura (Docker) - 1.5 min

**👉 ACCIÓN:** Abre el archivo `docker-compose.yml`.

**🗣️ GUION SUGERIDO:**
"Buenas tardes. Para entender ELAI, primero debemos ver dónde vive. No dependemos de configuraciones locales complejas; todo nuestro backend está orquestado aquí, en **Docker**."

*   *(Señala el servicio `postgres` línea 3)*: "Aquí tenemos nuestra base de datos **PostgreSQL**. Es un contenedor aislado y robusto."
*   *(Señala el servicio `backend` línea 41)*: "Este es el cerebro. Node.js con Express corriendo en un contenedor separado."
*   *(Señala el servicio `n8n` línea 95)*: "Y este es nuestro motor de IA y automatización, n8n, que vive dentro de nuestra misma red privada, permitiendo una comunicación ultra rápida y segura entre el bot y la API."

**💡 TIP:** Menciona/Señala la palabra `depends_on` (línea 66) para mostrar cómo garantizamos que la base de datos inicie antes que la API.

---

## 💾 Paso 2: Base de Datos (Prisma) - 2 min

**👉 ACCIÓN:** Cámbiate a la pestaña `backend/prisma/schema.prisma`.

**🗣️ GUION SUGERIDO:**
"El corazón de nuestros datos no son simples tablas SQL sueltas. Usamos **Prisma ORM**, que nos permite diseñar nuestra base de datos como un sistema de tipos estricto y seguro."

**👉 ACCIÓN:** Haz scroll a la sección `// SCHEDULING SYSTEM` (aprox línea 200).

"Miren cómo modelamos la complejidad de una clínica:"
1.  **Agendas:** *(Señala `model Agenda`)* "Cada médico tiene su agenda configurada."
2.  **Slots (Turnos):** *(Señala `model Slot`)* "La agenda se rompe en 'Slots'. Miren el campo `estado` (línea 251). Un turno no solo está 'ocupado' o 'libre', puede estar `DISPONIBLE`, `RESERVADO` (cuando el bot lo está ofreciendo), `CONFIRMADO` o `BLOQUEADO`."
3.  **Citas:** *(Señala `model Cita`)* "Finalmente, la `Cita` conecta a un `Paciente` con un `Slot` único."

**👉 ACCIÓN (Opcional pero potente):**
Si tienes tiempo, muestra la relación en la línea 302: `slot Slot @relation(...)`.
"Prisma nos garantiza integridad: No puede existir una Cita sin un Slot válido, y si borramos un Slot, el sistema sabe exactamente qué hacer (Cascade)."

---

## 🏛️ Paso 3: Arquitectura y Código (Ejemplo Real) - 2.5 min

**🗣️ GUION SUGERIDO:**
"¿Cómo viaja un dato desde el celular del paciente hasta esa base de datos? Usamos una arquitectura de 3 capas limpia."

**👉 ACCIÓN 1:** Abre `src/modules/citas/citas.routes.ts`.
"Todo entra por aquí. Las **Rutas**. Fíjense en la línea 9 (`/create`). Antes de que la petición toque nada, pasa por `validateN8NWebhook`. Si alguien intenta entrar sin la llave secreta del bot, el sistema lo rechaza aquí mismo. Seguridad primero."

**👉 ACCIÓN 2:** Abre `src/modules/citas/citas.controller.ts`.
"Si pasa la seguridad, llega al **Controlador**. Miren el método `createFromN8N` (línea 19)."
"Lo primero que hacemos no es guardar datos, es **VALIDAR** con **Zod** (línea 20). Si el bot manda un formato de fecha incorrecto, el código se detiene inmediatamente. Solo si los datos son puros, llamamos al `citasService.create`."

**🗣️ RESUMEN TÉCNICO:**
"No mezclamos cosas. El Controlador se encarga del HTTP (recibir y responder), el Servicio contiene la lógica pura, y Prisma habla con la base de datos. Esto hace que el código sea ultra mantenible."

---

## 🎯 Cierre Visual (Visualización de Datos) - 1 min

*Si te preguntan: "¿Y cómo ven los datos 'crudos' si es necesario?"*

**🗣️ RESPUESTA:**
"Aunque usamos Docker y contenedores cerrados, tenemos una herramienta visual potente llamada **Prisma Studio**."

*(Explicación verbal)*: "Con un solo comando (`npx prisma studio`), levantamos una interfaz web administrativa que nos permite ver y navegar por todas estas tablas (Pacientes, Citas, Logs de IA) como si fuera un Excel avanzado, directamente conectado a nuestro contenedor de Docker. Así auditamos los datos en tiempo real."

---

**Resumen para finalizar en 10 segundos:**
1.  Infraestructura en contenedores (**Docker**).
2.  Modelado de datos estricto y relacional (**Prisma**).
3.  Arquitectura por capas segura y validada (**Express + Zod**).
