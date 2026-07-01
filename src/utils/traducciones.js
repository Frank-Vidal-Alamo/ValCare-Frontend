const MAPA_ESPECIALIDADES = {
  "general medicine": "Medicina General",
  "medicina general": "Medicina General",
  "cardiology": "Cardiología",
  "cardiología": "Cardiología",
  "dermatology": "Dermatología",
  "dermatología": "Dermatología",
  "pediatrics": "Pediatría",
  "pediatría": "Pediatría",
  "gynecology": "Ginecología",
  "ginecología": "Ginecología",
  "obstetrics": "Obstetricia",
  "orthopedics": "Ortopedia",
  "ortopedia": "Ortopedia",
  "neurology": "Neurología",
  "neurología": "Neurología",
  "urology": "Urología",
  "urología": "Urología",
  "ophthalmology": "Oftalmología",
  "oftalmología": "Oftalmología",
  "endocrinology": "Endocrinología",
  "endocrinología": "Endocrinología",
  "nutrition": "Nutrición",
  "nutrición": "Nutrición",
  "psychiatry": "Psiquiatría",
  "psiquiatría": "Psiquiatría",
  "family medicine": "Medicina Familiar",
  "medicina familiar": "Medicina Familiar",
  "internal medicine": "Medicina Interna",
  "medicina interna": "Medicina Interna",
  "plastic surgery": "Cirugía Plástica",
  "cirugía plástica": "Cirugía Plástica",
  "dentistry": "Odontología",
  "odontología": "Odontología",
  "emergency medicine": "Medicina de Urgencias",
  "medicina de urgencias": "Medicina de Urgencias",
  "physical therapy": "Fisioterapia",
  "fisioterapia": "Fisioterapia",
  "clinical psychology": "Psicología Clínica",
  "psicología clínica": "Psicología Clínica",
  "allergy and immunology": "Alergología e Inmunología",
  "alergología e inmunología": "Alergología e Inmunología",
};

export function traducirEspecialidad(valor) {
  if (!valor) return "Consulta médica";
  const texto = String(valor).trim();
  if (!texto) return "Consulta médica";
  const clave = texto.toLowerCase();
  return MAPA_ESPECIALIDADES[clave] || texto;
}
