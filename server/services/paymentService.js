exports.createReference = (type) => {
  const randomChars = Math.random().toString(32).substr(8);
  let prefix = 'ATC_';
  switch (type) {
    case 'payment':
      prefix += 'PAY';
      break;
    case 'subscription':
      prefix += 'SUB';
      break;
    case 'refund':
      prefix += 'RFD';
    case 'payout':
      prefix += 'PYT';
      break;
    default:
      prefix = 'DEF';
      break;
  }
  return `${prefix}_${randomChars}_${Date.now()}`.toUpperCase();
}
