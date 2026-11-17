// Type definitions untuk pph-21.
// Dasar hukum: PP 58/2023, PMK 168/2023, PMK 101/2016, UU HPP 7/2021.

export type StatusPtkp =
  | 'TK/0'
  | 'TK/1'
  | 'TK/2'
  | 'TK/3'
  | 'K/0'
  | 'K/1'
  | 'K/2'
  | 'K/3'
  | 'K/I/0'
  | 'K/I/1'
  | 'K/I/2'
  | 'K/I/3';

export type KategoriTer = 'A' | 'B' | 'C';

/** Satu lapisan tabel: [batasAtas (inklusif), tarifPersen]. */
export type LapisanTer = [batasAtas: number, tarifPersen: number];

export declare const TER_A: LapisanTer[];
export declare const TER_B: LapisanTer[];
export declare const TER_C: LapisanTer[];
export declare const PTKP: Record<StatusPtkp, number>;
export declare const KATEGORI_TER: Record<string, KategoriTer>;
export declare const STATUS_PTKP: StatusPtkp[];
export declare const TARIF_PROGRESIF: LapisanTer[];
export declare const TER_HARIAN: LapisanTer[];

export interface HasilTarifTer {
  kategori: KategoriTer;
  /** Tarif desimal, mis. 0.02 untuk 2%. */
  tarif: number;
  tarifPersen: number;
}

export interface HasilBulanan extends HasilTarifTer {
  bruto: number;
  ptkp: StatusPtkp;
  pph21: number;
  tanpaNpwp: boolean;
}

export interface HasilHarian {
  brutoHarian: number;
  tarifTer: number;
  tarifTerPersen: number;
  pph21: number;
  tanpaNpwp: boolean;
}

export interface LapisanProgresif {
  batasAtas: number;
  tarif: number;
  tarifPersen: number;
  dasar: number;
  pajak: number;
}

export interface HasilTahunan {
  brutoSetahun: number;
  biayaJabatan: number;
  iuranPensiun: number;
  penghasilanNeto: number;
  ptkp: StatusPtkp;
  nilaiPtkp: number;
  pkp: number;
  lapisan: LapisanProgresif[];
  pph21Setahun: number;
  pph21PerBulan: number;
  tanpaNpwp: boolean;
}

export interface HasilDesember {
  pph21Setahun: number;
  sudahDipotong: number;
  pph21Desember: number;
  lebihPotong: number;
}

export interface HasilGrossUp {
  bruto: number;
  ptkp: StatusPtkp;
  tunjanganPajak: number;
  brutoKotor: number;
  pph21: number;
  gajiBersih: number;
  iterasi: number;
}

export interface HasilBukanPegawai {
  bruto: number;
  dasarPengenaan: number;
  lapisan: LapisanProgresif[];
  pph21: number;
  tanpaNpwp: boolean;
}

export declare function getPtkp(status: StatusPtkp): number;
export declare function getKategoriTer(status: StatusPtkp): KategoriTer;
export declare function getTarifTer(
  brutoBulanan: number,
  ptkp: StatusPtkp,
): HasilTarifTer;
export declare function hitungPPh21Bulanan(input: {
  bruto: number;
  ptkp: StatusPtkp;
  punyaNpwp?: boolean;
}): HasilBulanan;
export declare function hitungPPh21Harian(input: {
  brutoHarian: number;
  punyaNpwp?: boolean;
}): HasilHarian;
export declare function hitungProgresif(pkp: number): {
  lapisan: LapisanProgresif[];
  total: number;
};
export declare function hitungPPh21Tahunan(input: {
  brutoSetahun: number;
  iuranPensiun?: number;
  ptkp: StatusPtkp;
  punyaNpwp?: boolean;
}): HasilTahunan;
export declare function hitungDesember(input: {
  pph21Setahun: number;
  sudahDipotong: number;
}): HasilDesember;
export declare function hitungGrossUp(input: {
  bruto: number;
  ptkp: StatusPtkp;
  punyaNpwp?: boolean;
}): HasilGrossUp;
export declare function hitungBukanPegawai(input: {
  bruto: number;
  punyaNpwp?: boolean;
}): HasilBukanPegawai;
export declare function formatRupiah(nilai: number): string;
