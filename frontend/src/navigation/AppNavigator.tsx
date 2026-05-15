import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Telas de autenticação
import Login from '../screens/Login';
import Register from '../screens/Register';

// Telas principais (abas)
import Home from '../screens/Home';
import Clients from '../screens/Clients';
import Agenda from '../screens/Agenda';
import Properties from '../screens/Properties';
import Profile from '../screens/Profile';

// Telas modais/stack adicionais
import NewClient from '../screens/NewClient';
import NewAppointment from '../screens/NewAppointment';
import NewProperty from '../screens/NewProperty';
import EditAppointment from '../screens/EditAppointment';
import EditClient from '../screens/EditClient';
import EditProperty from '../screens/EditProperty';

// Tipagem das rotas da pilha principal
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  NewClient: undefined;
  NewAppointment: undefined;
  NewProperty: undefined;
  EditProperty: {
  property: {
    id: number;
    streetName: string;
    location: string;
    bedrooms: number;
    bathrooms: number;
    livingRoom: boolean;
    balcony: boolean;
    area: number;
    price: number;
    photo: string;
  };
  refresh: () => void;
};
  EditAppointment: {
    appointment: {
      id: number;
      clientName: string;
      date: string;
      time: string;
    };
    refresh: () => void;
  };
  EditClient: {
    client: {
      id: number;
      name: string;
      phone: string;
      email: string;
      firstServiceDate: string;
      familyMembers: number;
      hasPets: boolean;
      propertyType: string;
      lastAttendedBy: string;
      chosenProperty: string;
      visitDate: string;
    };
    refresh: () => void;
  };
};

// Tipagem das rotas das abas
export type TabParamList = {
  Início: undefined;
  Clientes: undefined;
  Agenda: undefined;
  Imóveis: undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Componente de abas com ícones
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: '#2980b9',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          switch (route.name) {
            case 'Início':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Clientes':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Agenda':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Imóveis':
              iconName = focused ? 'business' : 'business-outline';
              break;
            case 'Perfil':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Início" component={Home} />
      <Tab.Screen name="Clientes" component={Clients} />
      <Tab.Screen name="Agenda" component={Agenda} />
      <Tab.Screen name="Imóveis" component={Properties} />
      <Tab.Screen name="Perfil" component={Profile} />
    </Tab.Navigator>
  );
}

// Navegador principal
export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2980b9" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Rotas de autenticação
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </>
        ) : (
          // Rotas principais e modais
          <>
            <Stack.Screen name="Main" component={AppTabs} />
            <Stack.Screen
              name="NewClient"
              component={NewClient}
              options={{ title: 'Novo Cliente', headerShown: true }}
            />
            <Stack.Screen
              name="NewAppointment"
              component={NewAppointment}
              options={{ title: 'Novo Atendimento', headerShown: true }}
            />
            <Stack.Screen
              name="NewProperty"
              component={NewProperty}
              options={{ title: 'Novo Imóvel', headerShown: true }}
            />
            <Stack.Screen
              name="EditAppointment"
              component={EditAppointment}
              options={{ title: 'Editar Compromisso', headerShown: true }}
            />
            <Stack.Screen
              name="EditClient"
              component={EditClient}
              options={{ title: 'Editar Cliente', headerShown: true }}
            />
            <Stack.Screen
              name="EditProperty"
              component={EditProperty}
              options={{ title: 'Editar Imóvel', headerShown: true }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});