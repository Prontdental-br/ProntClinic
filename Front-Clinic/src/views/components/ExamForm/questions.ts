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
  'digitais': {
    'Serviços': [
      { type: 'check', label: 'Escaneamento intraoral' },
      { type: 'check', label: 'Placa de contenção' },
      { type: 'check', label: 'Placa miorrelaxante' },
      { type: 'check', label: 'Placa de clareamento' },
      { type: 'check', label: 'Modelo 3D impresso Alta Resolução (resina)' },
      { type: 'check', label: 'Modelo 3D impresso Resolução convencional (filamento)' },
      { type: 'check', label: 'Enceramento digital' },
      { type: 'check', label: 'Setup ortodôntico virtual' },
      { type: 'check', label: 'Perioguide com análise facial' },
      { type: 'check', label: 'Perioguide sem análise facial' },
      { type: 'check', label: 'Biomodelo Alta resolução (resina)' },
      { type: 'check', label: 'Biomodelo resolução convencional (filamento)' },
      { type: 'check', label: 'Biomodelo mandíbula' },
      { type: 'check', label: 'Biomodelo maxila' },
    ],
  },
  'tomografia': {
    'Assinale o formato do recebimento': [
      { type: 'radio', label: 'Digital' },
      { type: 'radio', label: 'Impresso (filme fotografico)' },
      { type: 'radio', label: 'Impresso (papel fotográfico)' }
    ],
    'Assinale a região de interesse': [
      { type: 'check', label: 'Maxila total' },
      { type: 'check', label: 'Mandíbula total' },
      { type: 'check', label: 'Segmentada' },
      { type: 'check', label: 'Face total' },
      { type: 'check', label: 'Seios da face' },
    ],
    'Assinale a finalidade do exame': [
      { type: 'check', label: 'Implantes' },
      { type: 'check', label: 'Dentes inclusos/3º molares' },
      { type: 'check', label: 'Patologias' },
      { type: 'check', label: 'Periodontia (tomografia de alta resolução)' },
      { type: 'check', label: 'Perfuração/trepanação (tomografia de alta resolução)' },
      { type: 'check', label: 'ATM (UNIDADE 1 & IV) 1 posição' },
      { type: 'check', label: 'ATM (UNIDADE 1 & IV) 2 posições' },
    ],
    'Software para visualização e planejamento virtual': [
      { type: 'check', label: 'Dental slice' },
      { type: 'check', label: 'Implantviewer' },
      { type: 'check', label: 'Prexionviewer' },
      { type: 'check', label: 'On demand' },
      { type: 'check', label: 'Codiagnostix' },
      { type: 'check', label: 'Dicom' },
    ],
    'Cirurgia guiada': [
      { type: 'check', label: 'Tomo de 1 arcada + escaneamento de guia intraoral + software para planejamento' },
      { type: 'check', label: 'Tomo de 2 arcada + escaneamento de guia intraoral + software para planejamento' },
      { type: 'text', label: 'Região do implante' },
      { type: 'text', label: 'Marca do implante' },
      { type: 'check', label: 'Planejamento virtual de implantes' },
      { type: 'check', label: 'Confecção do guia cirúrgico' },
    ],
    'Ṕrotocolo ortognática': [
      { type: 'check', label: 'Tomo de face + 14 fotos + modelo digital (unidade I & IV)' },
    ],
    'Ṕrotocolo SEG/SYM': [
      { type: 'check', label: 'Tomo de face + 18 fotos (unidade I & IV) Análise PowerPoint' },
      { type: 'check', label: 'Tomo de face + 18 fotos (unidade I & IV) Análise PDF' },
      { type: 'check', label: 'Tomo de face + 18 fotos (unidade I & IV) Sem Análise' },
    ],
    'Informações adicionais': [
      { type: 'text', label: 'Informações adicionais' },
    ],
  },
  'radiografia': {
    'Assinale o formato do recebimento': [
      { type: 'radio', label: 'Digital' },
      { type: 'radio', label: 'Impresso' },
    ],
    'Radiografias extrabucais': [
      { type: 'check', label: 'Panorâmica convencional' },
      { type: 'text', label: 'Finalidade' },
      { type: 'check', label: 'Panorâmica para implante com traçado anatômico' },
      { type: 'text', label: 'Região' },
      { type: 'check', label: 'Transfacial de ATM - 2 posições' },
    ],
    'Telerradiografia lateral': [
      { type: 'check', label: 'Sem traçado' },
      { type: 'check', label: 'Com traçado' },
    ],
    'Telerradiografia frontal': [
      { type: 'check', label: 'AP' },
      { type: 'check', label: 'PA' },
      { type: 'check', label: 'Seios da face (waters)' },
    ],
    'Índice carpal': [
      { type: 'check', label: 'curva de crescimento' },
      { type: 'check', label: 'idade óssea' },
    ],
    'Periapical': [
      { type: 'check', label: 'dentes assinalados' },
      { type: 'check', label: 'técnica de clark' },
      { type: 'check', label: 'boca toda' },
    ], 
    'Interproximal': [
      { type: 'check', label: 'molares D E' },
      { type: 'check', label: 'pré-molares D E' },
    ],
    'Oclusais': [
      { type: 'check', label: 'maxila' },
      { type: 'check', label: 'mandíbula' },
    ],
    'Informações adicionais': [
      { type: 'text', label: 'Informações adicionais' },
    ],
  },
  'ortodontia': {
    'Assinale o formato do recebimento': [
      { type: 'radio', label: 'Digital' },
      { type: 'radio', label: 'Impresso' },
    ],
    'documentação simplificada ': [
      { type: 'check', label: 'Pan + Tele com traçados + 6 fotos + Modelo' },
    ],
    'documentação completa': [
      { type: 'check', label: 'Pan + Tele com traçados + periapicais de incisivos + 8 fotos + Modelo' },
    ],
    'documentação para alinhadores': [
      { type: 'check', label: 'Pan + Tele + 8 fotos + Modelo' },
    ],
    'documentação first check': [
      { type: 'check', label: 'Pan + Modelo digital' },
    ],
    'Assinale o tipo de modelo': [
      { type: 'radio', label: 'Sem modelo' },
      { type: 'radio', label: 'Modelo digital - STL' },
      { type: 'radio', label: 'Modelo de resolução convencional (filamento)' },
      { type: 'radio', label: 'Modelo de resolução alta (resina)' },
      { type: 'radio', label: 'Modelo de gesso' },
    ],
    'Assinalar análise cefalométrica': [
      { type: 'check', label: 'Adenóide' },
      { type: 'check', label: 'Análise facial' },
      { type: 'check', label: 'Bimler' },
      { type: 'check', label: 'Jarabak' },
      { type: 'check', label: 'Macnamara' },
      { type: 'check', label: 'Petrovick' },
      { type: 'check', label: 'Ricketts' },
      { type: 'check', label: 'Trevisi' },
      { type: 'check', label: 'USP' },
      { type: 'check', label: 'USP/Unicamp' },
      { type: 'text', label: 'Outras' },
    ],
    'Serviços opcionais': [
      { type: 'check', label: 'Periapicais de incisivos' },
      { type: 'check', label: 'Fotos oclusais (2)' },
      { type: 'check', label: 'Escaneamento intraoral' },
      { type: 'text', label: 'Finalidade' },
      { type: 'check', label: 'Fotos extra (3)' },
      { type: 'check', label: 'Fotos intra (3)' },
      { type: 'check', label: 'Carpal' },
      { type: 'check', label: 'Tele frontal' },
    ],
    'Smile design DVI': [
      { type: 'check', label: 'Motivacional (fotos + modelo digital + desenho digital do sorriso)' },
      { type: 'check', label: 'Modelo impresso para mockup' },
      { type: 'check', label: 'Guia para mockup' },
    ]
  }
}
