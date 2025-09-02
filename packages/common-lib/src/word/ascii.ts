export const parseAscii = (word: string) => word.replaceAll('ee', 'q').replaceAll('oo', 'w').replaceAll('sh', 'j');

export const toAscii = (word: string) => word.replaceAll('q', 'ee').replaceAll('w', 'oo').replaceAll('j', 'sh');
