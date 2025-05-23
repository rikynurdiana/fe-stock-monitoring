'use client';

import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface ChartData {
  timestamp: number;
  price: number;
}

interface ChartResponse {
  symbol: string;
  chart: ChartData[];
}

const AVAILABLE_SYMBOLS = ['BBRI', 'BBCA', 'TLKM', 'ANTM'];

export default function Home() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [chartData, setChartData] = useState<{ [key: string]: ChartData[] }>({});
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['BBCA', 'BBRI']);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const socket = io('http://localhost:3000');
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('getStock', selectedSymbols);
      socket.emit('getChart', selectedSymbols);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('stockData', (data: StockData[]) => {
      setStocks(data);
    });

    socket.on('chartData', (data: ChartResponse[] | ChartResponse) => {
      console.log('chartData received:', data);
      setChartData(prev => {
        if (Array.isArray(data)) {
          const updates: { [key: string]: ChartData[] } = {};
          data.forEach(item => {
            updates[item.symbol] = item.chart;
          });
          return { ...prev, ...updates };
        }
        return { ...prev, [data.symbol]: data.chart };
      });
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Emit ulang setiap selectedSymbols berubah, gunakan socket yang sama
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('getStock', selectedSymbols);
      socketRef.current.emit('getChart', selectedSymbols);
    }
  }, [selectedSymbols]);

  const handleToggleSymbol = (symbol: string) => {
    if (selectedSymbols.includes(symbol)) {
      setSelectedSymbols(selectedSymbols.filter(s => s !== symbol));
    } else {
      setSelectedSymbols([...selectedSymbols, symbol]);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Stock Market Monitor</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex gap-2 mb-4 flex-wrap items-center">
            {AVAILABLE_SYMBOLS.map(symbol => (
              <button
                key={symbol}
                onClick={() => handleToggleSymbol(symbol)}
                className={`px-4 py-1 rounded-full border transition-colors font-semibold ${selectedSymbols.includes(symbol)
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-white dark:bg-slate-800 text-blue-700 border-blue-300 hover:bg-blue-100 dark:hover:bg-slate-700'}`}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {selectedSymbols.map(symbol => {
            const stock = stocks.find(s => s.symbol === symbol);
            const data = chartData[symbol];
            if (!stock && (!Array.isArray(data) || data.length === 0)) return null;
            
            const lastPrice = data && data.length > 0 ? data[data.length - 1]?.price ?? 0 : stock?.price ?? 0;
            const firstPrice = data && data.length > 0 ? data[0]?.price ?? 0 : stock?.price ?? 0;
            const priceChange = stock ? stock.change : (lastPrice - firstPrice);
            const priceChangePercent = stock ? stock.changePercent : ((lastPrice - firstPrice) / firstPrice * 100);
            return (
              <div key={symbol} className="stock-card">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{symbol}</h2>
                  <span className="stock-price">
                    {lastPrice?.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex gap-2 mb-2">
                  <span className={`stock-change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
                    {priceChange >= 0 ? '+' : ''}{priceChange?.toLocaleString('id-ID')}
                  </span>
                  <span className={`stock-change ${priceChangePercent >= 0 ? 'positive' : 'negative'}`}>
                    ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent?.toFixed(2)}%)
                  </span>
                </div>
                {Array.isArray(data) && data.length > 0 && (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(timestamp) => new Date(timestamp * 1000).toLocaleTimeString()}
                        />
                        <YAxis 
                          domain={['auto', 'auto']}
                          tickFormatter={(value) => value.toLocaleString('id-ID')}
                        />
                        <Tooltip 
                          labelFormatter={(timestamp) => new Date(timestamp * 1000).toLocaleString()}
                          formatter={(value) => [value.toLocaleString('id-ID'), 'Price']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke={priceChange >= 0 ? '#22c55e' : '#ef4444'} 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
