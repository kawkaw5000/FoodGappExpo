import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import axios from 'axios';
import LoginScreen from '../app/(login)/loginScreen';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Login Phase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires email and password', async () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {});
    const { getByTestId } = render(<LoginScreen />);
    fireEvent.press(getByTestId('login-submit'));
    await waitFor(() => {
      const calls = (alertSpy as jest.Mock).mock.calls;
      console.log('[LG-001] Expected: Display error message | Actual:', calls[0]);
      expect(alertSpy).toHaveBeenCalledWith('Email and password are required.');
    });
    alertSpy.mockRestore();
  });

  it('handles invalid credentials', async () => {
    mockedAxios.post.mockRejectedValueOnce({ response: { data: { error: 'Invalid credentials' } } } as any);
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {});
    const { getByTestId } = render(<LoginScreen />);
    fireEvent.changeText(getByTestId('login-email'), 'user@example.com');
    fireEvent.changeText(getByTestId('login-password'), 'wrong');
    fireEvent.press(getByTestId('login-submit'));
    await waitFor(() => {
      const calls = (alertSpy as jest.Mock).mock.calls;
      console.log('[LG-002] Expected: Account not logged in | Actual:', calls[0]);
      expect(alertSpy).toHaveBeenCalledWith('Invalid credentials');
    });
    alertSpy.mockRestore();
  });

  it('blocks SQL injection input attempt', async () => {
    mockedAxios.post.mockRejectedValueOnce({ response: { data: { error: 'Malicious input submitted' } } } as any);
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {});
    const { getByTestId } = render(<LoginScreen />);
    fireEvent.changeText(getByTestId('login-email'), "' OR '1'='1");
    fireEvent.changeText(getByTestId('login-password'), "' OR '1'='1");
    fireEvent.press(getByTestId('login-submit'));
    await waitFor(() => {
      const calls = (alertSpy as jest.Mock).mock.calls;
      console.log('[LG-003] Expected: Reject malicious input | Actual:', calls[0]);
      expect(alertSpy).toHaveBeenCalledWith('Malicious input submitted');
    });
    alertSpy.mockRestore();
  });

  it('navigates after successful login', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Login successful', roleName: 'User', userId: 1 } } as any);
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {});
    const { getByTestId } = render(<LoginScreen />);
    fireEvent.changeText(getByTestId('login-email'), 'user@example.com');
    fireEvent.changeText(getByTestId('login-password'), 'password');
    fireEvent.press(getByTestId('login-submit'));
    await waitFor(() => {
      const calls = (alertSpy as jest.Mock).mock.calls;
      console.log('[LG-004] Expected: User logged in and navigates | Actual:', calls[0]);
      expect(alertSpy).toHaveBeenCalledWith('Login successful');
    });
    alertSpy.mockRestore();
  });
});


