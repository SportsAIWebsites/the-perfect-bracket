import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../lib/supabase'
import { Modal } from '../ui/Modal'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🏀</div>
          <h2 className="text-xl font-bold text-white">Join March Madness Fantasy</h2>
          <p className="text-slate-400 text-sm mt-1">
            Sign in to draft players and compete globally
          </p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#FFD100',
                  brandAccent: '#00b8d9',
                  inputBackground: '#161616',
                  inputBorder: '#2C2C2C',
                  inputText: '#ffffff',
                  inputPlaceholder: '#64748b',
                  messageText: '#94a3b8',
                  anchorTextColor: '#FFD100',
                  dividerBackground: '#2C2C2C',
                  defaultButtonBackground: '#161616',
                  defaultButtonBorder: '#2C2C2C',
                  defaultButtonText: '#ffffff',
                },
                fonts: {
                  bodyFontFamily: 'inherit',
                  buttonFontFamily: 'inherit',
                },
                radii: {
                  borderRadiusButton: '0.5rem',
                  buttonBorderRadius: '0.5rem',
                  inputBorderRadius: '0.5rem',
                },
              },
            },
          }}
          providers={['google']}
          redirectTo={window.location.origin}
          onlyThirdPartyProviders={false}
        />
      </div>
    </Modal>
  )
}
