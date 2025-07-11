import { Plus, Users, Upload, BarChart3 } from "lucide-react";

interface PainelControleProps {
  novoCliente: string;
  setNovoCliente: (value: string) => void;
  adicionarCliente: () => void;
  createClientMutation: {
    isPending: boolean;
    mutate: (data: {
      name: string;
      executiveId: number;
      proposalSent?: boolean;
    }) => void;
  };
  nextExecutive?: {
    id: number;
    name: string;
    createdAt: Date;
    color: string;
  };
  novoExecutivo: string;
  setNovoExecutivo: (value: string) => void;
  adicionarExecutivo: () => void;
  createExecutiveMutation: {
    isPending: boolean;
    mutate: (data: { name: string; color: string }) => void;
  };
  uploadExecutivo: string;
  setUploadExecutivo: (value: string) => void;
  executivos: Array<{
    id: number;
    name: string;
    createdAt: Date;
    color: string;
  }>;
  showListaInput: boolean;
  setShowListaInput: (value: boolean) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  processarUpload: () => void;
  bulkUploadMutation: {
    isPending: boolean;
    mutate: (data: { file: File; executiveId: number }) => void;
  };
  listaClientes: string;
  setListaClientes: (value: string) => void;
  processarListaManual: () => void;
  bulkManualMutation: {
    isPending: boolean;
    mutate: (data: { names: string[]; executiveId: number }) => void;
  };
  pularExecutivo: () => void;
  setShowDashboard: (value: boolean) => void;
}

const PainelControle = ({
  novoCliente,
  setNovoCliente,
  adicionarCliente,
  createClientMutation,
  nextExecutive,
  novoExecutivo,
  setNovoExecutivo,
  adicionarExecutivo,
  createExecutiveMutation,
  uploadExecutivo,
  setUploadExecutivo,
  executivos,
  showListaInput,
  setShowListaInput,
  selectedFile,
  setSelectedFile,
  processarUpload,
  bulkUploadMutation,
  listaClientes,
  setListaClientes,
  processarListaManual,
  bulkManualMutation,
  pularExecutivo,
  setShowDashboard,
}: PainelControleProps) => {
  return (
    <div className="card-responsive bg-card text-card-foreground rounded-xl shadow border">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Adicionar Cliente */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[color:var(--muted-foreground)]">
            Adicionar Cliente
          </label>
          <div className="flex-responsive">
            <input
              type="text"
              value={novoCliente}
              onChange={(e) => setNovoCliente(e.target.value)}
              placeholder="Nome do cliente"
              className="input-responsive border border-[color:var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] transition"
              onKeyUp={(e) => e.key === "Enter" && adicionarCliente()}
            />
            <button
              onClick={adicionarCliente}
              disabled={createClientMutation.isPending}
              className="button-responsive bg-[color:var(--primary)] text-[color:var(--primary-foreground)] rounded-lg hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap transition"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Adicionar</span>
            </button>
          </div>
          {nextExecutive && (
            <p className="text-sm text-[color:var(--muted-foreground)] mt-1">
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

        {/* Gerenciar Executivos */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[color:var(--muted-foreground)]">
            Gerenciar Executivos
          </label>
          <div className="flex-responsive">
            <input
              type="text"
              value={novoExecutivo}
              onChange={(e) => setNovoExecutivo(e.target.value)}
              placeholder="Nome do executivo"
              className="input-responsive border border-[color:var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] transition"
              onKeyPress={(e) => e.key === "Enter" && adicionarExecutivo()}
            />
            <button
              onClick={adicionarExecutivo}
              disabled={createExecutiveMutation.isPending}
              className="button-responsive bg-[color:var(--primary)] text-[color:var(--primary-foreground)] rounded-lg hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap transition"
            >
              <Users size={16} />
              <span className="hidden sm:inline">Adicionar</span>
            </button>
          </div>
        </div>

        {/* Upload e Lista Manual separadas visualmente */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-[color:var(--muted-foreground)]">
            Upload de Clientes
          </label>

          {/* Select Executivo */}
          <select
            value={uploadExecutivo}
            onChange={(e) => setUploadExecutivo(e.target.value)}
            className="input-responsive border border-[color:var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] transition w-full"
          >
            <option value="">Selecione executivo</option>
            {executivos.map((exec) => (
              <option key={exec.id} value={exec.name}>
                {exec.name}
              </option>
            ))}
          </select>

          {/* Upload de Arquivo */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              type="file"
              accept=".txt,.csv,.xlsx,.xls"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="input-responsive border border-[color:var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] text-xs sm:text-sm"
            />
            <button
              onClick={processarUpload}
              disabled={bulkUploadMutation.isPending}
              className="button-responsive bg-[color:var(--primary)] text-[color:var(--primary-foreground)] rounded-lg hover:brightness-110 disabled:opacity-50 flex items-center gap-2 justify-center transition"
            >
              <Upload size={16} />
              Upload
            </button>
          </div>

          <hr className="border-[color:var(--border)]" />

          {/* Lista Manual */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="block text-sm font-medium text-[color:var(--muted-foreground)]">
                Inserção Manual
              </span>
              <button
                onClick={() => setShowListaInput(!showListaInput)}
                className="button-responsive bg-[color:var(--primary)] text-[color:var(--primary-foreground)] rounded-lg hover:brightness-110 transition flex items-center gap-2"
              >
                <Upload size={16} />
                Lista
              </button>
            </div>

            {showListaInput && (
              <div className="space-y-2">
                <textarea
                  value={listaClientes}
                  onChange={(e) => setListaClientes(e.target.value)}
                  placeholder="Digite os nomes dos clientes (um por linha)"
                  rows={4}
                  className="input-responsive border border-[color:var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] resize-y min-h-20 transition w-full"
                />
                <button
                  onClick={processarListaManual}
                  disabled={bulkManualMutation.isPending}
                  className="button-responsive bg-[color:var(--primary)] text-[color:var(--primary-foreground)] rounded-lg hover:brightness-110 disabled:opacity-50 w-full sm:w-auto transition"
                >
                  Adicionar Lista
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={pularExecutivo}
          className="bg-[color:var(--destructive)] text-[color:var(--destructive-foreground)] px-5 py-2 rounded-lg hover:brightness-110 transition"
        >
          Pular Próximo
        </button>
        <button
          onClick={() => setShowDashboard(true)}
          className="button-responsive bg-[color:var(--primary)] text-[color:var(--primary-foreground)] rounded-lg hover:brightness-110 flex items-center justify-center gap-2 w-full sm:w-auto transition"
        >
          <BarChart3 size={16} />
          Dashboard
        </button>
      </div>
    </div>
  );
};

export default PainelControle;
