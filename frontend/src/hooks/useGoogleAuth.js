import { useEffect, useCallback } from 'react';

const useGoogleAuth = (onSuccess, onError) => {
    const handleCredentialResponse = useCallback((response) => {
        try {
            // Decode the JWT token to get user info
            const payload = JSON.parse(atob(response.credential.split('.')[1]));

            const userData = {
                email: payload.email,
                firstName: payload.given_name,
                lastName: payload.family_name,
                profilePicture: payload.picture,
                googleId: payload.sub
            };

            console.log('Google OAuth success:', userData);
            onSuccess(userData);
        } catch (error) {
            console.error('Error processing Google OAuth response:', error);
            onError(error);
        }
    }, [onSuccess, onError]);

    useEffect(() => {
        // Wait for Google Identity Services to load
        const initializeGoogleAuth = () => {
            if (window.google && window.google.accounts) {
                window.google.accounts.id.initialize({
                    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com',
                    callback: handleCredentialResponse,
                    auto_select: false,
                    cancel_on_tap_outside: true
                });
            } else {
                // Retry after a short delay if Google services haven't loaded yet
                setTimeout(initializeGoogleAuth, 100);
            }
        };

        initializeGoogleAuth();

        return () => {
            // Cleanup if needed
        };
    }, [handleCredentialResponse]);

    const signIn = useCallback(() => {
        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

        // If no real Client ID is configured, use demo mode
        if (!clientId || clientId.includes('your-actual-client-id')) {
            console.log('Using demo Google OAuth mode');

            // Simulate Google OAuth success with demo data
            setTimeout(() => {
                const demoUserData = {
                    email: 'demo@gmail.com',
                    firstName: 'Demo',
                    lastName: 'User',
                    profilePicture: 'https://via.placeholder.com/40x40/4285f4/ffffff?text=D',
                    googleId: 'demo-google-id-123'
                };

                console.log('Demo Google OAuth success:', demoUserData);
                onSuccess(demoUserData);
            }, 1000); // Simulate network delay

            return;
        }

        if (window.google && window.google.accounts) {
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // Fallback: show the popup manually
                    window.google.accounts.id.renderButton(
                        document.getElementById('google-signin-button'),
                        {
                            theme: 'outline',
                            size: 'large',
                            text: 'signin_with',
                            shape: 'rectangular',
                            width: '100%'
                        }
                    );
                }
            });
        } else {
            console.error('Google Identity Services not loaded');
            onError(new Error('Google services not available'));
        }
    }, [onSuccess, onError]);

    return { signIn };
};

export default useGoogleAuth;
