export const parseAscii = (word: string) => word.replace(/ee/g, 'q').replace(/oo/g, 'w').replace(/sh/g, 'j');

export const toAscii = (word: string) => word.replace(/q/g, 'ee').replace(/w/g, 'oo').replace(/j/g, 'sh');
