// src/screens/Forms/data/questions.ts
import { Language } from '../../../types/language';
export interface Question {
    id: number;
    text: string;
    min: string;
    max: string;
  }
  
  type Questions = Record<Language, Question[]>;
  
  export const questions: Questions = {
    es: [
      {
        id: 1,
        text: 'En comparación con los/las niños/as de mi edad mi forma física global o condición física es:',
        min: 'Muy mala/\nmalísima',
        max: 'Muy buena/\nbuenísima',
      },
      {
        id: 2,
        text: 'En comparación con los/las niños/as de mi edad la cantidad de actividad física que realizo semanalmente (por ejemplo: jugar en el patio, hacer deportes, andar o ir en bicicleta, etc.) es:',
        min: 'Nada/\nNinguna',
        max: 'Muchísima',
      },
      {
        id: 3,
        text: 'En comparación con los/las niños/as de mi curso lo que sé sobre la educación física es:',
        min: 'Nada',
        max: 'Muchísimo',
      },
      {
        id: 4,
        text: 'En comparación con los/las niños/as de mi edad mi interés y ganas para realizar actividad física (por ejemplo: jugar en el patio, hacer deportes, andar o ir en bicicleta, etc.) es:',
        min: 'Ninguna',
        max: 'Muchísima',
      },
      {
        id: 5,
        text: 'En comparación con los/las niños/as de mi edad hago nuevos amigos/as y me siento mejor con mis compañeros/as gracias a la actividad física que realizo (por ejemplo: jugar en el patio, hacer deportes, andar o ir en bicicleta, etc.):',
        min: 'Nada',
        max: 'Muchísimo',
      },
      {
        id: 6,
        text: 'Sabiendo que la alfabetización física es la suma de las preguntas anteriores: 1) forma física global/condición física; 2) cantidad de actividad física realizada semanalmente; 3) lo que sabes sobre educación física; 4) motivación para realizar actividad física, incluyendo hacer nuevos amigos y sentirte mejor con tus compañeros/as gracias a la actividad física. En comparación con los/las niños/as de mi edad mi alfabetización física es:',
        min: 'Muy mala/\nPésima',
        max: 'Muy buena/\nExcelente',
      },
    ],
    en: [
      {
        id: 1,
        text: 'Compared to children my age, my overall physical fitness is:',
        min: 'Very poor',
        max: 'Excellent',
      },
      {
        id: 2,
        text: 'Compared to children my age, the amount of physical activity I do weekly (e.g., playing in the yard, doing sports, walking or cycling, etc.) is:',
        min: 'None',
        max: 'Very much',
      },
      {
        id: 3,
        text: 'Compared to children in my class, what I know about physical education is:',
        min: 'Nothing',
        max: 'Very much',
      },
      {
        id: 4,
        text: 'Compared to children my age, my interest and desire to do physical activity (e.g., playing in the yard, doing sports, walking or cycling, etc.) is:',
        min: 'None',
        max: 'Very much',
      },
      {
        id: 5,
        text: 'Compared to children my age, I make new friends and feel better with my peers thanks to the physical activity I do (e.g., playing in the yard, doing sports, walking or cycling, etc.):',
        min: 'Not at all',
        max: 'Very much',
      },
      {
        id: 6,
        text: 'Knowing that physical literacy is the sum of the previous questions: 1) overall physical fitness; 2) amount of weekly physical activity; 3) what you know about physical education; 4) motivation to do physical activity, including making new friends and feeling better with your peers thanks to physical activity. Compared to children my age, my physical literacy is:',
        min: 'Very poor',
        max: 'Excellent',
      },
    ],
    "pt-PT": [
      {
        id: 1,
        text: 'Em comparação com as crianças da minha idade, a minha forma física global é:',
        min: 'Muito má',
        max: 'Excelente',
      },
      {
        id: 2,
        text: 'Em comparação com as crianças da minha idade, a quantidade de atividade física que faço semanalmente (por exemplo: brincar no pátio, fazer desporto, caminhar ou andar de bicicleta, etc.) é:',
        min: 'Nenhuma',
        max: 'Muitíssima',
      },
      {
        id: 3,
        text: 'Em comparação com as crianças da minha turma, o que sei sobre educação física é:',
        min: 'Nada',
        max: 'Muitíssimo',
      },
      {
        id: 4,
        text: 'Em comparação com as crianças da minha idade, o meu interesse e vontade de fazer atividade física (por exemplo: brincar no pátio, fazer desporto, caminhar ou andar de bicicleta, etc.) é:',
        min: 'Nenhum',
        max: 'Muitíssimo',
      },
      {
        id: 5,
        text: 'Em comparação com as crianças da minha idade, faço novos amigos e sinto-me melhor com os meus colegas graças à atividade física que faço (por exemplo: brincar no pátio, fazer desporto, caminhar ou andar de bicicleta, etc.):',
        min: 'Nada',
        max: 'Muitíssimo',
      },
      {
        id: 6,
        text: 'Sabendo que a literacia física é a soma das questões anteriores: 1) forma física global; 2) quantidade de atividade física semanal; 3) o que sabe sobre educação física; 4) motivação para fazer atividade física, incluindo fazer novos amigos e sentir-se melhor com os colegas graças à atividade física. Em comparação com as crianças da minha idade, a minha literacia física é:',
        min: 'Muito má',
        max: 'Excelente',
      },
    ],
    "pt-BR": [
      {
        id: 1,
        text: 'Em comparação com as crianças da minha idade, minha forma física global é:',
        min: 'Muito ruim',
        max: 'Excelente',
      },
      {
        id: 2,
        text: 'Em comparação com as crianças da minha idade, a quantidade de atividade física que faço semanalmente (por exemplo: brincar no pátio, fazer esportes, caminhar ou andar de bicicleta, etc.) é:',
        min: 'Nenhuma',
        max: 'Muitíssima',
      },
      {
        id: 3,
        text: 'Em comparação com as crianças da minha turma, o que sei sobre educação física é:',
        min: 'Nada',
        max: 'Muitíssimo',
      },
      {
        id: 4,
        text: 'Em comparação com as crianças da minha idade, meu interesse e vontade de fazer atividade física (por exemplo: brincar no pátio, fazer esportes, caminhar ou andar de bicicleta, etc.) é:',
        min: 'Nenhum',
        max: 'Muitíssimo',
      },
      {
        id: 5,
        text: 'Em comparação com as crianças da minha idade, faço novos amigos e me sinto melhor com meus colegas graças à atividade física que faço (por exemplo: brincar no pátio, fazer esportes, caminhar ou andar de bicicleta, etc.):',
        min: 'Nada',
        max: 'Muitíssimo',
      },
      {
        id: 6,
        text: 'Sabendo que o letramento físico é a soma das questões anteriores: 1) forma física global; 2) quantidade de atividade física semanal; 3) o que sabe sobre educação física; 4) motivação para fazer atividade física, incluindo fazer novos amigos e sentir-se melhor com os colegas graças à atividade física. Em comparação com as crianças da minha idade, meu letramento físico é:',
        min: 'Muito ruim',
        max: 'Excelente',
      },
    ],
  };