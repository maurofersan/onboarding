import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CreateAccountRequest {
  documentType: string;
  documentNumber: string;
  phoneNumber: string;
  email: string;
  isPeruvian: string; // "S" o "N"
  acceptedPrivacyPolicy: string; // "S" o "N"
}

export interface CreateAccountResponse {
  leadId: number;
  documentType: string;
  documentNumber: string;
  firstLastname: string;
  secondLastname: string;
  fullName: string;
  birthDate: string;
  phoneNumber: string;
  maritalStatus: string;
  gender: string;
  homeAddress: string;
  companyRuc: string;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  campaignStartDate: string;
  income: number;
  bureauScore: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  leadProductRecord?: {
    leadId: number;
    productCode: string;
    subproductCode: string;
    evaluationType: string;
    strategyColorCode: string;
    approvedAmount: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
  };
  loanLeadRecord?: {
    loanId: number;
    leadId: number;
    approvedAmount: number;
    disbursedAmount: number;
    interestRate: number;
    termMonths: number;
    startDate: string;
    endDate: string;
    loanStatus: string;
    contractPath: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    isActive: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class AccountOpeningApiService {
  // Usar ruta relativa para que el proxy de webpack funcione
  // El proxy redirige /api/* a http://localhost:3000/*
  // Esto evita problemas de CORS en desarrollo
  private readonly apiUrl = '/api/redis/create';

  constructor(private http: HttpClient) {}

  /**
   * Crea una cuenta con los datos del formulario
   */
  createAccount(request: CreateAccountRequest): Observable<CreateAccountResponse> {
    // Configurar headers para la petición
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });

    // Opciones de la petición HTTP
    const httpOptions = {
      headers: headers,
      // No incluir credentials para evitar problemas de CORS
      withCredentials: false,
    };

    // Realizar la petición POST con headers
    return this.http.post<CreateAccountResponse>(this.apiUrl, request, httpOptions);
  }
}

