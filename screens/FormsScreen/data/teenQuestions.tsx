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
            min: 'Muito inferior/Péssima',
            max: 'Muito superior/Muito elevada',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 2,
            text: 'Em comparação com os/as adolescentes da minha idade, a quantidade de atividade física que pratico semanalmente (por exemplo, praticar desporto, caminhar ou andar de bicicleta, etc.) é:',
            min: 'Muito inferior/Nenhuma',
            max: 'Muito superior/Muito elevada',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 3,
            text: 'Em comparação com os/as adolescentes da minha turma, o meu conhecimento sobre os conteúdos da educação física é:',
            min: 'Muito inferior/Nenhum',
            max: 'Muito superior/Muito elevado',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 4,
            text: 'Em comparação com os/as adolescentes da minha idade, a minha motivação para praticar atividade física (por exemplo, praticar desporto, caminhar ou andar de bicicleta, etc.) é:',
            min: 'Muito inferior/Nenhuma',
            max: 'Muito superior/Muito elevada',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 5,
            text: 'Em comparação com os/as adolescentes da minha idade, sinto que faço novos/as amigos e melhoro as minhas relações sociais através da atividade física (por exemplo, praticar desporto, caminhar ou andar de bicicleta, etc.):',
            min: 'Muito inferior',
            max: 'Muito superior',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 6,
            text: 'Sabendo que a literacia física consiste na soma das questões acima: 1) aptidão física/condição física; 2) quantidade de atividade física realizada semanalmente; 3) conhecimento sobre os conteúdos da educação física; 4) motivação para praticar atividade física, incluindo fazer novos/as amigos/as e melhorar as minhas relações com os/as outros/as. Em comparação com os/as adolescentes da minha idade, a minha literacia física é:',
            min: 'Muito inferior/Nenhuma',
            max: 'Muito superior/Muito elevada',
            range: Array.from({length: 11}, (_, i) => i)
        }
    ],
    "pt-BR": [
        {
            id: 1,
            text: 'Em comparação com os/as adolescentes da minha idade, minha aptidão física ou condição física é:',
            min: 'Muito inferior/Péssima',
            max: 'Muito superior/Muito elevada',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 2,
            text: 'Em comparação com os/as adolescentes da minha idade, a quantidade de atividade física que pratico semanalmente (por exemplo, praticar esporte, caminhar ou andar de bicicleta, etc.) é:',
            min: 'Muito inferior/Nenhuma',
            max: 'Muito superior/Muito elevada',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 3,
            text: 'Em comparação com os/as adolescentes da minha turma, meu conhecimento sobre os conteúdos da educação física é:',
            min: 'Muito inferior/Nenhum',
            max: 'Muito superior/Muito elevado',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 4,
            text: 'Em comparação com os/as adolescentes da minha idade, minha motivação para praticar atividade física (por exemplo, praticar esporte, caminhar ou andar de bicicleta, etc.) é:',
            min: 'Muito inferior/Nenhuma',
            max: 'Muito superior/Muito elevada',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 5,
            text: 'Em comparação com os/as adolescentes da minha idade, sinto que faço novos/as amigos e melhoro minhas relações sociais através da atividade física (por exemplo, praticar esporte, caminhar ou andar de bicicleta, etc.):',
            min: 'Muito inferior',
            max: 'Muito superior',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 6,
            text: 'Sabendo que o letramento físico consiste na soma das questões acima: 1) aptidão física/condição física; 2) quantidade de atividade física realizada semanalmente; 3) conhecimento sobre os conteúdos da educação física; 4) motivação para praticar atividade física, incluindo fazer novos/as amigos/as e melhorar minhas relações com os/as outros/as. Em comparação com os/as adolescentes da minha idade, meu letramento físico é:',
            min: 'Muito inferior/Nenhuma',
            max: 'Muito superior/Muito elevada',
            range: Array.from({length: 11}, (_, i) => i)
        }
    ],
    es: [
        {
            id: 1,
            text: 'En comparación con los/las chicos/as de mi edad mi forma física global o condición física es:',
            min: 'Muy mala/Pésima',
            max: 'Muy buena/Excelente',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 2,
            text: 'En comparación con los/las chicos/as de mi edad la cantidad de actividad física que realizo semanalmente (por ejemplo: practicar deportes, caminar o ir en bicicleta, etc.) es:',
            min: 'Nada/Ninguna',
            max: 'Muchísima',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 3,
            text: 'En comparación con los/las chicos/as de mi curso mi conocimiento sobre los contenidos de educación física es:',
            min: 'Ninguno',
            max: 'Muy bueno/Excelente',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 4,
            text: 'En comparación con los/las chicos/as de mi edad mi motivación para realizar actividad física (por ejemplo: practicar deportes, caminar o ir en bicicleta, etc.) es:',
            min: 'Ninguna',
            max: 'Muchísima',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 5,
            text: 'En comparación con los/las chicos/as de mi edad hago nuevos amigos/as y me siento mejor con mis compañeros/as gracias a la actividad física que realizo (por ejemplo: practicar deportes, caminar o ir en bicicleta, etc.):',
            min: 'Nada',
            max: 'Muchísimo',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 6,
            text: 'Sabiendo que la alfabetización física es la suma de las preguntas anteriores: 1) forma física global/condición física; 2) cantidad de actividad física realizada semanalmente; 3) lo que conoces sobre los contenidos de educación física; 4) motivación para realizar actividad física, incluyendo hacer nuevos amigos y sentirte mejor con tus compañeros/as gracias a la actividad física. En comparación con los/las chicos/as de mi edad mi alfabetización física es:',
            min: 'Muy mala/Pésima',
            max: 'Muy buena/Excelente',
            range: Array.from({length: 11}, (_, i) => i)
        }
    ],
    en: [
        {
            id: 1,
            text: 'Compared to teenagers my age, my overall physical fitness is:',
            min: 'Very poor',
            max: 'Excellent',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 2,
            text: 'Compared to teenagers my age, the amount of physical activity I do weekly (e.g., playing sports, walking or cycling, etc.) is:',
            min: 'None',
            max: 'Very much',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 3,
            text: 'Compared to teenagers in my class, my knowledge about physical education content is:',
            min: 'None',
            max: 'Excellent',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 4,
            text: 'Compared to teenagers my age, my motivation to do physical activity (e.g., playing sports, walking or cycling, etc.) is:',
            min: 'None',
            max: 'Very much',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 5,
            text: 'Compared to teenagers my age, I make new friends and improve my social relationships through physical activity (e.g., playing sports, walking or cycling, etc.):',
            min: 'Not at all',
            max: 'Very much',
            range: Array.from({length: 11}, (_, i) => i)
        },
        {
            id: 6,
            text: 'Knowing that physical literacy is the sum of the previous questions: 1) overall physical fitness; 2) amount of weekly physical activity; 3) what you know about physical education content; 4) motivation to do physical activity, including making new friends and improving your relationships with others through physical activity. Compared to teenagers my age, my physical literacy is:',
            min: 'Very poor',
            max: 'Excellent',
            range: Array.from({length: 11}, (_, i) => i)
        }
    ]
};

export const isTeenager = (age: number): boolean => {
    return age >= 12 && age <= 18;
};