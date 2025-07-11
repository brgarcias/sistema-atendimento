"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface GraficoBarraProps {
  data: Array<{
    nome: string;
    Total: number;
    Propostas: number;
    Pendentes: number;
  }>;
}

export const GraficoBarra = ({ data }: GraficoBarraProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="nome" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Total" fill="#2563eb" />
        <Bar dataKey="Propostas" fill="#16a34a" />
        <Bar dataKey="Pendentes" fill="#ea580c" />
      </BarChart>
    </ResponsiveContainer>
  );
};
