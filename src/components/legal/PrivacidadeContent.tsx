const Section = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
  <section>
    <h2 className="font-heading text-lg font-semibold text-white mb-3">{n}) {title}</h2>
    <div className="space-y-2">{children}</div>
  </section>
);

export const PrivacidadeContent = () => (
  <>
    <Section n="1" title="Responsável pelo tratamento">
      <p><strong className="text-white/90">Fomentar Sonhos, Lda.</strong></p>
      <p>NIF: 514177594</p>
      <p>Morada: Rua da Carvalha, Leiria, Portugal</p>
      <p>E-mail: <span className="text-blue-400">frederico.carvalho@digitalfc.pt</span></p>
      <p>Telefone/WhatsApp: +351 915 015 508</p>
    </Section>

    <Section n="2" title="Dados pessoais recolhidos">
      <p>No âmbito da inscrição e participação no Webinar "Cria Imagens Profissionais com IA", são recolhidos os seguintes dados pessoais:</p>
      <ul className="list-disc list-inside space-y-1 mt-2">
        <li>Nome (primeiro e último)</li>
        <li>Endereço de e-mail</li>
        <li>Número de telefone/WhatsApp (quando fornecido voluntariamente)</li>
        <li>Dados de navegação e interação com o site (cookies, IP, dispositivo)</li>
        <li>Dados de pagamento (quando aplicável, processados por entidades terceiras)</li>
      </ul>
    </Section>

    <Section n="3" title="Finalidades do tratamento">
      <p>Os dados pessoais são tratados para as seguintes finalidades:</p>
      <ul className="list-disc list-inside space-y-1 mt-2">
        <li>Gestão da inscrição e participação no evento</li>
        <li>Envio de comunicações relacionadas com o evento (lembretes, acessos, materiais)</li>
        <li>Envio de comunicações de marketing sobre conteúdos, produtos e serviços do Frederico Carvalho / DIGITALFC</li>
        <li>Processamento de pagamentos (quando aplicável)</li>
        <li>Melhoria da experiência do utilizador no site</li>
        <li>Cumprimento de obrigações legais e fiscais</li>
      </ul>
    </Section>

    <Section n="4" title="Base legal do tratamento">
      <p>O tratamento de dados pessoais baseia-se nas seguintes bases legais:</p>
      <ul className="list-disc list-inside space-y-1 mt-2">
        <li><strong className="text-white/90">Consentimento</strong> — para o envio de comunicações de marketing</li>
        <li><strong className="text-white/90">Execução de contrato</strong> — para a gestão da inscrição e participação no evento</li>
        <li><strong className="text-white/90">Interesse legítimo</strong> — para melhoria dos serviços e análise de utilização</li>
        <li><strong className="text-white/90">Obrigação legal</strong> — para cumprimento de obrigações fiscais e legais</li>
      </ul>
    </Section>

    <Section n="5" title="Partilha de dados com terceiros">
      <p>Os dados pessoais podem ser partilhados com as seguintes categorias de entidades:</p>
      <ul className="list-disc list-inside space-y-1 mt-2">
        <li>Plataformas de email marketing (ex.: E-goi) para envio de comunicações</li>
        <li>Plataformas de pagamento (ex.: EuPago) para processamento de transações</li>
        <li>Plataformas de alojamento e infraestrutura tecnológica</li>
        <li>Autoridades fiscais e legais, quando exigido por lei</li>
      </ul>
      <p className="mt-2">Não são vendidos dados pessoais a terceiros.</p>
    </Section>

    <Section n="6" title="Transferências internacionais">
      <p>Alguns dos serviços utilizados podem implicar transferência de dados para fora do Espaço Económico Europeu (EEE). Nesses casos, são adotadas as medidas adequadas para garantir a proteção dos dados, nomeadamente cláusulas contratuais-tipo aprovadas pela Comissão Europeia.</p>
    </Section>

    <Section n="7" title="Período de conservação">
      <p>Os dados pessoais são conservados durante o período necessário para as finalidades para que foram recolhidos:</p>
      <ul className="list-disc list-inside space-y-1 mt-2">
        <li>Dados de inscrição: durante a relação comercial e até 2 anos após a última interação</li>
        <li>Dados de pagamento e faturação: durante o período legalmente exigido (mínimo 10 anos)</li>
        <li>Dados de marketing: até à retirada do consentimento</li>
      </ul>
    </Section>

    <Section n="8" title="Direitos do titular dos dados">
      <p>Nos termos do RGPD, o titular dos dados tem os seguintes direitos:</p>
      <ul className="list-disc list-inside space-y-1 mt-2">
        <li><strong className="text-white/90">Acesso</strong> — solicitar informação sobre os dados tratados</li>
        <li><strong className="text-white/90">Retificação</strong> — corrigir dados inexatos ou incompletos</li>
        <li><strong className="text-white/90">Apagamento</strong> — solicitar a eliminação dos dados (quando aplicável)</li>
        <li><strong className="text-white/90">Limitação</strong> — restringir o tratamento em certas circunstâncias</li>
        <li><strong className="text-white/90">Portabilidade</strong> — receber os dados num formato estruturado</li>
        <li><strong className="text-white/90">Oposição</strong> — opor-se ao tratamento para fins de marketing direto</li>
        <li><strong className="text-white/90">Retirada do consentimento</strong> — a qualquer momento, sem comprometer a licitude do tratamento anterior</li>
      </ul>
      <p className="mt-2">Para exercer qualquer destes direitos, contacte: <span className="text-blue-400">frederico.carvalho@digitalfc.pt</span></p>
    </Section>

    <Section n="9" title="Cookies">
      <p>O site utiliza cookies para melhorar a experiência de navegação e para fins analíticos e de marketing. Os cookies utilizados incluem:</p>
      <ul className="list-disc list-inside space-y-1 mt-2">
        <li><strong className="text-white/90">Essenciais</strong> — necessários para o funcionamento do site</li>
        <li><strong className="text-white/90">Analíticos</strong> — para compreender como os visitantes utilizam o site</li>
        <li><strong className="text-white/90">Marketing</strong> — para personalizar anúncios e medir campanhas (ex.: Meta Pixel)</li>
      </ul>
      <p className="mt-2">O utilizador pode gerir as preferências de cookies através das definições do browser.</p>
    </Section>

    <Section n="10" title="Segurança dos dados">
      <p>São adotadas medidas técnicas e organizativas adequadas para proteger os dados pessoais contra acessos não autorizados, perda, destruição ou alteração, incluindo encriptação, controlo de acessos e monitorização.</p>
    </Section>

    <Section n="11" title="Alterações à Política de Privacidade">
      <p>Esta Política de Privacidade pode ser atualizada a qualquer momento. A versão vigente é a publicada no site na data de cada visita/interação. Alterações significativas serão comunicadas por e-mail quando possível.</p>
    </Section>

    <Section n="12" title="Reclamações">
      <p>Sem prejuízo de qualquer outro recurso, o titular dos dados tem o direito de apresentar reclamação junto da Comissão Nacional de Proteção de Dados (CNPD): <span className="text-blue-400">www.cnpd.pt</span></p>
    </Section>

    <Section n="13" title="Contacto">
      <p>Para questões relacionadas com a proteção de dados pessoais:</p>
      <p><span className="text-blue-400">frederico.carvalho@digitalfc.pt</span> | +351 915 015 508 (WhatsApp)</p>
    </Section>
  </>
);
