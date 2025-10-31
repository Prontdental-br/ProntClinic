import { ReactNode } from "react";
import { Box, Container, Typography, Divider } from "@mui/material";
import BlankLayout from "src/@core/layouts/BlankLayout";

const PoliticaPrivacidade = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Política de Privacidade e Termos de Uso
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          CLAIRIS SOFTWARE
        </Typography>
      </Box>
      <Section title="Política de Privacidade – Termos de Uso do Software Clairis">
        <Paragraph>
          A CLAIRIS SOFTWARE, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 61.051.560/0001-60, com sede na Rua Alagoas Tocantins, nº 125, sala 1401, Condomínio West Side, bairro Alphaville Centro Industrial e Empresarial/Alphaville, CEP 06455-020 – Barueri/SP, respeita a privacidade dos seus usuários e está comprometida com a proteção dos dados pessoais tratados em sua plataforma.
        </Paragraph>
        <Paragraph>
          Esta Política de Privacidade tem como objetivo esclarecer, de forma clara e transparente, como coletamos, utilizamos, armazenamos, compartilhamos e protegemos os dados dos usuários do software CLAIRIS.
        </Paragraph>

        <Subsection title="1. Dados Coletados">
          <ListItems items={[
            "Dados de identificação pessoal: nome, CPF, RG, data de nascimento, e-mail, telefone, endereço, profissão, entre outros;",
            "Dados de acesso: login, senha, endereço IP, data e hora de acesso;",
            "Dados de pacientes: inseridos voluntariamente pelo usuário na plataforma;",
            "Dados de pagamento: referentes a cartão de crédito ou PIX utilizados para fins de cobrança;",
            "Informações técnicas: navegador, sistema operacional, geolocalização aproximada."
          ]} />
        </Subsection>

        <Subsection title="2. Finalidade do Tratamento de Dados">
          <ListItems items={[
            "Prestação dos serviços contratados;",
            "Emissão de cobranças e processamento de pagamentos;",
            "Atendimento ao cliente e suporte técnico;",
            "Envio de comunicações sobre funcionalidades, atualizações ou condições comerciais;",
            "Cumprimento de obrigações legais e regulatórias;",
            "Aprimoramento do software e da experiência do usuário;",
            "Segurança e prevenção de fraudes."
          ]} />
        </Subsection>

        <Subsection title="3. Compartilhamento de Dados">
          <Paragraph>
            A CLAIRIS não comercializa ou repassa dados pessoais dos usuários a terceiros, exceto:
          </Paragraph>
          <ListItems items={[
            "Quando necessário para a prestação dos serviços (ex: parceiros de pagamento);",
            "Em cumprimento a obrigações legais, regulatórias ou judiciais;",
            "Com o consentimento expresso do usuário."
          ]} />
        </Subsection>

        <Subsection title="4. Tratamento de Dados dos Pacientes">
          <Paragraph>
            A CLAIRIS atua como operadora dos dados inseridos por seus usuários (dentistas, clínicas e consultórios). Os dados dos pacientes são de total responsabilidade do profissional de saúde, que é o controlador dessas informações.
          </Paragraph>
          <Paragraph>
            A CLAIRIS apenas fornece a infraestrutura tecnológica para o armazenamento seguro e tratamento dos dados conforme as instruções dos usuários.
          </Paragraph>
        </Subsection>

        <Subsection title="5. Armazenamento e Segurança dos Dados">
  <Paragraph>
    Os dados são armazenados em servidores seguros, com práticas de segurança da informação compatíveis com os padrões de mercado:
  </Paragraph>
  <ListItems items={[
    "Criptografia de dados sensíveis;",
    "Backups diários;",
    "Acesso restrito com autenticação;",
    "Monitoramento de acessos e logs."
  ]} />
  <Paragraph>
    A CLAIRIS adota medidas para prevenir acessos não autorizados, destruição, perda, alteração, comunicação ou qualquer forma de tratamento inadequado ou ilícito.
  </Paragraph>
</Subsection>

<Subsection title="6. Direitos do Titular de Dados">
  <Paragraph>
    De acordo com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/18), os usuários têm os seguintes direitos:
  </Paragraph>
  <ListItems items={[
    "Confirmação da existência do tratamento;",
    "Acesso aos dados;",
    "Correção de dados incompletos, inexatos ou desatualizados;",
    "Anonimização, bloqueio ou eliminação de dados desnecessários;",
    "Portabilidade dos dados;",
    "Eliminação dos dados tratados com consentimento;",
    "Informações sobre compartilhamento;",
    "Revogação do consentimento."
  ]} />
  <Paragraph>
    Para exercer esses direitos, o usuário poderá entrar em contato pelo e-mail: <strong>financeiro@clairis.com.br</strong>.
  </Paragraph>
</Subsection>

<Subsection title="7. Retenção de Dados">
  <Paragraph>
    Os dados dos usuários e pacientes serão armazenados enquanto a conta estiver ativa. Caso o usuário solicite o cancelamento e a exclusão de dados, a CLAIRIS procederá com a exclusão definitiva, exceto nos casos em que houver obrigação legal de retenção.
  </Paragraph>
</Subsection>

<Subsection title="8. Responsabilidades do Usuário">
  <Paragraph>
    O usuário é o único responsável pelas informações inseridas no sistema e pela segurança de seu login e senha. A CLAIRIS não se responsabiliza por acessos indevidos causados por negligência do próprio usuário.
  </Paragraph>
</Subsection>

