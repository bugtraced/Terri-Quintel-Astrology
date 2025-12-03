import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartService, Chart } from '../services/chart.service';

@Component({
  selector: 'app-task1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="task1-container">
      <h2>Astrological Charts</h2>
      <p class="task-description">
        Browse through astrological birth charts from our collection.
      </p>

      <div class="filters-container">
        <div class="search-section">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="applyFilters()"
            placeholder="Search by name or location..."
            class="search-input"
          />
        </div>

        <div class="filters-row">
          <div class="filter-group">
            <label>Sun Sign:</label>
            <select [(ngModel)]="filters.sunSign" (change)="applyFilters()" class="filter-select">
              <option value="">All</option>
              <option *ngFor="let sign of zodiacSigns" [value]="sign">{{ sign }}</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Moon Sign:</label>
            <select [(ngModel)]="filters.moonSign" (change)="applyFilters()" class="filter-select">
              <option value="">All</option>
              <option *ngFor="let sign of zodiacSigns" [value]="sign">{{ sign }}</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Rising Sign:</label>
            <select [(ngModel)]="filters.risingSign" (change)="applyFilters()" class="filter-select">
              <option value="">All</option>
              <option *ngFor="let sign of zodiacSigns" [value]="sign">{{ sign }}</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Sort By:</label>
            <select [(ngModel)]="sortBy" (change)="applyFilters()" class="filter-select">
              <option value="createdAt">Creation Date</option>
              <option value="birthDate">Birth Date</option>
              <option value="name">Name</option>
              <option value="sunSign">Sun Sign</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Order:</label>
            <select [(ngModel)]="sortOrder" (change)="applyFilters()" class="filter-select">
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        <div class="date-filter-row">
          <div class="filter-group">
            <label>Date From:</label>
            <input
              type="date"
              [(ngModel)]="filters.dateFrom"
              (change)="applyFilters()"
              class="filter-input"
            />
          </div>

          <div class="filter-group">
            <label>Date To:</label>
            <input
              type="date"
              [(ngModel)]="filters.dateTo"
              (change)="applyFilters()"
              class="filter-input"
            />
          </div>

          <button (click)="clearFilters()" class="clear-button">Clear Filters</button>
        </div>
      </div>
      
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading charts...</p>
      </div>

      <div *ngIf="error && !loading" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>Error Loading Charts</h3>
        <p>{{ error }}</p>
        <button (click)="loadCharts()" class="retry-button">Try Again</button>
      </div>

      <div *ngIf="!loading && !error && filteredCharts.length === 0 && allCharts.length > 0" class="empty-container">
        <div class="empty-icon">🔍</div>
        <h3>No Charts Match Your Filters</h3>
        <p>Try adjusting your search or filter criteria.</p>
      </div>

      <div *ngIf="!loading && !error && allCharts.length === 0" class="empty-container">
        <div class="empty-icon">📊</div>
        <h3>No Charts Available</h3>
        <p>There are no charts to display at the moment.</p>
      </div>

      <div *ngIf="!loading && !error && filteredCharts.length > 0" class="charts-grid">
        <div *ngFor="let chart of filteredCharts" class="chart-card">
          <div class="chart-header">
            <h3 class="chart-name">{{ chart.name }}</h3>
            <div class="chart-header-right">
              <span class="chart-id">#{{ chart._id.slice(-6) }}</span>
              <div class="chart-actions">
                <button (click)="openEditModal(chart)" class="action-button edit-button" title="Edit chart">
                  ✏️
                </button>
                <button (click)="confirmDelete(chart)" class="action-button delete-button" title="Delete chart">
                  🗑️
                </button>
              </div>
            </div>
          </div>
          
          <div class="chart-info">
            <div class="info-row">
              <span class="info-label">📍 Location:</span>
              <span class="info-value">{{ chart.birthLocation }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">📅 Birth Date:</span>
              <span class="info-value">{{ formatDate(chart.birthDate) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">🕐 Birth Time:</span>
              <span class="info-value">{{ chart.birthTime }}</span>
            </div>
          </div>

          <div class="signs-section">
            <h4 class="section-title">Key Signs</h4>
            <div class="signs-grid">
              <div class="sign-item">
                <span class="sign-label">Sun</span>
                <span class="sign-value">{{ chart.sunSign }}</span>
              </div>
              <div class="sign-item">
                <span class="sign-label">Moon</span>
                <span class="sign-value">{{ chart.moonSign }}</span>
              </div>
              <div class="sign-item">
                <span class="sign-label">Rising</span>
                <span class="sign-value">{{ chart.risingSign }}</span>
              </div>
            </div>
          </div>

          <div class="planets-section">
            <h4 class="section-title">Planetary Positions</h4>
            <div class="planets-list">
              <div *ngFor="let planet of getPlanetsList(chart.planets)" class="planet-item">
                <span class="planet-name">{{ capitalizeFirst(planet.name) }}</span>
                <span class="planet-details">{{ planet.sign }} {{ planet.degree }}°</span>
              </div>
            </div>
          </div>

          <div *ngIf="chart.notes" class="notes-section">
            <p class="notes-text">{{ chart.notes }}</p>
          </div>
        </div>
      </div>

      <div *ngIf="loadingMore" class="loading-more">
        <div class="spinner-small"></div>
        <p>Loading more charts...</p>
      </div>

      <div *ngIf="!hasMore && filteredCharts.length > 0 && !loadingMore" class="end-message">
        <p>You've reached the end of the list</p>
        <p *ngIf="filteredCharts.length < allCharts.length" class="filter-note">
          Showing {{ filteredCharts.length }} of {{ allCharts.length }} charts
        </p>
      </div>
    </div>

    <!-- Edit Modal -->
    <div *ngIf="showEditModal" class="modal-overlay" (click)="closeEditModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Edit Chart</h3>
          <button (click)="closeEditModal()" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <form *ngIf="editingChart" (ngSubmit)="saveChart()" class="edit-form">
            <div class="form-group">
              <label>Chart Name:</label>
              <input
                type="text"
                [(ngModel)]="editingChart.name"
                name="name"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label>Birth Date:</label>
              <input
                type="date"
                [(ngModel)]="editingChart.birthDate"
                name="birthDate"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label>Birth Time:</label>
              <input
                type="time"
                [(ngModel)]="editingChart.birthTime"
                name="birthTime"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label>Birth Location:</label>
              <input
                type="text"
                [(ngModel)]="editingChart.birthLocation"
                name="birthLocation"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label>Notes:</label>
              <textarea
                [(ngModel)]="editingChart.notes"
                name="notes"
                class="form-textarea"
                rows="3"
                maxlength="1000"
              ></textarea>
            </div>

            <div class="form-group">
              <label>
                <input
                  type="checkbox"
                  [(ngModel)]="editingChart.isPublic"
                  name="isPublic"
                />
                Public Chart
              </label>
            </div>

            <div *ngIf="editError" class="error-message">
              {{ editError }}
            </div>

            <div class="modal-actions">
              <button type="button" (click)="closeEditModal()" class="cancel-button">Cancel</button>
              <button type="submit" [disabled]="saving" class="save-button">
                <span *ngIf="!saving">Save Changes</span>
                <span *ngIf="saving">Saving...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div *ngIf="showDeleteModal" class="modal-overlay" (click)="closeDeleteModal()">
      <div class="modal-content delete-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Delete Chart</h3>
          <button (click)="closeDeleteModal()" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this chart?</p>
          <p class="delete-warning"><strong>{{ chartToDelete?.name }}</strong></p>
          <p class="delete-note">This action cannot be undone.</p>
          <div *ngIf="deleteError" class="error-message">
            {{ deleteError }}
          </div>
          <div class="modal-actions">
            <button type="button" (click)="closeDeleteModal()" class="cancel-button">Cancel</button>
            <button (click)="deleteChart()" [disabled]="deleting" class="delete-confirm-button">
              <span *ngIf="!deleting">Delete</span>
              <span *ngIf="deleting">Deleting...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task1-container {
      max-width: 1200px;
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

    .filters-container {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .search-section {
      margin-bottom: 1rem;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .filters-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .date-filter-row {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #4a5568;
    }

    .filter-select,
    .filter-input {
      padding: 0.5rem;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.875rem;
      background: white;
    }

    .filter-select:focus,
    .filter-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .clear-button {
      padding: 0.5rem 1rem;
      background: #e2e8f0;
      color: #4a5568;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background 0.2s;
    }

    .clear-button:hover {
      background: #cbd5e0;
    }

    .filter-note {
      font-size: 0.75rem;
      color: #718096;
      margin-top: 0.5rem;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .delete-modal {
      max-width: 400px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .modal-header h3 {
      margin: 0;
      color: #2d3748;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 2rem;
      color: #718096;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .modal-close:hover {
      background: #e2e8f0;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 500;
      color: #4a5568;
      font-size: 0.875rem;
    }

    .form-input,
    .form-textarea {
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      font-size: 1rem;
      font-family: inherit;
    }

    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-textarea {
      resize: vertical;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }

    .cancel-button,
    .save-button,
    .delete-confirm-button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cancel-button {
      background: #e2e8f0;
      color: #4a5568;
    }

    .cancel-button:hover {
      background: #cbd5e0;
    }

    .save-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .save-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .save-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .delete-confirm-button {
      background: #e53e3e;
      color: white;
    }

    .delete-confirm-button:hover:not(:disabled) {
      background: #c53030;
    }

    .delete-confirm-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .delete-warning {
      font-size: 1.1rem;
      color: #2d3748;
      margin: 1rem 0;
    }

    .delete-note {
      color: #718096;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    .error-message {
      color: #e53e3e;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: #fff5f5;
      border-radius: 4px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-container {
      text-align: center;
      padding: 3rem 2rem;
      background: #fff5f5;
      border: 2px solid #fc8181;
      border-radius: 12px;
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

    .retry-button {
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.3s;
    }

    .retry-button:hover {
      background: #5568d3;
    }

    .empty-container {
      text-align: center;
      padding: 4rem 2rem;
      color: #999;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      border: 1px solid #e2e8f0;
    }

    .chart-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .chart-header-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .chart-actions {
      display: flex;
      gap: 0.25rem;
    }

    .action-button {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      transition: background 0.2s;
      line-height: 1;
    }

    .edit-button:hover {
      background: #e6fffa;
    }

    .delete-button:hover {
      background: #fff5f5;
    }

    .chart-name {
      margin: 0;
      color: #2d3748;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .chart-id {
      font-size: 0.875rem;
      color: #718096;
      background: #edf2f7;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
    }

    .chart-info {
      margin-bottom: 1.5rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f7fafc;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      font-weight: 500;
      color: #4a5568;
    }

    .info-value {
      color: #2d3748;
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2d3748;
      margin: 1.5rem 0 1rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #667eea;
    }

    .signs-section {
      margin-bottom: 1.5rem;
    }

    .signs-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .sign-item {
      text-align: center;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      color: white;
    }

    .sign-label {
      display: block;
      font-size: 0.875rem;
      opacity: 0.9;
      margin-bottom: 0.5rem;
    }

    .sign-value {
      display: block;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .planets-section {
      margin-bottom: 1rem;
    }

    .planets-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .planet-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem;
      background: #f7fafc;
      border-radius: 6px;
      border-left: 3px solid #667eea;
    }

    .planet-name {
      font-weight: 500;
      color: #4a5568;
    }

    .planet-details {
      color: #718096;
      font-size: 0.875rem;
    }

    .notes-section {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .notes-text {
      color: #718096;
      font-style: italic;
      font-size: 0.875rem;
      margin: 0;
    }

    .loading-more {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
      margin-top: 2rem;
    }

    .spinner-small {
      width: 30px;
      height: 30px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 0.5rem;
    }

    .end-message {
      text-align: center;
      padding: 2rem;
      color: #718096;
      font-size: 0.875rem;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .charts-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .signs-grid {
        grid-template-columns: 1fr;
      }

      .planets-list {
        grid-template-columns: 1fr;
      }

      .filters-row {
        grid-template-columns: 1fr;
      }

      .date-filter-row {
        flex-direction: column;
      }

      .date-filter-row .filter-group {
        width: 100%;
      }

      .clear-button {
        width: 100%;
      }

      h2 {
        font-size: 1.5rem;
      }

      .task-description {
        font-size: 1rem;
      }
    }

    @media (max-width: 480px) {
      .task1-container {
        padding: 0.5rem;
      }

      .chart-card {
        padding: 1rem;
      }

      .chart-name {
        font-size: 1.25rem;
      }
    }
  `]
})
export class Task1Component implements OnInit, OnDestroy {
  allCharts: Chart[] = [];
  filteredCharts: Chart[] = [];
  loading = false;
  loadingMore = false;
  error: string | null = null;
  currentPage = 1;
  totalPages = 1;
  hasMore = true;

  searchQuery = '';
  sortBy: string = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';
  filters = {
    sunSign: '',
    moonSign: '',
    risingSign: '',
    dateFrom: '',
    dateTo: ''
  };

  zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  constructor(private chartService: ChartService) {}

  ngOnInit() {
    this.loadCharts();
  }

  ngOnDestroy() {
    // Cleanup handled by HostListener removal
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (this.loadingMore || !this.hasMore || this.loading) {
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.documentElement.scrollHeight;
    const threshold = 200;

    if (scrollPosition >= pageHeight - threshold) {
      this.loadNextPage();
    }
  }

  loadCharts() {
    this.loading = true;
    this.error = null;
    this.currentPage = 1;
    this.allCharts = [];
    this.filteredCharts = [];

    this.fetchCharts();
  }

  fetchCharts() {
    const sunSign = this.filters.sunSign || undefined;
    this.chartService.getAllCharts(this.currentPage, 10, sunSign, this.sortBy, this.sortOrder).subscribe({
      next: (response) => {
        if (this.currentPage === 1) {
          this.allCharts = response.data;
        } else {
          this.allCharts = [...this.allCharts, ...response.data];
        }
        this.totalPages = response.pages;
        this.hasMore = this.currentPage < this.totalPages;
        this.loading = false;
        this.loadingMore = false;
        this.applyFilters();
      },
      error: (err) => {
        this.error = err.error?.error || err.message || 'Failed to load charts';
        this.loading = false;
        this.loadingMore = false;
        console.error('Error:', err);
      }
    });
  }

  loadNextPage() {
    if (!this.hasMore || this.loadingMore) {
      return;
    }

    this.loadingMore = true;
    this.currentPage++;
    this.fetchCharts();
  }

  applyFilters() {
    let filtered = [...this.allCharts];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(chart =>
        chart.name.toLowerCase().includes(query) ||
        chart.birthLocation.toLowerCase().includes(query)
      );
    }

    if (this.filters.moonSign) {
      filtered = filtered.filter(chart => chart.moonSign === this.filters.moonSign);
    }

    if (this.filters.risingSign) {
      filtered = filtered.filter(chart => chart.risingSign === this.filters.risingSign);
    }

    if (this.filters.dateFrom) {
      const fromDate = new Date(this.filters.dateFrom);
      filtered = filtered.filter(chart => {
        const chartDate = new Date(chart.birthDate);
        return chartDate >= fromDate;
      });
    }

    if (this.filters.dateTo) {
      const toDate = new Date(this.filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(chart => {
        const chartDate = new Date(chart.birthDate);
        return chartDate <= toDate;
      });
    }

    this.filteredCharts = filtered;
  }

  clearFilters() {
    this.searchQuery = '';
    this.filters = {
      sunSign: '',
      moonSign: '',
      risingSign: '',
      dateFrom: '',
      dateTo: ''
    };
    this.sortBy = 'createdAt';
    this.sortOrder = 'desc';
    this.loadCharts();
  }

  showEditModal = false;
  showDeleteModal = false;
  editingChart: Chart | null = null;
  chartToDelete: Chart | null = null;
  saving = false;
  deleting = false;
  editError: string | null = null;
  deleteError: string | null = null;

  openEditModal(chart: Chart) {
    this.editingChart = { 
      ...chart,
      birthDate: this.formatDateForInput(chart.birthDate)
    };
    this.editError = null;
    this.showEditModal = true;
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return dateString.split('T')[0];
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingChart = null;
    this.editError = null;
  }

  saveChart() {
    if (!this.editingChart) return;

    this.saving = true;
    this.editError = null;

    const updates = {
      name: this.editingChart.name,
      birthDate: this.editingChart.birthDate,
      birthTime: this.editingChart.birthTime,
      birthLocation: this.editingChart.birthLocation,
      notes: this.editingChart.notes || '',
      isPublic: this.editingChart.isPublic || false
    };

    this.chartService.updateChart(this.editingChart._id, updates).subscribe({
      next: (updatedChart) => {
        const index = this.allCharts.findIndex(c => c._id === updatedChart._id);
        if (index !== -1) {
          this.allCharts[index] = updatedChart;
          this.applyFilters();
        }
        this.saving = false;
        this.closeEditModal();
      },
      error: (err) => {
        this.editError = err.error?.error || err.error?.errors?.[0]?.msg || err.message || 'Failed to update chart';
        this.saving = false;
        console.error('Error updating chart:', err);
      }
    });
  }

  confirmDelete(chart: Chart) {
    this.chartToDelete = chart;
    this.deleteError = null;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.chartToDelete = null;
    this.deleteError = null;
  }

  deleteChart() {
    if (!this.chartToDelete) return;

    this.deleting = true;
    this.deleteError = null;

    this.chartService.deleteChart(this.chartToDelete._id).subscribe({
      next: () => {
        this.allCharts = this.allCharts.filter(c => c._id !== this.chartToDelete!._id);
        this.applyFilters();
        this.deleting = false;
        this.closeDeleteModal();
      },
      error: (err) => {
        this.deleteError = err.error?.error || err.message || 'Failed to delete chart';
        this.deleting = false;
        console.error('Error deleting chart:', err);
      }
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

