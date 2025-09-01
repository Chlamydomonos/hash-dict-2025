export const parseLatin = (word: string) =>
    word.replace(/ə/g, 'q').replace(/ɔ/g, 'w').replace(/ʃ/g, 'j').replace(/ɪ/g, 'i').replace(/ø/g, 'y');
export const toLatin = (word: string) =>
    word.replace(/q/g, 'ə').replace(/w/g, 'ɔ').replace(/j/g, 'ʃ').replace(/i/g, 'ɪ').replace(/y/g, 'ø');
