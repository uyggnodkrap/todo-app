import { supabase } from './supabase.js';
export class AuthApp {
    constructor() {
        this.mode = 'login';
        this.form = document.getElementById('auth-form');
        this.emailInput = document.getElementById('auth-email');
        this.passwordInput = document.getElementById('auth-password');
        this.submitBtn = document.getElementById('auth-submit-btn');
        this.toggleBtn = document.getElementById('auth-toggle-btn');
        this.titleEl = document.getElementById('auth-title');
        this.errorEl = document.getElementById('auth-error');
        this.messageEl = document.getElementById('auth-message');
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        this.toggleBtn.addEventListener('click', () => this.toggleMode());
        const githubBtn = document.getElementById('github-login-btn');
        githubBtn.addEventListener('click', () => this.signInWithGitHub());
    }
    async signInWithGitHub() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: { redirectTo: window.location.origin },
        });
        if (error)
            this.errorEl.textContent = error.message;
    }
    toggleMode() {
        this.mode = this.mode === 'login' ? 'signup' : 'login';
        this.clearMessages();
        const isLogin = this.mode === 'login';
        this.titleEl.textContent = isLogin ? '로그인' : '회원가입';
        this.submitBtn.textContent = isLogin ? '로그인' : '회원가입';
        this.toggleBtn.textContent = isLogin ? '회원가입하기' : '로그인하기';
    }
    clearMessages() {
        this.errorEl.textContent = '';
        this.messageEl.textContent = '';
    }
    async handleSubmit() {
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        this.clearMessages();
        this.submitBtn.disabled = true;
        try {
            if (this.mode === 'signup') {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error)
                    throw error;
                this.messageEl.textContent = '가입 완료! 이메일 인증 링크를 확인하고 로그인해 주세요.';
            }
            else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error)
                    throw error;
                // 성공 시 onAuthStateChange가 자동으로 todo 섹션 전환
            }
        }
        catch (err) {
            const message = err instanceof Error ? err.message : '오류가 발생했습니다.';
            this.errorEl.textContent = message;
        }
        finally {
            this.submitBtn.disabled = false;
        }
    }
}
