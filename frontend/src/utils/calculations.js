import writtenNumber from 'written-number';

writtenNumber.defaults.lang = 'fr';

export const calculateTotals = (categories = []) => {
  const ht = categories.reduce((accCat, cat) => {
    const articles = cat.articles || [];
    const catTotal = articles.reduce((accArt, art) => {
      const montant = parseFloat(art.montantHT) || 0;
      return accArt + montant;
    }, 0);
    return accCat + catTotal;
  }, 0);

  const total = ht;
  
  const montantEnLettres = total > 0 
    ? writtenNumber(Math.floor(total)) + ' francs CFA' 
    : '';

  return {
    ht,
    total,
    montantEnLettres
  };
};
