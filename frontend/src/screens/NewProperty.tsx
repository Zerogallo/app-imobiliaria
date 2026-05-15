import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../services/api';

export default function NewProperty({ navigation }: any) {
  const [streetName, setStreetName] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');

  const handleSave = async () => {
    if (!streetName || !location) {
      Alert.alert('Erro', 'Rua e localização são obrigatórios');
      return;
    }
    try {
      await api.post('/properties', { streetName, location, price: Number(price) || 0 });
      Alert.alert('Sucesso', 'Imóvel adicionado');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Logradouro</Text>
      <TextInput style={styles.input} value={streetName} onChangeText={setStreetName} />
      <Text>Localização</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} />
      <Text>Preço (R$)</Text>
      <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
      <TouchableOpacity style={styles.button} onPress={handleSave}><Text style={styles.buttonText}>Salvar</Text></TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15 },
  button: { backgroundColor: '#27ae60', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});