import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth } from '../firebaseConfig';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/');
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  };

  const register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace('/');
    } catch (err) {
      alert('Register failed: ' + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login or Register</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} style={styles.input} />
      <Button title="Login" onPress={login} />
      <Button title="Register" onPress={register} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, justifyContent: 'center' },
  title: { fontSize: 22, marginBottom: 16 },
  input: { borderWidth: 1, padding: 8, marginVertical: 8 },
});
