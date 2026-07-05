import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Loader from '../components/Loader';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function Dashboard({ setPage }) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalSales: 0,
    totalRevenue: 0,
    avgSale: 0,
    totalCustomers: 0,
    topProducts: [],
    topCustomers: [],
    recentSales: [],
    salesByDay: [],
    salesByDayLabels: [],
    paymentMethodLabels: [],
    paymentMethodValues: [],
    loading: false
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setStats((prev) => ({ ...prev, loading: true }));
    try {
      const results = await Promise.allSettled([
        API.get('/products'),
        API.get('/sales'),
        API.get('/customers')
      ]);

      const [productsRes, salesRes, customersRes] = results;
      const productList = Array.isArray(productsRes.value?.data)
        ? productsRes.value.data
        : Array.isArray(productsRes.value?.data?.products)
          ? productsRes.value.data.products
          : [];
      const salesList = Array.isArray(salesRes.value?.data)
        ? salesRes.value.data
        : Array.isArray(salesRes.value?.data?.sales)
          ? salesRes.value.data.sales
          : [];
      const customerList = Array.isArray(customersRes.value?.data)
        ? customersRes.value.data
        : Array.isArray(customersRes.value?.data?.customers)
          ? customersRes.value.data.customers
          : [];

      const errors = results
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason?.response?.data?.message || result.reason?.message)
        .filter(Boolean);

      if (errors.length) {
        window.dispatchEvent(new CustomEvent('notify', {
          detail: {
            type: 'error',
            message: `Error al cargar datos: ${errors.join(' / ')}`
          }
        }));
      }

      const lowStock = productList.filter((p) => Number(p.stock) < 5).length;
      const totalRevenue = salesList.reduce((sum, sale) => sum + (sale.total || 0), 0);

      const productSalesCount = {};
      const customerTotals = {};
      const paymentMethodStats = {};

      salesList.forEach((sale) => {
        sale.items?.forEach((item) => {
          const productId = item.product?._id || item.product;
          productSalesCount[productId] = (productSalesCount[productId] || 0) + item.quantity;
        });

        const customerName = sale.customerId?.name || sale.customer?.name || 'Anónimo';
        customerTotals[customerName] = (customerTotals[customerName] || 0) + (sale.total || 0);

        const method = sale.paymentMethod || 'efectivo';
        paymentMethodStats[method] = (paymentMethodStats[method] || 0) + 1;
      });

      const topProducts = productList
        .map((p) => ({
          ...p,
          salesCount: productSalesCount[p._id] || 0
        }))
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, 5);

      const topCustomers = Object.entries(customerTotals)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      const paymentMethodLabels = Object.keys(paymentMethodStats);
      const paymentMethodValues = Object.values(paymentMethodStats);

      const recentSales = salesList.slice(-5).reverse();

      const today = new Date();
      const dailyLabels = [];
      const salesByDayMap = {};
      for (let offset = 6; offset >= 0; offset -= 1) {
        const date = new Date(today);
        date.setDate(today.getDate() - offset);
        const label = date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
        dailyLabels.push(label);
        salesByDayMap[label] = 0;
      }

      salesList.forEach((sale) => {
        const label = new Date(sale.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
        if (salesByDayMap[label] !== undefined) {
          salesByDayMap[label] += sale.total || 0;
        }
      });

      const salesByDay = dailyLabels.map((label) => salesByDayMap[label]);
      const avgSale = salesList.length > 0 ? (totalRevenue / salesList.length).toFixed(2) : 0;

      setStats({
        totalProducts: productList.length,
        lowStockCount: lowStock,
        totalSales: salesList.length,
        totalRevenue: totalRevenue.toFixed(2),
        avgSale,
        totalCustomers: customerList.length,
        topProducts,
        topCustomers,
        recentSales,
        salesByDay,
        salesByDayLabels: dailyLabels,
        paymentMethodLabels,
        paymentMethodValues,
        loading: false
      });
    } catch (error) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'Error al cargar dashboard' } }));
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  if (stats.loading) return <Loader size={24} />;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">📊 Dashboard</h2>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6 max-w-7xl mx-auto">
        <div className="bg-blue-50 border border-blue-300 rounded-2xl p-6 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-blue-600 font-bold">Total de Productos</p>
              <p className="text-3xl font-bold text-blue-800 mt-2">{stats.totalProducts}</p>
            </div>
            <span className="text-3xl">📦</span>
          </div>
          <button
            onClick={() => setPage('products')}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-semibold"
          >
            Ver productos →
          </button>
        </div>

        <div className="bg-green-50 border border-green-300 rounded-2xl p-6 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-green-600 font-bold">Ingresos Totales</p>
              <p className="text-3xl font-bold text-green-800 mt-2">${stats.totalRevenue}</p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
          <p className="text-xs text-green-600 mt-4">{stats.totalSales} ventas</p>
        </div>

        <div className="bg-purple-50 border border-purple-300 rounded-2xl p-6 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-purple-600 font-bold">Promedio por Venta</p>
              <p className="text-3xl font-bold text-purple-800 mt-2">${stats.avgSale}</p>
            </div>
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-xs text-purple-600 mt-4">Base de ventas reciente</p>
        </div>

        <div className="bg-red-50 border border-red-300 rounded-2xl p-6 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-red-600 font-bold">Bajo Stock</p>
              <p className="text-3xl font-bold text-red-800 mt-2">{stats.lowStockCount}</p>
            </div>
            <span className="text-3xl">⚠️</span>
          </div>
          <button
            onClick={() => setPage('products')}
            className="mt-4 text-sm text-red-600 hover:text-red-800 font-semibold"
          >
            Revisar stock →
          </button>
        </div>

        <div className="bg-orange-50 border border-orange-300 rounded-2xl p-6 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-orange-600 font-bold">Total Clientes</p>
              <p className="text-3xl font-bold text-orange-800 mt-2">{stats.totalCustomers}</p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
          <button
            onClick={() => setPage('customers')}
            className="mt-4 text-sm text-orange-600 hover:text-orange-800 font-semibold"
          >
            Ver clientes →
          </button>
        </div>

        <div className="bg-sky-50 border border-sky-300 rounded-2xl p-6 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-sky-600 font-bold">Ventas Totales</p>
              <p className="text-3xl font-bold text-sky-800 mt-2">{stats.totalSales}</p>
            </div>
            <span className="text-3xl">🛒</span>
          </div>
          <button
            onClick={() => setPage('reports')}
            className="mt-4 text-sm text-sky-600 hover:text-sky-800 font-semibold"
          >
            Ver reportes →
          </button>
        </div>
      </div>

      {/* Productos top y Ventas recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">🏆 Top 5 Productos</h3>
          {stats.topProducts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay datos</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((product, idx) => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-blue-600">#{idx + 1}</span>
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-gray-600">${product.price}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{product.salesCount}</p>
                    <p className="text-xs text-gray-600">unidades vendidas</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">👥 Clientes Top</h3>
          {stats.topCustomers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay datos</p>
          ) : (
            <div className="space-y-3">
              {stats.topCustomers.map((customer, idx) => (
                <div key={customer.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-xs text-gray-600">Cliente frecuente</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${customer.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-600">Gastado</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 lg:col-span-2">
          <h3 className="text-xl font-bold mb-4">📈 Ventas Recientes</h3>
          {stats.recentSales.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay ventas</p>
          ) : (
            <div className="space-y-3">
              {stats.recentSales.map((sale) => (
                <div key={sale._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">${sale.total?.toFixed(2) || '0'}</p>
                    <p className="text-xs text-gray-600">{formatDate(sale.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                      {sale.items?.length || 0} items
                    </span>
                    <p className="text-xs text-gray-600 mt-1 capitalize">{sale.paymentMethod || 'efectivo'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-4">📊 Ingresos últimos 7 días</h3>
              <div className="max-w-full">
                <Bar
                  data={{
                    labels: stats.salesByDayLabels,
                    datasets: [
                      {
                        label: 'Ingresos',
                        data: stats.salesByDay,
                        backgroundColor: 'rgba(59, 130, 246, 0.65)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top'
                      },
                      title: {
                        display: false,
                        text: 'Ingresos por día'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `$${value}`
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">💳 Ventas por método</h3>
              <div className="max-w-full">
                <Doughnut
                  data={{
                    labels: stats.paymentMethodLabels,
                    datasets: [
                      {
                        data: stats.paymentMethodValues,
                        backgroundColor: ['#2563eb', '#10b981', '#f97316', '#8b5cf6', '#e11d48'],
                        hoverOffset: 6
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
