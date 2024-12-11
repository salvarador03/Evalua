import { Language } from '../../../types/language';

export interface Question {
    id: number;
    text: string;
    min: string;
    max: string;
    range: number[];
}

type Questions = Record<Language, Question[]>;

export const teenQuestions: Questions = {
    "pt-PT": [
        {
            id: 1,
            text: 'Em comparação com os/as adolescentes da minha idade, a minha aptidão física ou condição física é:',
            min: 'MUITO MÁ/PÉSSIMA',
            max: 'MUITO BOA/EXCELENTE',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 2,
            text: 'Em comparação com os/as adolescentes da minha idade, a quantidade de atividade física que pratico semanalmente (por exemplo, praticar desporto, caminhar ou andar de bicicleta, etc.) é:',
            min: 'NADA/NENHUMA',
            max: 'MUITÍSSIMA',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 3,
            text: 'Em comparação com os/as adolescentes da minha turma, o meu conhecimento sobre os conteúdos da educação física é:',
            min: 'NENHUM',
            max: 'MUITO BOM/EXCELENTE',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 4,
            text: 'Em comparação com os/as adolescentes da minha idade, a minha motivação para praticar atividade física é:',
            min: 'NENHUMA',
            max: 'MUITÍSSIMA',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 5,
            text: 'Em comparação com os/as adolescentes da minha idade, faço novos/as amigos/as e sinto-me melhor com os/as meus/minhas colegas graças à atividade física que realizo:',
            min: 'NENHUM/NADA',
            max: 'MUITÍSSIMOS(AS)/MUITÍSSIMO',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 6,
            text: 'Em comparação com os/as adolescentes da minha idade, a minha sensação de segurança em relação à atividade física é:',
            min: 'NENHUMA',
            max: 'MUITÍSSIMA',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 7,
            text: 'Em comparação com os/as adolescentes da minha idade, a minha competência física é:',
            min: 'MUITO MÁ/PÉSSIMA',
            max: 'MUITO BOA/EXCELENTE',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 8,
            text: 'As pessoas que têm uma boa literacia física têm uma série de características:\n\nA) Têm uma boa condição física em comparação com as pessoas da sua idade.\nB) Têm mais conhecimentos sobre os conteúdos de Educação Física.\nC) Estão mais motivadas para a realização de atividade física.\nD) São capazes de socializar (fazer amigos/as e melhorar as suas relações) graças à atividade física.\nE) São mais seguras ao realizar atividade física.\nF) São mais habilidosas e competentes na realização de atividade física.\n\nEstas pessoas, após avaliarem as diferentes opções para realizar atividade física, escolhem participar frequentemente nelas ao longo da vida.\n\nTendo em conta as características de uma pessoa com uma boa literacia física, em comparação com os/as adolescentes da minha idade, a minha literacia física é:',
            min: 'MUITO MÁ/PÉSSIMA',
            max: 'MUITO BOA/EXCELENTE',
            range: Array.from({length: 11}, (_, i) => i)
        }
    ],
    "pt-BR": [
        {
            id: 1,
            text: 'Em comparação com os/as adolescentes da minha idade, minha aptidão física ou condição física é:',
            min: 'MUITO RUIM/PÉSSIMA',
            max: 'MUITO BOA/EXCELENTE',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 2,
            text: 'Em comparação com os/as adolescentes da minha idade, a quantidade de atividade física que pratico semanalmente (por exemplo, praticar esporte, caminhar ou andar de bicicleta, etc.) é:',
            min: 'NADA/NENHUMA',
            max: 'MUITÍSSIMA',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 3,
            text: 'Em comparação com os/as adolescentes da minha turma, meu conhecimento sobre os conteúdos da educação física é:',
            min: 'NENHUM',
            max: 'MUITO BOM/EXCELENTE',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 4,
            text: 'Em comparação com os/as adolescentes da minha idade, minha motivação para praticar atividade física é:',
            min: 'NENHUMA',
            max: 'MUITÍSSIMA',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 5,
            text: 'Em comparação com os/as adolescentes da minha idade, faço novos/as amigos/as e me sinto melhor com meus/minhas colegas graças à atividade física que realizo:',
            min: 'NENHUM/NADA',
            max: 'MUITÍSSIMOS(AS)/MUITÍSSIMO',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 6,
            text: 'Em comparação com os/as adolescentes da minha idade, minha sensação de segurança em relação à atividade física é:',
            min: 'NENHUMA',
            max: 'MUITÍSSIMA',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 7,
            text: 'Em comparação com os/as adolescentes da minha idade, minha competência física é:',
            min: 'MUITO RUIM/PÉSSIMA',
            max: 'MUITO BOA/EXCELENTE',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 8,
            text: 'As pessoas que têm um bom letramento físico têm uma série de características:\n\nA) Têm uma boa condição física em comparação com as pessoas da sua idade.\nB) Têm mais conhecimentos sobre os conteúdos de Educação Física.\nC) Estão mais motivadas para a realização de atividade física.\nD) São capazes de socializar (fazer amigos/as e melhorar suas relações) graças à atividade física.\nE) São mais seguras ao realizar atividade física.\nF) São mais habilidosas e competentes na realização de atividade física.\n\nEstas pessoas, após avaliarem as diferentes opções para realizar atividade física, escolhem participar frequentemente nelas ao longo da vida.\n\nTendo em conta as características de uma pessoa com um bom letramento físico, em comparação com os/as adolescentes da minha idade, meu letramento físico é:',
            min: 'MUITO RUIM/PÉSSIMA',
            max: 'MUITO BOA/EXCELENTE',
            range: Array.from({length: 11}, (_, i) => i)
        }
    ],
    es: [
        {
            id: 1,
            text: 'En comparación con los/las adolescentes de mi edad, mi forma física global o condición física es:',
            min: 'MUY MALA/PÉSIMA',
            max: 'MUY BUENA/EXCELENTE',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 2,
            text: 'En comparación con los/las adolescentes de mi edad, la cantidad de actividad física que realizo semanalmente (por ejemplo: practicar deportes, caminar o ir en bicicleta, etc.) es:',
            min: 'NADA/NINGUNA',
            max: 'MUCHÍSIMA',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 3,
            text: 'En comparación con los/las adolescentes de mi curso, mi conocimiento sobre los contenidos de educación física es:',
            min: 'NINGUNO',
            max: 'MUY BUENO/EXCELENTE',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 4,
            text: 'En comparación con los/las adolescentes de mi edad, mi motivación para realizar actividad física es:',
            min: 'NINGUNA',
            max: 'MUCHÍSIMA',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 5,
            text: 'En comparación con los/las adolescentes de mi edad, hago nuevos amigos/as y me siento mejor con mis compañeros/as gracias a la actividad física que realizo:',
            min: 'NINGUNO/NADA',
            max: 'MUCHÍSIMOS(AS)/MUCHÍSIMO',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 6,
            text: 'En comparación con los/las adolescentes de mi edad, mi sensación de seguridad en relación con la actividad física es:',
            min: 'NINGUNA',
            max: 'MUCHÍSIMA',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 7,
            text: 'En comparación con los/las adolescentes de mi edad, mi competencia física es:',
            min: 'MUY MALA/PÉSIMA',
            max: 'MUY BUENA/EXCELENTE',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 8,
            text: 'Las personas que tienen una buena alfabetización física tienen una serie de características:\n\nA) Tienen una buena condición física en comparación con las personas de su edad.\nB) Tienen más conocimientos sobre los contenidos de Educación Física.\nC) Están más motivadas para la realización de actividad física.\nD) Son capaces de socializar (hacer amigos/as y mejorar sus relaciones) gracias a la actividad física.\nE) Son más seguras a la hora de realizar actividad física.\nF) Son más habilidosas y competentes realizando actividad física.\n\nEstas personas, tras valorar las diferentes opciones para realizar actividad física, eligen participar con frecuencia en ellas durante toda la vida.\n\nTeniendo en cuenta las características de una persona con una buena alfabetización física, en comparación con los/las adolescentes de mi edad, mi alfabetización física es:',
            min: 'MUY MALA/PÉSIMA',
            max: 'MUY BUENA/EXCELENTE',
            range: Array.from({length: 11}, (_, i) => i)
        }
    ],
    en: [
        {
            id: 1,
            text: 'Compared to teenagers my age, my overall physical fitness is:',
            min: 'VERY POOR',
            max: 'EXCELLENT',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 2,
            text: 'Compared to teenagers my age, the amount of physical activity I do weekly (e.g., playing sports, walking or cycling, etc.) is:',
            min: 'NONE',
            max: 'VERY MUCH',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 3,
            text: 'Compared to teenagers in my class, my knowledge about physical education content is:',
            min: 'NONE',
            max: 'EXCELLENT',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 4,
            text: 'Compared to teenagers my age, my motivation to do physical activity is:',
            min: 'NONE',
            max: 'VERY MUCH',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 5,
            text: 'Compared to teenagers my age, I make new friends and feel better with my peers through physical activity:',
            min: 'NOT AT ALL',
            max: 'VERY MUCH',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 6,
            text: 'Compared to teenagers my age, my feeling of security regarding physical activity is:',
            min: 'NONE',
            max: 'VERY MUCH',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 7,
            text: 'Compared to teenagers my age, my physical competence is:',
            min: 'VERY POOR',
            max: 'EXCELLENT',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 8,
            text: 'People with good physical literacy have a series of characteristics:\n\nA) They have good physical fitness compared to people their age.\nB) They have more knowledge about Physical Education content.\nC) They are more motivated to do physical activity.\nD) They are able to socialize (make friends and improve their relationships) through physical activity.\nE) They are more confident when doing physical activity.\nF) They are more skillful and competent in performing physical activity.\n\nThese people, after evaluating different options for physical activity, choose to participate frequently in them throughout their lives.\n\nConsidering the characteristics of a person with good physical literacy, compared to teenagers my age, my physical literacy is:',
            min: 'VERY POOR',
            max: 'EXCELLENT',
            range: Array.from({length: 11}, (_, i) => i)
        }
    ]
};

export const isTeenager = (age: number): boolean => {
    return age >= 12 && age <= 18;
};