'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#9333ea']

interface Props {
  data: {
    sesionesPorDia: { dia: string; total: number }[]
    porConector: { name: string; value: number }[]
  }
}

export default function AdminCharts({ data }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Sesiones últimos 7 días</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.sesionesPorDia}>
            <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Sesiones por tipo de conector</h2>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data.porConector} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {data.porConector.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
