import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

interface Client {
  _id: string;
  name: string;
  phone: string;
  email: string;
  firstServiceDate: string;
  familyMembers: number;
  hasPets: boolean;
  propertyType: string;
  lastAttendedBy: string;
  chosenProperty: string;
  visitDate: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const res = await api.get('/clients');
    setClients(res.data);
  };

  const handleContact = (type: string, value: string) => {
    if (type === 'call') Linking.openURL(`tel:${value}`);
    if (type === 'sms') Linking.openURL(`sms:${value}`);
    if (type === 'whatsapp') Linking.openURL(`https://wa.me/${value.replace(/\D/g, '')}`);
    if (type === 'email') Linking.openURL(`mailto:${value}`);
  };

  const handleEdit = (client: Client) => {
    // Navega para a tela de edição, passando o cliente e a função de refresh
    navigation.navigate('EditClient', { client, refresh: fetchClients });
  };

  const renderClient = ({ item }: { item: Client }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.phone}>📞 {item.phone}</Text>
      <Text style={styles.date}>📅 Primeiro atendimento: {new Date(item.firstServiceDate).toLocaleDateString()}</Text>

      <View style={styles.iconRow}>
        <TouchableOpacity onPress={() => handleContact('call', item.phone)}><Text style={styles.icon}>📞 Ligar</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleContact('sms', item.phone)}><Text style={styles.icon}>✉️ SMS</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleContact('whatsapp', item.phone)}><Text style={styles.icon}>📱 WhatsApp</Text></TouchableOpacity>
        {item.email && <TouchableOpacity onPress={() => handleContact('email', item.email)}><Text style={styles.icon}>📧 Email</Text></TouchableOpacity>}
      </View>

      <View style={styles.details}>
        <Text>👨‍👩‍👧‍👦 Família: {item.familyMembers || '?'} pessoas</Text>
        <Text>🐶 Tem pet: {item.hasPets ? 'Sim' : 'Não'}</Text>
        <Text>🏠 Tipo: {item.propertyType === 'house' ? 'Casa' : 'Apartamento'}</Text>
        <Text>🧑‍💼 Último corretor: {item.lastAttendedBy || '—'}</Text>
        <Text>📍 Imóvel escolhido: {item.chosenProperty || '—'}</Text>
        <Text>📅 Visita: {item.visitDate ? new Date(item.visitDate).toLocaleDateString() : '—'}</Text>
      </View>

      {/* Botão de edição */}
      <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
        <Text style={styles.editButtonText}>✏️ Editar Cliente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={clients}
      keyExtractor={(item) => item._id}
      renderItem={renderClient}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 3 },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  phone: { fontSize: 16, color: '#2c3e50', marginBottom: 4 },
  date: { fontSize: 14, color: '#7f8c8d', marginBottom: 12 },
  iconRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderTopWidth: 1, borderTopColor: '#ecf0f1', paddingTop: 12 },
  icon: { fontSize: 14, color: '#2980b9', fontWeight: '500' },
  details: { gap: 4, marginBottom: 8 },
  editButton: {
    backgroundColor: '#f39c12',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});