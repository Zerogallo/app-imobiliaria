import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';

export default function EditAppointment({ route, navigation }: any) {
  const { appointment, refresh } = route.params;
  const [date, setDate] = useState(new Date(appointment.date));
  const [time, setTime] = useState(appointment.time);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const handleUpdate = async () => {
    try {
      await api.put(`/appointments/${appointment._id}`, {
        date: date.toISOString().split('T')[0],
        time,
      });
      Alert.alert('Sucesso', 'Compromisso atualizado');
      refresh();
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Data</Text>
      <TouchableOpacity onPress={() => setShowDate(true)} style={styles.field}>
        <Text>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDate && (
        <DateTimePicker value={date} mode="date" onChange={(event, selectedDate) => {
          setShowDate(false);
          if (selectedDate) setDate(selectedDate);
        }} />
      )}
      <Text style={styles.label}>Horário</Text>
      <TouchableOpacity onPress={() => setShowTime(true)} style={styles.field}>
        <Text>{time}</Text>
      </TouchableOpacity>
      {showTime && (
        <DateTimePicker value={new Date(`2000-01-01T${time}:00`)} mode="time" onChange={(event, selectedTime) => {
          setShowTime(false);
          if (selectedTime) {
            const hours = selectedTime.getHours().toString().padStart(2, '0');
            const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
            setTime(`${hours}:${minutes}`);
          }
        }} />
      )}
      <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
        <Text style={styles.btnText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flex: 1 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 16 },
  field: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginTop: 4 },
  saveBtn: { backgroundColor: '#2980b9', padding: 14, borderRadius: 8, marginTop: 24, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});