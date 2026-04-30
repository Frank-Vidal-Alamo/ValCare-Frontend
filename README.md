# 🏥 ValCare / ValCore — Gestión Clínica Fullstack

> Reconstrucción profesional del sistema de gestión médica ValCare, optimizado para alto rendimiento y escalabilidad.

---

## 🎨 Design System & UI
El proyecto implementa una identidad visual propia centrada en la confianza y claridad del entorno médico.

| Elemento | Especificación |
| :--- | :--- |
| **Primario** | Paleta `marca` (Azules Clínicos: 50 - 950) |
| **Typography** | `Sora` (Encabezados) / `DM Sans` (Cuerpo) |
| **Modo** | Dark Mode nativo via Tailwind `class`[cite: 1] |
| **Motion** | Animaciones custom (`fade-up`, `modal-in`)[cite: 1] |

## 🛠️ Stack Tecnológico
* **Frontend:** React (Vite) + Tailwind CSS[cite: 1].
* **Enrutamiento:** React Router DOM (Single Page Application)[cite: 1].
* **Backend (Planificado):** FastAPI & PostgreSQL[cite: 1].

## 📂 Estructura de Arquitectura
Siguiendo principios de **Clean Architecture**, el proyecto se organiza para ser mantenible y escalable:
```text
src/
├── components/ # Componentes de UI reutilizables
├── context/    # Estados globales (Auth, Tema)
├── data/       # Constantes y mocks de datos
└── hooks/      # Lógica de React extraída


## 📂 Despliegue en vercel

https://val-care-frontend.vercel.app/ 
