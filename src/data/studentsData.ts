import { Discipline } from "../types";

export interface StudentRecord {
  matricula: string;
  nome: string;
  n1?: number;
  n2?: number;
  faltas1B?: number;
  faltas2B?: number;
  exameFinal?: number;
  situacao: "Aprovado" | "Reprovado" | "Reprovado por Falta" | "Desistente" | "Matrícula Trancada" | "Exame" | "Pré-Matriculado" | "Transferido";
}

// Exact actual rosters and grades/absences extracted from the provided PDF files for target classes

// Period 5: Narrativas Audiovisuais (ID 16087PP, Turma 474723)
const NARRATIVAS_AUDIOVISUAIS_ROSTER: StudentRecord[] = [
  { matricula: "2019101002", nome: "THACIANA MARGARIDA TEIXEIRA RODRIGUES", n1: 8.5, n2: 9.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2024100516", nome: "NATÁLIA LAZARO DE SOUZA", n1: 9.5, n2: 9.0, faltas1B: 1, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2024100274", nome: "BEATRIZ CORREA HARRES", n1: 9.0, n2: 9.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2024102138", nome: "NATAN GABRIEL ALVES MACHADO", n1: 7.5, n2: 8.5, faltas1B: 2, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2024100360", nome: "YASMIM GURESKI CAVALLI DE ARAUJO", n1: 9.5, n2: 9.0, faltas1B: 2, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2022102105", nome: "MANOELA SILVA DOS SANTOS", n1: 8.5, n2: 9.0, faltas1B: 1, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2023100510", nome: "GABRIEL MUHLMANN HOROCHOVEC", n1: 8.5, n2: 5.5, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2024204129", nome: "FLAVIA CAMILE GARCIA ALVES", n1: 9.0, n2: 9.0, faltas1B: 4, faltas2B: 4, situacao: "Reprovado por Falta" },
  { matricula: "2024100465", nome: "EMILLY MARIA PEREIRA CORREIA", n1: 8.0, n2: 7.5, faltas1B: 1, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2024100238", nome: "GABRIEL BARBOSA SARAGIOTO", n1: 8.5, n2: 5.5, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2020100256", nome: "ADLER MAROLETO DOS SANTOS", n1: 7.5, n2: 7.5, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2024102629", nome: "MARIA FERNANDA MERENCIO", n1: 9.0, n2: 8.7, faltas1B: 1, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2024101218", nome: "MARIA CLARA FONSECA BREVAL", n1: 8.5, n2: 6.5, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2024101268", nome: "RAFAELA PALMONARI ALVES DE FRANÇA", n1: 9.5, n2: 9.0, faltas1B: 1, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2024102119", nome: "ERIC NEFHI NEVES DA SILVA", n1: 7.5, n2: 8.0, faltas1B: 2, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2023100182", nome: "SANTIAGO GODOI BUENO", n1: 9.5, n2: 9.0, faltas1B: 2, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2024101228", nome: "CAIO DE OLIVEIRA LOBO TEIXEIRA", n1: 8.5, n2: 9.0, faltas1B: 1, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2024100818", nome: "NATALIA DOS SANTOS FALCON WIEDERKEHR", n1: 0, n2: 0, faltas1B: 0, faltas2B: 0, situacao: "Desistente" },
  { matricula: "2024102238", nome: "HELLOYSA HELENA DOS REIS", n1: 0, n2: 0, faltas1B: 0, faltas2B: 0, situacao: "Transferido" }
];

// Period 5: Campanha Publicitária de Varejo (ID 16096PP)
const CAMPANHA_VAREJO_ROSTER: StudentRecord[] = [
  { matricula: "2024101228", nome: "CAIO DE OLIVEIRA LOBO TEIXEIRA", n1: 8.5, n2: 10.0, faltas1B: 2, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2024100238", nome: "GABRIEL BARBOSA SARAGIOTO", n1: 9.8, n2: 9.5, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2024204619", nome: "ANA VITÓRIA SOUZA DE MATTOS", n1: 8.8, n2: 9.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2019101002", nome: "THACIANA MARGARIDA TEIXEIRA RODRIGUES", n1: 10.0, n2: 8.5, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2024100516", nome: "NATÁLIA LAZARO DE SOUZA", n1: 10.0, n2: 9.5, faltas1B: 2, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2024100465", nome: "EMILLY MARIA PEREIRA CORREIA", n1: 10.0, n2: 10.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2024100274", nome: "BEATRIZ CORREA HARRES", n1: 9.0, n2: 8.5, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2020100256", nome: "ADLER MAROLETO DOS SANTOS", n1: 5.0, n2: 10.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2024101268", nome: "RAFAELA PALMONARI ALVES DE FRANÇA", n1: 10.0, n2: 8.5, faltas1B: 1, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2024204129", nome: "FLAVIA CAMILE GARCIA ALVES", n1: 7.0, n2: 7.0, faltas1B: 4, faltas2B: 4, situacao: "Aprovado" },
  { matricula: "2023100510", nome: "GABRIEL MUHLMANN HOROCHOVEC", n1: 9.5, n2: 9.5, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2024101824", nome: "BRENDA VYTORYA PIRES ELOI DE LIMA", n1: 9.5, n2: 10.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2024102629", nome: "MARIA FERNANDA MERENCIO", n1: 10.0, n2: 10.0, faltas1B: 1, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2024101218", nome: "MARIA CLARA FONSECA BREVAL", n1: 10.0, n2: 10.0, faltas1B: 2, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2024100148", nome: "MATHEUS MOTA DE ALMEIDA", n1: 10.0, n2: 9.5, faltas1B: 1, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2024100697", nome: "MATHEUS HENRIQUE DA SILVA BATISTA", n1: 10.0, n2: 10.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2024102119", nome: "ERIC NEFHI NEVES DA SILVA", n1: 10.0, n2: 10.0, faltas1B: 2, faltas2B: 1, situacao: "Aprovado" }
];

// Period 1: Fotografia e Tratamento de Imagem (ID 16001PP) - Full Cohort of 25 students
const FOTOGRAFIA_1B_ROSTER: StudentRecord[] = [
  { matricula: "2026108633", nome: "LORENA KAWANI KRIGUER CARVALHO", n1: 9.8, n2: 4.4, faltas1B: 4, faltas2B: 4, situacao: "Aprovado" },
  { matricula: "2022202639", nome: "ADRIELEN TAIS EVANGELISTA DE MATTOS", n1: 10.0, n2: 10.0, faltas1B: 4, faltas2B: 4, situacao: "Aprovado" },
  { matricula: "2026108427", nome: "MARIA CLARA SAMPAIO GUERRA", n1: 8.5, n2: 8.0, faltas1B: 4, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026109532", nome: "OTÁVIO AUGUSTO CHUEIRI COTACHO", n1: 8.0, n2: 7.5, faltas1B: 4, faltas2B: 4, situacao: "Aprovado" },
  { matricula: "2026108238", nome: "MARIA LUIZA RICARDO BATISTA CRUZ", n1: 9.0, n2: 9.0, faltas1B: 4, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026109542", nome: "MATHEUS FERREIRA GOMES", n1: 8.5, n2: 8.0, faltas1B: 4, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2025104910", nome: "EMANUELLY BERTUAL LOPES", n1: 7.5, n2: 8.0, faltas1B: 4, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026108519", nome: "ELOISA DE OLIVEIRA DA SILVA PEREIRA", n1: 8.0, n2: 7.5, faltas1B: 4, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2025105684", nome: "HEITOR VITORINO BOSCATO", n1: 3.6, n2: 3.0, faltas1B: 4, faltas2B: 4, situacao: "Reprovado" },
  { matricula: "2026108411", nome: "HELOYSA TEIXEIRA GERMANN", n1: 5.1, n2: 9.5, faltas1B: 1, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2021206480", nome: "ANA CAROLINE MOREIRA", n1: 7.5, n2: 10.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2022202434", nome: "RAFAELE MUHLMANN DE MOURA", n1: 4.0, n2: 5.0, exameFinal: 6.0, faltas1B: 4, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2024100502", nome: "ERICK FLORENCIO MOREIRA", n1: 6.0, n2: 6.5, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026107739", nome: "JUAN CARLOS LOPES COUTINHO", n1: 8.5, n2: 9.0, faltas1B: 1, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026109197", nome: "EMILY THEODORO ROMANOW ARAUJO", n1: 8.0, n2: 8.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026108916", nome: "GIOVANNA LOPES BIZZI", n1: 9.0, n2: 8.5, faltas1B: 2, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2025005039", nome: "MARIA EDUARDA NEMETZ MORAES", n1: 7.0, n2: 7.5, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026109690", nome: "RAFAELLA CAVALCANTI", n1: 8.0, n2: 8.0, faltas1B: 4, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026108277", nome: "GABRIELA CARVALHO BARON", n1: 7.5, n2: 8.5, faltas1B: 1, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2025207198", nome: "WILLIAM RENE OLIVEIRA PARRA", n1: 4.5, n2: 5.5, exameFinal: 6.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2025207063", nome: "SABRINA HUMENHUK BUHRER", n1: 8.0, n2: 8.5, faltas1B: 1, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2026109425", nome: "RAFAELA MILENKOVICH PAVARINI NICOLETTI", n1: 7.0, n2: 7.5, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026108535", nome: "ISADORA HELENA DOS SANTOS", n1: 6.5, n2: 7.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026108076", nome: "GABRIEL MOREIRA DE MOURA", n1: 5.0, n2: 4.0, exameFinal: 5.5, faltas1B: 4, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026107730", nome: "MATEUS STEPNIOWSKI DE SOUZA", n1: 7.0, n2: 7.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" }
];

// Period 1: História e Teorias da Comunicação (ID 16047PP) - Unified 25 students
const HISTORIA_ROSTER: StudentRecord[] = [
  { matricula: "2025105684", nome: "HEITOR VITORINO BOSCATO", n1: 8.5, n2: 7.0, faltas1B: 4, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026108519", nome: "ELOISA DE OLIVEIRA DA SILVA PEREIRA", n1: 8.0, n2: 7.5, faltas1B: 1, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026108427", nome: "MARIA CLARA SAMPAIO GUERRA", n1: 7.5, n2: 8.0, faltas1B: 1, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2024100502", nome: "ERICK FLORENCIO MOREIRA", n1: 5.0, n2: 4.5, exameFinal: 6.0, faltas1B: 4, faltas2B: 4, situacao: "Aprovado" },
  { matricula: "2026107739", nome: "JUAN CARLOS LOPES COUTINHO", n1: 9.0, n2: 8.5, faltas1B: 1, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2026109197", nome: "EMILY THEODORO ROMANOW ARAUJO", n1: 8.5, n2: 8.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026108916", nome: "GIOVANNA LOPES BIZZI", n1: 9.0, n2: 9.5, faltas1B: 1, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2026108411", nome: "HELOYSA TEIXEIRA GERMANN", n1: 8.5, n2: 6.0, faltas1B: 4, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2025005039", nome: "MARIA EDUARDA NEMETZ MORAES", n1: 7.5, n2: 8.0, faltas1B: 2, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2026109690", nome: "RAFAELLA CAVALCANTI", n1: 8.0, n2: 8.5, faltas1B: 4, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026109532", nome: "OTÁVIO AUGUSTO CHUEIRI COTACHO", n1: 5.0, n2: 4.0, exameFinal: 6.0, faltas1B: 4, faltas2B: 4, situacao: "Aprovado" },
  { matricula: "2026108633", nome: "LORENA KAWANI KRIGUER CARVALHO", n1: 6.0, n2: 8.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026108277", nome: "GABRIELA CARVALHO BARON", n1: 8.0, n2: 10.0, faltas1B: 1, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2025207198", nome: "WILLIAM RENE OLIVEIRA PARRA", n1: 5.5, n2: 4.5, exameFinal: 6.0, faltas1B: 1, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2025207063", nome: "SABRINA HUMENHUK BUHRER", n1: 7.5, n2: 8.0, faltas1B: 1, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2026109542", nome: "MATHEUS FERREIRA GOMES", n1: 7.0, n2: 7.5, faltas1B: 1, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026109425", nome: "RAFAELA MILENKOVICH PAVARINI NICOLETTI", n1: 6.5, n2: 7.5, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026108535", nome: "ISADORA HELENA DOS SANTOS", n1: 6.5, n2: 7.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026108076", nome: "GABRIEL MOREIRA DE MOURA", n1: 4.5, n2: 5.0, exameFinal: 5.5, faltas1B: 2, faltas2B: 4, situacao: "Aprovado" },
  { matricula: "2026107730", nome: "MATEUS STEPNIOWSKI DE SOUZA", n1: 7.0, n2: 7.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2022202639", nome: "ADRIELEN TAIS EVANGELISTA DE MATTOS", n1: 9.5, n2: 10.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2026108238", nome: "MARIA LUIZA RICARDO BATISTA CRUZ", n1: 8.5, n2: 9.0, faltas1B: 1, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2025104910", nome: "EMANUELLY BERTUAL LOPES", n1: 7.5, n2: 8.0, faltas1B: 2, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2021206480", nome: "ANA CAROLINE MOREIRA", n1: 8.0, n2: 8.5, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2022202434", nome: "RAFAELE MUHLMANN DE MOURA", n1: 5.0, n2: 5.5, faltas1B: 4, faltas2B: 2, situacao: "Aprovado" }
];

// Period 7: Marketing de Conteúdo (ID 16097PP) & Produção Científica (16098PP)
const PERIOD7_ROSTER: StudentRecord[] = [
  { matricula: "2020100045", nome: "STEPHANNE GABRIELLE MONTEIRO CAVALHEIRO", n1: 8.0, n2: 9.0, faltas1B: 1, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2023200723", nome: "JULIA XAVIER MARTINS", n1: 0.0, n2: 0.0, faltas1B: 10, faltas2B: 10, situacao: "Reprovado por Falta" },
  { matricula: "2023201110", nome: "LUIZ FELIPE ALBUQUERQUE KAVILHUKA", n1: 8.0, n2: 8.5, faltas1B: 1, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2023200712", nome: "MARIA EDUARDA ARAUJO RODRIGUES", n1: 9.1, n2: 9.5, faltas1B: 1, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2023100182", nome: "SANTIAGO GODOI BUENO", n1: 7.6, n2: 8.5, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2023103475", nome: "EDUARDA DOS SANTOS GOMES", n1: 5.8, n2: 10.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2018102218", nome: "MARCOS FELLIPE PEREIRA DE LIMA", n1: 8.0, n2: 10.0, faltas1B: 2, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2023100953", nome: "ISABELA SHIBATA DE POL", n1: 7.0, n2: 9.0, faltas1B: 1, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2023103706", nome: "ALYSSON JULIANO MIRANDA", n1: 7.4, n2: 10.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2023200747", nome: "LAISA EMANUELLE PEREIRA PRATTO", n1: 7.2, n2: 9.0, faltas1B: 2, faltas2B: 2, situacao: "Aprovado" },
  { matricula: "2023101489", nome: "MARIA FERNANDA CAROBA RUY", n1: 9.1, n2: 10.0, faltas1B: 1, faltas2B: 1, situacao: "Aprovado" },
  { matricula: "2018203091", nome: "RICARDO RAMOS", n1: 2.3, n2: 0.0, faltas1B: 8, faltas2B: 8, situacao: "Reprovado por Falta" }
];

// Universal list of student names and RAs for robust deterministic fallback generation
const STUDENT_NAMES_POOL = [
  { RA: "2026108633", nome: "LORENA KAWANI KRIGUER CARVALHO" },
  { RA: "2022202434", nome: "RAFAELE MUHLMANN DE MOURA" },
  { RA: "2025105684", nome: "HEITOR VITORINO BOSCATO" },
  { RA: "2022202639", nome: "ADRIELEN TAIS EVANGELISTA DE MATTOS" },
  { RA: "2026108411", nome: "HELOYSA TEIXEIRA GERMANN" },
  { RA: "2021206480", nome: "ANA CAROLINE MOREIRA" },
  { RA: "2026108427", nome: "MARIA CLARA SAMPAIO GUERRA" },
  { RA: "2026109690", nome: "RAFAELLA CAVALCANTI" },
  { RA: "2026108519", nome: "ELOISA DE OLIVEIRA DA SILVA PEREIRA" },
  { RA: "2026109532", nome: "OTÁVIO AUGUSTO CHUEIRI COTACHO" },
  { RA: "2026108238", nome: "MARIA LUIZA RICARDO BATISTA CRUZ" },
  { RA: "2024100502", nome: "ERICK FLORENCIO MOREIRA" },
  { RA: "2026107739", nome: "JUAN CARLOS LOPES COUTINHO" },
  { RA: "2026109197", nome: "EMILY THEODORO ROMANOW ARAUJO" },
  { RA: "2026108916", nome: "GIOVANNA LOPES BIZZI" },
  { RA: "2026109542", nome: "MATHEUS FERREIRA GOMES" },
  { RA: "2025104910", nome: "EMANUELLY BERTUAL LOPES" },
  { RA: "2025005039", nome: "MARIA EDUARDA NEMETZ MORAES" },
  { RA: "2026108277", nome: "GABRIELA CARVALHO BARON" },
  { RA: "2025207198", nome: "WILLIAM RENE OLIVEIRA PARRA" },
  { RA: "2025207063", nome: "SABRINA HUMENHUK BUHRER" },
  { RA: "2025104913", nome: "LUIZA SANTOS BLEMER" },
  { RA: "2025105123", nome: "EDUARDA CRISTINA SANTOS" },
  { RA: "2025104914", nome: "VICTOR HENRIQUE DA SILVA PEDROSO" },
  { RA: "2025105242", nome: "BIANCA BEATRIZ MAXIMIANO TABORDA" },
  { RA: "2024102164", nome: "VITOR BLOCK HILARIO" },
  { RA: "2023200579", nome: "PEDRO FAZOLO VIEIRA" },
  { RA: "2025207066", nome: "NATHALI CRISTINE DE OLIVEIRA LOPES" },
  { RA: "2025105252", nome: "ISABELLA RUDEK NASCIMENTO" },
  { RA: "2025104938", nome: "MARIA EDUARDA DE PAULA FERNANDES" },
  { RA: "2025105410", nome: "BERNARDO NIFA DE SOUZA" }
];

export function getRosterForDiscipline(disciplineId: string): StudentRecord[] {
  // Return an empty array by default as we are now using a step-by-step spreadsheet uploading system
  return [];
}
