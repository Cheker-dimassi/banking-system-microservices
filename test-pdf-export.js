#!/usr/bin/env node
/**
 * Test PDF Export - Standalone demo
 * Run: node test-pdf-export.js
 */

const mongoose = require('mongoose');
const pdfkit = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Simulate transaction data
const mockAccount = {
  _id: '123',
  numeroCompte: 'FR7612345678901234567890123',
  typeCompte: 'COURANT',
  solde: 5432.50,
  devise: 'EUR',
  clientId: 'client-001',
  email: 'client@example.com',
  estActif: true,
  dateCreation: new Date('2024-01-15'),
  dateModification: new Date(),
};

const mockTransactions = [
  {
    _id: 'tx-001',
    compteId: '123',
    typeMouvement: 'CREDIT',
    montant: 1500,
    soldeApresMouvement: 4500,
    dateMouvement: new Date('2024-11-20'),
    description: 'Versement salaire novembre',
    referenceTransaction: 'ref-001',
  },
  {
    _id: 'tx-002',
    compteId: '123',
    typeMouvement: 'DEBIT',
    montant: 250,
    soldeApresMouvement: 4250,
    dateMouvement: new Date('2024-11-22'),
    description: 'Paiement facture électricité',
    referenceTransaction: 'ref-002',
  },
  {
    _id: 'tx-003',
    compteId: '123',
    typeMouvement: 'CREDIT',
    montant: 100,
    soldeApresMouvement: 4350,
    dateMouvement: new Date('2024-11-23'),
    description: 'Remboursement ami',
    referenceTransaction: 'ref-003',
  },
  {
    _id: 'tx-004',
    compteId: '123',
    typeMouvement: 'DEBIT',
    montant: 85.75,
    soldeApresMouvement: 4264.25,
    dateMouvement: new Date('2024-11-25'),
    description: 'Achat courses supermarché',
    referenceTransaction: 'ref-004',
  },
  {
    _id: 'tx-005',
    compteId: '123',
    typeMouvement: 'CREDIT',
    montant: 1168.25,
    soldeApresMouvement: 5432.50,
    dateMouvement: new Date('2024-11-26'),
    description: 'Versement intérêts',
    referenceTransaction: 'ref-005',
  },
];

/**
 * Generate PDF Report
 */
function generatePDF(account, transactions, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new pdfkit({ size: 'A4', margin: 50 });
    const outputFile = fs.createWriteStream(outputPath);

    doc.pipe(outputFile);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('SERVICE BANK', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('Relevé de Compte Détaillé', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, {
      align: 'right',
    });
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Account Summary
    doc.fontSize(12).font('Helvetica-Bold').text('INFORMATIONS DU COMPTE', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');

    const summaryData = [
      [`Numéro de Compte:`, account.numeroCompte],
      [`Type de Compte:`, account.typeCompte],
      [`Solde Actuel:`, `${account.solde.toFixed(2)} ${account.devise}`],
      [`Client ID:`, account.clientId],
      [`Date de Création:`, new Date(account.dateCreation).toLocaleDateString('fr-FR')],
      [`Actif:`, account.estActif ? 'Oui' : 'Non'],
    ];

    summaryData.forEach(([label, value]) => {
      doc.text(`${label} ${value}`);
      doc.moveDown(0.2);
    });
    doc.moveDown(0.5);

    // Transactions
    doc.fontSize(12).font('Helvetica-Bold').text('HISTORIQUE DES TRANSACTIONS', { underline: true });
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
      doc.text(header, xPos, currentY, { width: colWidths[i], align: 'left' });
      xPos += colWidths[i];
    });
    currentY += 20;
    doc.moveTo(startX, currentY).lineTo(startX + 495, currentY).stroke();
    currentY += 10;

    // Draw transaction rows
    doc.fontSize(9).font('Helvetica');
    transactions.forEach((tx) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      xPos = startX;
      const rowData = [
        new Date(tx.dateMouvement).toLocaleDateString('fr-FR'),
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

    // Footer
    doc.fontSize(9).text(
      'Service Bank - Tous droits réservés | Relevé généré automatiquement',
      startX,
      doc.page.height - 30,
      { align: 'center' }
    );

    doc.end();

    outputFile.on('finish', () => {
      console.log(`✓ PDF généré: ${outputPath}`);
      resolve();
    });

    outputFile.on('error', (err) => {
      console.error('✗ Erreur lors de la génération du PDF:', err);
      reject(err);
    });
  });
}

// Main
async function main() {
  const outputPath = path.join(__dirname, `releve_${mockAccount.numeroCompte}_${new Date().toISOString().slice(0, 10)}.pdf`);

  console.log('📄 Génération du relevé PDF...');
  console.log(`Compte: ${mockAccount.numeroCompte}`);
  console.log(`Solde: ${mockAccount.solde} EUR`);
  console.log(`Transactions: ${mockTransactions.length}`);

  try {
    await generatePDF(mockAccount, mockTransactions, outputPath);
    console.log(`\n✅ Succès! Le PDF est prêt à ${outputPath}`);
    console.log('\n📋 Utilisation dans l\'API:');
    console.log('GET /api/mouvements/export/pdf/{compteId}');
    console.log('GET /api/mouvements/export/pdf/{compteId}?dateFrom=2024-11-01&dateTo=2024-11-30');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

main();
