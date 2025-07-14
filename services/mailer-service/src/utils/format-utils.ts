/**
 * Utilitaires de formatage pour les templates d'email
 */

/**
 * Formate une date pour l'affichage
 * @param dateStr Chaîne de date ou objet Date
 * @returns Date formatée selon la locale française
 */
export function formatDate(dateStr: string | Date): string {
  if (!dateStr) return '';
  
  const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
  
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Formate un montant pour l'affichage
 * @param amount Montant à formater
 * @returns Montant formaté avec devise
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

/**
 * Tronque un texte s'il est trop long
 * @param text Texte à tronquer
 * @param maxLength Longueur maximale
 * @returns Texte tronqué
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Convertit une chaîne de caractères en première lettre majuscule
 * @param str Chaîne à formater
 * @returns Chaîne formatée
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
