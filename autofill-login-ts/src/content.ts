interface FormField {
  element: HTMLInputElement;
  type: 'username' | 'password';
}

class FormDetector {
  constructor() {
    this.observeForms();
  }

  private async getCredentials(): Promise<any[]> {
    try {
      const response = await chrome.runtime.sendMessage({ 
        action: 'getCredentials'
      });
      return response.credentials || [];
    } catch (error) {
      console.error('Error loading credentials:', error);
      return [];
    }
  }

  private observeForms() {
    const observer = new MutationObserver(() => {
      this.scanForForms();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.scanForForms();
  }

  private scanForForms() {
    const forms = document.querySelectorAll('form');
    
    Array.from(forms).forEach((form, index) => {
      if (!form.hasAttribute('data-autofill-processed')) {
        form.setAttribute('data-autofill-processed', 'true');
        this.processForm(form as HTMLFormElement, index);
      }
    });
  }

  private processForm(form: HTMLFormElement, formIndex: number) {
    const fields = this.findFormFields(form);
    
    if (fields.username && fields.password) {
      this.addAutofillButton(fields, form, formIndex);
      // USUNIĘTE: this.attemptAutoFill(fields); - nie auto-uzupełniaj automatycznie
    }
  }

  private findFormFields(form: HTMLFormElement): { username?: HTMLInputElement; password?: HTMLInputElement } {
    const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input:not([type])');
    const fields: { username?: HTMLInputElement; password?: HTMLInputElement } = {};

    Array.from(inputs).forEach((input) => {
      const element = input as HTMLInputElement;
      
      if (element.type === 'password' || this.isPasswordField(element)) {
        fields.password = element;
        return;
      }

      if (!fields.username && this.isUsernameField(element)) {
        fields.username = element;
      }
    });

    return fields;
  }

  private isPasswordField(input: HTMLInputElement): boolean {
    const name = input.name.toLowerCase();
    const id = input.id.toLowerCase();
    const placeholder = input.placeholder.toLowerCase();
    const type = input.type.toLowerCase();

    const passwordIndicators = ['pass', 'pwd', 'hasło', 'password'];
    
    return passwordIndicators.some(indicator => 
      name.includes(indicator) || 
      id.includes(indicator) || 
      placeholder.includes(indicator) ||
      (type === 'password')
    );
  }

  private isUsernameField(input: HTMLInputElement): boolean {
    const name = input.name.toLowerCase();
    const id = input.id.toLowerCase();
    const placeholder = input.placeholder.toLowerCase();
    const type = input.type.toLowerCase();

    const usernameIndicators = [
      'user', 'login', 'email', 'username', 'account', 'auth', 
      'name', 'id', 'identifier', 'uid', 'usr'
    ];

    return usernameIndicators.some(indicator => 
      name.includes(indicator) || 
      id.includes(indicator) || 
      placeholder.includes(indicator) ||
      (type === 'email')
    );
  }

  private addAutofillButton(fields: { username?: HTMLInputElement; password?: HTMLInputElement }, form: HTMLFormElement, formIndex: number) {
    const existingButton = form.previousElementSibling as HTMLElement;
    if (existingButton && existingButton.classList.contains('autofill-button')) {
      return;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = '🔐 AutoFill';
    button.className = 'autofill-button';
    button.style.cssText = `
      background: #4285f4;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      margin: 5px 0;
      font-family: inherit;
    `;

    button.addEventListener('click', () => {
      this.fillCredentials(fields);
    });

    form.parentNode?.insertBefore(button, form);
  }

  // USUNIĘTA: metoda attemptAutoFill - nie jest już potrzebna

  private async fillCredentials(fields: { username?: HTMLInputElement; password?: HTMLInputElement }) {
    const credentials = await this.getCredentials();
    if (credentials.length === 0) return;

    const cred = credentials[0];
    
    if (fields.username) {
      fields.username.value = cred.username;
      fields.username.dispatchEvent(new Event('input', { bubbles: true }));
      fields.username.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    if (fields.password) {
      fields.password.value = cred.password;
      fields.password.dispatchEvent(new Event('input', { bubbles: true }));
      fields.password.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Opcjonalnie: możesz dodać efekt wizualny po wypełnieniu
    this.showSuccessMessage(fields);
  }

  private showSuccessMessage(fields: { username?: HTMLInputElement; password?: HTMLInputElement }) {
    // Tworzymy tymczasowy komunikat sukcesu
    const message = document.createElement('div');
    message.textContent = '✓ Dane wypełnione!';
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 10px 15px;
      border-radius: 4px;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(message);

    // Usuwamy komunikat po 2 sekundach
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 2000);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new FormDetector();
  });
} else {
  new FormDetector();
}