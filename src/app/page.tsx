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

interface WeeklyData {
  Close: number;
  Date: string;
  Dividends: number;
  High: number;
  Low: number;
  Open: number;
  Stock_Splits: number;
  Volume: number;
}

interface StockDataReal {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  date: string;
  weeklyData: WeeklyData[];
}



const AVAILABLE_SYMBOLS = ['BBRI', 'BBCA', 'TLKM', 'ANTM'];

export default function Home() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [allStocks, setAllStocks] = useState<StockDataReal[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [chartData, setChartData] = useState<{ [key: string]: ChartData[] }>({});
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['BBCA', 'BBRI', 'TLKM', 'ANTM']);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const socket = io('http://localhost:3000');
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('getStockDummy', selectedSymbols);
      socket.emit('getChartDummy', selectedSymbols);
      socket.emit('getAllStocksReal');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('stockDataDummy', (data: StockData[]) => {
      setStocks(data);
    });

    socket.on('stockDataReal', (data: StockDataReal[]) => {
      setAllStocks(data);
    });

    socket.on('chartDataDummy', (data: ChartResponse[] | ChartResponse) => {
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
      socketRef.current.emit('getStockDummy', selectedSymbols);
      socketRef.current.emit('getChartDummy', selectedSymbols);
    }
  }, [selectedSymbols]);

  const handleToggleSymbol = (symbol: string) => {
    if (selectedSymbols.includes(symbol)) {
      setSelectedSymbols(selectedSymbols.filter(s => s !== symbol));
    } else {
      setSelectedSymbols([...selectedSymbols, symbol]);
    }
  };

  

  const CustomTooltip = ({ payload }: { payload: any }) => {
    if (payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white text-black p-2">
          <p className="intro">{`Open: Rp ${payload[0].payload.open.toLocaleString('id-ID')}`}</p>
          <p className="intro">{`High: Rp ${payload[0].payload.high.toLocaleString('id-ID')}`}</p>
          <p className="intro">{`Low: Rp ${payload[0].payload.low.toLocaleString('id-ID')}`}</p>
          <p className="intro">{`Close: Rp ${payload[0].payload.close.toLocaleString('id-ID')}`}</p>
          <p className="intro">{`Volume: ${payload[0].payload.volume.toLocaleString('id-ID')}`}</p>
        </div>
      );
    }

    return null;
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
          <div className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Contoh Implementasi Dummy Data dengan Interval 5 Detik
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

      <div className="max-w-6xl mx-auto mt-10">
        <div className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Contoh Implementasi Real Data dari YFinance stock data (range 1 Minggu)
          </div>

      <div className="grid grid-cols-2 gap-4">
        {allStocks.map((stock) => {
          const data = stock.weeklyData?.map((item: WeeklyData) => ({
            timestamp: new Date(item.Date).getTime() / 1000,
            price: item.Close,
            open: item.Open,
            high: item.High,
            low: item.Low,
            close: item.Close,
            volume: item.Volume,
            dividends: item.Dividends,
            stockSplits: item.Stock_Splits,
          })) || [];

          const priceChange = stock.change;
          const priceChangePercent = stock.changePercent;

          return (
            <div key={stock.symbol} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{stock.symbol}</h3>
                <span className="text-lg font-medium">
                  {stock.price?.toLocaleString('id-ID')}
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
              {data.length > 0 && (
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(timestamp) => new Date(timestamp * 1000).toLocaleDateString()}
                      />
                      <YAxis 
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => value.toLocaleString('id-ID')}
                      />
                      <Tooltip content={<CustomTooltip payload={data} />} />
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
