# Exposición del Proyecto: Frontend (UI/UX & Cliente)

*Tiempo estimado: 7 minutos*

## 1. Stack Tecnológico Moderno (1 minuto)

**Objetivo:** Introducir las herramientas de última generación elegidas para una experiencia de usuario fluida.

*   **Core:** **React 19 + TypeScript**. Usamos la última versión de React para aprovechar mejoras de rendimiento y TypeScript para garantizar la seguridad de tipos, fundamental en una aplicación con datos médicos sensibles.
*   **Build Tool:** **Vite**. Proporciona un entorno de desarrollo extremadamente rápido y builds de producción optimizados.
*   **Estilos:** **Tailwind CSS**. Nos permite construir una interfaz moderna, responsive y consistente rápidamente mediante clases utilitarias, manteniendo el peso del CSS bajo control.
*   **Estado del Servidor:** **TanStack Query (React Query)**. Herramienta crucial para manejar datos asíncronos (API). Gestiona caché, re-intentos y actualizaciones en segundo plano automáticamente.

## 2. Experiencia de Usuario (UI/UX) y Diseño (1.5 minutos)

**Objetivo:** Destacar cómo el diseño facilita el uso de la aplicación.

*   **Diseño Responsivo:** La interfaz se adapta perfectamente a dispositivos móviles, tablets y escritorio, crucial para médicos que pueden consultar agendas en movimiento.
*   **Componentes Reutilizables:** Hemos construido una biblioteca de componentes UI (Botones, Inputs, Cards, Modales) consistente y modular.
*   **Feedback al Usuario:**
    *   **Sonner (Toasts):** Notificaciones no intrusivas para confirmar acciones (ej: "Cita creada con éxito") o alertar errores.
    *   **Framer Motion:** Micro-animaciones suaves que guían la atención del usuario y hacen que la aplicación se sienta "viva" y profesional, sin sobrecargarla.
*   **Iconografía:** Uso de **Lucide React** para iconos limpios y semánticos que mejoran la legibilidad de la interfaz.

## 3. Gestión de Estado y Datos (1.5 minutos)

**Objetivo:** Explicar cómo manejamos la complejidad de los datos en el cliente.

El manejo de estado está dividido estratégicamente:

1.  **Estado del Servidor (Server State):**
    *   Manejado por **React Query**.
    *   Ejemplo: Al cargar la lista de citas, React Query las cachea. Si el usuario navega y vuelve, la carga es instantánea.
    *   Permite "Optimistic Updates" (actualizar la UI antes de que el servidor responda) para una sensación de velocidad instantánea.
2.  **Estado Global (Client State):**
    *   Usamos **React Context API** para estados globales ligeros, como el tema (Dark/Light mode) o la sesión del usuario autenticado.
3.  **Formularios:**
    *   **React Hook Form:** Manejo de formularios de alto rendimiento (sin re-renders innecesarios).
    *   **Zod/Yup:** Validación de esquemas en el lado del cliente para dar feedback inmediato al usuario antes de enviar datos al servidor (ej: "El correo no es válido").

## 4. Estructura y Navegación (1.5 minutos)

**Objetivo:** Mostrar cómo está organizada la aplicación para el usuario.

*   **Routing:** Utilizamos **React Router** para una navegación SPA (Single Page Application). El cambio de página es instantáneo sin recargar el navegador.
*   **Layouts:**
    *   **Dashboard Layout:** Estructura principal con Sidebar de navegación y Header.
    *   **Auth Layout:** Diseño específico para Login/Registro.
*   **Módulos Clave del Frontend:**
    *   **Dashboard Principal:** Vista resumen con gráficas (usando **Recharts**) de citas del día y métricas clave.
    *   **Calendario/Agenda:** Vista compleja que permite visualizar y gestionar slots de tiempo.
    *   **Gestión de Pacientes:** Tablas interactivas con filtros y búsqueda en tiempo real.

## 5. Integración con el Backend (1.5 minutos)

**Objetivo:** Explicar cómo se conecta "el cerebro" (backend) con "la cara" (frontend).

*   **Cliente HTTP (Axios):**
    *   Tenemos una instancia de Axios configurada globalmente (`apiClient`).
    *   **Interceptors:** Concepto clave.
        *   *Request Interceptor:* Inyecta automáticamente el token JWT en el header `Authorization` de cada petición.
        *   *Response Interceptor:* Detecta si el token ha expirado (Error 401) y redirige automáticamente al usuario al Login, mejorando la seguridad.
*   **Hooks Personalizados:**
    *   Encapsulamos la lógica de llamadas a la API en hooks como `useCitas`, `usePatients`.
    *   El componente de vista solo llama a `const { data, isLoading } = useCitas()` y no se preocupa por *cómo* se obtienen los datos.

---

**Conclusión:**
El frontend de ELAI no es solo una "cara bonita"; es una aplicación moderna y optimizada que prioriza la experiencia del usuario (UX), la velocidad de carga y la robustez en el manejo de datos, utilizando las mejores herramientas del ecosistema React actual.
