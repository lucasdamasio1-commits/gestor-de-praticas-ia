import React, { useState, useEffect } from "react";
import { Discipline } from "../types";
import { getRosterForDiscipline, StudentRecord } from "../data/studentsData";
import * as XLSX from "xlsx";
import { 
  Users, 
  BookOpen, 
  UserPlus, 
  Trash2, 
  FileSpreadsheet, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  RotateCcw, 
  BrainCircuit,
  Search,
  Filter,
  Sliders,
  CheckCircle2,
  Printer,
  Minus,
  Plus,
  Upload,
  Download
} from "lucide-react";

function parseDateValue(dateStr: any): Date {
  if (dateStr === null || dateStr === undefined) return new Date(0);
  if (dateStr instanceof Date) return dateStr;
  const str = String(dateStr).trim();
  if (!str) return new Date(0);
  
  // Try DD/MM/YYYY with optional time
  const dmYMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (dmYMatch) {
    let day = parseInt(dmYMatch[1], 10);
    let month = parseInt(dmYMatch[2], 10) - 1; // 0-indexed
    let year = parseInt(dmYMatch[3], 10);
    if (year < 100) year += 2000; // handle 2-digit years
    
    // Check if time is present
    const timeMatch = str.match(/(\d{1,2}):(\d{1,2}):?(\d{1,2})?/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      return new Date(year, month, day, hours, minutes, seconds);
    }
    return new Date(year, month, day);
  }
  
  // Standard JS parsing fallback
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    return new Date(parsed);
  }
  return new Date(0);
}

function normalizeGrade(val: any): number | undefined {
  if (val === undefined || val === null || val === "") return undefined;
  const num = parseFloat(String(val).replace(",", "."));
  if (isNaN(num)) return undefined;
  if (num > 10) {
    // If it's on a 0-100 scale, normalize to 0-10 scale
    return Math.min(10, Math.max(0, parseFloat((num / 10).toFixed(2))));
  }
  return Math.min(10, Math.max(0, parseFloat(num.toFixed(2))));
}

interface StudentControlProps {
  disciplines: Discipline[];
  onImportNewDisciplines?: (newDisList: { id: string; nome: string }[]) => void;
}

