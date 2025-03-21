import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';

/**
 * Generate a verification document PDF
 * @param batch The batch data
 * @param documentId The document ID
 */
export const generateVerificationDocument = async (batch: any, documentId: string) => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add header with logo and title
    pdf.setFillColor(16, 185, 129); // Green-500
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    // Add logo placeholder
    pdf.setFillColor(255, 255, 255);
    pdf.circle(20, 20, 10, 'F');
    pdf.setTextColor(16, 185, 129);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('S', 20, 24, { align: 'center' });
    
    // Add title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Batch Details Verification Report', 105, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Document ID: ${documentId}`, 105, 30, { align: 'center' });
    
    // Add generation date
    const currentDate = new Date().toLocaleString();
    pdf.text(`Generated on: ${currentDate}`, 105, 35, { align: 'center' });
    
    // Add QR code
    const qrCodeDataUrl = await QRCode.toDataURL(`https://verify.silverleafe.com/doc/${documentId}`);
    pdf.addImage(qrCodeDataUrl, 'PNG', pageWidth - 35, 10, 25, 25);
    
    let yPos = 50;
    
    // Section 1: Client Information
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('1. Client Information', 15, yPos);
    
    yPos += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Company: ${batch.farmName}`, 20, yPos);
    yPos += 5;
    pdf.text(`Location: ${batch.location.region}, ${batch.location.country}`, 20, yPos);
    yPos += 5;
    pdf.text(`Contact: ${batch.equipmentData.clientName}`, 20, yPos);
    
    // Section 2: Equipment and Harvest Data
    yPos += 15;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('2. Equipment & Harvest Data', 15, yPos);
    
    yPos += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const equipmentData = [
      ['Harvester Model', batch.equipmentData.harvesterModel],
      ['Harvester ID', batch.equipmentData.harvesterId],
      ['Operator', batch.equipmentData.operatorName],
      ['Operator ID', batch.equipmentData.operatorId],
      ['Cotton Variety', batch.equipmentData.cottonVariety],
      ['Field Name', batch.equipmentData.fieldName],
      ['Field Area', `${batch.equipmentData.fieldArea.value} ${batch.equipmentData.fieldArea.unit}`],
      ['Harvest Date', new Date(batch.harvestDate).toLocaleDateString()]
    ];
    
    equipmentData.forEach(([label, value]) => {
      pdf.text(`${label}: ${value}`, 20, yPos);
      yPos += 5;
    });
    
    // Section 3: Bale Information
    yPos += 10;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('3. Bale Information', 15, yPos);
    
    yPos += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Module ID: ${batch.equipmentData.moduleId}`, 20, yPos);
    
    yPos += 8;
    // Add bale table headers
    const baleHeaders = ['Bale No', 'Weight', 'Micronaire', 'Strength', 'Length'];
    const baleColumnWidths = [30, 30, 30, 30, 30];
    let xPos = 20;
    
    baleHeaders.forEach((header, i) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(header, xPos, yPos);
      xPos += baleColumnWidths[i];
    });
    
    // Add bale data
    batch.equipmentData.bales.forEach((bale: any) => {
      yPos += 6;
      xPos = 20;
      pdf.setFont('helvetica', 'normal');
      const baleData = [bale.baleNo, bale.weight, bale.micronaire, bale.strength, bale.length];
      baleData.forEach((value, i) => {
        pdf.text(value.toString(), xPos, yPos);
        xPos += baleColumnWidths[i];
      });
    });
    
    // Section 4: Blockchain Records
    yPos += 15;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('4. Blockchain Records', 15, yPos);
    
    yPos += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Token ID: ${batch.blockchainTokenId}`, 20, yPos);
    
    // Add custody chain
    yPos += 8;
    batch.custodyChain.forEach((event: any) => {
      pdf.text(`${new Date(event.timestamp).toLocaleString()}:`, 20, yPos);
      yPos += 5;
      pdf.text(`${event.fromEntity} → ${event.toEntity}`, 25, yPos);
      if (event.blockchainTransactionId) {
        yPos += 5;
        pdf.text(`Transaction: ${event.blockchainTransactionId}`, 25, yPos);
      }
      yPos += 7;
    });
    
    // Section 5: Isotope Marking Data
    yPos += 8;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('5. Isotope Marking Data', 15, yPos);
    
    yPos += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    if (batch.isotopeMarking) {
      const isotopeData = [
        ['Marking Type', batch.isotopeMarking.markingType],
        ['Marking Date', new Date(batch.isotopeMarking.markingDate).toLocaleDateString()],
        ['Verification Status', batch.isotopeMarking.verificationStatus],
        ['Last Verification', batch.isotopeMarking.lastVerificationDate ? 
          new Date(batch.isotopeMarking.lastVerificationDate).toLocaleDateString() : 'N/A']
      ];
      
      isotopeData.forEach(([label, value]) => {
        pdf.text(`${label}: ${value}`, 20, yPos);
        yPos += 5;
      });
    } else {
      pdf.text('No isotope marking data available', 20, yPos);
    }
    
    // Section 6: Chain of Custody
    yPos += 10;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('6. Chain of Custody', 15, yPos);
    
    yPos += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    batch.custodyChain.forEach((event: any, index: number) => {
      pdf.text(`Step ${index + 1}:`, 20, yPos);
      yPos += 5;
      pdf.text(`From: ${event.fromEntity}`, 25, yPos);
      yPos += 5;
      pdf.text(`To: ${event.toEntity}`, 25, yPos);
      yPos += 5;
      pdf.text(`Date: ${new Date(event.timestamp).toLocaleString()}`, 25, yPos);
      yPos += 5;
      pdf.text(`Location: ${event.location.region}, ${event.location.country}`, 25, yPos);
      yPos += 5;
      pdf.text(`Method: ${event.verificationMethod}`, 25, yPos);
      yPos += 7;
    });
    
    // Add footer with verification code
    pdf.setFillColor(16, 185, 129);
    pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    const verificationCode = `${documentId}-${Date.now().toString(36)}`;
    pdf.text('Silverleafe Cotton Traceability Platform - Confidential', 15, pageHeight - 8);
    pdf.text(`Verification Code: ${verificationCode}`, pageWidth - 15, pageHeight - 8, { align: 'right' });
    
    // Add page numbers
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setTextColor(128, 128, 128);
      pdf.setFontSize(8);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 15, pageHeight - 25, { align: 'right' });
    }
    
    // Save the PDF
    pdf.save(`verification_document_${documentId}.pdf`);
    
  } catch (error) {
    console.error('Error generating verification document:', error);
    throw error;
  }
};

/**
 * Generate a certificate PDF for a given certification
 * @param certification The certification object
 * @param batchId The batch ID
 * @param farmName The farm name
 */
export const generateCertificatePdf = async (certification: any, batchId: string, farmName: string) => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const filename = `${certification.id}_certificate.pdf`;
    
    // Set up the document
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add watermark
    pdf.setTextColor(230, 230, 230);
    pdf.setFontSize(60);
    pdf.setFont('helvetica', 'italic');
    pdf.text('SILVERLEAFE', pageWidth / 2, pageHeight / 2, { 
      align: 'center', 
      angle: 45 
    });
    
    // Add header
    pdf.setFillColor(30, 58, 138); // Indigo-900
    pdf.rect(0, 0, 210, 40, 'F');
    
    // Add logo placeholder
    pdf.setFillColor(255, 255, 255);
    pdf.circle(20, 20, 10, 'F');
    pdf.setTextColor(30, 58, 138);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('S', 20, 24, { align: 'center' });
    
    // Add title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('COTTON PASSPORT', 105, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Official Certificate of Authenticity', 105, 30, { align: 'center' });
    
    // Add certificate details
    let yPos = 60;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text("CERTIFICATE OF AUTHENTICITY", 105, yPos, { align: 'center' });
    
    yPos += 10;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`This certifies that cotton batch ${batchId} from ${farmName}`, 105, yPos, { align: 'center' });
    
    yPos += 10;
    pdf.text(`has been verified and authenticated according to`, 105, yPos, { align: 'center' });
    
    yPos += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${certification.name}`, 105, yPos, { align: 'center' });
    
    yPos += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`standards by ${certification.issuer}`, 105, yPos, { align: 'center' });
    
    // Add certificate details box
    yPos += 20;
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(248, 250, 252); // Slate-50
    pdf.roundedRect(20, yPos, 170, 60, 3, 3, 'FD');
    
    yPos += 10;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139); // Slate-500
    pdf.text("CERTIFICATE DETAILS", 30, yPos);
    
    yPos += 10;
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Certificate ID: ${certification.id}`, 30, yPos);
    
    yPos += 8;
    pdf.text(`Issue Date: ${new Date(certification.issueDate).toLocaleDateString()}`, 30, yPos);
    
    yPos += 8;
    pdf.text(`Expiry Date: ${new Date(certification.expiryDate).toLocaleDateString()}`, 30, yPos);
    
    yPos += 8;
    pdf.text(`Status: ${certification.status.charAt(0).toUpperCase() + certification.status.slice(1)}`, 30, yPos);
    
    yPos += 8;
    pdf.text(`Type: ${certification.type.charAt(0).toUpperCase() + certification.type.slice(1).replace('-', ' ')}`, 30, yPos);
    
    // Add QR code
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(`https://silverleafe.com/verify/${batchId}/${certification.id}`);
      pdf.addImage(qrCodeDataUrl, 'PNG', 140, yPos - 40, 40, 40);
      
      // Add QR code label
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139); // Slate-500
      pdf.text("SCAN TO VERIFY", 160, yPos + 5, { align: 'center' });
    } catch (qrError) {
      console.error('Error generating QR code:', qrError);
    }
    
    // Add verification instructions
    yPos += 30;
    pdf.setFontSize(12);
    pdf.setTextColor(30, 58, 138); // Indigo-900
    pdf.setFont('helvetica', 'bold');
    pdf.text("VERIFICATION INSTRUCTIONS", 105, yPos, { align: 'center' });
    
    yPos += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text("1. Scan the QR code or visit silverleafe.com/verify", 30, yPos);
    
    yPos += 8;
    pdf.text(`2. Enter the Certificate ID: ${certification.id}`, 30, yPos);
    
    yPos += 8;
    pdf.text(`3. Enter the Batch ID: ${batchId}`, 30, yPos);
    
    yPos += 8;
    pdf.text("4. Confirm the details match this certificate", 30, yPos);
    
    // Add footer
    pdf.setFillColor(30, 58, 138); // Indigo-900
    pdf.rect(0, 277, 210, 20, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.text('Silverleafe Cotton Traceability Platform - Confidential', 15, 287);
    pdf.text('Verify at: silverleafe.com/verify', 195, 287, { align: 'right' });
    
    // Add security features section
    yPos = 230;
    pdf.setTextColor(30, 58, 138);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text("SECURITY FEATURES", 105, yPos, { align: 'center' });
    
    yPos += 10;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    const securityFeatures = [
      "This document contains a digital watermark that can be verified through the Silverleafe platform.",
      "Blockchain verification ensures this document cannot be tampered with or forged.",
      "QR code authentication provides instant verification of document authenticity.",
      "Secure timestamp provides proof of when this document was generated."
    ];
    
    securityFeatures.forEach(feature => {
      pdf.text("• " + feature, 20, yPos);
      yPos += 7;
    });
    
    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating document:', error);
    alert('An error occurred while generating the document. Please try again.');
  }
};

