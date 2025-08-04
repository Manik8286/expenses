import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import AuthProvider, { useAuth } from '../context/AuthContext';

function AuthGuard() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f4511e" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="details" />
      <Stack.Screen name="add-expense" options={{ title: 'Add Expense' }} />
      <Stack.Screen name="view-graph" options={{ title: 'Expense Graph' }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGuard />
    </AuthProvider>
  );
}
