export const generateProductUrl = (id, name) => {
  const shortName = name.split(' ').slice(0, 3).join(' ');
  const slug = shortName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `/product/${slug}-${id}`;
};

export const parseProductId = (slugStr) => {
  if (!slugStr) return null;
  const parts = slugStr.split('-');
  const idStr = parts[parts.length - 1];
  return Number(idStr);
};

export const formatPhoneUz = (value) => {
  if (!value || !value.startsWith('+998')) {
    return '+998 ';
  }
  
  const prefix = '+998';
  let rest = value.slice(4).replace(/[^\d]/g, '').slice(0, 9);
  
  let formatted = prefix;
  if (rest.length > 0) {
    formatted += ' ' + rest.slice(0, 2);
  } else {
    formatted += ' ';
  }
  if (rest.length > 2) {
    formatted += ' ' + rest.slice(2, 5);
  }
  if (rest.length > 5) {
    formatted += ' ' + rest.slice(5, 7);
  }
  if (rest.length > 7) {
    formatted += ' ' + rest.slice(7, 9);
  }
  
  return formatted;
};
