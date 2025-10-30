import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import axios from 'axios';
import RegisterScreen from '../app/(register)/registerScreen';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Registration Phase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows error when required fields are missing', async () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {});
    const { getByTestId } = render(<RegisterScreen />);
    fireEvent.press(getByTestId('register-submit'));
    await waitFor(() => {
      const calls = (alertSpy as jest.Mock).mock.calls;
      console.log('[TC-001] Expected: Display error message | Actual:', calls[0]);
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Please fill in all required fields.');
    });
    alertSpy.mockRestore();
  });

  it('validates email format', async () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {});
    const { getByTestId } = render(<RegisterScreen />);
    fireEvent.changeText(getByTestId('register-email'), 'invalid-email');
    fireEvent.changeText(getByTestId('register-password'), 'abcdef');
    fireEvent.changeText(getByTestId('register-confirm-password'), 'abcdef');
    fireEvent.press(getByTestId('register-submit'));
    await waitFor(() => {
      const calls = (alertSpy as jest.Mock).mock.calls;
      console.log('[TC-002] Expected: Account not registered | Actual:', calls[0]);
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Please enter a valid email address.');
    });
    alertSpy.mockRestore();
  });

  it('rejects mismatched passwords', async () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {});
    const { getByTestId } = render(<RegisterScreen />);
    fireEvent.changeText(getByTestId('register-email'), 'user@example.com');
    fireEvent.changeText(getByTestId('register-password'), 'abcdef');
    fireEvent.changeText(getByTestId('register-confirm-password'), 'ghijkl');
    fireEvent.press(getByTestId('register-submit'));
    await waitFor(() => {
      const calls = (alertSpy as jest.Mock).mock.calls;
      console.log('[TC-003] Expected: Display error message | Actual:', calls[0]);
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Passwords do not match.');
    });
    alertSpy.mockRestore();
  });

  it('requires acceptance of privacy policy', async () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {});
    const { getByTestId } = render(<RegisterScreen />);
    fireEvent.changeText(getByTestId('register-email'), 'user@example.com');
    fireEvent.changeText(getByTestId('register-password'), 'abcdef');
    fireEvent.changeText(getByTestId('register-confirm-password'), 'abcdef');
    fireEvent.press(getByTestId('register-submit'));
    await waitFor(() => {
      const calls = (alertSpy as jest.Mock).mock.calls;
      console.log('[TC-004] Expected: Account not registered | Actual:', calls[0]);
      expect(alertSpy).toHaveBeenCalledWith('Error', 'You must agree to the Privacy & Policy.');
    });
    alertSpy.mockRestore();
  });

  it('submits successfully on valid inputs', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Success' } }); // register
    mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Logged in', userId: 1, roleName: 'User' } }); // login
    mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Created' } }); // createUserInfo

    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {});
    const { getByTestId, getAllByA11yRole } = render(<RegisterScreen />);
    fireEvent.changeText(getByTestId('register-email'), 'user@example.com');
    fireEvent.changeText(getByTestId('register-password'), 'abcdef');
    fireEvent.changeText(getByTestId('register-confirm-password'), 'abcdef');
    // toggle privacy checkbox
    fireEvent.press(getByTestId('register-privacy-checkbox'));
    fireEvent.press(getByTestId('register-submit'));

    await waitFor(() => {
      const calls = (alertSpy as jest.Mock).mock.calls;
      console.log('[TC-005] Expected: Account successfully registered | Actual:', calls[0]);
      expect(alertSpy).toHaveBeenCalledWith('Success', 'Registration successful!', expect.any(Array));
    });
    alertSpy.mockRestore();
  });
});


