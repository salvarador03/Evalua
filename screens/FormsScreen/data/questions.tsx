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
      text: 'En comparación con los/las niños/as de mi edad, mi forma física global o condición física (que significa estar en forma para poder hacer actividad física y/o deporte) es:',
      min: 'Muy mala/\nmalísima',
      max: 'Muy buena/\nbuenísima',
    },
    {
      id: 2,
      text: 'En comparación con los/las niños/as de mi edad, la cantidad de actividad física que realizo semanalmente (por ejemplo: jugar en el patio, hacer deportes, andar o ir en bicicleta, etc.) es:',
      min: 'Nada',
      max: 'Muchísima',
    },
    {
      id: 3,
      text: 'En comparación con los/las niños/as de mi curso, lo que sé sobre la educación física es:',
      min: 'Nada',
      max: 'Muchísimo',
    },
    {
      id: 4,
      text: 'En comparación con los/las niños/as de mi edad, mi interés y ganas para realizar actividad física (por ejemplo: jugar en el patio, hacer deportes, andar o ir en bicicleta, etc.) es:',
      min: 'Ninguno',
      max: 'Muchísimo',
    },
    {
      id: 5,
      text: 'En comparación con los/las niños/as de mi edad, hago nuevos amigos/as y me siento mejor con mis compañeros/as gracias a la actividad física que realizo:',
      min: 'Nada',
      max: 'Muchísimo',
    },
    {
      id: 6,
      text: 'En comparación con los/las niños/as de mi edad, mi seguridad en relación con la actividad física es:',
      min: 'Ninguna',
      max: 'Muchísima',
    },
    {
      id: 7,
      text: 'En comparación con los/las niños/as de mi edad, mi competencia física (que significa hacer bien una actividad física y/o deporte) es:',
      min: 'Muy mala/\nmalísima',
      max: 'Muy buena/\nbuenísima',
    },
    {
      id: 8,
      text: '',
      min: 'Muy mala/\nmalísima',
      max: 'Muy buena/\nbuenísima',
    },
  ],
  "es-PA": [
    {
      id: 1,
      text: 'En comparación con otros niños de mi edad, mi condición física es:',
      min: 'Muy mala/\nmalísima',
      max: 'Muy buena/\nbuenísima',
    },
    {
      id: 2,
      text: 'En comparación con otros niños de mi edad, la cantidad de actividad física que hago cada semana (como jugar, hacer deporte o andar en bicicleta) es:',
      min: 'Muy poca',
      max: 'Muchísima',
    },
    {
      id: 3,
      text: 'En comparación con los/las niños/as de mi curso, lo que sé sobre la educación física es:',
      min: 'Nada',
      max: 'Muchísimo',
    },
    {
      id: 4,
      text: 'En comparación con los/las niños/as de mi edad, mi interés y ganas para realizar actividad física (por ejemplo: jugar en el patio, hacer deportes, andar o ir en bicicleta, etc.) es:',
      min: 'Ninguno',
      max: 'Muchísimo',
    },
    {
      id: 5,
      text: 'En comparación con los/las niños/as de mi edad, hago nuevos amigos/as y me siento mejor con mis compañeros/as gracias a la actividad física que realizo:',
      min: 'Nada',
      max: 'Muchísimo',
    },
    {
      id: 6,
      text: 'En comparación con los/las niños/as de mi edad, mi seguridad en relación con la actividad física es:',
      min: 'Ninguna',
      max: 'Muchísima',
    },
    {
      id: 7,
      text: 'En comparación con los/las niños/as de mi edad, mi competencia física (que significa hacer bien una actividad física y/o deporte) es:',
      min: 'Muy mala/\nmalísima',
      max: 'Muy buena/\nbuenísima',
    },
    {
      id: 8,
      text: '',
      min: 'Muy mala/\nmalísima',
      max: 'Muy buena/\nbuenísima',
    },
  ],
  en: [
    {
      id: 1,
      text: 'Compared to children my age, my overall physical fitness (which means being fit to do physical activity and/or sports) is:',
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
      text: 'Compared to children my age, I make new friends and feel better with my peers thanks to the physical activity I do:',
      min: 'Not at all',
      max: 'Very much',
    },
    {
      id: 6,
      text: 'Compared to children my age, my confidence in relation to physical activity is:',
      min: 'None',
      max: 'Very much',
    },
    {
      id: 7,
      text: 'Compared to children my age, my physical competence (which means doing physical activity and/or sports well) is:',
      min: 'Very poor',
      max: 'Excellent',
    },
    {
      id: 8,
      text: '',
      min: 'Very poor',
      max: 'Excellent',
    },
  ],
  "pt-PT": [
    {
      id: 1,
      text: 'Em comparação com as crianças da minha idade, a minha forma física global (que significa estar em forma para poder fazer atividade física e/ou desporto) é:',
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
      text: 'Em comparação com as crianças da minha idade, o meu interesse e vontade de fazer atividade física é:',
      min: 'Nenhum',
      max: 'Muitíssimo',
    },
    {
      id: 5,
      text: 'Em comparação com as crianças da minha idade, faço novos amigos e sinto-me melhor com os meus colegas graças à atividade física que faço:',
      min: 'Nada',
      max: 'Muitíssimo',
    },
    {
      id: 6,
      text: 'Em comparação com as crianças da minha idade, a minha segurança em relação à atividade física é:',
      min: 'Nenhuma',
      max: 'Muitíssima',
    },
    {
      id: 7,
      text: 'Em comparação com as crianças da minha idade, a minha competência física (que significa fazer bem uma atividade física e/ou desporto) é:',
      min: 'Muito má',
      max: 'Excelente',
    },
    {
      id: 8,
      text: '',
      min: 'Muito má',
      max: 'Excelente',
    },
  ],
  "pt-BR": [
    {
      id: 1,
      text: 'Em comparação com as crianças da minha idade, minha forma física global (que significa estar em forma para poder fazer atividade física e/ou esporte) é:',
      min: 'Muito ruim',
      max: 'Excelente'
    },
    {
      id: 2,
      text: 'Em comparação com as crianças da minha idade, a quantidade de atividade física que faço semanalmente (por exemplo: brincar no pátio, fazer esportes, caminhar ou andar de bicicleta, etc.) é:',
      min: 'Nenhuma',
      max: 'Muitíssima'
    },
    {
      id: 3,
      text: 'Em comparação com as crianças da minha turma, o que sei sobre educação física é:',
      min: 'Nada',
      max: 'Muitíssimo'
    },
    {
      id: 4,
      text: 'Em comparação com as crianças da minha idade, meu interesse e vontade de fazer atividade física é:',
      min: 'Nenhuma',
      max: 'Muitíssima'
    },
    {
      id: 5,
      text: 'Em comparação com as crianças da minha idade, faço novos amigos e me sinto melhor com meus colegas graças à atividade física que realizo:',
      min: 'Nada',
      max: 'Muitíssimo'
    },
    {
      id: 6,
      text: 'Em comparação com as crianças da minha idade, minha segurança em relação à atividade física é:',
      min: 'Nenhuma',
      max: 'Muitíssima'
    },
    {
      id: 7,
      text: 'Em comparação com as crianças da minha idade, minha competência física (que significa fazer bem uma atividade física e/ou esporte) é:',
      min: 'Muito ruim',
      max: 'Excelente'
    },
    {
      id: 8,
      text: '',
      min: 'Muito ruim',
      max: 'Excelente'
    }
  ],
};