<Subsection title="9. Cookies e Tecnologias de Rastreamento">
  <Paragraph>
    O site e o sistema CLAIRIS poderão utilizar cookies e outras tecnologias de rastreamento para:
  </Paragraph>
  <ListItems items={[
    "Melhorar a experiência de navegação;",
    "Medir audiência;",
    "Personalizar conteúdo;",
    "Direcionar campanhas de marketing."
  ]} />
  <Paragraph>
    O usuário pode controlar o uso de cookies diretamente no navegador.
  </Paragraph>
</Subsection>

<Subsection title="10. Alterações na Política de Privacidade">
  <Paragraph>
    Esta política poderá ser atualizada periodicamente. A versão atual estará sempre disponível no site da CLAIRIS. Recomendamos que o usuário revise este documento regularmente.
  </Paragraph>
  <Paragraph>
    Em caso de mudanças significativas, notificaremos os usuários por e-mail ou dentro da própria plataforma.
  </Paragraph>
</Subsection>

<Subsection title="11. Contato">
  <Paragraph>
    Em caso de dúvidas, solicitações ou reclamações, entre em contato com nosso Encarregado de Proteção de Dados (DPO):
  </Paragraph>
  <Paragraph>
    📧 <strong>financeiro@clairis.com.br</strong><br />
    📍 CLAIRIS SOFTWARE – CNPJ: 61.051.560/0001-60<br />
    Rua Alagoas Tocantins, 125 – sala 1401 – Barueri/SP – CEP 06455-020
  </Paragraph>
</Subsection>

      </Section>

      <Divider sx={{ my: 6 }} />

      <Section title="Termos e Condições de Uso do Software Clairis">
        <Paragraph>
          Estes são os termos que determinarão o nosso relacionamento. Este contrato refere-se ao sistema CLAIRIS, abrangendo qualquer uma de suas versões.
        </Paragraph>
        <Paragraph>
          Ao aceitar eletronicamente o presente Termo, clicando no botão de CADASTRO E CONTRATAÇÃO, o USUÁRIO estará automaticamente aderindo e concordando em se submeter integralmente às condições aqui previstas, bem como às políticas e futuras alterações, além de aceitar as disposições contidas na Política de Privacidade.
        </Paragraph>

        <Subsection title="Objeto do Termo">
          <Paragraph>
            Este termo regula o uso da plataforma Clairis, um software voltado à gestão de clínicas e consultórios, sendo de propriedade intelectual da Clairis Tecnologia.
          </Paragraph>
          <Paragraph>
            O uso do sistema requer a criação de uma conta pelo USUÁRIO (administrador), mediante fornecimento de dados verdadeiros e a seleção de um dos planos disponíveis, com pagamento via cartão de crédito ou PIX.
          </Paragraph>
        </Subsection>

      </Section>

      <Divider sx={{ my: 6 }} />

      <Section title="Responsabilidade Técnica e Conformidade com a LGPD">
  <Paragraph>
    A Clairis declara que adota medidas técnicas e administrativas adequadas para garantir a conformidade de seu sistema com os princípios e exigências da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 – LGPD), especialmente no que diz respeito à segurança, integridade, e tratamento responsável de dados pessoais e sensíveis.
  </Paragraph>
  <Paragraph>
    A responsabilidade técnica pela arquitetura, desenvolvimento, segurança da informação e implementação de práticas de conformidade com a LGPD é exercida por <strong>Carlos Inácio</strong>, Engenheiro de Software formado pela <strong>Universidade PUC MINAS</strong>, atual CTO da Clairis, e responsável técnico pelo sistema.
  </Paragraph>
  <Paragraph>
    O Eng. <strong>Carlos Inácio</strong>, atuando na cidade de <strong>São Paulo</strong>, com e-mail de contato profissional <strong>carlos.inacio@clairis.com.br</strong>, implementou o sistema conforme os princípios de <em>Privacy by Design</em> e <em>Privacy by Default</em>, garantindo:
  </Paragraph>
    <ListItems items={[
    "Criptografia e proteção de dados sensíveis;",
    "Registro de logs e auditoria;",
    "Minimização e anonimização de dados pessoais;",
    "Mecanismos para gestão de consentimento e atendimento de direitos dos titulares."
  ]} />
  <Paragraph>
    Essa atuação técnica está fundamentada na Lei nº 13.709/2018 (LGPD) e na Medida Provisória nº 2.200-2/2001, que reconhecem a validade jurídica de documentos eletrônicos, registros digitais e assinaturas feitas em meios eletrônicos, desde que garantam autenticidade, integridade e concordância entre as partes.
  </Paragraph>
</Section>
    </Container>
  );
};

// Componentes auxiliares
const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <Box mb={5}>
    <Typography variant="h5" fontWeight="bold" gutterBottom>
      {title}
    </Typography>
    {children}
  </Box>
);

const Subsection = ({ title, children }: { title: string; children: ReactNode }) => (
  <Box mt={3} mb={2}>
    <Typography variant="h6" fontWeight="medium" gutterBottom>
      {title}
    </Typography>
    {children}
  </Box>
);

const Paragraph = ({ children }: { children: ReactNode }) => (
  <Typography variant="body1" paragraph>
    {children}
  </Typography>
);

const ListItems = ({ items }: { items: string[] }) => (
  <Box component="ul" sx={{ pl: 3 }}>
    {items.map((item, index) => (
      <li key={index}>
        <Typography variant="body2">{item}</Typography>
      </li>
    ))}
  </Box>
);

PoliticaPrivacidade.guestGuard = true;
PoliticaPrivacidade.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>;

export default PoliticaPrivacidade;