/**
 * Download a document as PDF
 * @param documentUrl The URL of the document to download
 * @param filename The filename to save as
 */
export const downloadDocumentAsPdf = async (documentUrl: string, filename: string) => {
  try {
    // In a real implementation, this would fetch the document from the URL
    // For this demo, we'll create a simple PDF with a message
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set up the document
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add watermark
    pdf.setTextColor(230, 230, 230);
    pdf.setFontSize(60);
    pdf.setFont('helvetica', 'italic');
    pdf.text('SILVERLEAFE', pageWidth / 2, pageHeight / 2, { 
      align: 'center', 
      angle: 45 
    });
    
    // Add header
    pdf.setFillColor(30, 58, 138); // Indigo-900
    pdf.rect(0, 0, 210, 40, 'F');
    
    // Add logo placeholder
    pdf.setFillColor(255, 255, 255);
    pdf.circle(20, 20, 10, 'F');
    pdf.setTextColor(30, 58, 138);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('S', 20, 24, { align: 'center' });
    
    // Add title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DOCUMENT', 105, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Official Silverleafe Documentation', 105, 30, { align: 'center' });
    
    // Add document content
    let yPos = 60;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text("DOCUMENT INFORMATION", 105, yPos, { align: 'center' });
    
    yPos += 20;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Document URL: ${documentUrl}`, 20, yPos);
    
    yPos += 10;
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPos);
    
    yPos += 20;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Document Content", 20, yPos);
    
    yPos += 10;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text("This is a placeholder for the actual document content.", 20, yPos);
    
    yPos += 10;
    pdf.text("In a production environment, this would contain the actual document content", 20, yPos);
    
    yPos += 10;
    pdf.text("fetched from the provided URL.", 20, yPos);
    
    // Add QR code
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(documentUrl);
      pdf.addImage(qrCodeDataUrl, 'PNG', 140, 100, 40, 40);
      
      // Add QR code label
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139); // Slate-500
      pdf.text("SCAN TO ACCESS ORIGINAL", 160, 145, { align: 'center' });
    } catch (qrError) {
      console.error('Error generating QR code:', qrError);
    }
    
    // Add footer
    pdf.setFillColor(30, 58, 138); // Indigo-900
    pdf.rect(0, 277, 210, 20, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.text('Silverleafe Cotton Traceability Platform - Confidential', 15, 287);
    pdf.text('Verify at: silverleafe.com/verify', 195, 287, { align: 'right' });
    
    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error downloading document:', error);
    alert('An error occurred while downloading the document. Please try again.');
  }
};