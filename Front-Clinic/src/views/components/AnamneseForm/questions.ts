type QuestionOption = {
  type: 'radio' | 'text' | 'check'
  label: string
}

type Questions = {
  [question: string]: QuestionOption[]
}

type QuestionList = {
  [key: string]: Questions
}

export const questionsObjectList: QuestionList = {
  // 'anamnese Geral': {
  //   'Tem pressão alta?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma alergia? (Como penicilinas, AAS ou outra)': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma alteração sanguínea?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já teve hemorragia diagnosticada?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma alteração cardiovascular?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui diabetes?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui asma?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui anemia?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma disfunção hepática?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Apresenta alguma disfunção renal?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma disfunção respiratória?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma alteração óssea?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma doença transmissível?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma outra doença/síndrome não mencionada': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já sofreu alguma reação alérgica ao receber anestesia': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui azia, má digestão, refluxo, úlcera ou gastrite': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Tem dificuldade de abrir a boca': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui algum antecedente de febre reumática': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Escuta algum estalado ao abrir a boca': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Está grávida': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Está amamentando': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Toma anticoncepcional?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ]
  // },
  
  // 'anamnese cirurgia e implante': {
  //   'Está em tratamento médico': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Está usando medicação': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma alergia? (Como penicilinas, AAS ou outra)': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já esteve internado': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já teve hemorragia diagnosticada': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma alteração sanguínea': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma alteração cardiovascular': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Tem pressão alta': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui diabetes': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui asma': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui anemia': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma disfunção hepática': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Apresenta alguma disfunção renal': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma disfunção respiratória': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma alteração óssea': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma doença transmissível': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma outra doença/síndrome não mencionada': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já sofreu alguma reação alérgica ao receber anestesia': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui azia, má digestão, refluxo, úlcera ou gastrite': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Está ou esteve em tratamento psicológico': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Tem dificuldade de abrir a boca': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui algum antecedente de febre reumática': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já se submeteu à Cirurgia Oral (exodontia, freio labial, etc.)': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já se submeteu à Ortodontia (aparelhos e correção)': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já se submeteu à Periodontia (tratamento gengival)': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já se submeteu à Endodontia (tratamento de canal)': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Toma anticoncepcional': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Qual a pressão arterial do paciente': [{ type: 'text', label: 'digite' }],
  //   'Qual frequência respiratória por minuto do paciente': [{ type: 'text', label: 'digite' }],
  //   'Qual a frequência cardíaca por minuto(bpm) do paciente': [{ type: 'text', label: 'digite' }],
  //   'Possui o hábito de tabagismo, alcoolismo ou uso de drogas? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ]
  // },

  // 'anamnese infantil': {
  //   'Está em tratamento médico': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma alergia? (Como penicilinas, AAS ou outra)': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Sente alguma dor nos dentes ou na boca': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Está usando medicação': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já esteve internado': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já teve hemorragia diagnosticada': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma alteração sanguínea': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui diabetes': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui asma': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui anemia': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma disfunção hepática': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Apresenta alguma disfunção renal': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma disfunção respiratória': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma alteração óssea': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma doença transmissível': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Está ou esteve em tratamento psicológico': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui algum antecedente de febre reumática': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui algum antecedente de endocardite bacteriana': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma outra doença/síndrome não mencionada': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já sofreu alguma reação alérgica ao receber anestesia': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Tem dificuldade de abrir a boca': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Sente dores no ouvido, cabeça, face, nuca ou pescoço': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui azia, má digestão, refluxo, úlcera ou gastrite': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Apresenta sangramento a escovação': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Seus dentes são sensíveis a mudança de temperatura ou a alimentos doces': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Range os dentes': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já se submeteu à Cirurgia Oral (exodontia, freio labial, etc.)': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já se submeteu à Ortodontia (aparelhos e correção)': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já se submeteu à Periodontia (tratamento gengival)': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já se submeteu à Endodontia (tratamento de canal)': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Quando foi sua última vez que veio ao dentista? Como foi o atendimento': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Quantas vezes por dia escova os dentes': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Usa creme dental': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Usa fio dental': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Faz uso de antisséptico bucal': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Come muitos doces, balas entre outros': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Tem hábito de tomar café ou refrigerantes': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Tem o hábito de roer unha ou morder objetos (lápis, caneta, etc.)': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'A criança nasceu com parto normal ou cesariana': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Peso ao nascer': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Realiza(ou) aleitamento materno': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Realiza(ou) o uso de mamadeira ou chupeta': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Apresenta alguma alteração de língua, lábio e/ou palato': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Apresenta outra alteração na face não mencionada? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ]
  // },

  // 'anamnese ortodôntica': {
  //   'Possui alguma alergia? (Como penicilinas, AAS ou outra)': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Está em tratamento médico? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Tem pressão alta? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Sente alguma dor nos dentes ou na boca? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Está usando medicação? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já esteve internado? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já teve hemorragia diagnosticada? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma alteração sanguínea? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui diabetes? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui asma? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui anemia? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma disfunção hepática? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Apresenta alguma disfunção renal? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma disfunção respiratória? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma alteração óssea? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma doença transmissível? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui depressão? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Está ou esteve em tratamento psicológico? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui algum antecendente de endocardite bacteriana? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui alguma outra doença/síndrome não mencionada? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já sofreu alguma reação alérgica ao receber anestesia? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Tem dificuldade de abrir a boca? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Sente dores no ouvido, cabeça, face, nuca ou pescoço? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui azia, má digestão, refluxo, úlcera ou gastrite? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Apresenta sangramento a escovação? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Seus dentes são sensíveis a mudança de temperatura ou a alimentos doces? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Range os dentes? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já se submeteu à Cirurgia Oral (exodontia, freio labial, etc.)? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já se submeteu à Ortodontia (aparelhos e correção)? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já se submeteu à Periodontia (tratamento gengival)? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já se submeteu à Endodontia (tratamento de canal)? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já se submeteu à Profilaxia / Prevenção (limpeza, flúor, selante oclusal, etc.)? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Quando foi sua última vez que veio ao dentista? Como foi o atendimento? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Quantas vezes por dia escova os dentes? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Usa creme dental? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Usa fio dental? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Faz uso de antisséptico bucal? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Come muitos doces, balas entre outros? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Tem hábito de tomar café ou refrigerantes? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Tem o hábito de roer unha ou morder objetos (lápis, caneta, etc.)? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'A criança nasceu com parto normal ou cesariana? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Peso ao nascer? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Realiza(ou) aleitamento materno? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Realiza(ou) o uso de mamadeira ou chupeta? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Realiza(ou) sucção de dedo ou lábio? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Qual a sobremordida? (aumentada, normal ou aberta)': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Qual o trespasse horizontal? (aumentado, normal ou negativo) ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Possui mordida cruzada? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'O paciente possiu alguma alteração ganglionar? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Apresenta alguma alteração de língua, lábio e/ou palato? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Apresenta outra alteração na face não mencionada? ': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ]
  // },

  // 'anamnese Estética': {
  //   'Já realizou procedimentos estéticos?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Quais?': [{ type: 'text', label: 'digite quais' }],
  //   'Houve melhora?': [{ type: 'text', label: 'descreva se houve melhora' }],
  //   'Já fez aplicação de Toxina Botulínica?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Já fez algum preenchimento dérmico?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Usa ou já usou ácidos na pele?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Onde e quando?': [{ type: 'text', label: 'informe onde e quando' }],
  //   'Faz o uso de protetor solar?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'FPS?': [{ type: 'text', label: 'informe o FPS' }],
  //   'Usa algum cosmético?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Reaplica?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Quantas vezes?': [{ type: 'text', label: 'informe a quantidade' }],
  //   'Rotina de cuidados?': [{ type: 'text', label: 'descreva sua rotina de cuidados' }],
  //   'Quando toma sol como sua pele se comporta?': [
  //     { type: 'check', label: 'Queima facilmente e nunca fica bronzeada' },
  //     { type: 'check', label: 'Queima moderadamente e bronzeia levemente' },
  //     { type: 'check', label: 'Queima levemente e bronzeia facilmente' },
  //     { type: 'check', label: 'Nunca queima e bronzeia mais que a média' },
  //     { type: 'check', label: 'Pele negra – nunca queima e totalmente pigmentada' }
  //   ],
  //   'Possui manchas de sol?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Como é sua pele?': [
  //     { type: 'check', label: 'Oleosa' },
  //     { type: 'check', label: 'Oleosa, na zona T (testa, nariz e queixo)' },
  //     { type: 'check', label: 'Mista' },
  //     { type: 'check', label: 'Seca' },
  //     { type: 'check', label: 'Normal' },
  //     { type: 'check', label: 'Sensível' }
  //   ],
  //   'Como sente sua pele?': [
  //     { type: 'radio', label: 'Lisa' },
  //     { type: 'radio', label: 'Áspera' }
  //   ],
  //   'Possui Efélides (sardas)?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Possui telangectasias?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Região:': [{ type: 'text', label: 'informe a região' }],
  //   'Possui melasma?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Quando se machuca tende a ficar manchado(a) no local da casquinha, por exemplo?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Tem ou já apresentou, em alguma fase da vida, acne?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Faz algum tipo de depilação?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Pratica atividade física?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Tem rosácea?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Tem foliculite (pelo encravado)?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Possui dermatite?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Qual?': [{ type: 'text', label: 'informe qual' }],
  //   'Possui alguma lesão suspeita?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Onde?': [{ type: 'text', label: 'informe onde' }],
  //   'Frequência:': [{ type: 'text', label: 'informe a frequência' }],
  //   'Como funciona o seu intestino?': [{ type: 'text', label: 'descreva o funcionamento' }],
  //   'Qual a quantidade de água ingerida por dia:': [
  //     { type: 'radio', label: 'menos de 500ml' },
  //     { type: 'radio', label: '500ml' },
  //     { type: 'radio', label: '1L' },
  //     { type: 'radio', label: '2L' },
  //     { type: 'radio', label: '3L' },
  //     { type: 'radio', label: 'mais de 3L' }
  //   ],
  //   'Descreva um dia de sua alimentação:': [{ type: 'text', label: 'descreva sua alimentação' }],
  //   'Faz acompanhamento alimentar?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Com qual profissional Faz acompanhamento?': [{ type: 'text', label: 'informe o profissional' }],
  //   'Intolerância alimentar?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'A que?': [{ type: 'text', label: 'informe a que' }],
  //   'E alergia alimentar?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'A que é alérgico?': [{ type: 'text', label: 'informe a que' }],
  //   'Retém líquido com frequência?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Ganha peso ou perde peso com facilidade?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Ingere bebida alcoólica?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Fuma?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Toma café?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Qtd dia?': [{ type: 'text', label: 'informe a quantidade por dia' }],
  //   'Quantos cigarros por dia?': [{ type: 'text', label: 'informe a quantidade' }],
  //   'Como é seu sono?': [{ type: 'text', label: 'descreva seu sono' }],
  //   'Quantas horas/noite:': [{ type: 'text', label: 'informe a quantidade de horas' }],
  //   'Acorda com frequência durante à noite?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Quando acorda sente-se descansado(a)?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Já fez alguma cirurgia?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Como foi sua recuperação?': [{ type: 'text', label: 'descreva a recuperação' }],
  //   'Possui alguma prótese?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Qual parte do corpo?': [{ type: 'text', label: 'informe a parte do corpo' }],
  //   'Há quanto tempo?': [{ type: 'text', label: 'informe há quanto tempo' }],
  //   'Faz o uso de algum hormônio?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Faz o uso de algum suplemento?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Faz algum acompanhamento médico?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Faz exame periodicamente?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Tem alergia a algum produto ou medicamento?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Faz ou fez (último mês) uso de algum medicamento?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Qual(is)?': [{ type: 'text', label: 'informe quais' }],
  //   'Com qual profissional?': [{ type: 'text', label: 'informe o profissional' }],
  //   'Última vez?': [{ type: 'text', label: 'informe a última vez' }],
  //   'A que ?': [{ type: 'text', label: 'informe a que' }],
  //   'Qual(is) ?': [{ type: 'text', label: 'informe quais' }],
  //   'Houve alguma alteração no último exame?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Histórico de doença na família?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Como é sua menstruação?': [{ type: 'text', label: 'descreva sua menstruação' }],
  //   'Usa anticoncepcional?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Faz uso de DIU?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Pode estar grávida?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' },
  //     { type: 'radio', label: 'Não sei' }
  //   ],
  //   'Já ficou grávida?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Sofreu aborto?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Possui ou sofre alguma das opções abaixo?': [
  //     { type: 'check', label: 'Aparelho Ortodôntico' },
  //     { type: 'check', label: 'Implante Dentário' },
  //     { type: 'check', label: 'Prótese Dentária' },
  //     { type: 'check', label: 'Bruxismo' }
  //   ],
  //   'Possui deficiência de vitaminas?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Quais vitaminas?': [{ type: 'text', label: 'informe qual' }],
  //   'Faz reposição?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Com?': [{ type: 'text', label: 'informe com o que faz a reposição' }],
  //   'Faz uso de antidepressivo?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Qual antidepressivo?': [{ type: 'text', label: 'informe qual' }],
  //   'Permanece muito tempo sentado?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Horas:': [{ type: 'text', label: 'informe as horas' }],
  //   'Possui marcapasso?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Possui anemia?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Possui algum problema circulatório?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Possui diabetes?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Possui algum distúrbio hormonal?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Possui lúpus?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Possui psoríase?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Cabelos e/ou unhas quebradiços?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Possui algum distúrbio na tireoide?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Distúrbio hepático (fígado)?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Distúrbio renal (rins)?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Tumor?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Quando?': [{ type: 'text', label: 'informe quando' }],
  //   'Possui algum problema gástrico?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],

  //   // Continuação do objeto 'anamnese Complementar'
  //   'Gastrite?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Refluxo?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Faz tratamento?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Possui algum problema de cicatrização?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Tem histórico de cicatriz hipertrófica?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Possui mioma?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Cisto no ovário?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Endometriose?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Queloide?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Tem ou teve herpes labial ou em outro lugar do rosto?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Onde teve herpes labial?': [{ type: 'text', label: 'informe onde' }],
  //   'Como é sua pressão arterial?': [
  //     { type: 'check', label: 'Hipotensão (valores abaixo de 80-90mmHg x 60mmHg)' },
  //     { type: 'check', label: 'Normal (valores próximos a 120mmHg x 80mmHg)' },
  //     { type: 'check', label: 'Hipertensão (valores acima de 140mmHg x 90mmHg)' }
  //   ],
  //   'Faz controle da pressão arterial?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'É ansioso?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'É estressado?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Teve Covid?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Tomou vacina?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Quando Tomou vacina?': [{ type: 'text', label: 'informe quando' }],
  //   'Com qual medicação?': [{ type: 'text', label: 'informe com qual medicação' }],
  //   'Sua gengiva costuma sangrar?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Possui alguma doença ou há alguma informação que não foi perguntada que deseja informar?': [
  //     { type: 'radio', label: 'Sim' },
  //     { type: 'radio', label: 'Não' }
  //   ],
  //   'Fale sobre:': [{ type: 'text', label: 'informe os detalhes' }]
  // }
}
