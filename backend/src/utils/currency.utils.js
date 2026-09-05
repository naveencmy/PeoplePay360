
function formatCurrency(amount, symbol = '₹') {
  if (amount === null || amount === undefined || isNaN(amount)) return `${symbol}0.00`;

  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}


function roundToPaysa(amount) {
  return Math.round(amount * 100) / 100;
}


function roundToRupee(amount) {
  return Math.round(amount);
}


function annualToMonthly(annual) {
  return roundToPaysa(annual / 12);
}

function monthlyToAnnual(monthly) {
  return roundToPaysa(monthly * 12);
}


function amountInWords(amount) {
  if (amount === 0) return 'Zero';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
    'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertHundreds(n) {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertHundreds(n % 100) : '');
  }

  const num = Math.floor(Math.abs(amount));
  if (num === 0) return 'Zero';

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = num % 1000;

  let result = '';
  if (crore) result += convertHundreds(crore) + ' Crore ';
  if (lakh) result += convertHundreds(lakh) + ' Lakh ';
  if (thousand) result += convertHundreds(thousand) + ' Thousand ';
  if (hundred) result += convertHundreds(hundred);

  return (amount < 0 ? 'Minus ' : '') + result.trim() + ' Rupees Only';
}

module.exports = {
  formatCurrency,
  roundToPaysa,
  roundToRupee,
  annualToMonthly,
  monthlyToAnnual,
  amountInWords,
};
