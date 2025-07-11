import { ClientWithExecutive } from "@/lib/api";
import { Trash2 } from "lucide-react";

interface ListaClientesProps {
  clientesFiltrados: ClientWithExecutive[];
  updateClientMutation: {
    isPending: boolean;
    mutate: (data: { id: number; updates: { proposalSent: boolean } }) => void;
  };
  deleteClientMutation: {
    isPending: boolean;
    mutate: (id: number) => void;
  };
}

/** ListaClientes component displays a list of clients with options to update proposal status and delete clients.
 * It highlights the executive assigned to each client.
 */
const ListaClientes = ({
  clientesFiltrados,
  updateClientMutation,
  deleteClientMutation,
}: ListaClientesProps) => {
  return (
    <div className="card-responsive bg-card text-card-foreground rounded-xl shadow border">
      <h3 className="text-lg font-semibold mb-5">
        Clientes Cadastrados ({clientesFiltrados.length})
      </h3>

      <div className="table-responsive">
        <table className="w-full min-w-full border-collapse">
          <thead>
            <tr className="border-b border-[color:var(--border)]">
              <th className="text-left py-3 px-4 text-sm sm:text-base text-[color:var(--muted-foreground)]">
                Cliente
              </th>
              <th className="text-left py-3 px-4 text-sm sm:text-base text-[color:var(--muted-foreground)] hidden sm:table-cell">
                Executivo
              </th>
              <th className="text-left py-3 px-4 text-xs sm:text-sm text-[color:var(--muted-foreground)] hidden md:table-cell">
                Data de Entrada
              </th>
              <th className="text-left py-3 px-4 text-sm sm:text-base text-[color:var(--muted-foreground)]">
                Proposta
              </th>
              <th className="text-left py-3 px-4 text-sm sm:text-base text-[color:var(--muted-foreground)]">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {clientesFiltrados.map((cliente) => (
              <tr
                key={cliente.id}
                className="border-b border-[color:var(--border)] hover:bg-[color:var(--muted)] dark:hover:bg-[color:var(--muted)] transition cursor-default"
              >
                <td className="py-3 px-4 text-sm sm:text-base font-medium max-w-xs truncate">
                  <div className="truncate">{cliente.name}</div>
                  <div className="sm:hidden text-xs text-[color:var(--muted-foreground)] mt-1 flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cliente.executiveColor }}
                    />
                    {cliente.executiveName}
                  </div>
                </td>

                <td className="py-3 px-4 text-sm sm:text-base hidden sm:table-cell max-w-[150px] truncate">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cliente.executiveColor }}
                    />
                    <span className="truncate">{cliente.executiveName}</span>
                  </div>
                </td>

                <td className="py-3 px-4 text-xs sm:text-sm text-[color:var(--muted-foreground)] hidden md:table-cell whitespace-nowrap">
                  {new Date(cliente.createdAt).toLocaleString("pt-BR")}
                </td>

                <td className="py-3 px-4">
                  <button
                    onClick={() =>
                      updateClientMutation.mutate({
                        id: cliente.id,
                        updates: { proposalSent: !cliente.proposalSent },
                      })
                    }
                    disabled={updateClientMutation.isPending}
                    className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium disabled:opacity-50 whitespace-nowrap transition ${
                      cliente.proposalSent
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {cliente.proposalSent ? "Enviada" : "Pendente"}
                  </button>
                </td>

                <td className="py-3 px-4">
                  <button
                    onClick={() => deleteClientMutation.mutate(cliente.id)}
                    disabled={deleteClientMutation.isPending}
                    className="text-[color:var(--destructive)] hover:text-[color:var(--destructive-hover)] disabled:opacity-50 p-1 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaClientes;
