import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

interface Property {
  _id: string;
  photo: string;
  streetName: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  livingRoom: boolean;
  balcony: boolean;
  area: number;
  price: number;
}

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => fetchProperties());
    return unsubscribe;
  }, [navigation]);

  const fetchProperties = async () => {
    try {
      const res = await api.get('/properties');
      setProperties(res.data);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
      Alert.alert('Erro', 'Não foi possível carregar os imóveis');
    }
  };

  const handleEdit = (property: Property) => {
    navigation.navigate('EditProperty', { property, refresh: fetchProperties });
  };

  const renderItem = ({ item }: { item: Property }) => (
    <View style={styles.card}>
      {item.photo ? (
        <Image source={{ uri: item.photo }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}><Text>🏠 Sem foto</Text></View>
      )}
      <View style={styles.info}>
        <Text style={styles.street}>{item.streetName}</Text>
        <Text style={styles.location}>{item.location}</Text>
        <Text>🛏️ {item.bedrooms} quartos • 🛁 {item.bathrooms} banheiros</Text>
        <Text>🛋️ Sala: {item.livingRoom ? 'Sim' : 'Não'} | 🪴 Varanda: {item.balcony ? 'Sim' : 'Não'}</Text>
        <Text>📏 {item.area} m²</Text>
        <Text style={styles.price}>💰 R$ {item.price.toLocaleString()}</Text>
      </View>
      {/* Botão de editar */}
      <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
        <Text style={styles.editButtonText}>✏️ Editar Imóvel</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={properties}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  image: { width: '100%', height: 200, resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: 200, backgroundColor: '#ecf0f1', justifyContent: 'center', alignItems: 'center' },
  info: { padding: 12 },
  street: { fontSize: 18, fontWeight: 'bold' },
  location: { fontSize: 14, color: '#7f8c8d', marginBottom: 8 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#27ae60', marginTop: 8 },
  editButton: { backgroundColor: '#f39c12', borderRadius: 8, margin: 12, marginTop: 0, paddingVertical: 10, alignItems: 'center' },
  editButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});