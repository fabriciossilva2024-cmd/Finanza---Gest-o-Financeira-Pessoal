import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import { AuthForm } from './AuthForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Entrar na sua conta
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-start gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              Seus dados atuais deste dispositivo serão <strong>transferidos</strong> para a conta.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AuthForm onDone={onClose} />
      </div>
    </div>
  );
};
