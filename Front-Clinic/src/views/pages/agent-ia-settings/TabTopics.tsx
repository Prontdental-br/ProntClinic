import { useEffect, useState } from "react";
import { Button, Card, TextField, Typography } from "@mui/material";
import { useClinic } from "src/context/AgentIAContext";
import { useRouter } from "next/router";


const defaultTopics = {
  "medical-clinic": [
    {
      title: "Sobre a Clínica Exemplo",
      content:
        `Com mais de 20.000 pacientes atendidos e 15.000 tratamentos realizados, a Clínica Saúde Integrada, especializada em cuidados médicos, tem vasta experiência no atendimento à saúde e bem-estar de nossos pacientes. Oferecemos uma gama de serviços médicos, desde consultas de rotina até procedimentos médicos complexos, com profissionais especializados em diversas áreas, como cardiologia, dermatologia, ginecologia e ortopedia. Nossa equipe altamente qualificada utiliza tecnologia de ponta para garantir diagnósticos precisos e tratamentos eficazes. Estamos comprometidos em proporcionar saúde de qualidade, com atendimento humanizado e soluções médicas duradouras.
`,
    },
    {
      title: "Planos de Saúde",
      content:
        `Planos que cobramos R$250,00: Sulamérica, Prevent Sênior, Amil, Sompo, Omint, Care Plus, Allianz, Itaú Saúde.
Planos que atendemos sem cobrar: Bradesco, Petrobrás, Porto Seguro, Cabesp, Cassi, Gama Saúde, GEAP.
Planos que não atendemos:
Teste de Plano 1, Exemplo de Plano 2.
`,
    },
    {
     title: 'Profissionais da Clínica',
     content: `Dr. Fulano da Silva - Cardiologista
Dr. Beltrano Martins - Dermatologista
Dr. Exemplo Freire - Ortopedista
`,
    },
    {
     title: 'Agendar',
     content: `Para agendamentos de consultas e outras informações, a IA da Clínica Saúde Integrada pode realizar seu agendamento de forma automática. Basta fornecer as seguintes informações:
Nome completo
Número de telefone
Especialidade desejada (Ex.: Cardiologia, Dermatologia, Ortopedia)
Data e horário preferidos para o atendimento
Tipo de consulta (Ex.: Inicial, Retorno, Emergência)
A IA irá verificar a disponibilidade e confirmar o agendamento para você de maneira rápida e prática. Em caso de dúvidas gerais sobre os serviços ou para agendamentos, envie um e-mail para contato@clinicasaudeintegrada.com.
`,
    },
    {
        title: 'Contato',
        content: `Para agendamentos de consultas e outras informações, entre em contato pelo telefone (11) 99880-8944.
Para dúvidas gerais sobre os serviços da clínica ou agendamentos, envie um e-mail para atendimento@clinicasaudeintegrada.com. A nossa IA está disponível para realizar seu agendamento automaticamente, basta fornecer os dados solicitados e nosso sistema confirmará seu horário de atendimento de forma prática e eficiente.
`
    },
    {
        title: 'Serviços Oferecidos',
        content: `A clínica médica oferece um atendimento completo para a saúde de nossos pacientes, com profissionais qualificados e tecnologia avançada para diagnósticos e tratamentos eficazes.
As consultas médicas incluem avaliação detalhada da saúde geral, exames preventivos, acompanhamento de doenças crônicas e consultas de rotina, com planejamento personalizado para cada paciente.
A clínica oferece atendimento especializado nas áreas de cardiologia, dermatologia, ortopedia, ginecologia, endocrinologia, psicologia e outras especialidades, oferecendo tratamentos modernos e soluções para as mais diversas condições médicas.
Além disso, realizamos exames de rotina, como check-ups gerais, exames laboratoriais e exames de imagem, garantindo uma avaliação precisa e tratamentos personalizados de acordo com o quadro de cada paciente.
`
    },
    {
        title: 'Avaliações dos Pacientes',
        content: `A Clínica Saúde Integrada é reconhecida pela excelência no atendimento médico e pelo cuidado com a saúde de nossos pacientes. Oferecemos um atendimento de qualidade, com profissionais altamente qualificados, e tratamos com seriedade todas as necessidades dos nossos pacientes.
Com uma média de avaliação de 4,9 estrelas, nossos pacientes destacam comentários como: "Atendimento excepcional! Os médicos são atenciosos e cuidadosos com todas as minhas necessidades." e "A clínica tem ótimos profissionais e os exames são feitos de forma rápida e precisa. Me senti muito bem atendido!"
Agende sua consulta e descubra um novo padrão de atendimento médico!
`
    },
    {
        title: 'Política de Cancelamento',
        content: `A clínica preza pelo compromisso e organização no atendimento aos pacientes. Caso seja necessário cancelar ou reagendar uma consulta, solicitamos que o aviso seja feito com pelo menos 24 horas de antecedência. O cancelamento pode ser realizado por telefone, WhatsApp ou diretamente no sistema online da clínica.
Para reagendamentos, a equipe estará disponível para encontrar um novo horário conforme a disponibilidade do paciente e do profissional. Cancelamentos feitos com menos de 24 horas podem estar sujeitos a taxas ou restrições para marcações futuras.
Nosso objetivo é garantir um atendimento eficiente para todos, evitando longas esperas e otimizando a agenda dos profissionais. Contamos com sua colaboração!
`
    },
    {
        title: 'Formas de Pagamento',
        content: `A clínica oferece diversas formas de pagamento para sua comodidade. Aceitamos cartões de crédito e débito (Visa, MasterCard, Elo e American Express), com possibilidade de parcelamento conforme as condições da clínica.
Também trabalhamos com transferências bancárias e PIX, garantindo agilidade e segurança, com compensação imediata. Para quem prefere, o pagamento pode ser feito em dinheiro, diretamente na recepção.
Para tratamentos de maior valor ou exames específicos, consulte nossa equipe sobre opções de parcelamento e condições especiais. Nosso compromisso é tornar o atendimento acessível e facilitar o cuidado com a saúde.
`
    },
    {
        title: 'Estacionamento',
        content: `A clínica oferece estacionamento próprio com vagas exclusivas para maior comodidade dos pacientes. O espaço é seguro e de fácil acesso, garantindo praticidade no momento da consulta. Além disso, há opções de estacionamento próximo para quem preferir, com valores sujeitos à tarifa do local. Nosso objetivo é proporcionar uma experiência confortável desde a sua chegada.`
    },
    {
        title: 'Acessibilidade',
        content: `A clínica é totalmente acessível para garantir conforto e segurança a todos os pacientes. Contamos com rampas de acesso, portas amplas para cadeirantes e banheiros adaptados, proporcionando mais autonomia durante a visita. Além disso, nossa equipe está sempre pronta para oferecer suporte caso necessário. Nosso compromisso é atender com qualidade e inclusão, garantindo um ambiente acessível para todos.`
    },
    {
        title: 'Atendimento de Urgência',
        content: `A clínica oferece atendimento de urgência para situações emergenciais, como dores intensas, traumas ou complicações inesperadas. O atendimento é realizado por médicos especializados que avaliam rapidamente a situação e providenciam o cuidado necessário. Em caso de emergência, os pacientes podem entrar em contato com a clínica pelo telefone ou WhatsApp, e a equipe direcionará para o atendimento imediato ou, se necessário, orientará sobre o melhor procedimento a ser seguido. Nossa prioridade é garantir um atendimento rápido, seguro e eficaz para todas as emergências.

Esse conteúdo está ajustado para clínicas médicas, cobrindo uma ampla gama de serviços e situações com um foco na saúde geral e atendimento especializado.
`
    }
  ],
  "esthetic": [
    {
      title: "Sobre a Clínica Exemplo",
      content: `Com mais de 20.000 pacientes atendidos e 15.000 tratamentos realizados, a Clínica Beleza Suprema, especializada em estética, tem vasta experiência no cuidado e rejuvenescimento da pele, corpo e bem-estar. Oferecemos uma gama de serviços, desde consultas de rotina até procedimentos avançados, como preenchimentos faciais, toxina botulínica, tratamentos para rejuvenescimento e depilação a laser. Nossa equipe de profissionais altamente qualificados utiliza tecnologia de ponta para garantir tratamentos eficazes e personalizados. Estamos comprometidos em proporcionar resultados naturais, com atendimento humanizado e duradouro.`,
    },
    {
      title: "Planos de Saúde",
      content: `*Planos que cobramos R$250,00*: Sulamérica, Prevent Sênior, Amil, Sompo, Omint, Care Plus, Allianz, Itaú Saúde.  
*Planos que atendemos sem cobrar*: Bradesco, Petrobrás, Porto Seguro, Cabesp, Cassi, Gama Saúde, GEAP.  
*Planos que não atendemos*:  
Teste de Plano 1, Exemplo de Plano 2.`,
    },
    {
        title: 'Profissionais da Clínica',
        content: `- *Dr. Fulano da Silva* - Especialista em Rejuvenescimento Facial  
- *Dr. Beltrano Martins* - Dermatologista Especialista em Procedimentos Estéticos  
- *Dr. Exemplo Freire* - Especialista em Cirurgia Plástica`
    },
    {
        title: 'Agendar',
        content: `Para agendamentos de consultas e outras informações, a IA da Clínica Beleza Suprema pode realizar seu agendamento de forma automática. Basta fornecer as seguintes informações:

- Nome completo  
- Número de telefone  
- Especialidade desejada (Ex.: Preenchimento Facial, Toxina Botulínica, Depilação a Laser)  
- Data e horário preferidos para o atendimento  
- Tipo de consulta (Ex.: Inicial, Retorno, Emergência)

A IA irá verificar a disponibilidade e confirmar o agendamento para você de maneira rápida e prática. Em caso de dúvidas gerais sobre os serviços ou para agendamentos, envie um e-mail para *contato@clinicabelezasuperma.com*.`
    },
    {
        title: 'Contato',
        content: `Para agendamentos de consultas e outras informações, entre em contato pelo telefone *(11) 99880-8944*.

Para dúvidas gerais sobre os serviços da Pront Dental ou agendamentos, envie um e-mail para *atendimento@prontdental.com.br*. A nossa IA está disponível para realizar seu agendamento automaticamente, basta fornecer os dados solicitados e nosso sistema confirmará seu horário de atendimento de forma prática e eficiente.`
    },
    {
        title: 'Serviços Oferecidos',
        content: `A clínica de estética oferece um atendimento completo para cuidados com a beleza e bem-estar, com profissionais qualificados e tecnologia avançada para proporcionar tratamentos eficazes e confortáveis.

As consultas estéticas incluem avaliação detalhada da saúde da pele, tratamentos de rejuvenescimento facial, como toxina botulínica, e acompanhamento pós-procedimento.

Os procedimentos estéticos incluem preenchimentos faciais, clareamento de pele, tratamento de acne, manchas e outros tratamentos dermatológicos avançados, visando a saúde e a beleza da pele.

A clínica também disponibiliza tratamentos de depilação a laser, para eliminar pelos de forma definitiva, e procedimentos corporais como criolipólise e massagem modeladora, proporcionando resultados visíveis na estética do corpo.`
    },
    {
        title: 'Avaliações dos Pacientes',
        content: `A Clínica Beleza Suprema é reconhecida pela excelência em tratamentos estéticos e pelo cuidado com os pacientes. Oferecemos desde procedimentos mais simples até cirurgias estéticas complexas, tudo com a mais alta qualidade e conforto. 

Com uma média de avaliação de *4,9 estrelas*, nossos pacientes destacam comentários como: "Estou amando os resultados dos meus tratamentos! A clínica tem profissionais super qualificados e a recepção é sempre acolhedora." e "Fiquei super satisfeita com o atendimento! A equipe é maravilhosa, me senti muito bem cuidada."

Agende sua consulta e descubra um novo padrão em estética!`
    },
    {
        title: 'Política de Cancelamento',
        content: `A clínica preza pelo compromisso e organização no atendimento aos pacientes. Caso seja necessário cancelar ou reagendar uma consulta, solicitamos que o aviso seja feito com pelo menos *24 horas de antecedência*. O cancelamento pode ser realizado por telefone, WhatsApp ou diretamente no sistema online da clínica.

Para reagendamentos, a equipe estará disponível para encontrar um novo horário conforme a disponibilidade do paciente e do profissional. Cancelamentos feitos com menos de 24 horas podem estar sujeitos a taxas ou restrições para marcações futuras.

Nosso objetivo é garantir um atendimento eficiente para todos, evitando longas esperas e otimizando a agenda dos profissionais. Contamos com sua colaboração!`
    },
    {
        title: 'Formas de Pagamento',
        content: `A clínica oferece diversas formas de pagamento para sua comodidade. Aceitamos *cartões de crédito e débito* (Visa, MasterCard, Elo e American Express), com possibilidade de parcelamento conforme as condições da clínica.

Também trabalhamos com *transferências bancárias e PIX, garantindo agilidade e segurança, com compensação imediata. Para quem prefere, o pagamento pode ser feito em **dinheiro*, diretamente na recepção.

Para tratamentos de maior valor, consulte nossa equipe sobre opções de parcelamento e condições especiais. Nosso compromisso é tornar o atendimento acessível e facilitar seu cuidado com a estética e bem-estar`
    },
    {
        title: 'Estacionamento',
        content: `A clínica oferece *estacionamento próprio* com vagas exclusivas para maior comodidade dos pacientes. O espaço é seguro e de fácil acesso, garantindo praticidade no momento da consulta. Além disso, há opções de estacionamento próximo para quem preferir, com valores sujeitos à tarifa do local. Nosso objetivo é proporcionar uma experiência confortável desde a sua chegada.`
    },
    {
        title: 'Acessibilidade',
        content: `A clínica é totalmente acessível para garantir conforto e segurança a todos os pacientes. Contamos com *rampas de acesso, **portas amplas para cadeirantes* e *banheiros adaptados*, proporcionando mais autonomia durante a visita. Além disso, nossa equipe está sempre pronta para oferecer suporte caso necessário. Nosso compromisso é atender com qualidade e inclusão, garantindo um ambiente acessível para todos.`
    },
    {
        title: 'Atendimento de Urgência',
        content: `A clínica oferece *atendimento de urgência* para situações emergenciais, como reações inesperadas a tratamentos, reações alérgicas ou complicações pós-procedimento. O atendimento é realizado por profissionais especializados que avaliam rapidamente a situação e providenciam o cuidado necessário. Em caso de emergência, os pacientes podem entrar em contato com a clínica pelo telefone ou WhatsApp, e a equipe direcionará para o atendimento imediato ou, se necessário, orientará sobre o melhor procedimento a ser seguido. Nossa prioridade é garantir um atendimento rápido, seguro e eficaz para todas as emergências.`
    },
  ],
  "dentist": [
    {
      title: "Sobre a Clínica Exemplo",
      content: `Com mais de 20.000 pacientes atendidos e 15.000 tratamentos realizados, a Clínica Sorriso Perfeito, especializada em odontologia, tem vasta experiência no cuidado com a saúde bucal. Oferecemos uma gama de serviços, desde consultas de rotina até procedimentos complexos, como implantes dentários, ortodontia e estética dental. Nossa equipe de profissionais altamente qualificados utiliza tecnologia de ponta para garantir tratamentos eficazes e personalizados. Estamos comprometidos em proporcionar um sorriso saudável e bonito, com atendimento humanizado e resultados duradouros.`,
    },
    {
      title: "Planos de Saúde",
      content: `Planos que cobramos R$250,00: Sulamérica, Prevent Sênior, Amil, Sompo, Omint, Care Plus, Allianz, Itaú Saúde.
Planos que atende sem cobrar: Bradesco, Petrobrás, Porto Seguro, Cabesp, Cassi, Gama Saúde, GEAP.
Planos que não atendemos:
Teste de Plano 1, Exemplo de Plano 2
`,
    },
    {
        title: 'Profissionais Médicos',
        content: `
      Dr. Fulano da Silva- Neurocirurgião Especialista em Coluna
      Dr. Beltrano Martins - Médica Generalista
      Dr. Exemplo Freire - Especialista em Joelho
`
    },
    {
        title: 'Agendar',
        content: `Para agendamentos de consultas e outras informações, a IA da Clínica Sorriso Perfeito pode realizar seu agendamento de forma automática. Basta fornecer as seguintes informações:

Nome completo
Número de telefone
Especialidade desejada (Ex.: Ortodontia, Implantes, Estética Dental)
Data e horário preferidos para o atendimento
Tipo de consulta (Ex.: Inicial, Retorno, Emergência)
A IA irá verificar a disponibilidade e confirmar o agendamento para você de maneira rápida e prática. Em caso de dúvidas gerais sobre os serviços ou para agendamentos, envie um e-mail para contato@clinicasorrisoperfeito.com.`
    },
    {
        title: 'Contato',
        content: `Para agendamentos de consultas e outras informações, entre em contato pelo telefone (11) 99880-8944.

Para dúvidas gerais sobre os serviços da Pront Dental ou agendamentos, envie um e-mail para atendimento@prontdental.com.br. A nossa IA está disponível para realizar seu agendamento automaticamente, basta fornecer os dados solicitados e nosso sistema confirmará seu horário de atendimento de forma prática e eficiente.
`
    },
    {
        title: 'Serviços Oferecidos',
        content: `A clínica odontológica oferece um atendimento completo para a saúde bucal, com profissionais qualificados e tecnologia avançada para proporcionar tratamentos eficazes e confortáveis.

As consultas odontológicas incluem avaliação detalhada da saúde bucal, prevenção de doenças, limpeza profissional e planejamento personalizado de tratamentos.

Para correção estética e funcional do sorriso, a clínica disponibiliza tratamentos ortodônticos, como aparelhos fixos, alinhadores invisíveis e contenções, garantindo um alinhamento adequado dos dentes.

Os procedimentos estéticos incluem clareamento dental, facetas de porcelana e resina, lentes de contato dentais e reabilitação oral, proporcionando um sorriso mais bonito e harmonioso.

Na área de implantodontia, são realizados implantes dentários para reposição de dentes perdidos, devolvendo estética e função mastigatória com segurança e durabilidade.
`
    },
    {
        title: 'Avaliações dos Pacientes',
        content: `A clínica odontológica oferece um atendimento completo para a saúde bucal, com profissionais qualificados e tecnologia avançada. Os pacientes contam com consultas detalhadas, tratamentos ortodônticos, procedimentos estéticos como clareamento e lentes de contato, além de implantes, canais e cirurgias odontológicas. O cuidado com as crianças também é uma prioridade, garantindo um atendimento especializado em odontopediatria.

Nosso compromisso com a excelência reflete-se na satisfação dos pacientes. Com uma média de avaliação de 4,9 estrelas, destacamos comentários como: "Atendimento incrível, profissionais atenciosos e resultado excelente!" e "A clínica superou minhas expectativas, desde a recepção até o tratamento final!".

Agende sua consulta e descubra um novo padrão em odontologia!
`
    },
    {
        title: 'Política de Cancelamento',
        content: `A clínica preza pelo compromisso e organização no atendimento aos pacientes. Caso seja necessário cancelar ou reagendar uma consulta, solicitamos que o aviso seja feito com pelo menos 24 horas de antecedência. O cancelamento pode ser realizado por telefone, WhatsApp ou diretamente no sistema online da clínica.

Para reagendamentos, a equipe estará disponível para encontrar um novo horário conforme a disponibilidade do paciente e do profissional. Cancelamentos feitos com menos de 24 horas podem estar sujeitos a taxas ou restrições para marcações futuras.

Nosso objetivo é garantir um atendimento eficiente para todos, evitando longas esperas e otimizando a agenda dos profissionais. Contamos com sua colaboração!
`
    },
    {
        title: 'Formas de Pagamento',
        content: `A clínica oferece diversas formas de pagamento para sua comodidade. Aceitamos cartões de crédito e débito (Visa, MasterCard, Elo e American Express), com possibilidade de parcelamento conforme as condições da clínica.

Também trabalhamos com transferências bancárias e PIX, garantindo agilidade e segurança, com compensação imediata. Para quem prefere, o pagamento pode ser feito em dinheiro, diretamente na recepção.

Para tratamentos de maior valor, consulte nossa equipe sobre opções de parcelamento e condições especiais. Nosso compromisso é tornar o atendimento acessível e facilitar seu cuidado com a saúde bucal.
`
    },
    {
        title: 'Estacionamento',
        content: `A clínica oferece estacionamento próprio com vagas exclusivas para maior comodidade dos pacientes. O espaço é seguro e de fácil acesso, garantindo praticidade no momento da consulta. Além disso, há opções de estacionamento próximo para quem preferir, com valores sujeitos à tarifa do local. Nosso objetivo é proporcionar uma experiência confortável desde a sua chegada.`
    },
    {
        title: 'Acessibilidade',
        content: `A clínica é totalmente acessível para garantir conforto e segurança a todos os pacientes. Contamos com rampas de acesso, portas amplas para cadeirantes e banheiros adaptados, proporcionando mais autonomia durante a visita. Além disso, nossa equipe está sempre pronta para oferecer suporte caso necessário. Nosso compromisso é atender com qualidade e inclusão, garantindo um ambiente acessível para todos.
`,
    },
    {
        title: 'Atendimento de Urgência',
        content: `A clínica oferece atendimento de urgência para situações emergenciais, como dores intensas, traumas ou complicações inesperadas. O atendimento é realizado por profissionais especializados que avaliam rapidamente a situação e providenciam o cuidado necessário. Em caso de emergência, os pacientes podem entrar em contato com a clínica pelo telefone ou WhatsApp, e a equipe direcionará para o atendimento imediato ou, se necessário, orientará sobre o melhor procedimento a ser seguido. Nossa prioridade é garantir um atendimento rápido, seguro e eficaz para todas as emergências.`,
    },
  ],
  "clinic-odontologic": [
    {
      title: "Sobre a Clínica Exemplo",
      content: `Com mais de 20.000 pacientes atendidos e 15.000 tratamentos realizados, a Clínica Sorriso Perfeito, especializada em odontologia, tem vasta experiência no cuidado com a saúde bucal. Oferecemos uma gama de serviços, desde consultas de rotina até procedimentos complexos, como implantes dentários, ortodontia e estética dental. Nossa equipe de profissionais altamente qualificados utiliza tecnologia de ponta para garantir tratamentos eficazes e personalizados. Estamos comprometidos em proporcionar um sorriso saudável e bonito, com atendimento humanizado e resultados duradouros.`,
    },
    {
      title: "Planos de Saúde",
      content: `Planos que cobramos R$250,00: Sulamérica, Prevent Sênior, Amil, Sompo, Omint, Care Plus, Allianz, Itaú Saúde.
Planos que atende sem cobrar: Bradesco, Petrobrás, Porto Seguro, Cabesp, Cassi, Gama Saúde, GEAP.
Planos que não atendemos:
Teste de Plano 1, Exemplo de Plano 2`,
    },
    {
        title: 'Profissionais Médicos',
        content: `  Dr. Fulano da Silva- Neurocirurgião Especialista em Coluna
     Dr. Beltrano Martins - Médica Generalista
     Dr. Exemplo Freire - Especialista em Joelho`
    },
    {
        title: 'Agendar',
        content: `Para agendamentos de consultas e outras informações, a IA da Clínica Sorriso Perfeito pode realizar seu agendamento de forma automática. Basta fornecer as seguintes informações:

Nome completo
Número de telefone
Especialidade desejada (Ex.: Ortodontia, Implantes, Estética Dental)
Data e horário preferidos para o atendimento
Tipo de consulta (Ex.: Inicial, Retorno, Emergência)
A IA irá verificar a disponibilidade e confirmar o agendamento para você de maneira rápida e prática. Em caso de dúvidas gerais sobre os serviços ou para agendamentos, envie um e-mail para contato@clinicasorrisoperfeito.com.`
    },
    {
        title: 'Contato',
        content: `Para agendamentos de consultas e outras informações, entre em contato pelo telefone (11) 99880-8944.

Para dúvidas gerais sobre os serviços da Pront Dental ou agendamentos, envie um e-mail para atendimento@prontdental.com.br. A nossa IA está disponível para realizar seu agendamento automaticamente, basta fornecer os dados solicitados e nosso sistema confirmará seu horário de atendimento de forma prática e eficiente.`
    },
    {
        title: 'Serviços Oferecidos',
        content: `A clínica odontológica oferece um atendimento completo para a saúde bucal, com profissionais qualificados e tecnologia avançada para proporcionar tratamentos eficazes e confortáveis.

As consultas odontológicas incluem avaliação detalhada da saúde bucal, prevenção de doenças, limpeza profissional e planejamento personalizado de tratamentos.

Para correção estética e funcional do sorriso, a clínica disponibiliza tratamentos ortodônticos, como aparelhos fixos, alinhadores invisíveis e contenções, garantindo um alinhamento adequado dos dentes.

Os procedimentos estéticos incluem clareamento dental, facetas de porcelana e resina, lentes de contato dentais e reabilitação oral, proporcionando um sorriso mais bonito e harmonioso.

Na área de implantodontia, são realizados implantes dentários para reposição de dentes perdidos, devolvendo estética e função mastigatória com segurança e durabilidade.`
    },
    {
        title: 'Avaliações dos Pacientes',
        content: `A clínica odontológica oferece um atendimento completo para a saúde bucal, com profissionais qualificados e tecnologia avançada. Os pacientes contam com consultas detalhadas, tratamentos ortodônticos, procedimentos estéticos como clareamento e lentes de contato, além de implantes, canais e cirurgias odontológicas. O cuidado com as crianças também é uma prioridade, garantindo um atendimento especializado em odontopediatria.

Nosso compromisso com a excelência reflete-se na satisfação dos pacientes. Com uma média de avaliação de 4,9 estrelas, destacamos comentários como: "Atendimento incrível, profissionais atenciosos e resultado excelente!" e "A clínica superou minhas expectativas, desde a recepção até o tratamento final!".

Agende sua consulta e descubra um novo padrão em odontologia!`
    },
    {
        title: 'Política de Cancelamento',
        content: `A clínica preza pelo compromisso e organização no atendimento aos pacientes. Caso seja necessário cancelar ou reagendar uma consulta, solicitamos que o aviso seja feito com pelo menos 24 horas de antecedência. O cancelamento pode ser realizado por telefone, WhatsApp ou diretamente no sistema online da clínica.

Para reagendamentos, a equipe estará disponível para encontrar um novo horário conforme a disponibilidade do paciente e do profissional. Cancelamentos feitos com menos de 24 horas podem estar sujeitos a taxas ou restrições para marcações futuras.

Nosso objetivo é garantir um atendimento eficiente para todos, evitando longas esperas e otimizando a agenda dos profissionais. Contamos com sua colaboração!`
    },
    {
        title: 'Formas de Pagamento',
        content: `A clínica oferece diversas formas de pagamento para sua comodidade. Aceitamos cartões de crédito e débito (Visa, MasterCard, Elo e American Express), com possibilidade de parcelamento conforme as condições da clínica.

Também trabalhamos com transferências bancárias e PIX, garantindo agilidade e segurança, com compensação imediata. Para quem prefere, o pagamento pode ser feito em dinheiro, diretamente na recepção.

Para tratamentos de maior valor, consulte nossa equipe sobre opções de parcelamento e condições especiais. Nosso compromisso é tornar o atendimento acessível e facilitar seu cuidado com a saúde bucal.`
    },
    {
        title: 'Estacionamento',
        content: `A clínica oferece estacionamento próprio com vagas exclusivas para maior comodidade dos pacientes. O espaço é seguro e de fácil acesso, garantindo praticidade no momento da consulta. Além disso, há opções de estacionamento próximo para quem preferir, com valores sujeitos à tarifa do local. Nosso objetivo é proporcionar uma experiência confortável desde a sua chegada.`
    },
    {
        title: 'Acessibilidade',
        content: `A clínica é totalmente acessível para garantir conforto e segurança a todos os pacientes. Contamos com rampas de acesso, portas amplas para cadeirantes e banheiros adaptados, proporcionando mais autonomia durante a visita. Além disso, nossa equipe está sempre pronta para oferecer suporte caso necessário. Nosso compromisso é atender com qualidade e inclusão, garantindo um ambiente acessível para todos.`,
    },
    {
        title: 'Atendimento de Urgência',
        content: `A clínica oferece atendimento de urgência para situações emergenciais, como dores intensas, traumas ou complicações inesperadas. O atendimento é realizado por profissionais especializados que avaliam rapidamente a situação e providenciam o cuidado necessário. Em caso de emergência, os pacientes podem entrar em contato com a clínica pelo telefone ou WhatsApp, e a equipe direcionará para o atendimento imediato ou, se necessário, orientará sobre o melhor procedimento a ser seguido. Nossa prioridade é garantir um atendimento rápido, seguro e eficaz para todas as emergências.`,
    },
  ],
};

