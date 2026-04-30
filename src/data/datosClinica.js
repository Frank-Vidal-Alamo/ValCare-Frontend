export const ESPECIALIDADES = [
  { id: "cardiologia",     nombre: "Cardiología",       icono: "Heart" },
  { id: "neurologia",      nombre: "Neurología",         icono: "Brain" },
  { id: "pediatria",       nombre: "Pediatría",          icono: "Baby" },
  { id: "medicina_gral",   nombre: "Medicina General",   icono: "Stethoscope" },
  { id: "endocrinologia",  nombre: "Endocrinología",     icono: "FlaskConical" },
  { id: "ginecologia",     nombre: "Ginecología",        icono: "CircleUserRound" },
];

export const DOCTORES = [
  {
    id:           "dra_elena_valdivia",
    nombres:      "Dra. Elena Valdivia",
    especialidad: "cardiologia",
    cargo:        "Jefe de Cardiología",
    rating:       "Top Rated",
    imagen:       "https://lh3.googleusercontent.com/aida-public/AB6AXuD3ledZzLKf5cUjb1IjKWe9aZl5FzzIee_4qNywqDoCBigYrfvhciF_NvJanU1kKPc9F9Z4lAqW8bVmipdaG0tDY3mPQhGSmwdQC4sIRHPncMSwBscGzUyRVASELrHNhAfAdDp9EAa82DGh4L_34BjDTiuftVDYU7vCMKC8k1QEbgYH6I4y_PS8VAXkCJnLO7ajd967FU7LbKI1c3QzcIAcbnByI3Gdpy-GhQuod1evBiDczRQdghqrh7kz2SvXuXZER1HFbWnOZ0mL",
    horarios: [
      { dia: "Lunes",     franjas: ["09:00 AM", "10:00 AM", "11:00 AM"] },
      { dia: "Miércoles", franjas: ["02:00 PM", "03:00 PM", "04:00 PM"] },
      { dia: "Viernes",   franjas: ["09:00 AM", "10:30 AM"] },
    ],
  },
  {
    id:           "dr_carlos_mendoza",
    nombres:      "Dr. Carlos Mendoza",
    especialidad: "neurologia",
    cargo:        "Director de Neurología",
    rating:       "Próx: 2:00 PM",
    imagen:       "https://lh3.googleusercontent.com/aida-public/AB6AXuBJc9sV5BPElbzh5hmhpzKpP-JxGHFTjOAgZvTKiDymfOJKR4WK0oFWn0VxmPiQ6HQrmDK0rpJ5pk6MhvST3ygihJT3BSVDxfth180F9fvq7uxLKVCLrTyFIKfVmnCsc8X7NxdUpCnuZ8I_ODatirymRYcI2UQ0VYByo5zkzEJY0RwuEKPVEHzhHs9OidThkw42dJBY8SWPw_VKLRcEF4qL0gX7E1_J8JZezCpiZRvfpz7YuiziOZ9-R_Adic1KRhaQaV2xhjN6Y4g7",
    horarios: [
      { dia: "Martes",   franjas: ["10:00 AM", "11:00 AM", "12:00 PM"] },
      { dia: "Jueves",   franjas: ["02:00 PM", "03:30 PM"] },
      { dia: "Viernes",  franjas: ["10:00 AM", "11:30 AM"] },
    ],
  },
  {
    id:           "dra_sofia_castro",
    nombres:      "Dra. Sofía Castro",
    especialidad: "pediatria",
    cargo:        "Especialista en Pediatría",
    rating:       "Nuevo Talento",
    imagen:       "https://lh3.googleusercontent.com/aida-public/AB6AXuB5vucfL4Mmcy98AqMmwf7ry7OcCmJdqsOveb9u3k1mRkPGG8IODVn_GgaamnQ6Bj_iXBmAf1NiUx-RCfhqhVONIjJ553RTTKnnZ4VT7VEhZCVhRxDjgRtAqE_qizUhbr0StfUW5budED11OvOLOmEkr2YJhCHCV0c8NEtqSXWtDfFeYF-eM6kRYSvllAtpX-wDgN6Ja6IDZIY9JDnN2CNS7C0A6dKbn7ed3jPrivCV0R8be2LxMnHL6lYn9Bwy4bchwnokTTN8csJt",
    horarios: [
      { dia: "Lunes",     franjas: ["08:00 AM", "09:00 AM", "10:00 AM"] },
      { dia: "Miércoles", franjas: ["08:00 AM", "09:30 AM"] },
      { dia: "Viernes",   franjas: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM"] },
    ],
  },
  {
    id:           "dr_ricardo_palma",
    nombres:      "Dr. Ricardo Palma",
    especialidad: "ginecologia",
    cargo:        "Ginecología y Maternidad",
    rating:       "Top Rated",
    imagen:       "https://lh3.googleusercontent.com/aida-public/AB6AXuCukaIXXGpKNY4abmLU3U_p7FVvfuos59eaj5sTNIYZKQSoLaBBvwWi37Q5Nf9xyx-LRkxHynnvUk3Qn0DTWIDT11J41pSeaTN11gblL9hK8RgvgKdAfO7F1SyEiFOwWQ2dhtToYvwc3Z4ghPf2GQn04G6gwrsy7CFv3EScPB2BoHv6C8i8PH8Qa1LC4b-CyNWTzqp6VQtz58TCmTIeCTlgW9cgtF69AGfi_496w1K817QjqUjUMGjwZLIBNibiTrDZtByy94gkxW0",
    horarios: [
      { dia: "Lunes",    franjas: ["02:00 PM", "03:00 PM", "04:00 PM"] },
      { dia: "Martes",   franjas: ["09:00 AM", "10:00 AM"] },
      { dia: "Jueves",   franjas: ["09:00 AM", "10:00 AM", "11:00 AM"] },
    ],
  },
  {
    id:           "dra_ana_rios",
    nombres:      "Dra. Ana Ríos",
    especialidad: "medicina_gral",
    cargo:        "Médico General",
    rating:       "Top Rated",
    imagen:       "https://lh3.googleusercontent.com/aida-public/AB6AXuBuRNn8MnLL2CLweRIq8JNbueZh_qsBputRRTyGui_ryTt2QpOelKLbIS7pcMVcIKwIzSvVdnfCYVuvCWbIdY-RJSd0UzHfJW7LlZj6DpZ9vIqdxcVqHaEdSI_M7Bu1lCAuABDEC5e0NY3VFrCdUdbR7rHczJRCAF7Tq9EPOfpTdCcpBdZ9a7b0TMCxq9Fjcsmy2MnqT_17dPVGXb2Qz9hiUxMf1yXYTQuFKQ709vT56ei9d6xYcoA2TN7J3Tca2srlhIWtNKhKtBjJ",
    horarios: [
      { dia: "Lunes",     franjas: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM"] },
      { dia: "Martes",    franjas: ["08:00 AM", "09:00 AM"] },
      { dia: "Miércoles", franjas: ["02:00 PM", "03:00 PM", "04:00 PM"] },
      { dia: "Jueves",    franjas: ["08:00 AM", "09:00 AM", "10:00 AM"] },
    ],
  },
  {
    id:           "dr_javier_luna",
    nombres:      "Dr. Javier Luna",
    especialidad: "endocrinologia",
    cargo:        "Endocrinólogo Especialista",
    rating:       "Próx: 3:00 PM",
    imagen:       "https://lh3.googleusercontent.com/aida-public/AB6AXuAJalETQXQ2rrzJFkHKdyj8A4Jk45X3xf65x9-Z8RXzv8U2RM6530-IuxbFMXTt3t0U9lOqH6VyFNvyINDdzJCwXv3xLxz6cBTCdhK4NAoPxEFxy5OqHOtDbDcIK2aoyxCwzl_YrKfteT8p75ciOp81KYesYMBXULQ6QZMEEMjIa0AwR-IOGtOu1SpOTbUqFfl5UhDRwGYAzblmgDW4in_bXi3yKLkQSMOjg5CxXYQW_7y4bEooSXBn3FG3PlRfysSUuMLqjjFNpdP7",
    horarios: [
      { dia: "Martes",   franjas: ["10:00 AM", "11:30 AM"] },
      { dia: "Jueves",   franjas: ["03:00 PM", "04:30 PM"] },
    ],
  },
];

/** Filtra doctores por especialidad */
export function getDoctoresPorEspecialidad(especialidadId) {
  return DOCTORES.filter((d) => d.especialidad === especialidadId);
}

/** Devuelve todos los slots de un doctor en todos sus horarios */
export function getSlotsDoctorFlat(doctorId) {
  const doc = DOCTORES.find((d) => d.id === doctorId);
  if (!doc) return [];
  return doc.horarios.flatMap((h) =>
    h.franjas.map((f) => ({ dia: h.dia, franja: f, id: `${h.dia}-${f}` }))
  );
}

/** Paleta de fondos del portal */
export const FONDOS_PORTAL = [
  { id: "default",  nombre: "Predeterminado",   clase: "bg-[var(--color-fondo)]" },
  { id: "gradient", nombre: "Degradado Azul",    clase: "bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950" },
  { id: "slate",    nombre: "Pizarra Oscura",    clase: "bg-slate-950" },
  { id: "medical",  nombre: "Verde Médico",      clase: "bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950" },
  { id: "sky",      nombre: "Cielo Claro",       clase: "bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-sky-950 dark:via-slate-900 dark:to-blue-950" },
];
