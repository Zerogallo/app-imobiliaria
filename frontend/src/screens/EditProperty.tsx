import React, { useState } from 'react';
import {
  View, Text, TextInput, Switch, TouchableOpacity, StyleSheet,
  Alert, ScrollView, Image, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

export default function EditProperty({ route, navigation }: any) {
  const { property, refresh } = route.params;
  
  // Dados básicos
  const [streetName, setStreetName] = useState(property.streetName);
  const [location, setLocation] = useState(property.location);
  
  // Cômodos
  const [bedrooms, setBedrooms] = useState(String(property.bedrooms || 0));
  const [bathrooms, setBathrooms] = useState(String(property.bathrooms || 0));
  const [livingRoom, setLivingRoom] = useState(property.livingRoom || false);
  const [balcony, setBalcony] = useState(property.balcony || false);
  
  // Características
  const [propertyType, setPropertyType] = useState(property.propertyType || 'casa');
  const [status, setStatus] = useState(property.status || 'disponivel');
  
  // Medidas e preço
  const [area, setArea] = useState(String(property.area || 0));
  const [price, setPrice] = useState(String(property.price || 0));
  
  // Imagem
  const [photo, setPhoto] = useState(property.photo || '');
  const [uploading, setUploading] = useState(false);

  // Função para escolher imagem da galeria
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria de fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setPhoto(base64Image);
    }
  };

  // Função para tirar foto
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua câmera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setPhoto(base64Image);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Adicionar Foto',
      'Escolha uma opção',
      [
        { text: 'Tirar foto', onPress: takePhoto },
        { text: 'Escolher da galeria', onPress: pickImage },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleSave = async () => {
    if (!streetName || !location) {
      Alert.alert('Erro', 'Rua e localização são obrigatórios');
      return;
    }

    try {
      const updatedData = {
        streetName,
        location,
        bedrooms: parseInt(bedrooms) || 0,
        bathrooms: parseInt(bathrooms) || 0,
        livingRoom,
        balcony,
        propertyType,
        status,
        area: parseInt(area) || 0,
        price: parseInt(price) || 0,
        photo
      };

      const response = await api.put(`/properties/${property.id}`, updatedData);
      Alert.alert('Sucesso', response.data.message || 'Imóvel atualizado com sucesso!');
      refresh();
      navigation.goBack();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Falha ao atualizar imóvel';
      Alert.alert('Erro', msg);
    }
  };

  const getStatusText = (statusValue: string) => {
    switch (statusValue) {
      case 'disponivel': return 'Disponível';
      case 'vendido': return 'Vendido';
      case 'alugado': return 'Alugado';
      default: return 'Disponível';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar Imóvel</Text>

      {/* Seção de Foto */}
      <Text style={styles.label}>📷 Foto do Imóvel</Text>
      <TouchableOpacity style={styles.photoContainer} onPress={showImageOptions}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>+ Adicionar Foto</Text>
            <Text style={styles.photoSubText}>Toque para tirar ou escolher</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Dados básicos */}
      <Text style={styles.label}>🏠 Rua/Logradouro *</Text>
      <TextInput style={styles.input} value={streetName} onChangeText={setStreetName} placeholder="Ex: Rua das Flores, 123" />

      <Text style={styles.label}>📍 Localização/Bairro *</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Ex: Centro, Cidade" />

      {/* Tipo do imóvel */}
      <Text style={styles.label}>🏷️ Tipo do Imóvel</Text>
      <View style={styles.rowButtons}>
        <TouchableOpacity
          style={[styles.optionButton, propertyType === 'casa' && styles.optionSelected]}
          onPress={() => setPropertyType('casa')}
        >
          <Text style={[styles.optionText, propertyType === 'casa' && styles.optionTextSelected]}>🏠 Casa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, propertyType === 'apartamento' && styles.optionSelected]}
          onPress={() => setPropertyType('apartamento')}
        >
          <Text style={[styles.optionText, propertyType === 'apartamento' && styles.optionTextSelected]}>🏢 Apartamento</Text>
        </TouchableOpacity>
      </View>

      {/* Status do imóvel */}
      <Text style={styles.label}>📌 Status</Text>
      <View style={styles.rowButtons}>
        <TouchableOpacity
          style={[styles.optionButton, status === 'disponivel' && styles.optionSelected]}
          onPress={() => setStatus('disponivel')}
        >
          <Text style={[styles.optionText, status === 'disponivel' && styles.optionTextSelected]}>✅ Disponível</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, status === 'vendido' && styles.optionSelected]}
          onPress={() => setStatus('vendido')}
        >
          <Text style={[styles.optionText, status === 'vendido' && styles.optionTextSelected]}>💰 Vendido</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, status === 'alugado' && styles.optionSelected]}
          onPress={() => setStatus('alugado')}
        >
          <Text style={[styles.optionText, status === 'alugado' && styles.optionTextSelected]}>🔑 Alugado</Text>
        </TouchableOpacity>
      </View>

      {/* Cômodos */}
      <Text style={styles.label}>🛏️ Quantidade de Quartos</Text>
      <TextInput style={styles.input} value={bedrooms} onChangeText={setBedrooms} keyboardType="numeric" placeholder="0" />

      <Text style={styles.label}>🚽 Quantidade de Banheiros</Text>
      <TextInput style={styles.input} value={bathrooms} onChangeText={setBathrooms} keyboardType="numeric" placeholder="0" />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>🛋️ Sala de Estar?</Text>
        <Switch value={livingRoom} onValueChange={setLivingRoom} trackColor={{ false: '#ccc', true: '#2980b9' }} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>🪴 Varanda?</Text>
        <Switch value={balcony} onValueChange={setBalcony} trackColor={{ false: '#ccc', true: '#2980b9' }} />
      </View>

      {/* Medidas e preço */}
      <Text style={styles.label}>📏 Área (m²)</Text>
      <TextInput style={styles.input} value={area} onChangeText={setArea} keyboardType="numeric" placeholder="0" />

      <Text style={styles.label}>💰 Preço (R$)</Text>
      <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0" />

      {/* Botão salvar */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>💾 Salvar Alterações</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8, color: '#34495e' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  
  photoContainer: { marginBottom: 16 },
  photo: { width: '100%', height: 200, borderRadius: 12, resizeMode: 'cover' },
  photoPlaceholder: { width: '100%', height: 200, backgroundColor: '#ecf0f1', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed' },
  photoPlaceholderText: { fontSize: 18, color: '#7f8c8d', fontWeight: '500' },
  photoSubText: { fontSize: 12, color: '#95a5a6', marginTop: 8 },
  
  rowButtons: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  optionButton: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#fff' },
  optionSelected: { backgroundColor: '#2980b9', borderColor: '#2980b9' },
  optionText: { fontSize: 14, color: '#2c3e50' },
  optionTextSelected: { color: '#fff', fontWeight: 'bold' },
  
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  switchLabel: { fontSize: 16, color: '#34495e' },
  
  saveButton: { backgroundColor: '#27ae60', paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginTop: 30, marginBottom: 40 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});