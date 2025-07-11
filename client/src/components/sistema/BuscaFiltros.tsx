import { Search } from "lucide-react";

interface BuscaFiltrosProps {
  busca: string;
  setBusca: (value: string) => void;
  filtroColuna: string;
  setFiltroColuna: (value: string) => void;
}

/**
 * BuscaFiltros component provides a search input and filter for client and executive lists.
 * It allows users to search by name and filter by any column.
 */
const BuscaFiltros = ({
  busca,
  setBusca,
  filtroColuna,
  setFiltroColuna,
}: BuscaFiltrosProps) => {
  return (
    <div className="mt-4 bg-white rounded-lg shadow-lg card-responsive mb-4 sm:mb-6 mx-2 sm:mx-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="input-busca"
            className="block text-sm font-medium text-gray-700"
          >
            Buscar Cliente/Executivo
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
              aria-hidden="true"
            />
            <input
              id="input-busca"
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite o nome..."
              className="input-responsive pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Buscar Cliente ou Executivo"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="input-filtro-coluna"
            className="block text-sm font-medium text-gray-700"
          >
            Filtrar Colunas
          </label>
          <input
            id="input-filtro-coluna"
            type="text"
            value={filtroColuna}
            onChange={(e) => setFiltroColuna(e.target.value)}
            placeholder="Filtrar por qualquer coluna..."
            className="input-responsive border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filtrar por qualquer coluna"
          />
        </div>
      </div>
    </div>
  );
};

export default BuscaFiltros;