export default function StudentControl({ disciplines, onImportNewDisciplines }: StudentControlProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>("");
  const [studentsData, setStudentsData] = useState<Record<string, StudentRecord[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "APROVADO" | "RECUPERACAO" | "REPROVADO">("ALL");
  
  // Student Form State
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentMatricula, setNewStudentMatricula] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // IA Recommendations State
  const [aiTip, setAiTip] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  // Filter disciplines by period
  const filteredDisciplines = disciplines.filter(d => d.periodo === selectedPeriod);

  // Automatically select the first discipline when the period changes
  useEffect(() => {
    if (filteredDisciplines.length > 0) {
      const matches = filteredDisciplines.some(d => d.id === selectedDisciplineId);
      if (!matches) {
        setSelectedDisciplineId(filteredDisciplines[0].id);
      }
    } else {
      setSelectedDisciplineId("");
    }
  }, [selectedPeriod, filteredDisciplines]);

  // Load students data from localStorage
  useEffect(() => {
    const cached = localStorage.getItem("unibrasil_pp_student_grades_v5");
    if (cached) {
      try {
        setStudentsData(JSON.parse(cached));
      } catch (e) {
        console.error("Erro ao carregar dados dos alunos", e);
      }
    } else {
      setStudentsData({});
    }
  }, []);

  // Get active discipline details
  const activeDiscipline = disciplines.find(d => d.id === selectedDisciplineId);

  // Get student list for selected discipline, initialize if empty
  const currentStudents: StudentRecord[] = React.useMemo(() => {
    if (!selectedDisciplineId) return [];
    
    const rawRoster = studentsData[selectedDisciplineId] || getRosterForDiscipline(selectedDisciplineId);
    
    return rawRoster.map(st => {
      const n1 = normalizeGrade(st.n1);
      const n2 = normalizeGrade(st.n2);
      const exameFinal = normalizeGrade(st.exameFinal);
      const f1Val = st.faltas1B !== undefined && st.faltas1B !== null && !isNaN(Number(st.faltas1B)) ? Math.max(0, Number(st.faltas1B)) : undefined;
      const f2Val = st.faltas2B !== undefined && st.faltas2B !== null && !isNaN(Number(st.faltas2B)) ? Math.max(0, Number(st.faltas2B)) : undefined;

      const healed: StudentRecord = {
        ...st,
        n1,
        n2,
        exameFinal,
        faltas1B: f1Val,
        faltas2B: f2Val
      };
      
      const ch = activeDiscipline ? activeDiscipline.ch : 80;
      return recalculateSituation(healed, ch);
    });
  }, [selectedDisciplineId, studentsData, activeDiscipline]);

  // Save changes helper
  const saveStudents = (updatedRecords: StudentRecord[]) => {
    if (!selectedDisciplineId) return;
    const newData = {
      ...studentsData,
      [selectedDisciplineId]: updatedRecords
    };
    setStudentsData(newData);
    localStorage.setItem("unibrasil_pp_student_grades_v5", JSON.stringify(newData));
  };

  // Reset current discipline grades to empty
  const handleResetGrades = () => {
    if (window.confirm("Deseja realmente apagar todos os alunos e notas desta disciplina para recomeçar do zero?")) {
      saveStudents([]);
      setAiTip("");
    }
  };

  // Reset entire course data to empty
  const handleResetAllData = () => {
    if (window.confirm("Deseja apagar os dados de TODAS as disciplinas e redefinir o diário para o estado inicial vazio?")) {
      setStudentsData({});
      localStorage.removeItem("unibrasil_pp_student_grades_v5");
      setAiTip("");
    }
  };

  // Recalculate situation helper
  function recalculateSituation(st: StudentRecord, customCH?: number): StudentRecord {
    const n1Val = normalizeGrade(st.n1) ?? null;
    const n2Val = normalizeGrade(st.n2) ?? null;
    
    if (n1Val === null && n2Val === null) {
      return { ...st, situacao: "Aprovado" };
    }

    let mediaSemestral = 0;
    if (n1Val !== null && n2Val !== null) {
      mediaSemestral = (n1Val + n2Val) / 2;
    } else if (n1Val !== null) {
      mediaSemestral = n1Val;
    } else if (n2Val !== null) {
      mediaSemestral = n2Val;
    }

    const f1Val = st.faltas1B !== undefined && !isNaN(Number(st.faltas1B)) ? Number(st.faltas1B) : 0;
    const f2Val = st.faltas2B !== undefined && !isNaN(Number(st.faltas2B)) ? Number(st.faltas2B) : 0;
    const totalFaltas = f1Val + f2Val;
    const ch = customCH !== undefined ? customCH : (activeDiscipline ? activeDiscipline.ch : 80);
    const freq = ((ch - totalFaltas) / ch) * 100;

    let situacao: StudentRecord["situacao"] = "Aprovado";
    if (st.situacao !== "Desistente" && st.situacao !== "Matrícula Trancada" && st.situacao !== "Transferido") {
      if (freq < 75) {
        situacao = "Reprovado por Falta";
      } else if (mediaSemestral >= 6.0) {
        situacao = "Aprovado";
      } else if (mediaSemestral >= 4.0) {
        const examVal = normalizeGrade(st.exameFinal);
        if (examVal !== undefined) {
          const mediaFinal = (mediaSemestral + examVal) / 2;
          situacao = mediaFinal >= 5.0 ? "Aprovado" : "Reprovado";
        } else {
          situacao = "Exame";
        }
      } else {
        situacao = "Reprovado";
      }
    } else {
      situacao = st.situacao;
    }

    return { ...st, situacao };
  }

  // Generate and download a sample template in CSV format
  const downloadTemplate = (type: "1B" | "2B" | "TOTAL") => {
    let headers: string[] = [];
    let rows: string[][] = [];
    
    if (type === "1B") {
      headers = ["Matricula", "Nome", "Nota 1B", "Faltas 1B"];
      rows = [
        ["2026108633", "LORENA KAWANI KRIGUER CARVALHO", "9.8", "4"],
        ["2022202639", "ADRIELEN TAIS EVANGELISTA DE MATTOS", "10.0", "4"],
        ["2025105684", "HEITOR VITORINO BOSCATO", "3.6", "4"]
      ];
    } else if (type === "2B") {
      headers = ["Matricula", "Nome", "Nota 2B", "Faltas 2B"];
      rows = [
        ["2026108633", "LORENA KAWANI KRIGUER CARVALHO", "4.4", "4"],
        ["2022202639", "ADRIELEN TAIS EVANGELISTA DE MATTOS", "10.0", "4"],
        ["2025105684", "HEITOR VITORINO BOSCATO", "3.0", "4"]
      ];
    } else {
      headers = ["Matricula", "Nome", "Nota 1B", "Faltas 1B", "Nota 2B", "Faltas 2B", "Exame Final"];
      rows = [
        ["2026108633", "LORENA KAWANI KRIGUER CARVALHO", "9.8", "4", "4.4", "4", ""],
        ["2022202639", "ADRIELEN TAIS EVANGELISTA DE MATTOS", "10.0", "4", "10.0", "4", ""],
        ["2025105684", "HEITOR VITORINO BOSCATO", "3.6", "4", "3.0", "4", ""],
        ["2022202434", "RAFAELE MUHLMANN DE MOURA", "4.0", "4", "5.0", "2", "6.0"]
      ];
    }

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `modelo_diario_${type.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process imported rows from XLSX/CSV files and automatically group/distribute them by discipline
  const processImportedData = (rows: any[], type: "1B" | "2B" | "TOTAL") => {
    if (!rows || rows.length === 0) {
      alert("Planilha vazia ou sem registros válidos.");
      return;
    }

    // Work on a copy of the whole studentsData dictionary
    const newStudentsData = { ...studentsData };
    const importedDisciplinesMap: Record<string, { nome: string; ch?: number }> = {}; // CODDISC -> {nome, ch}

    let addedCount = 0;
    let updatedCount = 0;

    interface ParsedRow {
      matricula: string;
      nome: string;
      coddisc: string;
      disciplinaNome: string;
      ch?: number;
      n1?: number;
      n2?: number;
      faltas1B?: number;
      faltas2B?: number;
      exameFinal?: number;
      dataInfo?: Date;
      rawBimestre?: string;
    }

    // Sets to track students that must be removed/excluded for each discipline (coddisc) due to classifications like 'Matrícula Trancada', 'Desistente', etc.
    const exclusionsByDiscipline = new Map<string, { matriculas: Set<string>; nomes: Set<string> }>();

    const addExclusion = (coddiscId: string, mat: string, name: string) => {
      const discKey = coddiscId.toUpperCase();
      if (!exclusionsByDiscipline.has(discKey)) {
        exclusionsByDiscipline.set(discKey, { matriculas: new Set(), nomes: new Set() });
      }
      const ex = exclusionsByDiscipline.get(discKey)!;
      if (mat) ex.matriculas.add(mat.toUpperCase());
      if (name) ex.nomes.add(name.toUpperCase());
    };

    // Parse all rows
    const parsedRows: ParsedRow[] = [];

    rows.forEach((row: any) => {
      const keys = Object.keys(row);
      
      // 1. Look for Student Identification (Matricula/RA and Name)
      const matriculaKey = keys.find(k => 
        /^(ra|matricula|id|registro|registration|codigo|código|matricula_aluno|ra_aluno)$/i.test(k.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      );
      
      const nameKey = keys.find(k => 
        /^(nome|aluno|estudante|name|student|nome_aluno)$/i.test(k.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      );

      if (!matriculaKey && !nameKey) return; // Skip if it's a metadata row or doesn't have student info

      const matricula = matriculaKey ? String(row[matriculaKey]).trim() : `IMP-${Math.floor(Math.random() * 100000)}`;
      const nome = nameKey ? String(row[nameKey]).trim().toUpperCase() : `ALUNO SEM NOME (${matricula})`;

      // 2. Identify the discipline (CODDISC & DISCIPLINA)
      const coddiscKey = keys.find(k => 
        /^(coddisc|cod_disc|codigo_disciplina|codigo da disciplina|cod\.disc|cod_disciplina)$/i.test(k.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      );
      const disciplinaKey = keys.find(k => 
        /^(disciplina|nome_disciplina|nome da disciplina|disciplina_nome)$/i.test(k.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      );

      let coddisc = coddiscKey ? String(row[coddiscKey]).trim() : undefined;
      let disciplinaNome = disciplinaKey ? String(row[disciplinaKey]).trim() : undefined;

      // If both are missing, fallback to the currently active discipline
      if (!coddisc && !disciplinaNome) {
        if (selectedDisciplineId) {
          coddisc = selectedDisciplineId;
          disciplinaNome = activeDiscipline?.nome;
        } else {
          return; // Skip since we have no way to associate this row
        }
      }

      // Try to find if this discipline is already registered in our active list
      let matchedDiscipline = disciplines.find(d => d.id.toUpperCase() === coddisc?.toUpperCase());
      if (!matchedDiscipline && disciplinaNome) {
        matchedDiscipline = disciplines.find(d => d.nome.toUpperCase() === disciplinaNome?.toUpperCase());
      }

      const finalCoddisc = matchedDiscipline ? matchedDiscipline.id : (coddisc || `DISC-${Math.floor(Math.random() * 100)}`);
      const finalDisciplinaNome = matchedDiscipline ? matchedDiscipline.nome : (disciplinaNome || `Disciplina ${finalCoddisc}`);

      // Check for excluded classifications (SITUACAODISCIPLINA / SITUACAONADISCIPLINA)
      const statusKey = keys.find(k => 
        /^(situacaodisciplina|situacaonadisciplina|situacao|situacao_disciplina|situacao_na_disciplina|status)$/i.test(k.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      );
      
      let isExcludedStudent = false;
      if (statusKey && row[statusKey] !== undefined && row[statusKey] !== null) {
        const statusVal = String(row[statusKey]).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const excludedTerms = [
          "anulado",
          "pre-matriculado",
          "pre matriculado",
          "pre-matricula portal calour",
          "pre matricula portal calour",
          "pre-matricula portal calouro",
          "pre matricula portal calouro",
          "matricula trancada",
          "transferido de curso",
          "desistente",
          "classificado processos seletivo",
          "classificado processo seletivo"
        ];
        if (excludedTerms.some(term => statusVal === term || statusVal.includes(term))) {
          isExcludedStudent = true;
        }
      }

      if (isExcludedStudent) {
        addExclusion(finalCoddisc, matricula, nome);
        return; // Skip this row!
      }

      // Helper to find numeric value
      const findValue = (patterns: RegExp[]) => {
        const matchKey = keys.find(k => patterns.some(p => p.test(k.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))));
        if (matchKey && row[matchKey] !== undefined && row[matchKey] !== "") {
          const parsed = parseFloat(String(row[matchKey]).replace(",", "."));
          return isNaN(parsed) ? undefined : parsed;
        }
        return undefined;
      };

      // Extract CH if present
      const ch = findValue([/^ch$/i, /^carga horaria$/i, /^carga_horaria$/i, /^carga horaria da disciplina$/i]);

      // If it's a completely new discipline code, collect it so we can register it dynamically
      if (!matchedDiscipline && coddisc) {
        importedDisciplinesMap[finalCoddisc] = { nome: finalDisciplinaNome, ch };
      }

      // Extract Date if present
      const dataKey = keys.find(k => /^(data|data_info|data da informacao|data_cadastro|data_insercao)$/i.test(k.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
      const dataInfo = dataKey ? parseDateValue(row[dataKey]) : undefined;

      // Extract Bimestre if present
      const bimestreKey = keys.find(k => /^(bimestre|periodo_bimestre)$/i.test(k.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
      let rowBimestre: "1B" | "2B" | undefined = undefined;
      if (bimestreKey && row[bimestreKey] !== undefined) {
        const bimStr = String(row[bimestreKey]).trim().toLowerCase();
        if (bimStr.includes("1") || bimStr.includes("primeiro") || bimStr.includes("1o") || bimStr.includes("1º")) {
          rowBimestre = "1B";
        } else if (bimStr.includes("2") || bimStr.includes("segundo") || bimStr.includes("2o") || bimStr.includes("2º")) {
          rowBimestre = "2B";
        }
      }

      const targetBimestre = rowBimestre || (type === "TOTAL" ? undefined : type);

      // Extract grades
      const n1 = normalizeGrade(findValue([/^(notabimestre1|nota 1b|nota 1|n1|1b|primeiro bimestre)$/i]));
      const n2 = normalizeGrade(findValue([/^(notabimestre2|nota 2b|nota 2|n2|2b|segundo bimestre)$/i]));
      const examValue = normalizeGrade(findValue([/^(notaexame|exame|exame final|nota exame|ef)$/i]));

      // If there's a generic "nota" column and we know the bimestre
      const genericNota = normalizeGrade(findValue([/^nota$/i, /^nota_valor$/i]));
      let finalN1 = n1;
      let finalN2 = n2;
      if (genericNota !== undefined) {
        if (targetBimestre === "1B") finalN1 = genericNota;
        else if (targetBimestre === "2B") finalN2 = genericNota;
        else {
          if (type === "1B") finalN1 = genericNota;
          else if (type === "2B") finalN2 = genericNota;
        }
      }

      // Extract absences
      const f1 = findValue([/^(faltas 1b|faltas 1|f1|absences 1b)$/i]);
      const f2 = findValue([/^(faltas 2b|faltas 2|f2|absences 2b)$/i]);
      const genericFaltas = findValue([/^faltas$/i, /^falta$/i, /^absences$/i]);

      let finalF1 = f1;
      let finalF2 = f2;
      if (genericFaltas !== undefined) {
        if (targetBimestre === "1B") finalF1 = genericFaltas;
        else if (targetBimestre === "2B") finalF2 = genericFaltas;
        else {
          if (type === "1B") finalF1 = genericFaltas;
          else if (type === "2B") finalF2 = genericFaltas;
        }
      }

      parsedRows.push({
        matricula,
        nome,
        coddisc: finalCoddisc,
        disciplinaNome: finalDisciplinaNome,
        ch,
        n1: finalN1,
        n2: finalN2,
        faltas1B: finalF1,
        faltas2B: finalF2,
        exameFinal: examValue,
        dataInfo,
        rawBimestre: rowBimestre || type
      });
    });

    // 3. Resolve duplicates within the imported list for each (matricula, coddisc)
    const groupedMap: Record<string, ParsedRow[]> = {};
    parsedRows.forEach(p => {
      const key = `${p.matricula}_${p.coddisc}`.toUpperCase();
      if (!groupedMap[key]) {
        groupedMap[key] = [];
      }
      groupedMap[key].push(p);
    });

    const consolidatedRows: ParsedRow[] = [];

    Object.values(groupedMap).forEach(list => {
      if (list.length === 1) {
        consolidatedRows.push(list[0]);
        return;
      }

      const first = list[0];
      const merged: ParsedRow = {
        matricula: first.matricula,
        nome: first.nome,
        coddisc: first.coddisc,
        disciplinaNome: first.disciplinaNome,
        ch: list.find(x => x.ch !== undefined)?.ch
      };

      // --- GRADES CONSOLIDATION (Take the maximum score) ---
      let maxN1: number | undefined = undefined;
      let maxN2: number | undefined = undefined;
      let maxExame: number | undefined = undefined;

      list.forEach(item => {
        if (item.n1 !== undefined) {
          if (maxN1 === undefined || item.n1 > maxN1) maxN1 = item.n1;
        }
        if (item.n2 !== undefined) {
          if (maxN2 === undefined || item.n2 > maxN2) maxN2 = item.n2;
        }
        if (item.exameFinal !== undefined) {
          if (maxExame === undefined || item.exameFinal > maxExame) maxExame = item.exameFinal;
        }
      });

      merged.n1 = maxN1;
      merged.n2 = maxN2;
      merged.exameFinal = maxExame;

      // --- FALTAS CONSOLIDATION (Take the most recent based on DATA column) ---
      const entries1B = list.filter(x => x.faltas1B !== undefined);
      const entries2B = list.filter(x => x.faltas2B !== undefined);

      if (entries1B.length > 0) {
        entries1B.sort((a, b) => {
          const tA = a.dataInfo ? a.dataInfo.getTime() : 0;
          const tB = b.dataInfo ? b.dataInfo.getTime() : 0;
          return tB - tA;
        });
        merged.faltas1B = entries1B[0].faltas1B;
      }

      if (entries2B.length > 0) {
        entries2B.sort((a, b) => {
          const tA = a.dataInfo ? a.dataInfo.getTime() : 0;
          const tB = b.dataInfo ? b.dataInfo.getTime() : 0;
          return tB - tA;
        });
        merged.faltas2B = entries2B[0].faltas2B;
      }

      consolidatedRows.push(merged);
    });

    const filteredConsolidatedRows = consolidatedRows.filter(parsed => {
      const ex = exclusionsByDiscipline.get(parsed.coddisc.toUpperCase());
      if (ex) {
        if (parsed.matricula && ex.matriculas.has(parsed.matricula.toUpperCase())) return false;
        if (parsed.nome && ex.nomes.has(parsed.nome.toUpperCase())) return false;
      }
      return true;
    });

    // 4. Now merge the consolidated rows into our state copy
    filteredConsolidatedRows.forEach(parsed => {
      // Initialize list of students for this discipline in our copy if not present
      if (!newStudentsData[parsed.coddisc]) {
        const existingInState = studentsData[parsed.coddisc];
        newStudentsData[parsed.coddisc] = existingInState ? [...existingInState] : [];
      }

      const discStudents = newStudentsData[parsed.coddisc];

      // Try to find if this student already exists in this discipline's roster
      let existingIndex = discStudents.findIndex(st => st.matricula === parsed.matricula);
      if (existingIndex === -1) {
        existingIndex = discStudents.findIndex(st => st.nome.toUpperCase() === parsed.nome.toUpperCase());
      }

      // Determine correct workload (CH)
      const matchedDiscipline = disciplines.find(d => d.id.toUpperCase() === parsed.coddisc.toUpperCase());
      const ch = parsed.ch !== undefined ? parsed.ch : (matchedDiscipline ? matchedDiscipline.ch : 80);

      if (existingIndex !== -1) {
        // Merge with existing record
        const current = discStudents[existingIndex];
        let updatedRecord = { ...current };

        if (type === "1B") {
          if (parsed.n1 !== undefined) updatedRecord.n1 = parsed.n1;
          if (parsed.faltas1B !== undefined) updatedRecord.faltas1B = Math.max(0, Math.round(parsed.faltas1B));
        } else if (type === "2B") {
          if (parsed.n2 !== undefined) updatedRecord.n2 = parsed.n2;
          if (parsed.faltas2B !== undefined) updatedRecord.faltas2B = Math.max(0, Math.round(parsed.faltas2B));
        } else {
          // TOTAL
          if (parsed.n1 !== undefined) updatedRecord.n1 = parsed.n1;
          if (parsed.n2 !== undefined) updatedRecord.n2 = parsed.n2;
          if (parsed.faltas1B !== undefined) updatedRecord.faltas1B = Math.max(0, Math.round(parsed.faltas1B));
          if (parsed.faltas2B !== undefined) updatedRecord.faltas2B = Math.max(0, Math.round(parsed.faltas2B));
          if (parsed.exameFinal !== undefined) updatedRecord.exameFinal = parsed.exameFinal;
        }

        updatedRecord = recalculateSituation(updatedRecord, ch);
        discStudents[existingIndex] = updatedRecord;
        updatedCount++;
      } else {
        // Add new student
        let newRecord: StudentRecord = {
          matricula: parsed.matricula,
          nome: parsed.nome,
          n1: type === "2B" ? undefined : parsed.n1,
          n2: type === "1B" ? undefined : parsed.n2,
          faltas1B: type === "2B" ? undefined : (parsed.faltas1B !== undefined ? Math.max(0, Math.round(parsed.faltas1B)) : undefined),
          faltas2B: type === "1B" ? undefined : (parsed.faltas2B !== undefined ? Math.max(0, Math.round(parsed.faltas2B)) : undefined),
          exameFinal: type === "TOTAL" ? parsed.exameFinal : undefined,
          situacao: "Aprovado"
        };

        newRecord = recalculateSituation(newRecord, ch);
        discStudents.push(newRecord);
        addedCount++;
      }
    });

    // 5. Remove any existing students from the state if they have been marked with an excluded status in this CSV
    exclusionsByDiscipline.forEach((ex, exCoddisc) => {
      if (newStudentsData[exCoddisc]) {
        const initialLen = newStudentsData[exCoddisc].length;
        newStudentsData[exCoddisc] = newStudentsData[exCoddisc].filter(student => {
          const matMatch = student.matricula && ex.matriculas.has(student.matricula.toUpperCase());
          const nameMatch = student.nome && ex.nomes.has(student.nome.toUpperCase());
          return !(matMatch || nameMatch);
        });
        const removed = initialLen - newStudentsData[exCoddisc].length;
        if (removed > 0) {
          console.log(`Excluídos ${removed} alunos com classificação inválida (ex: Trancado, Desistente) da disciplina ${exCoddisc}`);
        }
      }
    });

    // Send newly discovered disciplines to parent component so they are added to the general course database
    const newDisciplinesToImport = Object.entries(importedDisciplinesMap).map(([id, info]) => ({
      id,
      nome: info.nome,
      ch: info.ch
    }));
    if (newDisciplinesToImport.length > 0 && onImportNewDisciplines) {
      onImportNewDisciplines(newDisciplinesToImport);
    }

    // Save complete grouped state
    setStudentsData(newStudentsData);
    localStorage.setItem("unibrasil_pp_student_grades_v5", JSON.stringify(newStudentsData));

    alert(`Importação concluída com sucesso!\n\nAlunos novos distribuídos: ${addedCount}\nAlunos atualizados: ${updatedCount}\n\nAs faltas e notas foram divididas e processadas automaticamente seguindo as novas regras de datas e notas máximas!`);
  };

  // Read upload files using SheetJS
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "1B" | "2B" | "TOTAL") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        processImportedData(jsonData, type);
        
        // Reset file input value to allow uploading same file name again
        e.target.value = "";
      } catch (error) {
        alert("Erro ao ler a planilha. Certifique-se de que é um arquivo Excel (.xlsx, .xls) ou CSV válido.");
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Update specific student field
  const handleUpdateStudentField = (matricula: string, field: keyof StudentRecord, value: any) => {
    const updated = currentStudents.map(st => {
      if (st.matricula === matricula) {
        let parsedVal = value;
        if (field === "n1" || field === "n2" || field === "exameFinal") {
          if (value === "" || value === undefined || value === null) {
            parsedVal = undefined;
          } else {
            parsedVal = parseFloat(value);
            if (isNaN(parsedVal)) {
              parsedVal = undefined;
            } else {
              parsedVal = Math.min(10, Math.max(0, parsedVal));
            }
          }
        } else if (field === "faltas1B" || field === "faltas2B") {
          if (value === "" || value === undefined || value === null) {
            parsedVal = undefined;
          } else {
            parsedVal = parseInt(value);
            if (isNaN(parsedVal)) {
              parsedVal = undefined;
            } else {
              const maxFaltas = activeDiscipline ? activeDiscipline.ch / 2 : 40;
              parsedVal = Math.min(maxFaltas, Math.max(0, parsedVal));
            }
          }
        }
        
        // Recalculate situation dynamically upon changes
        const nextRecord = { ...st, [field]: parsedVal };
        const ch = activeDiscipline ? activeDiscipline.ch : 80;
        return recalculateSituation(nextRecord, ch);
      }
      return st;
    });
    saveStudents(updated);
  };

  // Delete a student from the active discipline roster
  const handleDeleteStudent = (matricula: string) => {
    if (window.confirm("Remover o aluno deste diário de classe?")) {
      const updated = currentStudents.filter(st => st.matricula !== matricula);
      saveStudents(updated);
    }
  };

  // Add student to the active discipline
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentMatricula.trim()) return;

    if (currentStudents.some(st => st.matricula === newStudentMatricula.trim())) {
      alert("Já existe um aluno com esta matrícula nesta disciplina.");
      return;
    }

    const newStudent: StudentRecord = {
      matricula: newStudentMatricula.trim(),
      nome: newStudentName.trim().toUpperCase(),
      n1: 7.0,
      n2: 7.0,
      faltas1B: 0,
      faltas2B: 0,
      situacao: "Aprovado"
    };

    const updated = [...currentStudents, newStudent];
    saveStudents(updated);

    setNewStudentName("");
    setNewStudentMatricula("");
    setShowAddForm(false);
  };

  // Helper to determine status style
  const getStatusLabelAndColor = (situacao: string) => {
    switch (situacao) {
      case "Aprovado":
        return { label: "Aprovado", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "Exame":
        return { label: "Exame", color: "bg-amber-100 text-amber-800 border-amber-200" };
      case "Reprovado por Falta":
        return { label: "Reprovado (Falta)", color: "bg-rose-100 text-rose-800 border-rose-200 font-bold" };
      case "Reprovado":
        return { label: "Reprovado", color: "bg-rose-100 text-rose-800 border-rose-200" };
      case "Desistente":
        return { label: "Desistente", color: "bg-slate-100 text-slate-500 border-slate-200 italic" };
      case "Matrícula Trancada":
        return { label: "Trancado", color: "bg-slate-100 text-slate-500 border-slate-200 italic" };
      case "Transferido":
        return { label: "Transferido", color: "bg-blue-50 text-blue-600 border-blue-100 italic" };
      default:
        return { label: situacao, color: "bg-slate-100 text-slate-800 border-slate-200" };
    }
  };

  // Stats Calculations for active discipline (integrated 20261 results)
  const stats = React.useMemo(() => {
    const activeStudents = currentStudents.filter(st => st.situacao !== "Desistente" && st.situacao !== "Matrícula Trancada" && st.situacao !== "Transferido");
    if (activeStudents.length === 0) return { avgGrade: 0, avgFreq: 0, approved: 0, exam: 0, failed: 0, failedFreq: 0 };
    
    let sumGrades = 0;
    let sumFreq = 0;
    let approved = 0;
    let exam = 0;
    let failed = 0;
    let failedFreq = 0;
    let studentsWithGradesCount = 0;

    activeStudents.forEach(st => {
      const n1Val = normalizeGrade(st.n1) ?? null;
      const n2Val = normalizeGrade(st.n2) ?? null;
      
      let mediaSemestral = 0;
      let hasGrades = false;
      if (n1Val !== null && n2Val !== null) {
        mediaSemestral = (n1Val + n2Val) / 2;
        hasGrades = true;
      } else if (n1Val !== null) {
        mediaSemestral = n1Val;
        hasGrades = true;
      } else if (n2Val !== null) {
        mediaSemestral = n2Val;
        hasGrades = true;
      }

      let finalGrade = mediaSemestral;
      const exameVal = normalizeGrade(st.exameFinal) ?? null;
      if (hasGrades) {
        if (mediaSemestral >= 4.0 && mediaSemestral < 6.0 && exameVal !== null) {
          finalGrade = (mediaSemestral + exameVal) / 2;
        }
        sumGrades += finalGrade;
        studentsWithGradesCount++;
      }

      const f1Val = st.faltas1B !== undefined && st.faltas1B !== null && !isNaN(Number(st.faltas1B)) ? Math.max(0, Number(st.faltas1B)) : 0;
      const f2Val = st.faltas2B !== undefined && st.faltas2B !== null && !isNaN(Number(st.faltas2B)) ? Math.max(0, Number(st.faltas2B)) : 0;
      const totalFaltas = f1Val + f2Val;
      const ch = activeDiscipline ? activeDiscipline.ch : 80;
      const freq = Math.max(0, Math.min(100, ((ch - totalFaltas) / ch) * 100));
      sumFreq += freq;

      if (st.situacao === "Aprovado") approved++;
      else if (st.situacao === "Exame") exam++;
      else if (st.situacao === "Reprovado por Falta") failedFreq++;
      else if (st.situacao === "Reprovado") failed++;
    });

    return {
      avgGrade: studentsWithGradesCount > 0 ? (sumGrades / studentsWithGradesCount) : 0,
      avgFreq: sumFreq / activeStudents.length,
      approved,
      exam,
      failed: failed + failedFreq,
      failedFreq
    };
  }, [currentStudents, activeDiscipline]);

  // Filter students based on search and selected situation
  const filteredStudents = currentStudents.filter(st => {
    const matchesSearch = st.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          st.matricula.includes(searchQuery);
    
    if (!matchesSearch) return false;
    if (statusFilter === "ALL") return true;
    if (statusFilter === "APROVADO") return st.situacao === "Aprovado";
    if (statusFilter === "RECUPERACAO") return st.situacao === "Exame";
    if (statusFilter === "REPROVADO") return st.situacao === "Reprovado" || st.situacao === "Reprovado por Falta";
    return true;
  });

  // Consult Gemini AI Pedagogical Advisor
  const handleConsultAiAdvisor = async () => {
    setLoadingAi(true);
    setAiTip("");

    try {
      const studentPerformanceString = currentStudents.map(st => {
        const n1Val = st.n1 !== undefined ? st.n1 : null;
        const n2Val = st.n2 !== undefined ? st.n2 : null;
        let mediaVal = 0;
        let hasGrades = false;
        if (n1Val !== null && n2Val !== null) {
          mediaVal = (n1Val + n2Val) / 2;
          hasGrades = true;
        } else if (n1Val !== null) {
          mediaVal = n1Val;
          hasGrades = true;
        } else if (n2Val !== null) {
          mediaVal = n2Val;
          hasGrades = true;
        }
        const mediaStr = hasGrades ? mediaVal.toFixed(1) : "-";

        const ch = activeDiscipline ? activeDiscipline.ch : 80;
        const f1Val = st.faltas1B !== undefined ? st.faltas1B : 0;
        const f2Val = st.faltas2B !== undefined ? st.faltas2B : 0;
        const totalFaltas = f1Val + f2Val;
        const freq = (((ch - totalFaltas) / ch) * 100).toFixed(0);
        return `${st.nome} (RA: ${st.matricula}, Notas: N1=${st.n1 !== undefined ? st.n1 : "-"}, N2=${st.n2 !== undefined ? st.n2 : "-"}, Média Semestral: ${mediaStr}, Faltas Totais: ${totalFaltas} [1ºB: ${st.faltas1B !== undefined ? st.faltas1B : 0}, 2ºB: ${st.faltas2B !== undefined ? st.faltas2B : 0}], Presença: ${freq}%, Situação: ${st.situacao})`;
      }).join("\n");

      const prompt = `Como assessor pedagógico do colegiado de Comunicação Social (Coordenador Lucas Damasio), analise os diários oficiais do Semestre 2026/1 da disciplina de "${activeDiscipline?.nome || "Componente Curricular"}".
Abaixo estão as notas bimestrais, faltas e situação oficial de cada aluno:

${studentPerformanceString}

Por favor, forneça um diagnóstico profissional contendo:
1. Resumo analítico do rendimento e assiduidade da turma (Média de Notas e Frequência Geral).
2. Destaque para Alunos em Risco de Reprovação (Frequência abaixo de 75% ou Média abaixo de 6.0).
3. Sugestão de duas estratégias de reforço acadêmico específicas para esta disciplina que o colegiado pode aplicar para melhorar a retenção.

Escreva em português claro, objetivo e formatado com marcadores.`;

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      if (response.ok) {
        const data = await response.json();
        setAiTip(data.text);
      } else {
        setAiTip("Erro ao consultar o Assistente IA. Por favor, tente novamente.");
      }
    } catch (err) {
      console.error(err);
      setAiTip("Não foi possível conectar ao servidor de IA neste momento.");
    } finally {
      setLoadingAi(false);
    }
  };

  // Simulate print view
  const handlePrint = () => {
    window.print();
  };

  // Export current list to CSV file
  const handleExportCSV = () => {
    if (!activeDiscipline) return;
    
    const headers = ["Matricula", "Nome", "Nota 1B", "Faltas 1B", "Nota 2B", "Faltas 2B", "Media Semestre", "Exame Final", "Media Final", "Faltas Totais", "Frequencia (%)", "Situacao"];
    const rows = currentStudents.map(st => {
      const n1Val = st.n1 !== undefined ? st.n1 : null;
      const n2Val = st.n2 !== undefined ? st.n2 : null;
      let mediaSemestral = 0;
      let hasGrades = false;
      if (n1Val !== null && n2Val !== null) {
        mediaSemestral = (n1Val + n2Val) / 2;
        hasGrades = true;
      } else if (n1Val !== null) {
        mediaSemestral = n1Val;
        hasGrades = true;
      } else if (n2Val !== null) {
        mediaSemestral = n2Val;
        hasGrades = true;
      }

      const f1Val = st.faltas1B !== undefined ? st.faltas1B : 0;
      const f2Val = st.faltas2B !== undefined ? st.faltas2B : 0;
      const totalFaltas = f1Val + f2Val;
      const ch = activeDiscipline.ch;
      const freq = Math.max(0, ((ch - totalFaltas) / ch) * 100);
      
      const isEligibleForExam = freq >= 75 && mediaSemestral >= 4.0 && mediaSemestral < 6.0;
      let mediaFinal = mediaSemestral;
      if (isEligibleForExam && st.exameFinal !== undefined && !isNaN(st.exameFinal)) {
        mediaFinal = (mediaSemestral + st.exameFinal) / 2;
      }

      return [
        st.matricula,
        st.nome,
        st.n1 !== undefined ? st.n1.toFixed(1) : "-",
        st.faltas1B !== undefined ? st.faltas1B : 0,
        st.n2 !== undefined ? st.n2.toFixed(1) : "-",
        st.faltas2B !== undefined ? st.faltas2B : 0,
        hasGrades ? mediaSemestral.toFixed(1) : "-",
        st.exameFinal !== undefined ? st.exameFinal.toFixed(1) : "-",
        hasGrades ? mediaFinal.toFixed(1) : "-",
        totalFaltas,
        freq.toFixed(1),
        st.situacao
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `diario_oficial_comunicacao_${activeDiscipline.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="student-control-container">
      
      {/* Top Header Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden no-print">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wider">
                Curso: Comunicação Social
              </span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
                Coordenador: Prof. Lucas Damasio
              </span>
              <span className="bg-slate-200 text-slate-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-slate-300 uppercase tracking-wider">
                Semestre Letivo: 2026/1
              </span>
            </div>
            <h2 className="text-xl font-sans font-black text-slate-900 mt-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Controle Oficial de Notas e Faltas (Semestre Completo)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Diário acadêmico contendo a consolidação oficial de faltas e notas do 1º e 2º bimestre para o curso de Comunicação Social.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exportar Planilha</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>Imprimir Boletim</span>
            </button>
            <button
              onClick={handleResetGrades}
              title="Redefinir notas para o oficial do PDF"
              className="px-3 py-1.5 border border-slate-250 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Total de Alunos</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-slate-850">
              {currentStudents.filter(st => st.situacao !== "Desistente" && st.situacao !== "Matrícula Trancada" && st.situacao !== "Transferido").length}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Ativos no semestre</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Média Geral Final</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2.5">
            <span className={`text-2xl font-black ${stats.avgGrade >= 6.0 ? "text-emerald-600" : stats.avgGrade >= 4.0 ? "text-amber-600" : "text-rose-600"}`}>
              {stats.avgGrade.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Meta UniBrasil: 6.0</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Frequência Geral</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2.5">
            <span className={`text-2xl font-black ${stats.avgFreq >= 80 ? "text-emerald-600" : stats.avgFreq >= 75 ? "text-amber-600" : "text-rose-600"}`}>
              {stats.avgFreq.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Mínimo legal: 75%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Aprovados Diretos</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-slate-800">{stats.approved}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {currentStudents.length > 0 ? ((stats.approved / currentStudents.filter(st => st.situacao !== "Desistente" && st.situacao !== "Matrícula Trancada" && st.situacao !== "Transferido").length) * 100).toFixed(0) : 0}% ativos
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Em Exame / Reprovados</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-rose-600">
              {stats.exam + stats.failed}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {stats.exam} em Exame | {stats.failed} Reprovados
            </span>
          </div>
        </div>

      </div>

      {/* Main Panel Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Selector Panel */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-5 no-print">
          
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>1. Filtrar Período</span>
            </h3>
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-lg">
              {[1, 3, 5, 7].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setSelectedPeriod(p);
                    setAiTip("");
                  }}
                  className={`py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    selectedPeriod === p
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  {p}º Per
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>2. Selecionar Disciplina</span>
            </h3>
            
            {filteredDisciplines.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-2">Nenhuma disciplina cadastrada para este período.</div>
            ) : (
              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                {filteredDisciplines.map((dis) => {
                  const isSelected = dis.id === selectedDisciplineId;
                  return (
                    <button
                      key={dis.id}
                      onClick={() => {
                        setSelectedDisciplineId(dis.id);
                        setAiTip("");
                      }}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex flex-col gap-1 border cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-amber-400 border-slate-950 font-semibold"
                          : "bg-slate-50 text-slate-600 border-slate-200/60 hover:bg-slate-100 hover:text-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] bg-slate-200/80 text-slate-700 px-1 py-0.25 rounded font-bold">
                          {dis.id}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">
                          {dis.ch} Horas
                        </span>
                      </div>
                      <span className="font-sans font-bold leading-tight mt-0.5 line-clamp-1">{dis.nome}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {activeDiscipline && (
            <div className="bg-amber-50/50 p-3.5 rounded-lg border border-amber-100 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-1.5 font-bold font-sans text-amber-800 text-[10px] uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Consolidação de Faltas</span>
              </div>
              <p className="text-[11px] text-amber-800/85 leading-relaxed">
                Esta disciplina possui <strong>{activeDiscipline.ch}h</strong> de carga horária.
              </p>
              <ul className="list-disc pl-4 text-[10px] space-y-1 text-amber-850">
                <li>Máximo legal de faltas (25%): <strong>{Math.floor(activeDiscipline.ch * 0.25)} faltas</strong>.</li>
                <li>Reprovação direta por falta ocorre com <strong>{Math.floor(activeDiscipline.ch * 0.25) + 1} faltas</strong>.</li>
              </ul>
            </div>
          )}

          <div className="pt-2 border-t border-slate-150">
            <button
              onClick={handleResetAllData}
              className="w-full text-center text-[10px] font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-dashed border-rose-200 p-2 rounded-lg transition-colors cursor-pointer"
            >
              Apagar Alterações do Diário
            </button>
          </div>

        </div>

        {/* Right Content Spreadsheet */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* PAINEL DE IMPORTAÇÃO DE PLANILHAS (XLSX, XLS, CSV) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4 no-print">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-sans font-bold text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Consolidador de Planilhas (XLS, XLSX ou CSV)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Importe e mescle as notas e faltas dos alunos de forma incremental para a disciplina ativa: <strong>{activeDiscipline?.nome} ({activeDiscipline?.id})</strong>
                </p>
              </div>
              <button 
                onClick={handleResetGrades}
                className="text-[10px] text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded border border-dashed border-rose-250 transition-all font-semibold cursor-pointer"
              >
                Limpar Diário Ativo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* PASSO 1: 1º BIMESTRE */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-150">PASSO 1</span>
                    <span className="text-[10px] text-slate-400 font-semibold font-mono">1º Bimestre</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-700">Faltas e Notas do 1ºB</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                    Lança o diário de frequência e as notas obtidas no primeiro bimestre.
                  </p>
                </div>
                
                <div className="space-y-1.5 pt-1">
                  <label className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold shadow-xs cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload 1ºB</span>
                    <input 
                      type="file" 
                      accept=".xlsx, .xls, .csv" 
                      onChange={(e) => handleFileUpload(e, "1B")} 
                      className="hidden" 
                    />
                  </label>
                  <button 
                    onClick={() => downloadTemplate("1B")}
                    className="w-full flex items-center justify-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-md text-[10px] font-semibold border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-slate-500" />
                    <span>Baixar Modelo CSV</span>
                  </button>
                </div>
              </div>

              {/* PASSO 2: 2º BIMESTRE */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-150">PASSO 2</span>
                    <span className="text-[10px] text-slate-400 font-semibold font-mono">2º Bimestre</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-700">Faltas e Notas do 2ºB</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                    Adiciona a frequência e as avaliações referentes ao segundo bimestre.
                  </p>
                </div>
                
                <div className="space-y-1.5 pt-1">
                  <label className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-bold shadow-xs cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload 2ºB</span>
                    <input 
                      type="file" 
                      accept=".xlsx, .xls, .csv" 
                      onChange={(e) => handleFileUpload(e, "2B")} 
                      className="hidden" 
                    />
                  </label>
                  <button 
                    onClick={() => downloadTemplate("2B")}
                    className="w-full flex items-center justify-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-md text-[10px] font-semibold border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-slate-500" />
                    <span>Baixar Modelo CSV</span>
                  </button>
                </div>
              </div>

              {/* PASSO 3: NOTAS TOTAIS / FINAIS */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-150">PASSO 3</span>
                    <span className="text-[10px] text-slate-400 font-semibold font-mono">Consolidação</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-700">Notas Finais e Exame</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                    Insere notas do exame final e consolida médias e situações definitivas.
                  </p>
                </div>
                
                <div className="space-y-1.5 pt-1">
                  <label className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold shadow-xs cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Completo</span>
                    <input 
                      type="file" 
                      accept=".xlsx, .xls, .csv" 
                      onChange={(e) => handleFileUpload(e, "TOTAL")} 
                      className="hidden" 
                    />
                  </label>
                  <button 
                    onClick={() => downloadTemplate("TOTAL")}
                    className="w-full flex items-center justify-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-md text-[10px] font-semibold border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-slate-500" />
                    <span>Baixar Modelo CSV</span>
                  </button>
                </div>
              </div>

            </div>

            {currentStudents.length === 0 && (
              <div className="bg-amber-50 text-[11px] text-amber-850 p-2.5 rounded border border-amber-200 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Nenhum aluno carregado ainda nesta disciplina. Baixe um dos modelos acima e faça o upload de sua planilha para ver as informações aparecerem na estrutura abaixo.</span>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            
            {/* Spreadsheet Action Bar */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
              
              {/* Search */}
              <div className="relative max-w-xs w-full">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Pesquisar por RA ou nome do aluno..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Filtering & Adding */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Filtrar:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-sans font-semibold text-slate-600"
                  >
                    <option value="ALL">Todos os Alunos</option>
                    <option value="APROVADO">Aprovados</option>
                    <option value="RECUPERACAO">Em Exame</option>
                    <option value="REPROVADO">Reprovados</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-2.5 py-1 bg-slate-900 text-amber-400 hover:bg-slate-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Incluir Aluno</span>
                </button>
              </div>

            </div>

            {/* Add Student Form */}
            {showAddForm && (
              <form onSubmit={handleAddStudent} className="p-4 border-b border-slate-200 bg-amber-50/20 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end animate-in slide-in-from-top-4 duration-150 no-print">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Nome Completo do Aluno</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: LORENA KAWANI KRIGUER CARVALHO"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Matrícula / RA</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 2026108633"
                    value={newStudentMatricula}
                    onChange={(e) => setNewStudentMatricula(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 border border-slate-250 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Print View Header Block */}
            <div className="hidden print:block p-6 border-b border-slate-300 text-center space-y-2">
              <h1 className="text-xl font-bold font-sans">UniBrasil Centro Universitário</h1>
              <p className="text-xs uppercase font-mono tracking-widest text-slate-600">Pauta Geral de Rendimento Acadêmico — Ano Letivo 2026/1</p>
              <div className="text-xs border border-slate-200 rounded-lg p-3 max-w-lg mx-auto grid grid-cols-2 text-left mt-2">
                <div><strong>Disciplina:</strong> {activeDiscipline?.id} - {activeDiscipline?.nome}</div>
                <div><strong>Coordenador:</strong> Prof. Lucas Damasio</div>
                <div><strong>Período:</strong> {selectedPeriod}º Semestre</div>
                <div><strong>Carga Horária:</strong> {activeDiscipline?.ch} h</div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-900 text-white border-b border-slate-800 text-[10px] uppercase font-mono tracking-wider">
                    <th className="py-3 px-3 font-semibold w-24">RA</th>
                    <th className="py-3 px-3 font-semibold min-w-[180px]">Aluno</th>
                    <th className="py-3 px-2 font-semibold text-center w-16">Nota 1B</th>
                    <th className="py-3 px-2 font-semibold text-center w-20">Faltas 1B</th>
                    <th className="py-3 px-2 font-semibold text-center w-16">Nota 2B</th>
                    <th className="py-3 px-2 font-semibold text-center w-20">Faltas 2B</th>
                    <th className="py-3 px-2 font-semibold text-center w-20 bg-slate-950 text-slate-300">Média Semestre</th>
                    <th className="py-3 px-2 font-semibold text-center w-20 bg-amber-950 text-amber-400">Exame Final</th>
                    <th className="py-3 px-2 font-semibold text-center w-20 bg-indigo-950 text-white">Média Final</th>
                    <th className="py-3 px-2 font-semibold text-center w-16">Faltas Tot</th>
                    <th className="py-3 px-2 font-semibold text-center w-16">Freq %</th>
                    <th className="py-3 px-3 font-semibold text-center w-28">Situação</th>
                    <th className="py-3 px-2 font-semibold w-10 text-center no-print">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="py-12 text-center text-slate-400 text-xs italic bg-slate-50/50">
                        Nenhum registro de aluno atende aos filtros selecionados nesta matéria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st, idx) => {
                      const n1Val = st.n1 !== undefined && !isNaN(st.n1) ? st.n1 : null;
                      const n2Val = st.n2 !== undefined && !isNaN(st.n2) ? st.n2 : null;
                      const hasGrades = n1Val !== null || n2Val !== null;

                      let mediaSemestral = 0;
                      if (n1Val !== null && n2Val !== null) {
                        mediaSemestral = (n1Val + n2Val) / 2;
                      } else if (n1Val !== null) {
                        mediaSemestral = n1Val;
                      } else if (n2Val !== null) {
                        mediaSemestral = n2Val;
                      }

                      const f1Val = st.faltas1B !== undefined && !isNaN(st.faltas1B) ? st.faltas1B : 0;
                      const f2Val = st.faltas2B !== undefined && !isNaN(st.faltas2B) ? st.faltas2B : 0;
                      const totalFaltas = f1Val + f2Val;
                      const ch = activeDiscipline ? activeDiscipline.ch : 80;
                      const freq = Math.max(0, ((ch - totalFaltas) / ch) * 100);
                      
                      const isEligibleForExam = freq >= 75 && mediaSemestral >= 4.0 && mediaSemestral < 6.0;
                      let mediaFinal = mediaSemestral;
                      if (isEligibleForExam && st.exameFinal !== undefined && !isNaN(st.exameFinal)) {
                        mediaFinal = (mediaSemestral + st.exameFinal) / 2;
                      }

                      const status = getStatusLabelAndColor(st.situacao);
                      const isInactive = st.situacao === "Desistente" || st.situacao === "Matrícula Trancada" || st.situacao === "Transferido";

                      return (
                        <tr
                          key={st.matricula}
                          className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"} ${isInactive ? "opacity-60" : ""} border-b border-slate-200/60 hover:bg-indigo-50/15 transition-all`}
                        >
                          {/* Matricula */}
                          <td className="py-3 px-3 font-mono text-[11px] font-bold text-slate-500">
                            {st.matricula}
                          </td>

                          {/* Nome */}
                          <td className="py-3 px-3 font-sans font-extrabold text-xs text-slate-800 uppercase max-w-[200px] truncate" title={st.nome}>
                            {st.nome}
                          </td>

                          {/* Nota 1B */}
                          <td className="py-2 px-1 text-center no-print">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              disabled={isInactive}
                              value={st.n1 !== undefined ? st.n1 : ""}
                              onChange={(e) => handleUpdateStudentField(st.matricula, "n1", e.target.value)}
                              className="w-12 bg-slate-50 border border-slate-200 text-center text-xs font-mono font-bold rounded p-1 focus:bg-white focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                            />
                          </td>
                          <td className="py-3 px-1 text-center hidden print:table-cell font-mono text-xs font-semibold">
                            {st.n1 !== undefined ? st.n1.toFixed(1) : "-"}
                          </td>

                          {/* Faltas 1B */}
                          <td className="py-2 px-1 text-center no-print">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                disabled={(st.faltas1B || 0) <= 0 || isInactive}
                                onClick={() => handleUpdateStudentField(st.matricula, "faltas1B", (st.faltas1B || 0) - 1)}
                                className="w-4 h-4 rounded bg-slate-100 text-[10px] font-bold text-slate-500 hover:bg-slate-200 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="w-5 font-mono text-xs font-bold text-slate-700 text-center">
                                {st.faltas1B !== undefined ? st.faltas1B : "-"}
                              </span>
                              <button
                                type="button"
                                disabled={(st.faltas1B || 0) >= (ch / 2) || isInactive}
                                onClick={() => handleUpdateStudentField(st.matricula, "faltas1B", (st.faltas1B || 0) + 1)}
                                className="w-4 h-4 rounded bg-slate-100 text-[10px] font-bold text-slate-500 hover:bg-slate-200 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-1 text-center hidden print:table-cell font-mono text-xs">
                            {st.faltas1B !== undefined ? st.faltas1B : "-"}
                          </td>

                          {/* Nota 2B */}
                          <td className="py-2 px-1 text-center no-print">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              disabled={isInactive}
                              value={st.n2 !== undefined ? st.n2 : ""}
                              onChange={(e) => handleUpdateStudentField(st.matricula, "n2", e.target.value)}
                              className="w-12 bg-slate-50 border border-slate-200 text-center text-xs font-mono font-bold rounded p-1 focus:bg-white focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                            />
                          </td>
                          <td className="py-3 px-1 text-center hidden print:table-cell font-mono text-xs font-semibold">
                            {st.n2 !== undefined ? st.n2.toFixed(1) : "-"}
                          </td>

                          {/* Faltas 2B */}
                          <td className="py-2 px-1 text-center no-print">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                disabled={(st.faltas2B || 0) <= 0 || isInactive}
                                onClick={() => handleUpdateStudentField(st.matricula, "faltas2B", (st.faltas2B || 0) - 1)}
                                className="w-4 h-4 rounded bg-slate-100 text-[10px] font-bold text-slate-500 hover:bg-slate-200 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="w-5 font-mono text-xs font-bold text-slate-700 text-center">
                                {st.faltas2B !== undefined ? st.faltas2B : "-"}
                              </span>
                              <button
                                type="button"
                                disabled={(st.faltas2B || 0) >= (ch / 2) || isInactive}
                                onClick={() => handleUpdateStudentField(st.matricula, "faltas2B", (st.faltas2B || 0) + 1)}
                                className="w-4 h-4 rounded bg-slate-100 text-[10px] font-bold text-slate-500 hover:bg-slate-200 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-1 text-center hidden print:table-cell font-mono text-xs">
                            {st.faltas2B !== undefined ? st.faltas2B : "-"}
                          </td>

                          {/* Media Semestral */}
                          <td className="py-3 px-1 text-center font-mono text-xs font-bold bg-slate-950/5">
                            <span className={mediaSemestral >= 6.0 ? "text-emerald-700" : mediaSemestral >= 4.0 ? "text-amber-700 font-bold" : "text-rose-700"}>
                              {hasGrades ? mediaSemestral.toFixed(1) : "-"}
                            </span>
                          </td>

                          {/* Exame Final */}
                          <td className="py-2 px-1 text-center no-print">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              placeholder="-"
                              disabled={isInactive || (!isEligibleForExam && st.exameFinal === undefined)}
                              value={st.exameFinal !== undefined ? st.exameFinal : ""}
                              onChange={(e) => handleUpdateStudentField(st.matricula, "exameFinal", e.target.value)}
                              className="w-12 bg-slate-50 border border-slate-200 text-center text-xs font-mono font-bold rounded p-1 focus:bg-white focus:ring-1 focus:ring-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="py-3 px-1 text-center hidden print:table-cell font-mono text-xs font-semibold">
                            {st.exameFinal !== undefined ? st.exameFinal.toFixed(1) : "-"}
                          </td>

                          {/* Media Final */}
                          <td className="py-3 px-1 text-center font-mono text-xs font-bold bg-indigo-50/30">
                            <span className={mediaFinal >= 6.0 ? "text-emerald-700" : mediaFinal >= 5.0 && isEligibleForExam ? "text-emerald-600 font-semibold" : mediaFinal >= 4.0 ? "text-amber-700 font-bold" : "text-rose-700"}>
                              {hasGrades ? mediaFinal.toFixed(1) : "-"}
                            </span>
                          </td>

                          {/* Faltas Totais */}
                          <td className="py-3 px-1 text-center font-mono text-xs font-semibold text-slate-600">
                            {totalFaltas}
                          </td>

                          {/* Freq % */}
                          <td className="py-3 px-1 text-center font-mono text-xs font-bold">
                            <span className={freq >= 75 ? "text-slate-600 font-medium" : "text-rose-600 font-black"}>
                              {freq.toFixed(0)}%
                            </span>
                          </td>

                          {/* Situação */}
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border block truncate max-w-[110px] ${status.color}`}>
                              {status.label}
                            </span>
                          </td>

                          {/* Ações */}
                          <td className="py-3 px-2 text-center no-print">
                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(st.matricula)}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Remover estudante do diário"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Print View Footer */}
            <div className="hidden print:block p-8 border-t border-slate-350 mt-12 text-xs text-slate-500 flex justify-between items-center">
              <div>UniBrasil Centro Universitário — Curitiba/PR</div>
              <div className="border-t border-slate-500 w-52 text-center pt-2 mt-8 font-sans font-bold text-slate-700">Assinatura Coordenador (Prof. Lucas Damasio)</div>
            </div>

          </div>

          {/* AI Advisor Panel */}
          <div className="bg-gradient-to-r from-blue-950 to-slate-900 rounded-xl border border-blue-900 shadow-md p-5 text-white space-y-4 no-print">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-sans font-black text-amber-400 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <BrainCircuit className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
                  <span>Assistente de Orientação Pedagógica (Gemini AI)</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Deixe que a Inteligência Artificial analise a pauta oficial de notas e faltas consolidadas do Semestre 2026/1 para sugerir diagnósticos e planos de recuperação para a turma.
                </p>
              </div>
              <button
                onClick={handleConsultAiAdvisor}
                disabled={loadingAi || currentStudents.length === 0}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
              >
                {loadingAi ? (
                  <>
                    <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Analisando...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>Analisar Diário</span>
                  </>
                )}
              </button>
            </div>

            {aiTip && (
              <div className="p-4 bg-slate-950/70 rounded-xl border border-blue-900/30 text-xs leading-relaxed space-y-2 animate-in fade-in duration-200">
                <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest pb-1.5 border-b border-blue-900/55">
                  Análise & Recomendações do Colegiado:
                </div>
                <div className="text-slate-200 prose prose-invert prose-xs max-w-none whitespace-pre-line font-sans font-medium">
                  {aiTip}
                </div>
              </div>
            )}
          </div>

          {/* Graphical Charts Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4 no-print">
            <div>
              <h3 className="font-sans font-black text-xs text-slate-800 uppercase tracking-wider">
                Análise Visual de Rendimento Acadêmico (2026/1)
              </h3>
              <p className="text-[11px] text-slate-500">Gráficos de barras para acompanhamento visual do desempenho individual e presença no semestre.</p>
            </div>

            {currentStudents.length === 0 ? (
              <div className="text-xs text-slate-400 italic text-center py-6">Insira alunos para gerar a análise gráfica.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Grades Chart */}
                <div className="border border-slate-150 rounded-xl p-4 space-y-3">
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center">Gráfico: Médias Finais de Notas</h4>
                  <div className="space-y-3 pt-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {currentStudents.map(st => {
                      const n1Val = st.n1 !== undefined ? st.n1 : null;
                      const n2Val = st.n2 !== undefined ? st.n2 : null;
                      let media = 0;
                      let hasGrades = false;
                      if (n1Val !== null && n2Val !== null) {
                        media = (n1Val + n2Val) / 2;
                        hasGrades = true;
                      } else if (n1Val !== null) {
                        media = n1Val;
                        hasGrades = true;
                      } else if (n2Val !== null) {
                        media = n2Val;
                        hasGrades = true;
                      }
                      const barWidth = `${media * 10}%`;
                      return (
                        <div key={st.matricula} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-medium text-slate-600">
                            <span className="truncate max-w-[70%] font-extrabold">{st.nome}</span>
                            <span className="font-mono text-slate-500">Média: {hasGrades ? media.toFixed(1) : "-"}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                media >= 6.0 
                                  ? "bg-emerald-500" 
                                  : media >= 4.0 
                                    ? "bg-amber-500" 
                                    : "bg-rose-500"
                              }`} 
                              style={{ width: barWidth }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Absence Chart */}
                <div className="border border-slate-150 rounded-xl p-4 space-y-3">
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center">Frequência e Limite Legal (75%)</h4>
                  <div className="space-y-3 pt-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {currentStudents.map(st => {
                      const f1Val = st.faltas1B !== undefined ? st.faltas1B : 0;
                      const f2Val = st.faltas2B !== undefined ? st.faltas2B : 0;
                      const totalFaltas = f1Val + f2Val;
                      const limit = activeDiscipline ? activeDiscipline.ch * 0.25 : 20;
                      const excess = totalFaltas > limit;
                      const pct = Math.min(100, (totalFaltas / (activeDiscipline?.ch || 80)) * 100);
                      const barWidth = `${pct}%`;

                      return (
                        <div key={st.matricula} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-medium text-slate-600">
                            <span className="truncate max-w-[75%] font-extrabold">{st.nome}</span>
                            <span className={`font-mono ${excess ? "text-rose-600 font-extrabold" : "text-slate-500"}`}>
                              {totalFaltas} f ({(((activeDiscipline?.ch || 80) - totalFaltas) / (activeDiscipline?.ch || 80) * 100).toFixed(0)}% freq)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5 relative overflow-hidden">
                            <div className="absolute left-[25%] top-0 bottom-0 w-[2px] bg-rose-500 z-10" title="Limite Crítico de 25% de Faltas"></div>
                            
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                excess ? "bg-rose-500" : pct > 15 ? "bg-amber-400" : "bg-indigo-500"
                              }`} 
                              style={{ width: barWidth }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-2 text-[9px] text-slate-400 font-mono text-center flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-indigo-50 block"></span> Regular (&lt; 15%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-amber-400 block"></span> Alerta (&gt; 15%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-rose-500 block"></span> Estourado (&gt; 25% - Reprovado)
                    </span>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
