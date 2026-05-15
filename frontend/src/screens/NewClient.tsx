import React, { useState } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import api from '../services/api';

export default function NewClient({ navigation }: any) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [familyMembers, setFamilyMembers] = useState('');
  const [hasPets, setHasPets] = useState(false);
  const [propertyType, setPropertyType] = useState('house'); // house or apartment

  const handleSave = async () => {
    if (!name || !phone) {
      Alert.alert('Erro', 'Nome e telefone são obrigatórios');
      return;
    }
    try {
      await api.post('/clients', {
        name, phone, email,
        familyMembers: parseInt(familyMembers) || 0,
        hasPets,
        propertyType,
        firstServiceDate: new Date(),
      });
      Alert.alert('Sucesso', 'Cliente cadastrado!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao cadastrar');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nome *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Telefone *</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Text style={styles.label}>Quantas pessoas na família?</Text>
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
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Salvar Cliente</Text>
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