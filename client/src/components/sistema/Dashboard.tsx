"use client";

import {
  BarChart3,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { GraficoPizza } from "@/components/sistema/Graficos/GraficoPizza";
import { GraficoBarra } from "@/components/sistema/Graficos/GraficoBarra";

interface Estatistica {
  name: string;
  clientCount: number;
  proposalCount: number;
  color: string;
  conversionRate: number;
}

interface DashboardProps {
  estatisticas: Estatistica[];
  dadosPizza: { name: string; value: number; color: string }[];
  totalClientes: number;
  totalPropostas: number;
  taxaConversao: number;
  setShowDashboard: (value: boolean) => void;
  loadingStats: boolean;
}

export default function Dashboard({
  estatisticas,
  dadosPizza,
  totalClientes,
  totalPropostas,
  taxaConversao,
  setShowDashboard,
  loadingStats,
}: DashboardProps) {
  const [graficoSelecionado, setGraficoSelecionado] = useState<
    "pizza" | "barra"
  >("pizza");

  const dadosGrafico = estatisticas.map((stat) => ({
    nome: stat.name,
    Total: stat.clientCount,
    Propostas: stat.proposalCount,
    Pendentes: stat.clientCount - stat.proposalCount,
  }));

  return (
    <div className="container-responsive bg-gray-50 min-h-screen py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4 mx-2 sm:mx-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="text-blue-600" />
          <span className="hidden sm:inline">Dashboard de Atendimentos</span>
          <span className="sm:hidden">Dashboard</span>
        </h1>
        <button
          onClick={() => setShowDashboard(false)}
          className="button-responsive bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <X size={16} />
          Fechar
        </button>
      </div>

      {loadingStats ? (
        <div className="flex justify-center items-center h-64 mx-2 sm:mx-0">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 mx-2 sm:mx-0">
            <div className="bg-white card-responsive rounded-lg shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-2">
                <Users className="text-blue-500 flex-shrink-0" size={20} />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    Total de Clientes
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    {totalClientes}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white card-responsive rounded-lg shadow-lg border-l-4 border-green-500">
              <div className="flex items-center gap-2">
                <CheckCircle
                  className="text-green-500 flex-shrink-0"
                  size={20}
                />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    Propostas Enviadas
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {totalPropostas}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white card-responsive rounded-lg shadow-lg border-l-4 border-orange-500">
              <div className="flex items-center gap-2">
                <Clock className="text-orange-500 flex-shrink-0" size={20} />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    Pendentes
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-orange-600">
                    {totalClientes - totalPropostas}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white card-responsive rounded-lg shadow-lg border-l-4 border-purple-500">
              <div className="flex items-center gap-2">
                <TrendingUp
                  className="text-purple-500 flex-shrink-0"
                  size={20}
                />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    Taxa de Conversão
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">
                    {taxaConversao.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico com toggle */}
          <div className="bg-white card-responsive rounded-lg shadow-lg mb-4 sm:mb-6 mx-2 sm:mx-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Resumo de Clientes</h3>
              <div className="space-x-2">
                <button
                  onClick={() => setGraficoSelecionado("pizza")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    graficoSelecionado === "pizza"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  Pizza
                </button>
                <button
                  onClick={() => setGraficoSelecionado("barra")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    graficoSelecionado === "barra"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  Barras
                </button>
              </div>
            </div>

            <div className="chart-responsive">
              {graficoSelecionado === "pizza" ? (
                <GraficoPizza data={dadosPizza} />
              ) : (
                <GraficoBarra data={dadosGrafico} />
              )}
            </div>
          </div>

          {/* Tabela de Performance */}
          <div className="bg-white rounded-lg shadow-lg card-responsive mx-2 sm:mx-0">
            <h3 className="text-lg font-semibold mb-4">
              Performance dos Executivos
            </h3>
            <div className="table-responsive">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 sm:px-4 text-sm sm:text-base">
                      Executivo
                    </th>
                    <th className="text-left py-2 px-2 sm:px-4 text-sm sm:text-base">
                      Total
                    </th>
                    <th className="text-left py-2 px-2 sm:px-4 text-sm sm:text-base hidden sm:table-cell">
                      Propostas
                    </th>
                    <th className="text-left py-2 px-2 sm:px-4 text-sm sm:text-base hidden md:table-cell">
                      Pendentes
                    </th>
                    <th className="text-left py-2 px-2 sm:px-4 text-sm sm:text-base hidden lg:table-cell">
                      % do Total
                    </th>
                    <th className="text-left py-2 px-2 sm:px-4 text-sm sm:text-base">
                      Conversão
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {estatisticas.map((stat, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: stat.color }}
                          />
                          <span className="truncate">{stat.name}</span>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base font-medium">
                        {stat.clientCount}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base hidden sm:table-cell">
                        {stat.proposalCount}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base hidden md:table-cell">
                        {stat.clientCount - stat.proposalCount}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base hidden lg:table-cell">
                        {totalClientes > 0
                          ? ((stat.clientCount / totalClientes) * 100).toFixed(
                              1
                            )
                          : 0}
                        %
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base font-medium">
                        {stat.conversionRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
