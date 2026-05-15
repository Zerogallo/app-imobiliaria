import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import api from '../services/api';

interface Appointment {
  _id: string;
  clientName: string;
  date: string;
  time: string;
}

export default function Agenda({ navigation }: any) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => fetchAppointments());
    return unsubscribe;
  }, [navigation]);

  const fetchAppointments = async () => {
    const res = await api.get('/appointments');
    setAppointments(res.data);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirmar', 'Remover compromisso?', [
      { text: 'Cancelar' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        await api.delete(`/appointments/${id}`);
        fetchAppointments();
      } }
    ]);
  };

  return (
    <FlatList
      data={appointments}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.client}>{item.clientName}</Text>
          <Text style={styles.datetime}>{item.date} às {item.time}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditAppointment', { appointment: item, refresh: fetchAppointments })}>
              <Text style={styles.btnText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
              <Text style={styles.btnText}>Deletar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', margin: 12, padding: 16, borderRadius: 12, elevation: 2 },
  client: { fontSize: 18, fontWeight: 'bold' },
  datetime: { fontSize: 14, color: '#7f8c8d', marginVertical: 8 },
  buttons: { flexDirection: 'row', gap: 12 },
  editBtn: { backgroundColor: '#f39c12', padding: 8, borderRadius: 6, flex: 1, alignItems: 'center' },
  deleteBtn: { backgroundColor: '#e74c3c', padding: 8, borderRadius: 6, flex: 1, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
});