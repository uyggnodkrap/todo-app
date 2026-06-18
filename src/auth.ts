import { supabase } from './supabase.js';

type AuthMode = 'login' | 'signup';

export class AuthApp {
  private mode: AuthMode = 'login';
  private form: HTMLFormElement;
  private emailInput: HTMLInputElement;
  private passwordInput: HTMLInputElement;
  private submitBtn: HTMLButtonElement;
  private toggleBtn: HTMLButtonElement;
  private titleEl: HTMLElement;
  private errorEl: HTMLElement;
  private messageEl: HTMLElement;

  constructor() {
    this.form = document.getElementById('auth-form') as HTMLFormElement;
    this.emailInput = document.getElementById('auth-email') as HTMLInputElement;
    this.passwordInput = document.getElementById('auth-password') as HTMLInputElement;
    this.submitBtn = document.getElementById('auth-submit-btn') as HTMLButtonElement;
    this.toggleBtn = document.getElementById('auth-toggle-btn') as HTMLButtonElement;
    this.titleEl = document.getElementById('auth-title') as HTMLElement;
    this.errorEl = document.getElementById('auth-error') as HTMLElement;
    this.messageEl = document.getElementById('auth-message') as HTMLElement;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    this.toggleBtn.addEventListener('click', () => this.toggleMode());

    const githubBtn = document.getElementById('github-login-btn') as HTMLButtonElement;
    githubBtn.addEventListener('click', () => this.signInWithGitHub());
  }

  private async signInWithGitHub(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin + window.location.pathname },
    });
    if (error) this.errorEl.textContent = error.message;
  }

  private toggleMode(): void {
    this.mode = this.mode === 'login' ? 'signup' : 'login';
    this.clearMessages();
    const isLogin = this.mode === 'login';
    this.titleEl.textContent = isLogin ? '로그인' : '회원가입';
    this.submitBtn.textContent = isLogin ? '로그인' : '회원가입';
    this.toggleBtn.textContent = isLogin ? '회원가입하기' : '로그인하기';
  }

  private clearMessages(): void {
    this.errorEl.textContent = '';
    this.messageEl.textContent = '';
  }

  private async handleSubmit(): Promise<void> {
    const email = this.emailInput.value.trim();
    const password = this.passwordInput.value;
    this.clearMessages();
    this.submitBtn.disabled = true;

    try {
      if (this.mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        this.messageEl.textContent = '가입 완료! 이메일 인증 링크를 확인하고 로그인해 주세요.';
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // 성공 시 onAuthStateChange가 자동으로 todo 섹션 전환
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다.';
      this.errorEl.textContent = message;
    } finally {
      this.submitBtn.disabled = false;
    }
  }
}
