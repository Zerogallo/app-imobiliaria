import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';

export default function EditAppointment({ route, navigation }: any) {
  const { appointment, refresh } = route.params;

  const [date, setDate] = useState(new Date(appointment.date));
  const [time, setTime] = useState(() => {
    const [hours, minutes] = appointment.time.split(':');
    const d = new Date();
    d.setHours(parseInt(hours), parseInt(minutes));
    return d;
  });
  const [notes, setNotes] = useState(appointment.notes || '');
  const [status, setStatus] = useState(appointment.status || 'agendado');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) setTime(selectedTime);
  };

  const handleUpdate = async () => {
    const formattedDate = date.toISOString().split('T')[0];
    const formattedTime = time.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    setLoading(true);
    try {
      const response = await api.put(`/appointments/${appointment.id || appointment._id}`, {
        date: formattedDate,
        time: formattedTime,
        notes,
        status
      });
      Alert.alert('Sucesso', response.data.message || 'Compromisso atualizado');
      if (refresh) refresh();
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao atualizar');
    } finally {
      setLoading(false);
    }
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
        {/* Informação do Cliente */}
        <View style={styles.clientCard}>
          <Ionicons name="person-circle" size={28} color="#2980b9" />
          <View style={styles.clientInfo}>
            <Text style={styles.clientLabel}>Cliente</Text>
            <Text style={styles.clientName}>{appointment.clientName}</Text>
          </View>
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
          onPress={handleUpdate}
          disabled={loading}
        >
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
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
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  clientInfo: { flex: 1 },
  clientLabel: { fontSize: 12, color: '#7f8c8d' },
  clientName: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
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