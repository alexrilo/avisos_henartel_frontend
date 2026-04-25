import { Page, Locator } from '@playwright/test';

export interface AvisoFormData {
  clienteId?: number;
  clienteNombre?: string;
  description: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  calle: string;
  numero: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;
  fechaProgramada?: string;
}

/**
 * Page Object Model for the Aviso Form page.
 * Provides locators and methods for interacting with the aviso creation/editing form.
 */
export class AvisoFormPage {
  readonly page: Page;
  readonly clientSelect: Locator;
  readonly descriptionInput: Locator;
  readonly prioritySelect: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.clientSelect = page.getByTestId('client-select');
    this.descriptionInput = page.getByTestId('description-input');
    this.prioritySelect = page.getByTestId('priority-select');
    this.submitButton = page.getByTestId('submit-button');
    this.cancelButton = page.getByTestId('cancel-button');
    this.successMessage = page.getByTestId('success-message');
    this.errorMessage = page.getByTestId('error-message');
  }

  /**
   * Navigate to the new aviso form.
   */
  async gotoNew(): Promise<void> {
    await this.page.goto('/dashboard/avisos/nuevo');
  }

  /**
   * Navigate to edit an existing aviso.
   * @param avisoId - The ID of the aviso to edit
   */
  async gotoEdit(avisoId: number): Promise<void> {
    await this.page.goto(`/dashboard/avisos/${avisoId}/editar`);
  }

  /**
   * Select a client by name.
   * @param name - The client name or razon social
   */
  async selectClient(name: string): Promise<void> {
    await this.clientSelect.selectOption({ label: name });
  }

  /**
   * Fill the description field.
   * @param text - The description text
   */
  async fillDescription(text: string): Promise<void> {
    await this.descriptionInput.fill(text);
  }

  /**
   * Select priority level.
   * @param priority - Priority value: BAJA, MEDIA, ALTA, or URGENTE
   */
  async selectPriority(priority: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE'): Promise<void> {
    await this.prioritySelect.selectOption(priority);
  }

  /**
   * Fill the address fields.
   * @param data - Object containing calle, numero, localidad, provincia, codigoPostal
   */
  async fillAddress(data: {
    calle: string;
    numero: string;
    localidad: string;
    provincia: string;
    codigoPostal: string;
  }): Promise<void> {
    await this.page.getByLabel(/calle/i).fill(data.calle);
    await this.page.getByLabel(/número|numero/i).fill(data.numero);
    await this.page.getByLabel(/localidad/i).fill(data.localidad);
    await this.page.getByLabel(/provincia/i).fill(data.provincia);
    await this.page.getByLabel(/código postal|codigo postal/i).fill(data.codigoPostal);
  }

  /**
   * Fill the complete aviso form.
   * Requires a client to be selected - fillForm will wait for the client select to be ready.
   * @param data - Complete form data
   */
  async fillForm(data: AvisoFormData): Promise<void> {
    // Wait for client select to be ready and have options
    await this.clientSelect.waitFor({ state: 'visible' });
    
    // Select client by ID or by name
    if (data.clienteId) {
      await this.clientSelect.selectOption(data.clienteId.toString());
    } else if (data.clienteNombre) {
      await this.clientSelect.selectOption({ label: data.clienteNombre });
    } else {
      // Default: select first available client (assuming there's at least one in DB)
      const options = await this.clientSelect.locator('option').count();
      if (options > 1) {
        // Select option index 1 (index 0 is usually the "select a client" placeholder)
        await this.clientSelect.selectOption({ index: 1 });
      }
    }
    
    await this.descriptionInput.fill(data.description);
    await this.prioritySelect.selectOption(data.prioridad);
    await this.fillAddress({
      calle: data.calle,
      numero: data.numero,
      localidad: data.localidad,
      provincia: data.provincia,
      codigoPostal: data.codigoPostal,
    });
    if (data.fechaProgramada) {
      await this.page.getByLabel(/fecha programada/i).fill(data.fechaProgramada);
    }
  }

  /**
   * Submit the form.
   */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Click the cancel button.
   */
  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * Get the success message if visible.
   */
  async getSuccessMessage(): Promise<string | null> {
    if (await this.successMessage.isVisible()) {
      return this.successMessage.textContent();
    }
    return null;
  }

  /**
   * Get the error message if visible.
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return this.errorMessage.textContent();
    }
    return null;
  }

  /**
   * Wait for the form to be submitted and navigate to the list.
   */
  async waitForSubmission(): Promise<void> {
    // Wait for redirect back to the list
    await this.page.waitForURL('**/dashboard/avisos**', { timeout: 10000 });
  }

  /**
   * Check if form validation is blocking submission.
   */
  async isSubmitDisabled(): Promise<boolean> {
    const submitButton = this.submitButton;
    const isDisabled = await submitButton.isDisabled();
    return isDisabled;
  }
}