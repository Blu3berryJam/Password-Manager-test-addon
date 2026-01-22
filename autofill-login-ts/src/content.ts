console.log('Truly Yours Password Manager content script loaded');

interface FormField {
  element: HTMLInputElement;
  type: 'username' | 'password';
}

class FormDetector {
  constructor() {
    console.log('FormDetector initialized');
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
    // Szukaj tradycyjnych formularzy <form>
    const forms = document.querySelectorAll('form');
    Array.from(forms).forEach((form, index) => {
      if (!form.hasAttribute('data-autofill-processed')) {
        form.setAttribute('data-autofill-processed', 'true');
        this.processContainer(form, index);
      }
    });

    // Szukaj SPECJALNIE tylko div z id="form"
    const formDivs = document.querySelectorAll('div#form');
    Array.from(formDivs).forEach((div, index) => {
      if (!div.hasAttribute('data-autofill-processed')) {
        div.setAttribute('data-autofill-processed', 'true');
        this.processContainer(div, index);
      }
    });
  }

  private processContainer(container: Element, index: number) {
    console.log('Processing container:', container);

    const inputs = Array.from(container.querySelectorAll('input')) as HTMLInputElement[];
    const fields = this.findFieldsFromInputs(inputs);
    
    console.log('Found fields:', fields);

    if (fields.username && fields.password) {
      this.addAutofillButton(fields, container, index);
      
      // Auto-uzupełnianie jeśli włączone
      this.attemptAutoFill(fields);

      // Nasłuchuj na próbę zapisu danych
      this.listenForSubmission(container, fields);
    }
  }

  private listenForSubmission(container: Element, fields: { username?: HTMLInputElement; password?: HTMLInputElement }) {
    let submissionDetected = false;

    const handleSubmit = () => {
      if (submissionDetected) return;

      console.log('Submission detected, checking credentials...');
      const username = fields.username?.value;
      const password = fields.password?.value;

      if (username && password) {
        submissionDetected = true;
        this.promptToSaveCredentials(username, password);
        // Reset the flag after a short delay to allow for future submissions
        setTimeout(() => { submissionDetected = false; }, 1000);
      }
    };

    // Nasłuchuj na tradycyjne wysłanie formularza
    const form = container.closest('form');
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }

    // Nasłuchuj na kliknięcia w przyciski, które mogą wysyłać formularz
    const buttons = container.querySelectorAll('button, input[type="submit"], input[type="button"]');
    buttons.forEach(button => {
      // Sprawdź, czy przycisk wygląda na przycisk do logowania
      const buttonText = (button instanceof HTMLInputElement ? button.value : (button as HTMLElement).innerText || '').toLowerCase();
      const loginKeywords = ['log in', 'sign in', 'login', 'signin', 'submit', 'zaloguj'];
      
      if (loginKeywords.some(keyword => buttonText.includes(keyword))) {
        button.addEventListener('click', handleSubmit);
      }
    });
  }

  private promptToSaveCredentials(username: string, password: string) {
    chrome.runtime.sendMessage({
      action: 'promptToSaveCredentials',
      username,
      password,
      website: window.location.hostname
    });
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
    if (input.type === 'hidden' || input.style.display === 'none') return false;

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
  if (input.type === 'hidden' || input.style.display === 'none') return false;

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
    button.innerHTML = '🔒 AutoFill';
    button.className = 'autofill-button';
    button.style.cssText = `
      background: #2c3e50;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      margin: 10px 0;
      font-family: inherit;
      display: block;
      border: 1px solid #34495e;
    `;

    button.addEventListener('click', () => {
      this.fillCredentials(fields);
    });

    container.parentNode?.insertBefore(button, container);
    console.log('AutoFill button added');
  }

  private async attemptAutoFill(fields: { username?: HTMLInputElement; password?: HTMLInputElement }) {
    // Sprawdź czy auto-uzupełnianie jest włączone
    const result = await chrome.storage.local.get(['autoFillEnabled']);
    const autoFillEnabled = result.autoFillEnabled !== false; // domyślnie true
    
    console.log('Auto-fill enabled:', autoFillEnabled);
    
    if (autoFillEnabled) {
      console.log('Auto-filling form');
      this.fillCredentials(fields);
    }
  }

  private async fillCredentials(fields: { username?: HTMLInputElement; password?: HTMLInputElement }) {
    const credentials = await this.getCredentials();
    if (credentials.length === 0) return;

    const cred = credentials[0];
    
    if (fields.username) {
      fields.username.value = cred.username;
      fields.username.dispatchEvent(new Event('input', { bubbles: true }));
      fields.username.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('Filled username:', fields.username);
    }
    
    if (fields.password) {
      fields.password.value = cred.password;
      fields.password.dispatchEvent(new Event('input', { bubbles: true }));
      fields.password.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('Filled password:', fields.password);
    }

    this.showSuccessMessage(fields);
  }

  private showSuccessMessage(fields: { username?: HTMLInputElement; password?: HTMLInputElement }) {
    const message = document.createElement('div');
    message.textContent = 'Credentials filled';
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #27ae60;
      color: white;
      padding: 10px 15px;
      border-radius: 4px;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      border: 1px solid #219652;
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