type ClinicType = "medical-clinic" | "esthetic" | "dentist" | "clinic-odontologic";

const TabTopics = () => {
  const [clinicType, setClinicType] = useState<string | null>(null);
  const [topics, setTopics] = useState<{ title: string; content: string }[]>([]);
  const { selectedClinic } = useClinic();
  const router = useRouter();

  const handleNext = () => {
    if (selectedClinic) {
      router.push(`/ia-agent/settings/behavior/`);
    }
  };

  useEffect(() => {
    if (selectedClinic) {
      setClinicType(selectedClinic);
      setTopics(defaultTopics[selectedClinic as ClinicType] || []);
    }
  }, [selectedClinic]);

  const mappedClinicTypes = {
    "medical-clinic": "Clínica Médica",
    "esthetic": "Estética",
    "clinic-odontologic": "Clínica Odontológica",
    "dentist": "Dentista"
  }

  return (
    <Card sx={{ padding: "24px", height: "100%" }}>
      <h2>2. Seu Negócio: <span style={{ padding: '8px', backgroundColor: '#bfe7dfff', borderRadius: '5px', color: '#087a64FF' }}>{mappedClinicTypes[clinicType as ClinicType || '']}</span></h2>

      {topics.map((topic, index) => (
        <div key={index} style={{ marginBottom: "20px" }}>
          <Typography color={'primary'} sx={ { fontWeight: 600, fontSize: '18px' } }>{topic.title}</Typography>
          <TextField
            fullWidth
            value={topic.content}
            margin="normal"
            multiline
            minRows={3}
            inputProps={{ maxLength: 1000 }}
            onChange={(e) => {
              const newText = e.target.value;
              if (newText.length <= 1000) {
                const updatedTopics = [...topics];
                updatedTopics[index].content = newText;
                setTopics(updatedTopics);
              }
            }}
          />
          <Typography variant="body2" color="textSecondary" align="right">
            {topics[index].content.length}/1000 caracteres
          </Typography>
        </div>
      ))}

      <Button variant='contained' onClick={handleNext}>Próximo</Button>
    </Card>
  );
};

export default TabTopics;