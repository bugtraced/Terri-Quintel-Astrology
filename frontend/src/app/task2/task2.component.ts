import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChartService, Chart, CalculateChartRequest } from '../services/chart.service';

@Component({
  selector: 'app-task2',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="task2-container">
      <h2>Birth Chart Calculator</h2>
      <p class="task-description">
        Enter your birth information to calculate your astrological birth chart.
      </p>
      
      <form [formGroup]="chartForm" (ngSubmit)="onSubmit()" class="chart-form">
        <div class="form-group">
          <label for="birthDate" class="form-label">
            Birth Date <span class="required">*</span>
          </label>
          <input
            type="date"
            id="birthDate"
            formControlName="birthDate"
            class="form-control"
            [class.invalid]="isFieldInvalid('birthDate')"
            [class.valid]="isFieldValid('birthDate')"
          />
          <div *ngIf="isFieldInvalid('birthDate')" class="error-message">
            <span *ngIf="chartForm.get('birthDate')?.errors?.['required']">
              Birth date is required
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="birthTime" class="form-label">
            Birth Time <span class="required">*</span>
          </label>
          <input
            type="time"
            id="birthTime"
            formControlName="birthTime"
            class="form-control"
            [class.invalid]="isFieldInvalid('birthTime')"
            [class.valid]="isFieldValid('birthTime')"
          />
          <div *ngIf="isFieldInvalid('birthTime')" class="error-message">
            <span *ngIf="chartForm.get('birthTime')?.errors?.['required']">
              Birth time is required
            </span>
          </div>
          <small class="form-hint">Use 24-hour format (e.g., 14:30 for 2:30 PM)</small>
        </div>

        <div class="form-group">
          <label for="birthLocation" class="form-label">
            Birth Location <span class="required">*</span>
          </label>
          <input
            type="text"
            id="birthLocation"
            formControlName="birthLocation"
            class="form-control"
            placeholder="e.g., New York, NY"
            [class.invalid]="isFieldInvalid('birthLocation')"
            [class.valid]="isFieldValid('birthLocation')"
          />
          <div *ngIf="isFieldInvalid('birthLocation')" class="error-message">
            <span *ngIf="chartForm.get('birthLocation')?.errors?.['required']">
              Birth location is required
            </span>
            <span *ngIf="chartForm.get('birthLocation')?.errors?.['minlength']">
              Location must be at least 2 characters
            </span>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="submit-button"
            [disabled]="chartForm.invalid || loading"
          >
            <span *ngIf="!loading">Calculate Chart</span>
            <span *ngIf="loading" class="button-loading">
              <span class="button-spinner"></span>
              Calculating...
            </span>
          </button>
          <button
            type="button"
            class="reset-button"
            (click)="resetForm()"
            [disabled]="loading"
          >
            Reset
          </button>
        </div>
      </form>

      <div *ngIf="error && !loading" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>Error</h3>
        <p>{{ error }}</p>
      </div>

      <div *ngIf="calculatedChart && !loading && !error" class="result-container">
        <div class="result-header">
          <h3>Your Birth Chart</h3>
          <span class="success-badge">✓ Calculated</span>
        </div>

        <div class="result-content">
          <div class="result-section">
            <h4 class="section-title">Birth Information</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Name:</span>
                <span class="info-value">{{ calculatedChart.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Location:</span>
                <span class="info-value">{{ calculatedChart.birthLocation }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Date:</span>
                <span class="info-value">{{ formatDate(calculatedChart.birthDate) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Time:</span>
                <span class="info-value">{{ calculatedChart.birthTime }}</span>
              </div>
            </div>
          </div>

          <div class="result-section">
            <h4 class="section-title">Key Signs</h4>
            <div class="signs-grid">
              <div class="sign-card sun">
                <div class="sign-icon">☀️</div>
                <div class="sign-label">Sun</div>
                <div class="sign-value">{{ calculatedChart.sunSign }}</div>
              </div>
              <div class="sign-card moon">
                <div class="sign-icon">🌙</div>
                <div class="sign-label">Moon</div>
                <div class="sign-value">{{ calculatedChart.moonSign }}</div>
              </div>
              <div class="sign-card rising">
                <div class="sign-icon">⬆️</div>
                <div class="sign-label">Rising</div>
                <div class="sign-value">{{ calculatedChart.risingSign }}</div>
              </div>
            </div>
          </div>

          <div class="result-section">
            <h4 class="section-title">Planetary Positions</h4>
            <div class="planets-grid">
              <div *ngFor="let planet of getPlanetsList(calculatedChart.planets)" class="planet-card">
                <div class="planet-name">{{ capitalizeFirst(planet.name) }}</div>
                <div class="planet-position">
                  <span class="planet-sign">{{ planet.sign }}</span>
                  <span class="planet-degree">{{ planet.degree }}°</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task2-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 1rem;
    }

    h2 {
      color: #333;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }

    .task-description {
      color: #666;
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }

    .chart-form {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }

    .required {
      color: #e53e3e;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-control.invalid {
      border-color: #e53e3e;
    }

    .form-control.valid {
      border-color: #38a169;
    }

    .form-hint {
      display: block;
      margin-top: 0.25rem;
      color: #718096;
      font-size: 0.875rem;
    }

    .error-message {
      color: #e53e3e;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .submit-button,
    .reset-button {
      flex: 1;
      padding: 0.875rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .submit-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .submit-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .submit-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .reset-button {
      background: #e2e8f0;
      color: #4a5568;
    }

    .reset-button:hover:not(:disabled) {
      background: #cbd5e0;
    }

    .button-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .button-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-container {
      background: #fff5f5;
      border: 2px solid #fc8181;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      margin-bottom: 2rem;
      color: #c53030;
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .error-container h3 {
      margin: 0.5rem 0;
      color: #c53030;
    }

    /* Result Container */
    .result-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      margin-top: 2rem;
    }

    .result-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .result-header h3 {
      margin: 0;
      font-size: 1.5rem;
    }

    .success-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .result-content {
      padding: 2rem;
    }

    .result-section {
      margin-bottom: 2rem;
    }

    .result-section:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #667eea;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-label {
      font-weight: 500;
      color: #718096;
      font-size: 0.875rem;
    }

    .info-value {
      color: #2d3748;
      font-size: 1rem;
    }

    .signs-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .sign-card {
      text-align: center;
      padding: 1.5rem;
      border-radius: 8px;
      color: white;
    }

    .sign-card.sun {
      background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
    }

    .sign-card.moon {
      background: linear-gradient(135deg, #90cdf4 0%, #4299e1 100%);
    }

    .sign-card.rising {
      background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%);
    }

    .sign-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .sign-label {
      display: block;
      font-size: 0.875rem;
      opacity: 0.9;
      margin-bottom: 0.5rem;
    }

    .sign-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .planets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }

    .planet-card {
      background: #f7fafc;
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      text-align: center;
    }

    .planet-name {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }

    .planet-position {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .planet-sign {
      color: #667eea;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .planet-degree {
      color: #718096;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .chart-form {
        padding: 1.5rem;
      }

      .form-actions {
        flex-direction: column;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .signs-grid {
        grid-template-columns: 1fr;
      }

      .planets-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .result-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      h2 {
        font-size: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .task2-container {
        padding: 0.5rem;
      }

      .chart-form {
        padding: 1rem;
      }

      .result-content {
        padding: 1rem;
      }

      .planets-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class Task2Component {
  chartForm: FormGroup;
  loading = false;
  error: string | null = null;
  calculatedChart: Chart | null = null;

  constructor(
    private fb: FormBuilder,
    private chartService: ChartService
  ) {
    this.chartForm = this.fb.group({
      birthDate: ['', [Validators.required]],
      birthTime: ['', [Validators.required]],
      birthLocation: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  onSubmit() {
    if (this.chartForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    this.calculatedChart = null;

    const formValue = this.chartForm.value;
    const request: CalculateChartRequest = {
      birthDate: formValue.birthDate,
      birthTime: formValue.birthTime,
      birthLocation: formValue.birthLocation.trim()
    };

    this.chartService.calculateChart(request).subscribe({
      next: (chart) => {
        this.calculatedChart = chart;
        this.loading = false;
        this.chartForm.reset();
        setTimeout(() => {
          const el = document.querySelector('.result-container');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      },
      error: (err) => {
        this.error = err.error?.error || err.error?.errors?.[0]?.msg || err.message || 'Failed to calculate chart';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  resetForm() {
    this.chartForm.reset();
    this.error = null;
    this.calculatedChart = null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.chartForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.chartForm.get(fieldName);
    return !!(field && field.valid && field.dirty);
  }

  private markFormGroupTouched() {
    Object.keys(this.chartForm.controls).forEach(key => {
      const control = this.chartForm.get(key);
      control?.markAsTouched();
    });
  }

  formatDate(dateString: string) {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  }

  getPlanetsList(planets: Chart['planets']) {
    const result = [];
    const allPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    
    for (const planetName of allPlanets) {
      const planet = planets[planetName as keyof typeof planets];
      if (planet) {
        result.push({
          name: planetName,
          sign: planet.sign,
          degree: planet.degree
        });
      }
    }

    return result;
  }

  capitalizeFirst(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

