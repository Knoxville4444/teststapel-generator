import doktypen from './doktypen.json';
import dokumentkategorien from './dokumentkategorien.json';

export const DOKTYPEN = doktypen;
export const DOKUMENTKATEGORIEN = dokumentkategorien;

export const FACHSYSTEME = [
  { key: 'marke', label: 'Marke' },
  { key: 'patgbm', label: 'Patente / Gebrauchsmuster' },
  { key: 'designs', label: 'Design' },
  { key: 'zv', label: 'Zahlungsverkehr' },
];

export const SONSTIGE_KEY = '__ohne_unterverzeichnis__';
