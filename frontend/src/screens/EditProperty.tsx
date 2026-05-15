import React, { useState } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import api from '../services/api';

export default function EditProperty({ route, navigation }: any) {
  const { property, refresh } = route.params;
  const [streetName, setStreetName] = useState(property.streetName);
  const [location, setLocation] = useState(property.location);
  const [bedrooms, setBedrooms] = useState(String(property.bedrooms));
  const [bathrooms, setBathrooms] = useState(String(property.bathrooms));
  const [livingRoom, setLivingRoom] = useState(property.livingRoom);
  const [balcony, setBalcony] = useState(property.balcony);
  const [area, setArea] = useState(String(property.area));
  const [price, setPrice] = useState(String(property.price));
  const [photo, setPhoto] = useState(property.photo);

  const handleSave = async () => {
    if (!streetName || !location) {
      Alert.alert('Erro', 'Rua e localização são obrigatórios');
      return;
    }
    try {
      await api.put(`/properties/${property.id}`, {
        streetName,
        location,
        bedrooms: parseInt(bedrooms) || 0,
        bathrooms: parseInt(bathrooms) || 0,
        livingRoom,
        balcony,
        area: parseInt(area) || 0,
        price: parseInt(price) || 0,
        photo
      });
      Alert.alert('Sucesso', 'Imóvel atualizado');
      refresh();
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao atualizar imóvel');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Rua *</Text>
      <TextInput style={styles.input} value={streetName} onChangeText={setStreetName} />
      <Text style={styles.label}>Localização *</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} />
      <Text style={styles.label}>Quartos</Text>
      <TextInput style={styles.input} value={bedrooms} onChangeText={setBedrooms} keyboardType="numeric" />
      <Text style={styles.label}>Banheiros</Text>
      <TextInput style={styles.input} value={bathrooms} onChangeText={setBathrooms} keyboardType="numeric" />
      <View style={styles.row}>
        <Text>Sala de estar?</Text>
        <Switch value={livingRoom} onValueChange={setLivingRoom} />
      </View>
      <View style={styles.row}>
        <Text>Varanda?</Text>
        <Switch value={balcony} onValueChange={setBalcony} />
      </View>
      <Text style={styles.label}>Área (m²)</Text>
      <TextInput style={styles.input} value={area} onChangeText={setArea} keyboardType="numeric" />
      <Text style={styles.label}>Preço (R$)</Text>
      <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
      <Text style={styles.label}>URL da foto (opcional)</Text>
      <TextInput style={styles.input} value={photo} onChangeText={setPhoto} placeholder="http://..." />
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
  saveButton: { backgroundColor: '#27ae60', padding: 14, borderRadius: 8, marginTop: 24, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});