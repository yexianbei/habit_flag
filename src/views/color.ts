/*
 * @description:
 * @LastEditTime: 2024-11-29 10:12:54
 */
const colorList: Array<{ id: number; color: string; children?: Array<{ id?: number; color: string }> }> = [
  {
    id: 0,
    color: '#F94E34',
    children: [
      { id: 0, color: '#FE492E' },
      { id: 1, color: '#FF6A54' },
      { id: 2, color: '#F59682' },
      { id: 3, color: '#FEBEB2' },
    ],
  },
  {
    id: 1,
    color: '#F85D2F',
    children: [
      { color: '#FF6328' },
      { color: '#F97045' },
      { color: '#FF8F61' },
      { color: '#FCBF89' },
    ],
  },
  {
    id: 2,
    color: '#FEC40B',
    children: [
      { color: '#FFC309' },
      { color: '#FFD140' },
      { color: '#FFE184' },
      { color: '#FCD88C' },
    ],
  },
  {
    id: 3,
    color: '#90B350',
    children: [
      { color: '#93B24B' },
      { color: '#8EAE7D' },
      { color: '#87C268' },
      { color: '#B5CAA1' },
    ],
  },
  {
    id: 4,
    color: '#01A894',
    children: [
      { color: '#03AA90 ' },
      { color: '#21CDB3' },
      { color: '#84DACD' },
      { color: '#9AEEE1' },
    ],
  },
  {
    id: 5,
    color: '#30A7DF',
    children: [
      { color: '#32A6DD ' },
      { color: '#56B2E1' },
      { color: '#79BAE2' },
      { color: '#A5DEE7' },
    ],
  },
  {
    id: 6,
    color: '#976CB3',
    children: [
      { color: '#976CB3' },
      { color: '#8B6BBE' },
      { color: '#9076B3' },
      { color: '#9E90C3' },
    ],
  },
  {
    id: 7,
    color: '#E26C8F',
    children: [
      { color: '#E36B8F' },
      { color: '#E97991' },
      { color: '#F79AAC' },
      { color: '#F2A8B9' },
    ],
  },
]

export default colorList
