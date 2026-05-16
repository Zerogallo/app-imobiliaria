import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
  RefreshControl, Alert, Modal, TouchableWithoutFeedback, Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Appointment {
  id: number;
  clientName: string;
  time: string;
  date: string;
  notes?: string;
  status?: string;
}

interface Client {
  id: number;
  name: string;
  phone: string;
  firstServiceDate: string;
}

interface Property {
  id: number;
  streetName: string;
  location: string;
  price: number;
  photo?: string;
  status?: string;
  propertyType?: string;
}

export default function Home() {
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const { user, signOut } = useAuth();
  const navigation = useNavigation();

  const fetchData = async () => {
    try {
      const [appointmentsRes, clientsRes, propertiesRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/clients'),
        api.get('/properties')
      ]);
      
      // Ordena por data e hora (mais recentes primeiro) e pega os 5 primeiros
      const sortedAppointments = appointmentsRes.data.sort((a: Appointment, b: Appointment) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });
      
      setRecentAppointments(sortedAppointments.slice(0, 5));
      setRecentClients(clientsRes.data.slice(0, 5));
      setRecentProperties(propertiesRes.data.slice(0, 5));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => signOut() }
    ]);
  };

  const handleMenuOption = (option: string) => {
    setMenuVisible(false);
    if (option === 'cliente') navigation.navigate('NewClient');
    if (option === 'atendimento') navigation.navigate('NewAppointment');
    if (option === 'imovel') navigation.navigate('NewProperty');
  };

  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'confirmado':
        return { icon: 'checkmark-circle', color: '#27ae60', text: 'Confirmado' };
      case 'cancelado':
        return { icon: 'close-circle', color: '#e74c3c', text: 'Cancelado' };
      case 'realizado':
        return { icon: 'checkmark-done-circle', color: '#2980b9', text: 'Realizado' };
      default:
        return { icon: 'time', color: '#f39c12', text: 'Agendado' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusInfoForProperty = (status?: string) => {
    switch (status) {
      case 'vendido':
        return { icon: '💰', text: 'Vendido', color: '#e74c3c' };
      case 'alugado':
        return { icon: '🔑', text: 'Alugado', color: '#f39c12' };
      default:
        return { icon: '✅', text: 'Disponível', color: '#27ae60' };
    }
  };

  // Card de compromisso (agenda)
  const renderAppointmentItem = ({ item }: { item: Appointment }) => {
    const statusInfo = getStatusInfo(item.status);
    return (
      <TouchableOpacity 
        style={styles.appointmentCard} 
        onPress={() => navigation.navigate('EditAppointment', { appointment: item, refresh: fetchData })}
      >
        <View style={styles.appointmentHeader}>
          <View style={styles.appointmentClient}>
            <Ionicons name="person-circle" size={20} color="#2980b9" />
            <Text style={styles.appointmentClientName}>{item.clientName}</Text>
          </View>
          <View style={[styles.appointmentStatus, { backgroundColor: statusInfo.color + '20' }]}>
            <Ionicons name={statusInfo.icon as any} size={10} color={statusInfo.color} />
            <Text style={[styles.appointmentStatusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>
        <View style={styles.appointmentDetails}>
          <View style={styles.appointmentDetail}>
            <Ionicons name="calendar" size={12} color="#7f8c8d" />
            <Text style={styles.appointmentDetailText}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.appointmentDetail}>
            <Ionicons name="time" size={12} color="#7f8c8d" />
            <Text style={styles.appointmentDetailText}>{item.time}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Card de cliente
  const renderClientItem = ({ item }: { item: Client }) => (
    <TouchableOpacity style={styles.horizontalCard} onPress={() => navigation.navigate('EditClient', { client: item, refresh: fetchData })}>
      <Text style={styles.horizontalTitle}>{item.name}</Text>
      <Text style={styles.horizontalSub}>📞 {item.phone}</Text>
      <Text style={styles.horizontalDate}>📅 {new Date(item.firstServiceDate).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  // Card de imóvel
  const renderPropertyItem = ({ item }: { item: Property }) => {
    const statusInfo = getStatusInfoForProperty(item.status);
    return (
      <TouchableOpacity style={styles.propertyCard} onPress={() => navigation.navigate('EditProperty', { property: item, refresh: fetchData })}>
        {item.photo ? (
          <Image source={{ uri: item.photo }} style={styles.propertyImage} />
        ) : (
          <View style={styles.propertyImagePlaceholder}>
            <Text style={styles.propertyImagePlaceholderText}>🏠</Text>
          </View>
        )}
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle} numberOfLines={1}>{item.streetName}</Text>
          <Text style={styles.propertySub} numberOfLines={1}>{item.location}</Text>
          <Text style={styles.propertyPrice}>💰 R$ {item.price.toLocaleString()}</Text>
          <View style={[styles.propertyStatus, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.propertyStatusText, { color: statusInfo.color }]}>
              {statusInfo.icon} {statusInfo.text}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Olá, {user?.name?.split(' ')[0] || 'Usuário'} 👋</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Últimos compromissos da agenda */}
      <Text style={styles.sectionTitle}>📋 Últimos Compromissos (últimos 5)</Text>
      <FlatList
        data={recentAppointments}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum compromisso agendado</Text>}
        renderItem={renderAppointmentItem}
      />

      {/* Últimos clientes */}
      <Text style={styles.sectionTitle}>🆕 Novos Clientes (últimos 5)</Text>
      <FlatList
        horizontal
        data={recentClients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderClientItem}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyHorizontal}>Nenhum cliente cadastrado</Text>}
        contentContainerStyle={styles.horizontalList}
      />

      {/* Últimos imóveis */}
      <Text style={styles.sectionTitle}>🏠 Novos Imóveis (últimos 5)</Text>
      <FlatList
        horizontal
        data={recentProperties}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPropertyItem}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyHorizontal}>Nenhum imóvel cadastrado</Text>}
        contentContainerStyle={styles.horizontalList}
      />

      {/* Botão flutuante */}
      <TouchableOpacity style={styles.fab} onPress={() => setMenuVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('cliente')}>
                <Text style={styles.menuItemText}>➕ Novo Cliente</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('atendimento')}>
                <Text style={styles.menuItemText}>📅 Novo Atendimento (Agenda)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('imovel')}>
                <Text style={styles.menuItemText}>🏠 Novo Imóvel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.menuItem, styles.cancelItem]} onPress={() => setMenuVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  welcome: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50' },
  logoutText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8, color: '#34495e' },
  empty: { textAlign: 'center', color: '#95a5a6', marginTop: 20, fontSize: 16 },
  horizontalList: { paddingRight: 16 },
  emptyHorizontal: { textAlign: 'center', color: '#95a5a6', fontSize: 14, marginLeft: 16 },
  
  // Card de compromisso (agenda)
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentClient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appointmentClientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  appointmentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  appointmentStatusText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  appointmentDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  appointmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  appointmentDetailText: {
    fontSize: 11,
    color: '#7f8c8d',
  },
  
  // Cards de cliente
  horizontalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 160,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  horizontalTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  horizontalSub: { fontSize: 12, color: '#7f8c8d' },
  horizontalDate: { fontSize: 10, color: '#95a5a6', marginTop: 4 },
  
  // Cards de imóvel
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    width: 200,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyImage: { width: '100%', height: 120, resizeMode: 'cover' },
  propertyImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyImagePlaceholderText: { fontSize: 40, color: '#bdc3c7' },
  propertyInfo: { padding: 10 },
  propertyTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  propertySub: { fontSize: 12, color: '#7f8c8d', marginBottom: 4 },
  propertyPrice: { fontSize: 13, fontWeight: 'bold', color: '#27ae60', marginBottom: 6 },
  propertyStatus: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  propertyStatusText: { fontSize: 10, fontWeight: 'bold' },
  
  // Menu flutuante
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2980b9',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: { fontSize: 32, color: '#fff', fontWeight: 'bold', marginTop: -4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  menuContainer: { backgroundColor: '#fff', borderRadius: 12, width: '80%', overflow: 'hidden', elevation: 5 },
  menuItem: { paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  menuItemText: { fontSize: 16, color: '#2c3e50' },
  cancelItem: { borderBottomWidth: 0 },
  cancelText: { fontSize: 16, color: '#e74c3c', textAlign: 'center', fontWeight: 'bold' },
});