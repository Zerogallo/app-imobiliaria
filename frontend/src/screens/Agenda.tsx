import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, Alert, 
  StyleSheet, RefreshControl, Modal, TextInput 
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

interface Appointment {
  id: number;
  _id: string;
  clientName: string;
  date: string;
  time: string;
  notes?: string;
  status?: string; // 'agendado', 'confirmado', 'cancelado', 'realizado'
}

export default function Agenda() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Erro ao buscar compromissos:', error);
      Alert.alert('Erro', 'Não foi possível carregar a agenda');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const handleDelete = (id: string | number) => {
    Alert.alert('Confirmar', 'Remover este compromisso?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Remover', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await api.delete(`/appointments/${id}`);
            fetchAppointments();
            Alert.alert('Sucesso', 'Compromisso removido');
          } catch (error) {
            Alert.alert('Erro', 'Falha ao remover');
          }
        }
      }
    ]);
  };

  const handleEdit = (appointment: Appointment) => {
    navigation.navigate('EditAppointment', { appointment, refresh: fetchAppointments });
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setEditNotes(appointment.notes || '');
    setModalVisible(true);
  };

  const handleUpdateNotes = async () => {
    if (!selectedAppointment) return;
    try {
      await api.put(`/appointments/${selectedAppointment.id || selectedAppointment._id}`, {
        notes: editNotes
      });
      Alert.alert('Sucesso', 'Observações atualizadas');
      setModalVisible(false);
      fetchAppointments();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar observações');
    }
  };

  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'confirmado':
        return { icon: 'checkmark-circle', color: '#27ae60', text: 'Confirmado' };
      case 'cancelado':
        return { icon: 'close-circle', color: '#e74c3c', text: 'Cancelado' };
      case 'realizado':
        return { icon: 'checkmark-done-circle', color: '#2980b9', text: 'Realizado' };
      default:
        return { icon: 'time', color: '#f39c12', text: 'Agendado' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderItem = ({ item }: { item: Appointment }) => {
    const statusInfo = getStatusInfo(item.status);
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => handleViewDetails(item)}
        activeOpacity={0.7}
      >
        {/* Cabeçalho do card */}
        <View style={styles.cardHeader}>
          <View style={styles.clientInfo}>
            <Ionicons name="person-circle" size={24} color="#2980b9" />
            <Text style={styles.clientName}>{item.clientName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Ionicons name={statusInfo.icon as any} size={12} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>

        {/* Data e hora */}
        <View style={styles.datetimeContainer}>
          <View style={styles.datetimeItem}>
            <Ionicons name="calendar" size={16} color="#7f8c8d" />
            <Text style={styles.datetimeText}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.datetimeItem}>
            <Ionicons name="time" size={16} color="#7f8c8d" />
            <Text style={styles.datetimeText}>{item.time}</Text>
          </View>
        </View>

        {/* Observações (se houver) */}
        {item.notes && (
          <View style={styles.notesContainer}>
            <Ionicons name="document-text" size={14} color="#95a5a6" />
            <Text style={styles.notesText} numberOfLines={2}>
              {item.notes}
            </Text>
          </View>
        )}

        {/* Botões de ação */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]} 
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={() => handleDelete(item.id || item._id)}
          >
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Deletar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        keyExtractor={(item) => (item.id || item._id).toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color="#bdc3c7" />
            <Text style={styles.emptyText}>Nenhum compromisso agendado</Text>
            <Text style={styles.emptySubText}>Toque no botão + para adicionar</Text>
          </View>
        }
        contentContainerStyle={appointments.length === 0 ? styles.emptyList : styles.list}
      />

      {/* Modal de detalhes/observações */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes do Atendimento</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            {selectedAppointment && (
              <>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Cliente</Text>
                  <Text style={styles.modalValue}>{selectedAppointment.clientName}</Text>
                </View>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Data e Hora</Text>
                  <Text style={styles.modalValue}>
                    {formatDate(selectedAppointment.date)} às {selectedAppointment.time}
                  </Text>
                </View>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Observações</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editNotes}
                    onChangeText={setEditNotes}
                    placeholder="Adicione observações sobre o atendimento..."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
                <TouchableOpacity style={styles.saveNotesButton} onPress={handleUpdateNotes}>
                  <Text style={styles.saveNotesButtonText}>Salvar Observações</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  list: { padding: 16 },
  emptyList: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  datetimeContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  datetimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  datetimeText: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 13,
    color: '#95a5a6',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#f39c12',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 13,
    color: '#bdc3c7',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalInfo: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7f8c8d',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 15,
    color: '#2c3e50',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2c3e50',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveNotesButton: {
    backgroundColor: '#2980b9',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  saveNotesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});