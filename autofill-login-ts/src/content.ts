console.log('🔐 Password Autofill content script LOADED!');

interface FormField {
  element: HTMLInputElement;
  type: 'username' | 'password';
}

class FormDetector {
  constructor() {
    console.log('🔐 FormDetector initialized');
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
      this.scanForLoginContainers();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.scanForLoginContainers();
  }

  private scanForLoginContainers() {
    // Szukaj tradycyjnych formularzy
    const forms = document.querySelectorAll('form');
    Array.from(forms).forEach((form, index) => {
      if (!form.hasAttribute('data-autofill-processed')) {
        form.setAttribute('data-autofill-processed', 'true');
        this.processContainer(form, index, 'form');
      }
    });

    // Szukaj div-ów z polami login/hasło (jak Twój przykład)
    const loginContainers = this.findLoginContainers();
    loginContainers.forEach((container, index) => {
      if (!container.hasAttribute('data-autofill-processed')) {
        container.setAttribute('data-autofill-processed', 'true');
        this.processContainer(container, index, 'div');
      }
    });
  }

  private findLoginContainers(): Element[] {
    const containers: Element[] = [];

    // Szukaj elementów które mają pola username i password
    const allContainers = document.querySelectorAll('div, section, .form, .login-container, #form, #login');
    
    allContainers.forEach(container => {
      const inputs = container.querySelectorAll('input');
      const hasUsername = Array.from(inputs).some(input => this.isUsernameField(input));
      const hasPassword = Array.from(inputs).some(input => this.isPasswordField(input));
      
      if (hasUsername && hasPassword) {
        containers.push(container);
      }
    });

    return containers;
  }

  private processContainer(container: Element, index: number, type: string) {
    console.log(`🔐 Processing ${type} container ${index}:`, container);

    const inputs = Array.from(container.querySelectorAll('input')) as HTMLInputElement[];
    const fields = this.findFieldsFromInputs(inputs);
    
    console.log(`🔐 Found fields in ${type}:`, fields);

    if (fields.username && fields.password) {
      this.addAutofillButton(fields, container, index);
    }
  }

  private findFieldsFromInputs(inputs: HTMLInputElement[]): { username?: HTMLInputElement; password?: HTMLInputElement } {
    const fields: { username?: HTMLInputElement; password?: HTMLInputElement } = {};

    // Najpierw znajdź pole password
    for (const input of inputs) {
      if (this.isPasswordField(input)) {
        fields.password = input;
        break;
      }
    }

    // Potem znajdź pole username
    for (const input of inputs) {
      if (!fields.username && this.isUsernameField(input)) {
        fields.username = input;
        break;
      }
    }

    return fields;
  }

  private isPasswordField(input: HTMLInputElement): boolean {
    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    const placeholder = (input.placeholder || '').toLowerCase();
    const type = (input.type || '').toLowerCase();

    const passwordIndicators = ['pass', 'pwd', 'hasło', 'password'];
    
    return passwordIndicators.some(indicator => 
      name.includes(indicator) || 
      id.includes(indicator) || 
      placeholder.includes(indicator) ||
      (type === 'password')
    );
  }

  private isUsernameField(input: HTMLInputElement): boolean {
    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    const placeholder = (input.placeholder || '').toLowerCase();
    const type = (input.type || '').toLowerCase();

    const usernameIndicators = [
      'user', 'login', 'email', 'username', 'account', 'auth', 
      'name', 'id', 'identifier', 'uid', 'usr', 'mail'
    ];

    return usernameIndicators.some(indicator => 
      name.includes(indicator) || 
      id.includes(indicator) || 
      placeholder.includes(indicator) ||
      (type === 'email') ||
      (type === 'text' && (name.includes('user') || name.includes('login')))
    );
  }

  private addAutofillButton(fields: { username?: HTMLInputElement; password?: HTMLInputElement }, container: Element, index: number) {
    const existingButton = container.previousElementSibling as HTMLElement;
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
      margin: 10px 0;
      font-family: inherit;
      display: block;
    `;

    button.addEventListener('click', () => {
      this.fillCredentials(fields);
    });

    container.parentNode?.insertBefore(button, container);
    console.log('🔐 AutoFill button added to container!');
  }

  private async fillCredentials(fields: { username?: HTMLInputElement; password?: HTMLInputElement }) {
    const credentials = await this.getCredentials();
    if (credentials.length === 0) return;

    const cred = credentials[0];
    
    if (fields.username) {
      fields.username.value = cred.username;
      fields.username.dispatchEvent(new Event('input', { bubbles: true }));
      fields.username.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('🔐 Filled username:', fields.username);
    }
    
    if (fields.password) {
      fields.password.value = cred.password;
      fields.password.dispatchEvent(new Event('input', { bubbles: true }));
      fields.password.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('🔐 Filled password:', fields.password);
    }

    this.showSuccessMessage(fields);
  }

  private showSuccessMessage(fields: { username?: HTMLInputElement; password?: HTMLInputElement }) {
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