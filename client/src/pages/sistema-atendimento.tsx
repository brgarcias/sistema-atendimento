import { useState } from "react";
import {
  BarChart3,
  X,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
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
} from "@/lib/api";
import ListaExecutivos from "@/components/sistema/ListaExecutivos";
import ListaClientes from "@/components/sistema/ListaClientes";
import PainelControle from "@/components/sistema/PainelControle";
import BuscaFiltros from "@/components/sistema/BuscaFiltros";
import Dashboard from "@/components/sistema/Dashboard";

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
      <Dashboard
        estatisticas={estatisticas}
        dadosPizza={dadosPizza}
        totalClientes={totalClientes}
        totalPropostas={totalPropostas}
        taxaConversao={taxaConversao}
        setShowDashboard={setShowDashboard}
        loadingStats={loadingStats}
      />
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
      <PainelControle
        novoCliente={novoCliente}
        setNovoCliente={setNovoCliente}
        adicionarCliente={adicionarCliente}
        createClientMutation={createClientMutation}
        nextExecutive={nextExecutive}
        novoExecutivo={novoExecutivo}
        setNovoExecutivo={setNovoExecutivo}
        adicionarExecutivo={adicionarExecutivo}
        createExecutiveMutation={createExecutiveMutation}
        uploadExecutivo={uploadExecutivo}
        setUploadExecutivo={setUploadExecutivo}
        executivos={executivos}
        showListaInput={showListaInput}
        setShowListaInput={setShowListaInput}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        processarUpload={processarUpload}
        bulkUploadMutation={bulkUploadMutation}
        listaClientes={listaClientes}
        setListaClientes={setListaClientes}
        processarListaManual={processarListaManual}
        bulkManualMutation={bulkManualMutation}
        pularExecutivo={pularExecutivo}
        setShowDashboard={setShowDashboard}
      />

      {/* Lista de Executivos */}
      <ListaExecutivos
        executivos={executivos}
        nextExecutive={nextExecutive}
        deleteExecutiveMutation={deleteExecutiveMutation}
      />

      {/* Busca e Filtros */}
      <BuscaFiltros
        busca={busca}
        setBusca={setBusca}
        filtroColuna={filtroColuna}
        setFiltroColuna={setFiltroColuna}
      />

      {/* Lista de Clientes */}
      <ListaClientes
        clientesFiltrados={clientesFiltrados}
        updateClientMutation={updateClientMutation}
        deleteClientMutation={deleteClientMutation}
      />
    </div>
  );
};

export default SistemaAtendimento;
