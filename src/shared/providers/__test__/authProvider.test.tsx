import { render, screen, } from '@testing-library/react';
import { describe, it, beforeEach, vi, expect } from 'vitest';
import { AuthProvider } from '../authProvider';
import { AuthContext } from '@/shared/hooks/useAuth';

vi.mock('../services/authService');

describe('AuthProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with loading state', async () => {
        render(
            <AuthProvider>
                <div>Test</div>
            </AuthProvider>
        );

        expect(screen.getByText('Test')).toBeDefined();
    });
 
    it('should handle session integrity validation', async () => {
        render(
            <AuthProvider>
                <div>Test</div>
            </AuthProvider>
        );

    });
});