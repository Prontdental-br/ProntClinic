// ** Mock Adapter
import mock from 'src/@fake-db/mock'

// ** Types
import { PricingDataType } from 'src/@core/components/plan-details/types'

const formatPrice = (price: any) => {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const data: PricingDataType = {
  pricingPlans: [
    // {
    //   active: true,
    //   imgWidth: 100,
    //   title: 'Agenda',
    //   categoryIDPrice: 1,
    //   categoryLabelPrice: 'Basic',
    //   imgHeight: 100,
    //   monthlyPrice: formatPrice(99.9),
    //   currentPlan: true,
    //   popularPlan: false,
    //   viewPrice: true,
    //   customView: false,
    //   customLabel: false,
    //   customLabelDiscount: false,
    //   customLabelDesountText: '',
    //   titleButton: 'Seu Plano Atual',
    //   subtitle: 'Cuide de seus pacientes e da sua agenda',
    //   imgSrc: '/images/pages/pricing-illustration-1.png',
    //   yearlyPlan: {
    //     perMonth: formatPrice(89.9),
    //     totalAnnual: formatPrice(1078.80)
    //   },
    //   planBenefits: [
    //     'Usuários ilimitados',
    //     'Cadastros de profissionais ilimitados',
    //     'Confirmação de consulta',
    //     'Pront. digital e emissão de documentos',
    //     'Odontograma',
    //     'HOF Estética',
    //     'Assinatura Digital',
    //     'Orça Flash',
    //     'Campanhas de marketing * ',
    //     'Orçamento Parcial'
    //   ]
    // },

    {
      active: true,
      imgWidth: 100,
      imgHeight: 100,
      monthlyPrice: formatPrice(1.0),
      popularPlan: true,
      currentPlan: false,
      isModalOnClick: false,
      viewPrice: true,
      customView: false,
      customLabel: false,
      customLabelDiscount: false,
      customLabelDesountText: '',
      titleButton: 'Atualizar para este',
      title: '',
      categoryIDPrice: 3,
      categoryLabelPrice: 'Prime',
      subtitle: 'Mais gestão e agilidade no processo de Clínicas',
      imgSrc: '',
      yearlyPlan: {
        perMonth: formatPrice(199.9),
        totalAnnual: formatPrice(2399.9)
      },
      planBenefits: [
        'Tudo do Plano Essencial +',
        'Assinatura digital gratuita em receitas, atestados e documentos',
        'Chat CRM integrado com número do WhatsApp da clínica e controle de oportunidades',
        'Confirmação de consulta via WhatsApp 100% gratuita com número da clínica',
        'Armazenamento ilimitado gratuito',
        'Estoque com Relatório',

        // 'Precificação Inteligente',

        'Módulo HOF Estética',
        'Orçamento facial HOF com injetáveis e estética',
        'Gerenciamento de cadastro tratamentos',
        'Gerenciamento de Estoque com relatório',
        'CRC / Alerta Aniversariantes do / Dia, Mês e Ano',
        'CRC / Alerta Agendamento - Confirmação pendentes / Atendidos / Confirmados / Faltou / Cancelou',
        'CRC / Alerta Orçamentos - Em aberto / Em andamento / Fechado / Perdido',
        'CRC / Alerta Falta 1 Consulta - Faltou / Contato Realizado / Agendado',
        'CRC / Alerta Desmarcações - Desmarcado / Contato Realizado / Reagendado',
        'CRC / Alerta Inadimplência - Parcela vencida / Contato Realizado / Renegociação',
        'Financeiro Integração com Asaas, pagamento por Boleto, Cartão crédito, Pix'

        // 'Consulta Score (consultar pacote)',
        // 'Agente IA (consultar pacote)',
      ]
    },

    {
      active: true,
      imgWidth: 100,
      imgHeight: 100,
      monthlyPrice: formatPrice(147.0),
      title: '',
      categoryIDPrice: 2,
      categoryLabelPrice: 'Essencial',
      popularPlan: false,
      currentPlan: false,
      isModalOnClick: false,
      viewPrice: true,
      customView: false,
      customLabel: false,
      customLabelDiscount: false,
      customLabelDesountText: '',
      titleButton: 'Atualizar para este',
      subtitle: 'Descomplique a gestão do seu consultório',
      imgSrc: '',
      yearlyPlan: {
        perMonth: formatPrice(103.9),
        totalAnnual: formatPrice(1247.04)
      },
      planBenefits: [
        'Cadastro de até 2 profissionais ativos',
        'Armazenamento de até 10 GB para imagens e documentos',

        // 'Armazenamento ilimitado de imagens',
        'Envio de Confirmação manual consulta pelo WhatsApp',
        'Painel Analytics',
        'Odontograma',
        'Aniversariantes do dia',
        'Painel de Orçamentos',
        'Financeiro contas a pagar e receber',
        'Prontuário do paciente',
        'Receituário',
        'Atestado',
        'Anamnese Digital',
        'Contratos',

        // 'Aplicativo Clairs',

        'Planejamento e Tratamentos',
        'Agenda Inteligente',
        'Módulo Ortodontia Inteligente',
        'Solicitações de exames',
        'Alerta Paciente chegou',
        'Organizador de Tarefas',
        'Detalhamento dos Atendimento com Histórico, Próxima consulta, A Executar',
        'Buscar Encontre paciente ou funcionalidades'
      ]
    },

    {
      active: true,
      imgWidth: 100,
      imgHeight: 100,
      monthlyPrice: formatPrice(297.0),
      popularPlan: false,
      currentPlan: false,
      isModalOnClick: false,
      viewPrice: true,
      customView: false,
      customLabel: false,
      customLabelDiscount: false,
      customLabelDesountText: '',
      titleButton: 'Atualizar para este',
      title: '',
      categoryIDPrice: 3,
      categoryLabelPrice: 'Prime',
      subtitle: 'Mais gestão e agilidade no processo de Clínicas',
      imgSrc: '',
      yearlyPlan: {
        perMonth: formatPrice(199.9),
        totalAnnual: formatPrice(2399.9)
      },
      planBenefits: [
        'Tudo do Plano Essencial +',
        'Cadastro Profissionais ilimitado',
        'Assinatura digital gratuita em receitas, atestados e documentos',
        'Chat CRM integrado com número do WhatsApp da clínica e controle de oportunidades',
        'Confirmação de consulta via WhatsApp 100% gratuita com número da clínica',
        'Armazenamento ilimitado gratuito',
        'Estoque com Relatório',

        // 'Precificação Inteligente',

        'Módulo HOF Estética',
        'Orçamento facial HOF com injetáveis e estética',
        'Gerenciamento de cadastro tratamentos',
        'Gerenciamento de Estoque com relatório',
        'CRC / Alerta Aniversariantes do / Dia, Mês e Ano',
        'CRC / Alerta Agendamento - Confirmação pendentes / Atendidos / Confirmados / Faltou / Cancelou',
        'CRC / Alerta Orçamentos - Em aberto / Em andamento / Fechado / Perdido',
        'CRC / Alerta Falta 1 Consulta - Faltou / Contato Realizado / Agendado',
        'CRC / Alerta Desmarcações - Desmarcado / Contato Realizado / Reagendado',
        'CRC / Alerta Inadimplência - Parcela vencida / Contato Realizado / Renegociação',
        'Financeiro Integração com Asaas, pagamento por Boleto, Cartão crédito, Pix'

        // 'Consulta Score (consultar pacote)',
        // 'Agente IA (consultar pacote)',
      ]
    },
    {
      active: false,
      imgWidth: 100,
      imgHeight: 100,
      monthlyPrice: String(0),
      popularPlan: false,
      currentPlan: false,
      viewPrice: false,
      customView: true,
      isModalOnClick: false,
      customLabel: false,
      secondButton: true,
      titleSecondButton: 'Consultar',
      customLabelDiscount: false,
      customLabelDesountText: '',
      customLabelText: 'NOVO',
      titleButton: 'Saiba mais',
      title: 'Redes e Franquias',
      categoryIDPrice: 0,
      categoryLabelPrice: '',
      subtitle: 'Solução para Redes e Franquias de Estética e Odontológicas',
      imgSrc: '',
      yearlyPlan: {
        perMonth: 0,
        totalAnnual: 0
      },
      planBenefits: []
    }

    // {
    //   active: true,
    //   imgWidth: 100,
    //   imgHeight: 100,
    //   monthlyPrice: 0,
    //   popularPlan: false,
    //   currentPlan: false,
    //   viewPrice: false,
    //   customView: true,
    //   customLabel: true,
    //   customLabelDiscount: false,
    //   customLabelDesountText: '',
    //   customLabelText: 'NOVO',
    //   titleButton: 'VER PACOTE',
    //   title: 'Assinatura Eletrônica',
    //   categoryIDPrice: 0,
    //   categoryLabelPrice: '',
    //   subtitle:
    //     'Gerencie sua Clínica totalmente sem papel. Documentos assinados eletronicamente, com validade jurídica. Simples e fácil',
    //   imgSrc: '',
    //   yearlyPlan: {
    //     perMonth: 0,
    //     totalAnnual: 0
    //   },
    //   planBenefits: []
    // },

    // {
    //   active: true,
    //   imgWidth: 100,
    //   imgHeight: 100,
    //   monthlyPrice: 0,
    //   popularPlan: false,
    //   currentPlan: false,
    //   viewPrice: false,
    //   customView: true,
    //   customLabel: true,
    //   customLabelDiscount: false,
    //   customLabelDesountText: '',
    //   customLabelText: 'NOVO',
    //   titleButton: 'VER PACOTE',
    //   title: 'Pacotes de SMS',
    //   categoryIDPrice: 0,
    //   categoryLabelPrice: '',
    //   subtitle:
    //     'Reduza as ausências e fortaleça a relação com seus pacientes usando campanhas de marketing automatizadas.',
    //   imgSrc: '',
    //   yearlyPlan: {
    //     perMonth: 0,
    //     totalAnnual: 0
    //   },
    //   planBenefits: []
    // },
    // {
    //   active: false,
    //   imgWidth: 100,
    //   imgHeight: 100,
    //   monthlyPrice: 0,
    //   popularPlan: false,
    //   currentPlan: false,
    //   viewPrice: false,
    //   customView: true,
    //   customLabel: false,
    //   customLabelDiscount: false,
    //   customLabelDesountText: '',
    //   customLabelText: 'NOVO',
    //   titleButton: 'EM BREVE',
    //   title: 'Pacote de WhatsApp',
    //   categoryIDPrice: 0,
    //   categoryLabelPrice: '',
    //   subtitle: 'Realize a confirmação de suas consultas pelo serviço de mensagens mais popular no Brasil.',
    //   imgSrc: '',
    //   yearlyPlan: {
    //     perMonth: 0,
    //     totalAnnual: 0
    //   },
    //   planBenefits: []
    // },
    // {
    //   active: true,
    //   imgWidth: 100,
    //   imgHeight: 100,
    //   monthlyPrice: 0,
    //   popularPlan: false,
    //   currentPlan: false,
    //   viewPrice: false,
    //   customView: true,
    //   customLabel: true,
    //   customLabelDiscount: false,
    //   customLabelDesountText: '',
    //   customLabelText: 'LANÇAMENTO',
    //   titleInPrice: 'Consulte Especialista',
    //   title: 'Impulsionamento',
    //   titleButton: 'CONSULTAR',
    //   categoryIDPrice: 0,
    //   categoryLabelPrice: '',
    //   subtitle: 'Dentistas que querem mais pacientes',
    //   imgSrc: '',
    //   yearlyPlan: {
    //     perMonth: 0,
    //     totalAnnual: 0
    //   },
    //   planBenefits: [
    //     'Consultoria especializada',
    //     'Marketing para dentistas',
    //     'Google ads, sua clinica em 1º lugar',
    //     'Redes sociais integram',
    //     'Redes sociais Tiktok',
    //     'Web-Site do Dentista',
    //     'Impulsionamento google'
    //   ]
    // }
  ],
  faq: [
    {
      id: 'responses-limit',
      question: 'What counts towards the 100 responses limit?',
      answer:
        'We count all responses submitted through all your forms in a month. If you already received 100 responses this month, you won’t be able to receive any more of them until next month when the counter resets.'
    },
    {
      id: 'process-payments',
      question: 'How do you process payments?',
      answer:
        'We accept Visa®, MasterCard®, American Express®, and PayPal®. So you can be confident that your credit card information will be kept safe and secure.'
    },
    {
      id: 'payment-methods',
      question: 'What payment methods do you accept?',
      answer: '2Checkout accepts all types of credit and debit cards.'
    },
    {
      id: 'money-back-guarantee',
      question: 'Do you have a money-back guarantee?',
      answer: 'Yes. You may request a refund within 30 days of your purchase without any additional explanations.'
    },
    {
      id: 'more-questions',
      question: 'I have more questions. Where can I get help?',
      answer: 'Please contact us if you have any other questions or concerns. We’re here to help!'
    }
  ],
  pricingTable: {
    header: [
      {
        title: 'Features',
        subtitle: 'Native Front Features'
      },
      {
        title: 'Starter',
        subtitle: 'Free'
      },
      {
        isPro: true,
        title: 'Pro',
        subtitle: '$7.5/month'
      },
      {
        title: 'Enterprise',
        subtitle: '$16/month'
      }
    ],
    rows: [
      {
        pro: true,
        starter: true,
        enterprise: true,
        feature: '14-days free trial'
      },
      {
        pro: false,
        starter: false,
        enterprise: true,
        feature: 'No user limit'
      },
      {
        pro: true,
        starter: false,
        enterprise: true,
        feature: 'Product Support'
      },
      {
        starter: false,
        enterprise: true,
        pro: 'Add-On Available',
        feature: 'Email Support'
      },
      {
        pro: true,
        starter: false,
        enterprise: true,
        feature: 'Integrations'
      },
      {
        starter: false,
        enterprise: true,
        pro: 'Add-On Available',
        feature: 'Removal of Front branding'
      },
      {
        pro: false,
        starter: false,
        enterprise: true,
        feature: 'Active maintenance & support'
      },
      {
        pro: false,
        starter: false,
        enterprise: true,
        feature: 'Data storage for 365 days'
      }
    ]
  }
}

mock.onGet('/pages/pricing').reply(() => [200, data])

export { data }
