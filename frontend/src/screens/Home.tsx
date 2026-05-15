import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
  RefreshControl, Alert, Modal, TouchableWithoutFeedback
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Appointment {
  id: number;
  clientName: string;
  time: string;
  date: string;
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
}

export default function Home() {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const { user, signOut } = useAuth();
  const navigation = useNavigation();

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [appointmentsRes, clientsRes, propertiesRes] = await Promise.all([
        api.get(`/appointments?date=${today}`),
        api.get('/clients'),
        api.get('/properties')
      ]);
      setTodayAppointments(appointmentsRes.data);
      // Últimos 5 clientes (mais recentes primeiro)
      setRecentClients(clientsRes.data.slice(0, 5));
      // Últimos 5 imóveis
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

  const renderClientItem = ({ item }: { item: Client }) => (
    <TouchableOpacity style={styles.horizontalCard} onPress={() => navigation.navigate('EditClient', { client: item, refresh: fetchData })}>
      <Text style={styles.horizontalTitle}>{item.name}</Text>
      <Text style={styles.horizontalSub}>📞 {item.phone}</Text>
      <Text style={styles.horizontalDate}>📅 {new Date(item.firstServiceDate).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  const renderPropertyItem = ({ item }: { item: Property }) => (
    <TouchableOpacity style={styles.horizontalCard} onPress={() => navigation.navigate('EditProperty', { property: item, refresh: fetchData })}>
      <Text style={styles.horizontalTitle}>{item.streetName}</Text>
      <Text style={styles.horizontalSub}>{item.location}</Text>
      <Text style={styles.priceText}>💰 R$ {item.price.toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Olá, {user?.name?.split(' ')[0] || 'Usuário'} 👋</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Atendimentos de hoje (lista vertical) */}
      <Text style={styles.sectionTitle}>📅 Atendimentos de Hoje</Text>
      <FlatList
        data={todayAppointments}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum atendimento hoje</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.clientName}>{item.clientName}</Text>
            <Text style={styles.time}>⏰ {item.time}</Text>
          </View>
        )}
      />

      {/* Últimos clientes (horizontal) */}
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

      {/* Últimos imóveis (horizontal) */}
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

      {/* Botão flutuante + menu */}
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
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  clientName: { fontSize: 16, fontWeight: 'bold' },
  time: { fontSize: 14, color: '#7f8c8d', marginTop: 4 },
  empty: { textAlign: 'center', color: '#95a5a6', marginTop: 20, fontSize: 16 },
  horizontalList: { paddingRight: 16 },
  horizontalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginRight: 12, width: 160, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  horizontalTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  horizontalSub: { fontSize: 12, color: '#7f8c8d' },
  horizontalDate: { fontSize: 10, color: '#95a5a6', marginTop: 4 },
  priceText: { fontSize: 12, fontWeight: 'bold', color: '#27ae60', marginTop: 4 },
  emptyHorizontal: { textAlign: 'center', color: '#95a5a6', fontSize: 14, marginLeft: 16 },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2980b9', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
  fabText: { fontSize: 32, color: '#fff', fontWeight: 'bold', marginTop: -4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  menuContainer: { backgroundColor: '#fff', borderRadius: 12, width: '80%', overflow: 'hidden', elevation: 5 },
  menuItem: { paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  menuItemText: { fontSize: 16, color: '#2c3e50' },
  cancelItem: { borderBottomWidth: 0 },
  cancelText: { fontSize: 16, color: '#e74c3c', textAlign: 'center', fontWeight: 'bold' },
});