import React, { useState } from "react";
import { Discipline } from "../types";
import { Printer, Download } from "lucide-react";

interface DocumentViewerProps {
  disciplines: Discipline[];
}

export default function DocumentViewer({ disciplines }: DocumentViewerProps) {
  const [filterPrintPeriod, setFilterPrintPeriod] = useState<string>("ALL");

  // Filter disciplines to print
  const printDisciplines = disciplines.filter(
    (d) => filterPrintPeriod === "ALL" || d.periodo.toString() === filterPrintPeriod
  );

  // Stats calculation
  const totalDisciplinesHours = printDisciplines.reduce((acc, d) => acc + d.ch, 0);
  const totalTeo = printDisciplines.reduce((acc, d) => acc + d.chTeo, 0);
  const totalPra = printDisciplines.reduce((acc, d) => acc + d.chPra, 0);
  const totalEad = printDisciplines.reduce((acc, d) => acc + d.chEad, 0);
  const totalExt = printDisciplines.reduce((acc, d) => acc + d.chExt, 0);
  const totalAds = printDisciplines.reduce((acc, d) => acc + d.chAds, 0);
  const totalCredits = printDisciplines.reduce((acc, d) => acc + d.credito, 0);

  // Export to CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Codigo,Disciplina,Semestre,Area Conhecimento,Tipo,CH Total,Teorica,Pratica,EAD,Extensao,CH ADS,Creditos,Ementa\n";
    
    disciplines.forEach((d) => {
      const cleanEmenta = (d.ementa || "").replace(/"/g, '""');
      const cleanArea = d.areaConhecimento.replace(/"/g, '""');
      csvContent += `"${d.id}","${d.nome}",${d.periodo},"${cleanArea}","${d.tipo}",${d.ch},${d.chTeo},${d.chPra},${d.chEad},${d.chExt},${d.chAds},${d.credito},"${cleanEmenta}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `matriz_curricular_pp_unibrasil.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(disciplines, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `matriz_curricular_pp_unibrasil.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Document Trigger
  const handlePrint = () => {
    window.print();
  };

  // Group disciplines by semester for display
  const semesters = Array.from(new Set(printDisciplines.map((d) => d.periodo))).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      
      {/* Configuration panel for export and print */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h4 className="font-sans font-bold text-slate-800 text-sm">Configuração de Exportação e Impressão</h4>
          <p className="text-xs text-slate-500">Personalize os dados acadêmicos e filtros antes de imprimir ou gerar o PDF oficial.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Semester Filter for report */}
          <select
            id="print-period-filter"
            value={filterPrintPeriod}
            onChange={(e) => setFilterPrintPeriod(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Todas as Disciplinas</option>
            <option value="1">1º Semestre</option>
            <option value="2">2º Semestre</option>
            <option value="3">3º Semestre</option>
            <option value="4">4º Semestre</option>
            <option value="5">5º Semestre</option>
            <option value="6">6º Semestre</option>
            <option value="7">7º Semestre</option>
          </select>

          {/* Export CSV */}
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          {/* Export JSON */}
          <button
            id="btn-export-json"
            onClick={handleExportJSON}
            className="flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar JSON</span>
          </button>

          {/* Print PDF */}
          <button
            id="btn-print-doc"
            onClick={handlePrint}
            className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Matriz / PDF</span>
          </button>
        </div>
      </div>

      {/* Actual Printable Page document */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-lg p-8 sm:p-12 max-w-4xl mx-auto print-container font-sans text-slate-800 relative">
        
        {/* Printable Header */}
        <div className="border-b-2 border-slate-800 pb-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-lg font-sans font-extrabold text-slate-900 uppercase tracking-wide">UniBrasil Centro Universitário</h1>
            <h2 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest mt-0.5">Escola de Comunicação e Negócios</h2>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Matriz Curricular Oficial de Publicidade e Propaganda (PPC do Curso)</p>
          </div>
          
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-right text-xs font-mono shrink-0">
            <div className="text-[9px] text-slate-400 font-bold uppercase">Código do Curso</div>
            <div className="font-bold text-slate-700">MEC - Curitiba/PR</div>
            <div className="text-[9px] text-slate-400 mt-1 uppercase">Dossiê Emitido em</div>
            <div className="text-slate-600 text-[10px] font-semibold">{new Date().toLocaleDateString("pt-BR")}</div>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center mb-6">
          <h3 className="text-base font-sans font-extrabold text-slate-900 uppercase tracking-wider">
            DOSSIÊ OFICIAL DE PLANEJAMENTO DA MATRIZ CURRICULAR
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Grade de disciplinas, cargas horárias e estruturação de créditos para homologação junto ao PPC</p>
        </div>

        {/* Course Info Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-slate-200 rounded-lg p-4 bg-slate-50 mb-6 text-xs text-slate-700">
          <div>
            <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Curso</span>
            <span className="font-semibold text-slate-800">Bacharelado em Publicidade e Propaganda</span>
          </div>
          <div>
            <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Coordenador do Curso</span>
            <span className="font-semibold text-slate-800">Prof. Lucas Damasio</span>
          </div>
          <div>
            <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Modalidade e Local</span>
            <span className="font-semibold text-slate-800">Presencial | Curitiba, PR</span>
          </div>
        </div>

        {/* Executive Summary stats in Document */}
        <div className="border border-slate-200 rounded-lg p-4 mb-6">
          <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2.5">Quadro Geral de Carga Horária e Créditos Gerados</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-2 border-r border-slate-100">
              <span className="block text-[10px] text-slate-400">Total Disciplinas</span>
              <span className="text-lg font-bold font-sans text-slate-800">{totalDisciplinesHours} horas</span>
            </div>
            <div className="p-2 border-r border-slate-100">
              <span className="block text-[10px] text-slate-400">Créditos Totais</span>
              <span className="text-lg font-bold font-sans text-amber-600">{totalCredits} Cred</span>
            </div>
            <div className="p-2 border-r border-slate-100">
              <span className="block text-[10px] text-slate-400">Prática (PRA)</span>
              <span className="text-lg font-bold font-sans text-emerald-600">{totalPra} horas</span>
            </div>
            <div className="p-2">
              <span className="block text-[10px] text-slate-400">Extensão (EXT)</span>
              <span className="text-lg font-bold font-sans text-purple-700">{totalExt} horas</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-slate-400 uppercase">
            <div>TEÓRICA: {totalTeo}h</div>
            <div>EAD: {totalEad}h</div>
            <div>CH ADS: {totalAds}h</div>
          </div>
        </div>

        {/* Grouped by Semester Syllabus rendering */}
        <div className="space-y-6">
          {semesters.map((sem) => {
            const semDisciplines = printDisciplines.filter((d) => d.periodo === sem);
            const semChTotal = semDisciplines.reduce((acc, d) => acc + d.ch, 0);
            const semCredits = semDisciplines.reduce((acc, d) => acc + d.credito, 0);

            return (
              <div key={sem} className="avoid-break-inside space-y-3">
                <div className="flex justify-between items-end border-b-2 border-slate-400 pb-1">
                  <h4 className="text-xs font-sans font-bold text-slate-900 uppercase tracking-wider">
                    {sem}º SEMESTRE
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">
                    SUBTOTAL: {semChTotal}h | CRÉDITOS: {semCredits}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {semDisciplines.map((d) => (
                    <div key={d.id} className="p-3 bg-white space-y-1 text-xs">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-sans font-bold text-slate-800">
                          <span className="font-mono text-[10px] text-slate-400 mr-1.5">{d.id}</span>
                          {d.nome}
                        </p>
                        <span className="shrink-0 font-mono text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                          CH: {d.ch}h | Cred: {d.credito} | ADS: {d.chAds}h
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">
                        ÁREA: {d.areaConhecimento} | TIPO: {d.tipo}
                      </p>

                      {d.ementa && (
                        <p className="text-[10px] text-slate-500 leading-relaxed pl-1 pt-0.5 border-l-2 border-slate-200">
                          <strong>Ementa:</strong> {d.ementa}
                        </p>
                      )}

                      {(d.praticaAtividade || d.ambientePratica || d.nivelExigencia) && (
                        <div className="text-[9px] text-slate-500 bg-blue-50/40 p-2 rounded-lg border border-blue-100/50 mt-1.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {d.praticaAtividade && (
                            <div>
                              <strong className="text-blue-900 font-mono text-[8px] uppercase block">Atividade Prática</strong>
                              <span className="text-slate-700">{d.praticaAtividade}</span>
                            </div>
                          )}
                          {d.ambientePratica && (
                            <div>
                              <strong className="text-blue-900 font-mono text-[8px] uppercase block">Ambiente</strong>
                              <span className="text-slate-700">{d.ambientePratica}</span>
                            </div>
                          )}
                          {d.nivelExigencia && (
                            <div>
                              <strong className="text-blue-900 font-mono text-[8px] uppercase block">Nível Exigência</strong>
                              <span className="font-semibold text-slate-700">{d.nivelExigencia}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {d.justificativa && (
                        <p className="text-[9px] text-slate-400 font-mono whitespace-pre-wrap pl-1">
                          {d.justificativa}
                        </p>
                      )}

                      {d.observacoes && (
                        <p className="text-[9px] text-purple-600 bg-purple-50/50 p-1.5 rounded font-medium mt-1">
                          <strong>Notas:</strong> {d.observacoes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Validation signatures at the bottom */}
        <div className="border-t border-slate-300 mt-12 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center avoid-break-inside">
          <div className="space-y-3">
            <div className="border-b border-slate-400 mx-auto w-44 h-8"></div>
            <div>
              <p className="text-xs font-bold text-slate-700">Prof. Lucas Damasio</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider">Coordenação de Publicidade e Propaganda</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="border-b border-slate-400 mx-auto w-44 h-8"></div>
            <div>
              <p className="text-xs font-bold text-slate-700">Colegiado de Curso / NDE</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider">Escola de Comunicação e Negócios</p>
            </div>
          </div>
        </div>

        {/* Printable Footer note */}
        <div className="mt-8 text-center text-[9px] text-slate-400 border-t border-slate-100 pt-3 font-mono uppercase tracking-widest">
          Grade oficial UniBrasil homologada sob DCN Parecer CNE/CES nº 146/2020.
        </div>

      </div>
    </div>
  );
}
