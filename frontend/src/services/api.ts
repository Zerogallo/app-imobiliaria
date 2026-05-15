import axios from 'axios';
import { Platform } from 'react-native';

// 🔧 Substitua pelo IP da sua máquina na rede local (ex: 192.168.0.100)
// Para descobrir o IP:
// - Windows: ipconfig (procure IPv4)
// - Mac/Linux: ifconfig | grep inet
const LOCAL_IP = '192.168.1.70'; // MUDE PARA O SEU IP REAL
const PORT = '3333';

const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Opção 1: IP real (recomendado, funciona sem firewall complicado)
      return `http://${LOCAL_IP}:${PORT}/api`;
      // Opção 2: 10.0.2.2 (não está funcionando no seu caso)
      // return 'http://10.0.2.2:3333/api';
    }
    // iOS ou simulador
    return `http://localhost:${PORT}/api`;
  }
  // Produção
  return 'https://api.seusite.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000, // aumentei para 15s
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para log de requisições (ajuda na depuração)
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros de rede
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Timeout - servidor não respondeu a tempo');
    } else if (!error.response) {
      console.error('❌ Sem resposta do servidor. Verifique se o backend está rodando e acessível.');
    }
    return Promise.reject(error);
  }
);

export default api;