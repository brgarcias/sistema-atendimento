import { useState } from "react";
import {
  Plus,
  Upload,
  BarChart3,
  Search,
  Trash2,
  X,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  getExecutives,
  createExecutive,
  deleteExecutive,
  getClients,
  createClient,
  updateClient,
  deleteClient,
  bulkCreateClients,
  bulkCreateClientsManual,
  getDashboardStats,
  getNextExecutive,
  type ClientWithExecutive,
  type DashboardStats,
} from "@/lib/api";

const SistemaAtendimento = () => {
  const [novoCliente, setNovoCliente] = useState("");
  const [novoExecutivo, setNovoExecutivo] = useState("");
  const [busca, setBusca] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);
  const [filtroColuna, setFiltroColuna] = useState("");
  const [uploadExecutivo, setUploadExecutivo] = useState("");
  const [listaClientes, setListaClientes] = useState("");
  const [showListaInput, setShowListaInput] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [nextExecutiveId, setNextExecutiveId] = useState<number>(0);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const cores = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
  ];

  // Queries
  const { data: executivos = [], isLoading: loadingExecutivos } = useQuery({
    queryKey: ["/api/executives"],
    queryFn: getExecutives,
  });

  const { data: clientes = [], isLoading: loadingClientes } = useQuery({
    queryKey: ["/api/clients"],
    queryFn: getClients,
  });

  const { data: dashboardStats, isLoading: loadingStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: getDashboardStats,
    enabled: showDashboard,
  });

  const { data: nextExecutive, refetch: refetchNextExecutive } = useQuery({
    queryKey: ["/api/executives/next", nextExecutiveId],
    queryFn: () => getNextExecutive(nextExecutiveId),
    enabled: executivos.length > 0,
  });

  const pularExecutivo = () => {
    if (nextExecutive) {
      setNextExecutiveId(nextExecutive.id);
      refetchNextExecutive();
    }
  };

  // Mutations
  const createClientMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/executives/next"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setNovoCliente("");
      toast({
        title: "Sucesso",
        description: "Cliente adicionado com sucesso",
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message?.message ||
        error?.message ||
        "Erro ao adicionar cliente";

      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    },
  });

  const createExecutiveMutation = useMutation({
    mutationFn: createExecutive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/executives"] });
      queryClient.invalidateQueries({ queryKey: ["/api/executives/next"] });
      setNovoExecutivo("");
      toast({
        title: "Sucesso",
        description: "Executivo adicionado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar executivo",
        variant: "destructive",
      });
    },
  });

  const deleteExecutiveMutation = useMutation({
    mutationFn: deleteExecutive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/executives"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/executives/next"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Executivo removido com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover executivo",
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<ClientWithExecutive>;
    }) => updateClient(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar cliente",
        variant: "destructive",
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Cliente removido com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover cliente",
        variant: "destructive",
      });
    },
  });

  const bulkUploadMutation = useMutation({
    mutationFn: ({ file, executiveId }: { file: File; executiveId: number }) =>
      bulkCreateClients(file, executiveId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/executives/next"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setSelectedFile(null);
      setUploadExecutivo("");
      toast({
        title: "Resultado da importação",
        description: (
          <div>
            <p>{data.message}</p>
            {data.duplicates && data.duplicates.length > 0 && (
              <div
                className="mt-1 bg-red-100 border border-red-300 rounded-md p-2 max-h-32 overflow-y-auto text-sm text-red-900"
                aria-label="Lista de duplicados ou erros"
                style={{ scrollbarWidth: "thin" }}
              >
                <ul className="list-disc list-inside space-y-1">
                  {data.duplicates.map((dup, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span>{dup}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ),
        variant: data.clients.length === 0 ? "destructive" : "default",
        duration: 10000,
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao fazer upload";

      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    },
  });

  const bulkManualMutation = useMutation({
    mutationFn: ({
      names,
      executiveId,
    }: {
      names: string[];
      executiveId: number;
    }) => bulkCreateClientsManual(names, executiveId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/executives/next"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setListaClientes("");
      setShowListaInput(false);
      setUploadExecutivo("");

      toast({
        title: "Resultado da importação",
        description: (
          <div>
            <p>{data.message}</p>
            {data.duplicates && data.duplicates.length > 0 && (
              <div
                className="mt-1 bg-red-100 border border-red-300 rounded-md p-2 max-h-32 overflow-y-auto text-sm text-red-900"
                aria-label="Lista de duplicados ou erros"
                style={{ scrollbarWidth: "thin" }}
              >
                <ul className="list-disc list-inside space-y-1">
                  {data.duplicates.map((dup, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span>{dup}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ),
        variant: data.clients.length === 0 ? "destructive" : "default",
        duration: 10000,
      });
    },

    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message?.message ||
        error?.message ||
        "Erro ao adicionar lista";

      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    },
  });

  const adicionarCliente = () => {
    if (!novoCliente.trim()) return;
    if (!nextExecutive) {
      toast({
        title: "Erro",
        description: "Nenhum executivo disponível",
        variant: "destructive",
      });
      return;
    }

    createClientMutation.mutate({
      name: novoCliente.trim(),
      executiveId: nextExecutive.id,
      proposalSent: false,
    });
  };

  const adicionarExecutivo = () => {
    if (!novoExecutivo.trim()) return;

    const cor = cores[executivos.length % cores.length];
    createExecutiveMutation.mutate({
      name: novoExecutivo.trim(),
      color: cor,
    });
  };

  const processarListaManual = () => {
    if (!listaClientes.trim()) {
      toast({
        title: "Erro",
        description: "Digite os nomes dos clientes",
        variant: "destructive",
      });
      return;
    }

    const executivoSelecionado = executivos.find(
      (e) => e.name === uploadExecutivo
    );
    if (!executivoSelecionado) {
      toast({
        title: "Erro",
        description: "Selecione um executivo para associar a lista",
        variant: "destructive",
      });
      return;
    }

    const names = listaClientes
      .split("\n")
      .map((nome) => nome.trim())
      .filter((nome) => nome);
    bulkManualMutation.mutate({ names, executiveId: executivoSelecionado.id });
  };

  const processarUpload = () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo",
        variant: "destructive",
      });
      return;
    }

    const executivoSelecionado = executivos.find(
      (e) => e.name === uploadExecutivo
    );
    if (!executivoSelecionado) {
      toast({
        title: "Erro",
        description: "Selecione um executivo para associar a lista",
        variant: "destructive",
      });
      return;
    }

    bulkUploadMutation.mutate({
      file: selectedFile,
      executiveId: executivoSelecionado.id,
    });
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    const termoBusca = busca.toLowerCase();
    const filtro = filtroColuna.toLowerCase();

    return (
      (cliente.name.toLowerCase().includes(termoBusca) ||
        cliente.executiveName.toLowerCase().includes(termoBusca)) &&
      (!filtro ||
        cliente.name.toLowerCase().includes(filtro) ||
        cliente.executiveName.toLowerCase().includes(filtro) ||
        new Date(cliente.createdAt)
          .toLocaleString("pt-BR")
          .toLowerCase()
          .includes(filtro))
    );
  });

  const estatisticas = dashboardStats?.executiveStats || [];
  const dadosGrafico = estatisticas.map((stat) => ({
    nome: stat.name,
    Total: stat.clientCount,
    Propostas: stat.proposalCount,
    Pendentes: stat.clientCount - stat.proposalCount,
  }));

  const dadosPizza = estatisticas.map((stat) => ({
    name: stat.name,
    value: stat.clientCount,
    color: stat.color,
  }));

  const totalClientes = dashboardStats?.totalClients || 0;
  const totalPropostas = dashboardStats?.totalProposals || 0;
  const taxaConversao = dashboardStats?.conversionRate || 0;

  if (showDashboard) {
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

            {/* Gráfico */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6 mx-2 sm:mx-0">
              <div className="bg-white card-responsive rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">
                  Proporção de Clientes (%)
                </h3>
                <div className="chart-responsive">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosPizza}
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        dataKey="value"
                        label={({ name, value, percent }) =>
                          `${name}: ${(percent * 100).toFixed(1)}%`
                        }
                      >
                        {dadosPizza.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} clientes`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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
                            ? (
                                (stat.clientCount / totalClientes) *
                                100
                              ).toFixed(1)
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

  if (loadingExecutivos || loadingClientes) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container-responsive bg-gray-50 min-h-screen py-4 sm:py-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 px-2 sm:px-0">
        Sistema de Distribuição de Atendimentos
      </h1>

      {/* Painel de Controle */}
      <div className="bg-white rounded-lg shadow-lg card-responsive mb-4 sm:mb-6 mx-2 sm:mx-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Adicionar Cliente
            </label>
            <div className="flex-responsive">
              <input
                type="text"
                value={novoCliente}
                onChange={(e) => setNovoCliente(e.target.value)}
                placeholder="Nome do cliente"
                className="input-responsive border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyUp={(e) => e.key === "Enter" && adicionarCliente()}
              />
              <button
                onClick={adicionarCliente}
                disabled={createClientMutation.isPending}
                className="button-responsive bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Adicionar</span>
              </button>
            </div>
            {nextExecutive && (
              <p className="text-sm text-gray-600 mt-2">
                Próximo:{" "}
                <span
                  className="font-semibold"
                  style={{ color: nextExecutive.color }}
                >
                  {nextExecutive.name}
                </span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Gerenciar Executivos
            </label>
            <div className="flex-responsive">
              <input
                type="text"
                value={novoExecutivo}
                onChange={(e) => setNovoExecutivo(e.target.value)}
                placeholder="Nome do executivo"
                className="input-responsive border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === "Enter" && adicionarExecutivo()}
              />
              <button
                onClick={adicionarExecutivo}
                disabled={createExecutiveMutation.isPending}
                className="button-responsive bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
              >
                <Users size={16} />
                <span className="hidden sm:inline">Adicionar</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Upload/Lista Manual
            </label>
            <div className="flex-responsive mb-2">
              <select
                value={uploadExecutivo}
                onChange={(e) => setUploadExecutivo(e.target.value)}
                className="input-responsive border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione executivo</option>
                {executivos.map((exec) => (
                  <option key={exec.id} value={exec.name}>
                    {exec.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowListaInput(!showListaInput)}
                className="button-responsive bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Upload size={16} />
                <span className="hidden sm:inline">Lista</span>
              </button>
            </div>

            <div className="flex-responsive">
              <input
                type="file"
                accept=".txt,.csv,.xlsx,.xls"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="input-responsive border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              />
              <button
                onClick={processarUpload}
                disabled={bulkUploadMutation.isPending}
                className="button-responsive bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
              >
                <Upload size={16} />
                <span className="hidden sm:inline">Upload</span>
              </button>
            </div>

            {showListaInput && (
              <div className="mt-2 space-y-2">
                <textarea
                  value={listaClientes}
                  onChange={(e) => setListaClientes(e.target.value)}
                  placeholder="Digite os nomes dos clientes (um por linha)"
                  rows={4}
                  className="input-responsive border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-20"
                />
                <button
                  onClick={processarListaManual}
                  disabled={bulkManualMutation.isPending}
                  className="button-responsive bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 w-full sm:w-auto"
                >
                  Adicionar Lista
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={pularExecutivo}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            Pular Próximo
          </button>
          <button
            onClick={() => setShowDashboard(true)}
            className="button-responsive bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <BarChart3 size={16} />
            Dashboard
          </button>
        </div>
      </div>

      {/* Lista de Executivos */}
      <div className="bg-white rounded-lg shadow-lg card-responsive mb-4 sm:mb-6 mx-2 sm:mx-0">
        <h3 className="text-lg font-semibold mb-4">Executivos Cadastrados</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {executivos.map((exec) => (
            <div
              key={exec.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: exec.color }}
                />
                <span className="font-medium truncate text-sm sm:text-base">
                  {exec.name}
                </span>
                {nextExecutive && exec.id === nextExecutive.id && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap">
                    Próximo
                  </span>
                )}
              </div>
              <button
                onClick={() => deleteExecutiveMutation.mutate(exec.id)}
                disabled={deleteExecutiveMutation.isPending}
                className="text-red-600 hover:text-red-800 disabled:opacity-50 p-1 flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="bg-white rounded-lg shadow-lg card-responsive mb-4 sm:mb-6 mx-2 sm:mx-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Buscar Cliente/Executivo
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Digite o nome..."
                className="input-responsive pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Filtrar Colunas
            </label>
            <input
              type="text"
              value={filtroColuna}
              onChange={(e) => setFiltroColuna(e.target.value)}
              placeholder="Filtrar por qualquer coluna..."
              className="input-responsive border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white rounded-lg shadow-lg card-responsive mx-2 sm:mx-0">
        <h3 className="text-lg font-semibold mb-4">
          Clientes Cadastrados ({clientesFiltrados.length})
        </h3>
        <div className="table-responsive">
          <table className="w-full min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 sm:px-4 text-sm sm:text-base">
                  Cliente
                </th>
                <th className="text-left py-2 px-2 sm:px-4 text-sm sm:text-base hidden sm:table-cell">
                  Executivo
                </th>
                <th className="text-left py-2 px-2 sm:px-4 text-sm sm:text-base hidden md:table-cell">
                  Data de Entrada
                </th>
                <th className="text-left py-2 px-2 sm:px-4 text-sm sm:text-base">
                  Proposta
                </th>
                <th className="text-left py-2 px-2 sm:px-4 text-sm sm:text-base">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base font-medium">
                    <div className="truncate">{cliente.name}</div>
                    <div className="sm:hidden text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cliente.executiveColor }}
                      />
                      {cliente.executiveName}
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cliente.executiveColor }}
                      />
                      <span className="truncate">{cliente.executiveName}</span>
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                    {new Date(cliente.createdAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4">
                    <button
                      onClick={() =>
                        updateClientMutation.mutate({
                          id: cliente.id,
                          updates: { proposalSent: !cliente.proposalSent },
                        })
                      }
                      disabled={updateClientMutation.isPending}
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium disabled:opacity-50 whitespace-nowrap ${
                        cliente.proposalSent
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {cliente.proposalSent ? "Enviada" : "Pendente"}
                    </button>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4">
                    <button
                      onClick={() => deleteClientMutation.mutate(cliente.id)}
                      disabled={deleteClientMutation.isPending}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 p-1"
                    >
                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SistemaAtendimento;
