const Section = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
  <section>
    <h2 className="font-heading text-lg font-semibold text-white mb-3">{n}) {title}</h2>
    <div className="space-y-2">{children}</div>
  </section>
);

export const TermosContent = () => (
  <>
    <Section n="1" title="Identificação e âmbito">
      <p>Os presentes Termos e Condições regulam o acesso e a participação no Webinar "Cria Imagens Profissionais com IA", bem como a aquisição de produtos associados (ex.: Premium Pass e/ou outros upsells), promovidos pela:</p>
      <ul className="list-none space-y-1 mt-3">
        <li><strong className="text-white/90">Fomentar Sonhos, Lda.</strong> (ou denominação fiscal aplicável)</li>
        <li>NIF: 514177594</li>
        <li>Morada: Rua da Carvalha, Leiria, Portugal</li>
        <li>E-mail: <span className="text-blue-400">frederico.carvalho@digitalfc.pt</span></li>
        <li>Telefone/WhatsApp: +351 915 015 508</li>
      </ul>
      <p className="mt-3">Ao inscrever-se e/ou ao adquirir qualquer produto associado ao evento, considera-se que foi lido e aceite o presente documento.</p>
      <p>A organização pode atualizar estes Termos e Condições a qualquer momento. A versão aplicável é a que estiver publicada na data da inscrição/compra.</p>
    </Section>

    <Section n="2" title="Descrição do evento">
      <p>O Webinar é um evento online, com transmissão ao vivo, em data e hora anunciadas na página do evento.</p>
      <p>O acesso poderá ser realizado via plataforma de terceiros (ex.: Zoom, YouTube ou equivalente), conforme decisão da organização, comunicada por e-mail aos inscritos.</p>
      <p>A organização envidará os melhores esforços para garantir qualidade de transmissão, não podendo, contudo, garantir ausência total de interrupções por motivos técnicos alheios (ex.: falhas de internet, plataforma, energia, etc.).</p>
    </Section>

    <Section n="3" title="Data, hora e acesso">
      <p>Data e hora previstas: 18 de fevereiro de 2026, 10h00 (Portugal), salvo indicação em contrário na página oficial.</p>
      <p>O link de acesso ao evento é disponibilizado por e-mail e/ou na área/página de transmissão, próximo da data do evento.</p>
      <p>Recomenda-se que o participante confirme previamente o funcionamento do dispositivo, ligação à internet e browser.</p>
    </Section>

    <Section n="4" title="Inscrição gratuita">
      <p>A inscrição no Webinar gratuito é feita através do site oficial do evento.</p>
      <p>A inscrição não garante, por si só, acesso a conteúdos pagos (Premium Pass, masterclasses, gravações, guias), os quais dependem de compra separada quando aplicável.</p>
    </Section>

    <Section n="5" title="Produtos pagos (Premium Pass e outros)">
      <p>Poderão existir produtos pagos associados ao evento (ex.: Premium Pass 15€ + IVA, masterclass, gravação, materiais).</p>
      <p>As condições comerciais (preço, conteúdo, datas, acesso e entrega) são as indicadas na respetiva página de compra no momento da aquisição.</p>
      <p>A fatura/recibo é emitida com base nos dados fornecidos no momento da compra. É responsabilidade do adquirente garantir que os dados fiscais estão corretos.</p>
    </Section>

    <Section n="6" title="Reembolsos e direito de livre resolução">
      <p>Quando aplicável, a compra pode enquadrar-se numa prestação de serviços com data específica (evento) e/ou em conteúdos digitais, podendo existir exceções legais ao direito de livre resolução, nos termos da lei.</p>
      <p>Caso existam condições específicas de reembolso (por exemplo, cancelamento do evento pela organização), estas serão comunicadas por e-mail e/ou publicadas na página do evento.</p>
      <p>Para pedidos de esclarecimento sobre reembolsos e faturação deve ser usado o contacto: <span className="text-blue-400">frederico.carvalho@digitalfc.pt</span>.</p>
    </Section>

    <Section n="7" title="Regras de participação e conduta">
      <p>É exigido comportamento respeitador e adequado. Não é tolerado assédio, linguagem ofensiva, discriminação, agressividade ou perturbação deliberada do evento.</p>
      <p>A organização pode suspender o acesso do participante em caso de violação destas regras, sem obrigação de reembolso quando aplicável.</p>
    </Section>

    <Section n="8" title="Gravação, imagem e voz">
      <p>O evento poderá ser gravado. Ao participar, o participante reconhece que poderá surgir em gravações (ex.: perguntas em chat/voz, intervenções), dependendo da forma de participação.</p>
      <p>Caso a organização pretenda utilizar excertos com fins promocionais (ex.: testemunhos, imagens do evento), poderá fazê-lo de forma proporcional e respeitando a legislação aplicável. Sempre que aplicável, o participante poderá opor-se através dos contactos indicados.</p>
    </Section>

    <Section n="9" title="Propriedade intelectual e utilização de conteúdos">
      <p>Todos os materiais do evento (slides, guias, prompts, gravações, textos e recursos) estão protegidos por direitos de autor e/ou direitos conexos.</p>
      <p>Não é permitida a gravação, reprodução, distribuição, venda, partilha pública ou disponibilização a terceiros (incluindo grupos, drive, plataformas) sem autorização escrita da organização.</p>
      <p>O acesso é pessoal e intransmissível, salvo autorização expressa da organização.</p>
    </Section>

    <Section n="10" title="Proteção de dados">
      <p>O tratamento de dados pessoais é regulado pela Política de Privacidade publicada no site do evento.</p>
      <p>Ao inscrever-se, o titular aceita o tratamento de dados para gestão do evento e comunicações associadas, nos termos indicados nessa Política.</p>
    </Section>

    <Section n="11" title="Lei aplicável e resolução de litígios">
      <p>Aplica-se a lei portuguesa.</p>
      <p>Em caso de litígio, as partes procurarão uma solução extrajudicial. Sem prejuízo, é competente a jurisdição portuguesa.</p>
      <p>Informação sobre resolução alternativa de litígios (RAL), quando aplicável, pode ser disponibilizada mediante pedido por e-mail.</p>
    </Section>

    <Section n="12" title="Contacto">
      <p>Para questões relacionadas com o evento, pagamentos, suporte e dados pessoais:</p>
      <p><span className="text-blue-400">frederico.carvalho@digitalfc.pt</span> | +351 915 015 508 (WhatsApp)</p>
    </Section>
  </>
);
