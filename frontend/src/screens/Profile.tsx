import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [description, setDescription] = useState(user?.description || '');
  const [photo, setPhoto] = useState(user?.photo || '');
  const [loading, setLoading] = useState(false);

  const handleChoosePhoto = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: false }, (response) => {
      if (response.assets && response.assets[0].uri) {
        setPhoto(response.assets[0].uri);
      }
    });
  };

  const handleSave = async () => {
    setLoading(true);
    await updateProfile({ name, phone, description, photo });
    setLoading(false);
    Alert.alert('Perfil', 'Atualizado com sucesso');
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={handleChoosePhoto} style={styles.avatarContainer}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>📷 Adicionar foto</Text>
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.label}>Nome</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Telefone</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Text style={styles.label}>Descrição</Text>
      <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline numberOfLines={4} />
      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Salvar</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  avatarContainer: { alignSelf: 'center', marginBottom: 24 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: '#ddd' },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#ecf0f1', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 14, color: '#7f8c8d' },
  label: { fontSize: 16, fontWeight: '500', marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginTop: 4 },
  textArea: { height: 80, textAlignVertical: 'top' },
  button: { backgroundColor: '#2980b9', padding: 14, borderRadius: 8, marginTop: 24, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});