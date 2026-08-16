export interface PaisCatalogo {
  id: number;
  nombre: string;
}

export interface EstadoCatalogo {
  id: number;
  nombre: string;
  paisId: number;
}

export interface RegimenFiscalCatalogo {
  clave: number;
  descripcion: string;
  /** camelCase (servicio ms-direcciones-fiscales) */
  aplicaFisica?: boolean;
  /** camelCase (servicio ms-direcciones-fiscales) */
  aplicaMoral?: boolean;
  /** snake_case (servicio ms-cif-procesamiento) */
  aplica_fisica?: boolean;
  aplica_moral?: boolean;
}
