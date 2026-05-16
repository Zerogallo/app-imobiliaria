import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';

interface Client {
  id: number;
  name: string;
  phone: string;
}

export default function NewAppointment({ navigation }: any) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [clientName, setClientName] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('agendado');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const handleSave = async () => {
    if (!selectedClientId || !clientName) {
      Alert.alert('Erro', 'Selecione um cliente');
      return;
    }

    const formattedDate = date.toISOString().split('T')[0];
    const formattedTime = time.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    setLoading(true);
    try {
      const response = await api.post('/appointments', {
        clientId: selectedClientId,
        clientName,
        date: formattedDate,
        time: formattedTime,
        notes,
        status,
        createdAt: new Date().toISOString()
      });
      Alert.alert('Sucesso', response.data.message || 'Compromisso agendado!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao agendar');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) setTime(selectedTime);
  };

  const statusOptions = [
    { value: 'agendado', label: '📅 Agendado', color: '#f39c12' },
    { value: 'confirmado', label: '✅ Confirmado', color: '#27ae60' },
    { value: 'cancelado', label: '❌ Cancelado', color: '#e74c3c' },
    { value: 'realizado', label: '🏆 Realizado', color: '#2980b9' }
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Seleção de Cliente */}
        <Text style={styles.label}>👤 Cliente *</Text>
        <View style={styles.clientList}>
          {clients.map((client) => (
            <TouchableOpacity
              key={client.id}
              style={[
                styles.clientButton,
                selectedClientId === client.id && styles.clientButtonSelected
              ]}
              onPress={() => {
                setSelectedClientId(client.id);
                setClientName(client.name);
              }}
            >
              <Text style={[
                styles.clientButtonText,
                selectedClientId === client.id && styles.clientButtonTextSelected
              ]}>
                {client.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Data */}
        <Text style={styles.label}>📅 Data *</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text>{date.toLocaleDateString('pt-BR')}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {/* Hora */}
        <Text style={styles.label}>⏰ Hora *</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
          <Text>{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}

        {/* Status */}
        <Text style={styles.label}>🏷️ Status</Text>
        <View style={styles.statusContainer}>
          {statusOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.statusButton,
                status === opt.value && { backgroundColor: opt.color }
              ]}
              onPress={() => setStatus(opt.value)}
            >
              <Text style={[
                styles.statusButtonText,
                status === opt.value && styles.statusButtonTextSelected
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Observações */}
        <Text style={styles.label}>📝 Observações</Text>
        <TextInput
          style={styles.textArea}
          value={notes}
          onChangeText={setNotes}
          placeholder="Adicione observações sobre o atendimento..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Botão Salvar */}
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={loading}
        >
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>
            {loading ? 'Salvando...' : 'Agendar Compromisso'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', padding: 16 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8, color: '#34495e' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  clientList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  clientButton: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  clientButtonSelected: { backgroundColor: '#2980b9' },
  clientButtonText: { color: '#2c3e50' },
  clientButtonTextSelected: { color: '#fff', fontWeight: 'bold' },
  statusContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  statusButton: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statusButtonText: { color: '#2c3e50' },
  statusButtonTextSelected: { color: '#fff', fontWeight: 'bold' },
  saveButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 40,
    gap: 8,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});