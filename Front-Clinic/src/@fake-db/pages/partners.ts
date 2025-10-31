// ** Mock Adapter
import mock from 'src/@fake-db/mock'

// ** Types
import { PricingDataType } from 'src/@core/components/plan-details/types'

const formatPrice = (price: any) => {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const dataPartners: PricingDataType = {
  pricingPlans: [
    {
        active: true,
        imgWidth: 260,
        imgHeight: 240,
        monthlyPrice: "0",
        popularPlan: false,
        currentPlan: false,
        viewPrice: false,
        
        // imgBanner: '/images/partners/Pacote-Promocional-Woson.jpeg',
      
        idVideo: "SnFAJB_wca0",
        isModalOnClick: true,
        whatsAppNumber: '5516991948766',
        customView: true,
        customLabel: true,
        customLabelDiscount: false,
        customLabelDesountText: '',
        customLabelText: 'Premium',
        titleButton: 'VER VIDEO',
        title: '',
        categoryIDPrice: 0,
        categoryLabelPrice: '',
        subtitle:
          '',
        imgSrc: '/images/partners/IGOR.png',
        yearlyPlan: {
          perMonth: 0,
          totalAnnual: 0
        },
        planBenefits: []
      },
    {
        active: true,
        imgWidth: 260,
        imgHeight: 240,
        monthlyPrice: "0",
        popularPlan: false,
        currentPlan: false,
        viewPrice: false,
        isModalOnClick: true,
        whatsAppNumber: '5511998808944',
        idVideo: "QR7nM5fOM8s",
        customView: true,
        customLabel: true,
        customLabelDiscount: false,
        customLabelDesountText: '',
        customLabelText: 'Premium',
        titleButton: 'VER VIDEO',
        title: '',
        categoryIDPrice: 0,
        categoryLabelPrice: '',
        subtitle:
          '',
        imgSrc: '/images/partners/IGOR.png',
        yearlyPlan: {
          perMonth: 0,
          totalAnnual: 0
        },
        planBenefits: []
      },

      {
        active: true,
        imgWidth: 260,
        imgHeight: 240,
        monthlyPrice: "0",
        popularPlan: false,
        currentPlan: false,
        isModalOnClick: true,
        viewPrice: false,
        customView: true,
        customLabel: true,
        customLabelDiscount: false,
        customLabelDesountText: '',
        customLabelText: 'Premium',
        whatsAppNumber: '5513996501109',
        idVideo: "17FF0cjYAl0",
        titleButton: 'VER VIDEO',
        title: '',
        categoryIDPrice: 0,
        categoryLabelPrice: '',
        subtitle:
          '',
        imgSrc: '/images/partners/IGOR.png',
        yearlyPlan: {
          perMonth: 0,
          totalAnnual: 0
        },
        planBenefits: []
      },

      // {
      //   active: true,
      //   imgWidth: 180,
      //   imgHeight: 180,
      //   monthlyPrice: 0,
      //   popularPlan: false,
      //   currentPlan: false,
      //   isModalOnClick: true,
      //   whatsAppNumber: '5513997289237',
      //   viewPrice: false,
      //   customView: true,
      //   customLabel: true,
      //   customLabelDiscount: false,
      //   customLabelDesountText: '',
      //   customLabelText: 'Premium',
      //   titleButton: 'VER PACOTE',
      //   title: '',
      //   categoryIDPrice: 0,
      //   categoryLabelPrice: '',
      //   subtitle:
      //     '',
      //   imgSrc: '/images/partners/newAlign.png',
      //   yearlyPlan: {
      //     perMonth: 0,
      //     totalAnnual: 0
      //   },
      //   planBenefits: []
      // },

    // {
    //   active: true,
    //   imgWidth: 180,
    //   imgHeight: 180,
    //   monthlyPrice: 0,
    //   popularPlan: false,
    //   currentPlan: false,
    //   isModalOnClick: true,
    //   whatsAppNumber: '5516997868341',
    //   viewPrice: false,
    //   customView: true,
    //   customLabel: true,
    //   customLabelDiscount: false,
    //   customLabelDesountText: '',
    //   customLabelText: 'Premium',
    //   titleButton: 'VER PACOTE',
    //   title: '',
    //   categoryIDPrice: 0,
    //   categoryLabelPrice: '',
    //   subtitle:
    //     '',
    //   imgSrc: '/images/partners/apcd.png',
    //   yearlyPlan: {
    //     perMonth: 0,
    //     totalAnnual: 0
    //   },
    //   planBenefits: []
    // },

    // {
    //   active: true,
    //   imgWidth: 180,
    //   imgHeight: 180,
    //   monthlyPrice: 0,
    //   popularPlan: false,
    //   currentPlan: false,
    //   isModalOnClick: true,
    //   whatsAppNumber: '551635056739',
    //   viewPrice: false,
    //   customView: true,
    //   customLabel: true,
    //   customLabelDiscount: false,
    //   customLabelDesountText: '',
    //   customLabelText: 'Premium',
    //   titleButton: 'VER PACOTE',
    //   title: '',
    //   categoryIDPrice: 0,
    //   categoryLabelPrice: '',
    //   subtitle:
    //     '',
    //   imgSrc: '/images/partners/brGuide.png',
    //   yearlyPlan: {
    //     perMonth: 0,
    //     totalAnnual: 0
    //   },
    //   planBenefits: []
    // },
    // {
    //   active: false,
    //   imgWidth: 180,
    //   imgHeight: 180,
    //   monthlyPrice: 0,
    //   popularPlan: false,
    //   currentPlan: false,
    //   isModalOnClick: true,
    //   viewPrice: false,
    //   customView: true,
    //   customLabel: true,
    //   customLabelDiscount: false,
    //   customLabelDesountText: '',
    //   customLabelText: 'Premium',
    //   titleButton: 'VER PACOTE',
    //   title: '',
    //   categoryIDPrice: 0,
    //   categoryLabelPrice: '',
    //   subtitle:
    //     '',
    //   imgSrc: '/images/partners/cropi.png',
    //   yearlyPlan: {
    //     perMonth: 0,
    //     totalAnnual: 0
    //   },
    //   planBenefits: []
    // },
    // {
    //   active: true,
    //   imgWidth: 180,
    //   imgHeight: 180,
    //   monthlyPrice: 0,
    //   popularPlan: false,
    //   currentPlan: false,
    //   isModalOnClick: true,
    //   viewPrice: false,
    //   customView: true,
    //   whatsAppNumber: '5516991829903',
    //   customLabel: true,
    //   customLabelDiscount: false,
    //   customLabelDesountText: '',
    //   customLabelText: 'Premium',
    //   titleButton: 'VER PACOTE',
    //   title: '',
    //   categoryIDPrice: 0,
    //   categoryLabelPrice: '',
    //   subtitle:
    //     '',
    //   imgSrc: '/images/partners/odontoSchooll.png',
    //   yearlyPlan: {
    //     perMonth: 0,
    //     totalAnnual: 0
    //   },
    //   planBenefits: []
    // },
    // {
    //   active: true,
    //   imgWidth: 180,
    //   imgHeight: 180,
    //   monthlyPrice: 0,
    //   popularPlan: false,
    //   currentPlan: false,
    //   isModalOnClick: true,
    //   whatsAppNumber: '5516993559625',
    //   viewPrice: false,
    //   customView: true,
    //   customLabel: true,
    //   customLabelDiscount: false,
    //   customLabelDesountText: '',
    //   customLabelText: 'Premium',
    //   titleButton: 'VER PACOTE',
    //   title: '',
    //   categoryIDPrice: 0,
    //   categoryLabelPrice: '',
    //   subtitle:
    //     '',
    //   imgSrc: '/images/partners/HEIN.png',
    //   yearlyPlan: {
    //     perMonth: 0,
    //     totalAnnual: 0
    //   },
    //   planBenefits: []
    // },
    
   
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

mock.onGet('/pages/partners').reply(() => [200, dataPartners])

export { dataPartners };
