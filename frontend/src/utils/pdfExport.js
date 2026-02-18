import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportAmortizationScheduleToPDF = (loan, scheduleArray, currencySymbol = 'Rs.') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Loan Amortization Schedule', 14, 20);
  
  // Add loan details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Loan: ${loan.loanName}`, 14, 30);
  doc.text(`Loan Type: ${loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1)}`, 14, 36);
  doc.text(`Principal Amount: ${currencySymbol}${loan.principalAmount.toLocaleString()}`, 14, 42);
  doc.text(`Interest Rate: ${loan.interestRate}% p.a.`, 14, 48);
  doc.text(`Tenure: ${loan.tenure} months`, 14, 54);
  doc.text(`Monthly EMI: ${currencySymbol}${loan.emiAmount.toLocaleString()}`, 14, 60);
  doc.text(`Start Date: ${new Date(loan.startDate).toLocaleDateString()}`, 120, 30);
  doc.text(`End Date: ${new Date(loan.endDate).toLocaleDateString()}`, 120, 36);
  doc.text(`Total Interest: ${currencySymbol}${(loan.totalAmount - loan.principalAmount).toLocaleString()}`, 120, 42);
  doc.text(`Total Amount: ${currencySymbol}${loan.totalAmount.toLocaleString()}`, 120, 48);
  doc.text(`Status: ${loan.status.toUpperCase()}`, 120, 54);
  
  // Add a line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 65, 196, 65);
  
  // Prepare table data
  const tableData = scheduleArray.map((item) => [
    item.paymentNumber,
    new Date(item.paymentDate).toLocaleDateString(),
    `${currencySymbol}${item.emiAmount.toLocaleString()}`,
    `${currencySymbol}${item.principalAmount.toLocaleString()}`,
    `${currencySymbol}${item.interestAmount.toLocaleString()}`,
    `${currencySymbol}${item.remainingBalance.toLocaleString()}`,
    item.isPaid ? 'Paid' : 'Pending'
  ]);
  
  // Add table
  doc.autoTable({
    startY: 70,
    head: [['#', 'Payment Date', 'EMI', 'Principal', 'Interest', 'Balance', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      halign: 'right',
      fontSize: 8
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 28 },
      6: { halign: 'center', cellWidth: 22 }
    },
    margin: { top: 70 },
    didDrawPage: (data) => {
      // Add footer with page number
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Page ${doc.internal.getNumberOfPages()}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      
      // Add generation date
      doc.text(
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }
  });
  
  // Add summary on last page
  const finalY = doc.lastAutoTable.finalY || 70;
  
  if (finalY + 40 > doc.internal.pageSize.height - 20) {
    doc.addPage();
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Loan Summary', 14, 20);
  } else {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Loan Summary', 14, finalY + 10);
  }
  
  const summaryY = finalY + 40 > doc.internal.pageSize.height - 20 ? 30 : finalY + 20;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Payments: ${scheduleArray.length}`, 14, summaryY);
  doc.text(`Payments Made: ${scheduleArray.filter(s => s.isPaid).length}`, 14, summaryY + 6);
  doc.text(`Remaining Payments: ${scheduleArray.filter(s => !s.isPaid).length}`, 14, summaryY + 12);
  
  const totalPrincipalPaid = scheduleArray
    .filter(s => s.isPaid)
    .reduce((sum, s) => sum + s.principalAmount, 0);
  const totalInterestPaid = scheduleArray
    .filter(s => s.isPaid)
    .reduce((sum, s) => sum + s.interestAmount, 0);
  
  doc.text(`Total Principal Paid: ${currencySymbol}${totalPrincipalPaid.toLocaleString()}`, 120, summaryY);
  doc.text(`Total Interest Paid: ${currencySymbol}${totalInterestPaid.toLocaleString()}`, 120, summaryY + 6);
  doc.text(`Remaining Balance: ${currencySymbol}${loan.remainingBalance.toLocaleString()}`, 120, summaryY + 12);
  
  // Save the PDF
  const fileName = `${loan.loanName.replace(/\s+/g, '_')}_Amortization_Schedule_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const exportLoanSummaryToPDF = (loan, scheduleArray, payments, currencySymbol = 'Rs.') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Loan Summary Report', 14, 20);
  
  // Loan Details Section
  doc.setFontSize(12);
  doc.text('Loan Details', 14, 35);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const details = [
    ['Loan Name', loan.loanName],
    ['Loan Type', loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1)],
    ['Lender', loan.lender || 'N/A'],
    ['Account Number', loan.accountNumber || 'N/A'],
    ['Principal Amount', `${currencySymbol}${loan.principalAmount.toLocaleString()}`],
    ['Interest Rate', `${loan.interestRate}% p.a.`],
    ['Tenure', `${loan.tenure} months`],
    ['Monthly EMI', `${currencySymbol}${loan.emiAmount.toLocaleString()}`],
    ['Start Date', new Date(loan.startDate).toLocaleDateString()],
    ['End Date', new Date(loan.endDate).toLocaleDateString()],
    ['Status', loan.status.toUpperCase()]
  ];
  
  doc.autoTable({
    startY: 40,
    body: details,
    theme: 'plain',
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 80 }
    }
  });
  
  // Progress Section
  const progressY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Repayment Progress', 14, progressY);
  
  const paidAmount = loan.principalAmount - loan.remainingBalance;
  const completionPercentage = ((paidAmount / loan.principalAmount) * 100).toFixed(2);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Amount Paid: ${currencySymbol}${paidAmount.toLocaleString()}`, 14, progressY + 8);
  doc.text(`Remaining Balance: ${currencySymbol}${loan.remainingBalance.toLocaleString()}`, 14, progressY + 14);
  doc.text(`Completion: ${completionPercentage}%`, 14, progressY + 20);
  
  // Payment History
  if (payments && payments.length > 0) {
    doc.addPage();
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment History', 14, 20);
    
    const paymentData = payments.map(p => [
      new Date(p.paymentDate).toLocaleDateString(),
      `${currencySymbol}${p.paymentAmount.toLocaleString()}`,
      `${currencySymbol}${p.principalPaid.toLocaleString()}`,
      `${currencySymbol}${p.interestPaid.toLocaleString()}`,
      `${currencySymbol}${p.remainingBalance.toLocaleString()}`
    ]);
    
    doc.autoTable({
      startY: 25,
      head: [['Date', 'Amount', 'Principal', 'Interest', 'Balance']],
      body: paymentData,
      theme: 'striped',
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255
      }
    });
  }
  
  // Save
  const fileName = `${loan.loanName.replace(/\s+/g, '_')}_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
