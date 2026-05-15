import React, { useState } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import api from '../services/api';

export default function EditClient({ route, navigation }: any) {
  const { client, refresh } = route.params;
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone);
  const [email, setEmail] = useState(client.email || '');
  const [familyMembers, setFamilyMembers] = useState(String(client.familyMembers || ''));
  const [hasPets, setHasPets] = useState(client.hasPets || false);
  const [propertyType, setPropertyType] = useState(client.propertyType || 'house');
  const [lastAttendedBy, setLastAttendedBy] = useState(client.lastAttendedBy || '');
  const [chosenProperty, setChosenProperty] = useState(client.chosenProperty || '');
  const [visitDate, setVisitDate] = useState(client.visitDate ? client.visitDate.split('T')[0] : '');

  const handleSave = async () => {
    if (!name || !phone) {
      Alert.alert('Erro', 'Nome e telefone são obrigatórios');
      return;
    }
    try {
      await api.put(`/clients/${client.id}`, {
        name,
        phone,
        email,
        familyMembers: parseInt(familyMembers) || 0,
        hasPets,
        propertyType,
        lastAttendedBy,
        chosenProperty,
        visitDate: visitDate || null
      });
      Alert.alert('Sucesso', 'Cliente atualizado');
      refresh();
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar cliente');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nome *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Telefone *</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} />
      <Text style={styles.label}>Pessoas na família</Text>
      <TextInput style={styles.input} value={familyMembers} onChangeText={setFamilyMembers} keyboardType="numeric" />
      <View style={styles.row}>
        <Text>Possui pet?</Text>
        <Switch value={hasPets} onValueChange={setHasPets} />
      </View>
      <Text style={styles.label}>Tipo de imóvel</Text>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.option, propertyType === 'house' && styles.optionSelected]} onPress={() => setPropertyType('house')}>
          <Text>Casa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.option, propertyType === 'apartment' && styles.optionSelected]} onPress={() => setPropertyType('apartment')}>
          <Text>Apartamento</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Último corretor</Text>
      <TextInput style={styles.input} value={lastAttendedBy} onChangeText={setLastAttendedBy} />
      <Text style={styles.label}>Imóvel escolhido</Text>
      <TextInput style={styles.input} value={chosenProperty} onChangeText={setChosenProperty} />
      <Text style={styles.label}>Data da visita (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={visitDate} onChangeText={setVisitDate} placeholder="2025-12-31" />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Salvar Alterações</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  label: { fontSize: 16, fontWeight: '500', marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12 },
  option: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', flex: 1, alignItems: 'center', marginHorizontal: 4 },
  optionSelected: { backgroundColor: '#2980b9', borderColor: '#2980b9' },
  saveButton: { backgroundColor: '#27ae60', padding: 14, borderRadius: 8, marginTop: 24, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});