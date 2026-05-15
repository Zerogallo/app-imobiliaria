import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../services/api';

export default function NewAppointment({ navigation }: any) {
  const [clientName, setClientName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSave = async () => {
    if (!clientName || !date || !time) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    try {
      await api.post('/appointments', { clientName, date, time, clientId: 0 });
      Alert.alert('Sucesso', 'Compromisso adicionado');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Nome do Cliente</Text>
      <TextInput style={styles.input} value={clientName} onChangeText={setClientName} />
      <Text>Data (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2025-12-31" />
      <Text>Horário (HH:MM)</Text>
      <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="14:30" />
      <TouchableOpacity style={styles.button} onPress={handleSave}><Text style={styles.buttonText}>Salvar</Text></TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15 },
  button: { backgroundColor: '#2980b9', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});