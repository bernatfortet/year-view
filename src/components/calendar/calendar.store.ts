import { atom } from 'nanostores'

export const $activeMonth = atom<number>(0)
export const $year = atom<number>(new Date().getFullYear())

