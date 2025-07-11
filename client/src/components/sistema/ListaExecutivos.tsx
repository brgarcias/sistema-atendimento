import { Trash2 } from "lucide-react";

interface ListaExecutivoProps {
  executivos: Array<{
    id: number;
    name: string;
    color: string;
    createdAt: Date;
  }>;
  nextExecutive?: {
    id: number;
    name: string;
    color: string;
    createdAt: Date;
  };
  deleteExecutiveMutation: {
    isPending: boolean;
    mutate: (id: number) => void;
  };
}

/**
 * ListaExecutivos component displays a list of registered executives with options to delete them.
 * It highlights the next executive in line for assignment.
 */
const ListaExecutivos = ({
  executivos,
  nextExecutive,
  deleteExecutiveMutation,
}: ListaExecutivoProps) => {
  return (
    <div className="mt-4 card-responsive bg-card text-card-foreground rounded-xl shadow border">
      <h3 className="text-lg font-semibold mb-5">Executivos Cadastrados</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {executivos.map((exec) => (
          <div
            key={exec.id}
            className="flex items-center justify-between p-3 border border-[color:var(--border)] rounded-lg shadow-sm bg-[color:var(--background)]"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className="w-5 h-5 rounded-full flex-shrink-0"
                style={{ backgroundColor: exec.color }}
                aria-hidden="true"
              />
              <span className="font-medium truncate text-sm sm:text-base">
                {exec.name}
              </span>
              {nextExecutive && exec.id === nextExecutive.id && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap select-none">
                  Próximo
                </span>
              )}
            </div>

            <button
              onClick={() => deleteExecutiveMutation.mutate(exec.id)}
              disabled={deleteExecutiveMutation.isPending}
              aria-label={`Excluir executivo ${exec.name}`}
              className="text-[color:var(--destructive)] hover:text-[color:var(--destructive-hover)] disabled:opacity-50 p-1 transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListaExecutivos;
