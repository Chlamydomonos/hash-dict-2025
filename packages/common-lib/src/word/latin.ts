export const parseLatin = (word: string) =>
    word.replaceAll('ə', 'q').replaceAll('ɔ', 'w').replaceAll('ʃ', 'j').replaceAll('ɪ', 'i').replaceAll('ø', 'y');
export const toLatin = (word: string) =>
    word.replaceAll('q', 'ə').replaceAll('w', 'ɔ').replaceAll('j', 'ʃ').replaceAll('i', 'ɪ').replaceAll('y', 'ø');
