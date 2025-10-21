import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import Config from '@/constants/Config';

const Account_API = Config.Account_API;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // Validate token on component mount
  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      Alert.alert('Invalid Link', 'No reset token found in the link.');
      router.push('/(login)/loginScreen');
      return;
    }

    try {
      console.log('🔍 Validating reset token:', token);
      
      const response = await axios.get(`${Account_API}/validate-reset-token/${encodeURIComponent(token)}`);
      
      console.log('✅ Token validation response:', response.data);
      
      if (response.data.valid) {
        setTokenValid(true);
        setUserEmail(response.data.email);
        setExpiresAt(new Date(response.data.expiresAt).toLocaleString());
      } else {
        Alert.alert('Invalid Token', response.data.message || 'This reset link is invalid or expired.');
        router.push('/(login)/loginScreen');
      }
    } catch (error: any) {
      console.log('❌ Token validation error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to validate reset token. Please try requesting a new password reset.');
      router.push('/(login)/loginScreen');
    } finally {
      setValidating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in both password fields.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Resetting password with token:', token);
      
      const response = await axios.post(`${Account_API}/reset-password`, {
        token: token,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });

      console.log('✅ Password reset response:', response.data);

      if (response.data.success) {
        Alert.alert(
          'Success!', 
          'Your password has been reset successfully. You can now log in with your new password.',
          [
            {
              text: 'Login Now',
              onPress: () => router.push('/(login)/loginScreen')
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to reset password.');
      }
    } catch (error: any) {
      console.log('❌ Password reset error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'An error occurred while resetting your password.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Validating reset link...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tokenValid) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Invalid or expired reset link</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/(login)/loginScreen')}>
            <Text style={styles.buttonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Reset Your Password</Text>
          <Text style={styles.subtitle}>
            Enter a new password for {userEmail}
          </Text>
          {expiresAt && (
            <Text style={styles.expiryText}>
              This link expires at: {expiresAt}
            </Text>
          )}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/(login)/loginScreen')}
            >
              <Text style={styles.linkText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  expiryText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: '#888',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#FF3B30',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
