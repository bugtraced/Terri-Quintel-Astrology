import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Planet {
    sign: string;
    degree: number;
}

export interface Chart {
    _id: string;
    name: string;
    birthDate: string;
    birthTime: string;
    birthLocation: string;
    sunSign: string;
    moonSign: string;
    risingSign: string;
    planets: {
        sun: Planet;
        moon: Planet;
        mercury: Planet;
        venus: Planet;
        mars: Planet;
        jupiter?: Planet;
        saturn?: Planet;
        uranus?: Planet;
        neptune?: Planet;
        pluto?: Planet;
    };
    latitude?: number;
    longitude?: number;
    notes?: string;
    isPublic?: boolean;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CalculateChartRequest {
    birthDate: string;
    birthTime: string;
    birthLocation: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
    createdBy?: string;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    count: number;
    total: number;
    page: number;
    pages: number;
}

@Injectable({
    providedIn: 'root'
})
export class ChartService {
    private apiUrl = '/api';

    constructor(private http: HttpClient) { }

    getAllCharts(
        page: number = 1, 
        limit: number = 10, 
        sunSign?: string, 
        sortBy: string = 'createdAt', 
        sortOrder: 'asc' | 'desc' = 'desc'
    ): Observable<PaginatedResponse<Chart>> {
        let url = `${this.apiUrl}/charts?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
        if (sunSign) {
            url += `&sunSign=${encodeURIComponent(sunSign)}`;
        }
        return this.http.get<PaginatedResponse<Chart>>(url);
    }

    getChartById(id: string): Observable<Chart> {
        return this.http.get<ApiResponse<Chart>>(`${this.apiUrl}/charts/${id}`).pipe(
            map(res => res.data)
        );
    }

    calculateChart(request: CalculateChartRequest): Observable<Chart> {
        return this.http.post<ApiResponse<Chart>>(`${this.apiUrl}/charts/calculate`, request).pipe(
            map(res => res.data)
        );
    }

    updateChart(id: string, updates: Partial<Chart>): Observable<Chart> {
        return this.http.put<ApiResponse<Chart>>(`${this.apiUrl}/charts/${id}`, updates).pipe(
            map(res => res.data)
        );
    }

    deleteChart(id: string): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/charts/${id}`).pipe(
            map(() => undefined)
        );
    }

    initializeProject(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/init`);
    }
}

