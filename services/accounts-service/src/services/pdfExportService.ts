/**
 * PDF Export Service - Generate transaction history PDFs
 */

import PDFDocument from 'pdfkit';
import { ICompteBancaire, IMouvementCompte } from '../types';
import { Writable } from 'stream';

export interface TransactionReportData {
  account: ICompteBancaire;
  transactions: IMouvementCompte[];
  dateFrom?: Date;
  dateTo?: Date;
  generatedAt: Date;
}

class PDFExportService {
  /**
   * Generate transaction history PDF
   */
  generateTransactionPDF(
    data: TransactionReportData,
    outputStream: Writable
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
        });

        doc.pipe(outputStream);

        // Header
        this.drawHeader(doc, data);

        // Account Summary
        this.drawAccountSummary(doc, data);

        // Transactions Table
        this.drawTransactionsTable(doc, data);

        // Footer
        this.drawFooter(doc, data);

        doc.end();

        doc.on('finish', () => {
          resolve();
        });

        doc.on('error', (err) => {
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Draw PDF header
   */
  private drawHeader(doc: PDFKit.PDFDocument, data: TransactionReportData): void {
    // Title
    doc.fontSize(24).font('Helvetica-Bold').text('SERVICE BANK', { align: 'center' });
    doc.fontSize(14)
      .font('Helvetica')
      .text('Relevé de Compte Détaillé', { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(10).text(`Généré le: ${this.formatDate(data.generatedAt)}`, {
      align: 'right',
    });

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);
  }

  /**
   * Draw account summary section
   */
  private drawAccountSummary(
    doc: PDFKit.PDFDocument,
    data: TransactionReportData
  ): void {
    const { account } = data;

    doc.fontSize(12).font('Helvetica-Bold').text('INFORMATIONS DU COMPTE', {
      underline: true,
    });
    doc.moveDown(0.3);

    doc.fontSize(10).font('Helvetica');
    const summaryData = [
      [`Numéro de Compte:`, account.numeroCompte],
      [`Type de Compte:`, account.typeCompte],
      [`Solde Actuel:`, `${account.solde.toFixed(2)} ${account.devise}`],
      [`Client ID:`, account.clientId],
      [`Date de Création:`, this.formatDate(account.dateCreation)],
      [`Actif:`, account.estActif ? 'Oui' : 'Non'],
    ];

    summaryData.forEach(([label, value]) => {
      doc.text(`${label} ${value}`, { continued: false });
      doc.moveDown(0.2);
    });

    doc.moveDown(0.5);
  }

  /**
   * Draw transactions table
   */
  private drawTransactionsTable(
    doc: PDFKit.PDFDocument,
    data: TransactionReportData
  ): void {
    const { transactions, dateFrom, dateTo } = data;

    doc.fontSize(12).font('Helvetica-Bold').text('HISTORIQUE DES TRANSACTIONS', {
      underline: true,
    });

    if (dateFrom && dateTo) {
      doc.fontSize(10)
        .font('Helvetica')
        .text(
          `Période: ${this.formatDate(dateFrom)} à ${this.formatDate(dateTo)}`
        );
    }

    doc.moveDown(0.5);

    // Table headers
    const headers = ['Date', 'Type', 'Montant', 'Solde Après', 'Description'];
    const colWidths = [100, 60, 80, 110, 145];
    const startX = 50;
    let currentY = doc.y;

    // Draw header row
    doc.fontSize(9).font('Helvetica-Bold');
    let xPos = startX;
    headers.forEach((header, i) => {
      doc.text(header, xPos, currentY, {
        width: colWidths[i],
        align: 'left',
      });
      xPos += colWidths[i];
    });

    currentY += 20;
    doc.moveTo(startX, currentY).lineTo(startX + 495, currentY).stroke();
    currentY += 10;

    // Draw transaction rows
    doc.fontSize(9).font('Helvetica');
    transactions.forEach((tx) => {
      // Check if we need a new page
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      xPos = startX;
      const rowData = [
        this.formatDate(tx.dateMouvement),
        tx.typeMouvement,
        `${tx.montant.toFixed(2)} €`,
        `${tx.soldeApresMouvement.toFixed(2)} €`,
        tx.description.substring(0, 40),
      ];

      rowData.forEach((value, i) => {
        doc.text(value, xPos, currentY, {
          width: colWidths[i],
          align: i === 2 || i === 3 ? 'right' : 'left',
        });
        xPos += colWidths[i];
      });

      currentY += 20;
    });

    if (transactions.length === 0) {
      doc.text('Aucune transaction trouvée.', startX, currentY);
      currentY += 20;
    }

    // Draw bottom line
    doc.moveTo(startX, currentY).lineTo(startX + 495, currentY).stroke();
    doc.moveDown(2);
  }

  /**
   * Draw footer
   */
  private drawFooter(doc: PDFKit.PDFDocument, data: TransactionReportData): void {
    const pageCount = (doc as any).bufferedPageRange().count;

    doc.fontSize(9).text(
      `Page 1 of ${pageCount} | Service Bank - Tous droits réservés`,
      50,
      doc.page.height - 30,
      { align: 'center' }
    );
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

export default new PDFExportService();
