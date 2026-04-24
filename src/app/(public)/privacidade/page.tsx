import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Markup Incorporações",
  description:
    "Política de Privacidade da Markup Incorporações. Saiba como coletamos, utilizamos e protegemos seus dados pessoais.",
};

const LOGO_SRC = "/assets/logo.png";

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "var(--font-playfair)",
  fontSize: "24px",
  color: "#1a1a1a",
  fontWeight: 400,
  marginTop: "48px",
  marginBottom: "16px",
};

const paragraphStyle: React.CSSProperties = {
  fontFamily: "var(--font-inter)",
  fontSize: "15px",
  lineHeight: 1.8,
  color: "#444444",
  marginBottom: "16px",
};

const listStyle: React.CSSProperties = {
  fontFamily: "var(--font-inter)",
  fontSize: "15px",
  lineHeight: 1.8,
  color: "#444444",
  marginBottom: "16px",
  paddingLeft: "24px",
};

export default function PrivacidadePage() {
  return (
    <>
      <Navbar logoSrc={LOGO_SRC} />

      {/* Hero */}
      <section
        style={{
          backgroundColor: "#1a1a1a",
          paddingTop: "160px",
          paddingBottom: "80px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "40px",
            color: "#ffffff",
            fontWeight: 400,
            marginBottom: "16px",
          }}
        >
          Política de Privacidade
        </h1>
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "14px",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Última atualização: Março 2026
        </p>
      </section>

      {/* Content */}
      <section style={{ backgroundColor: "#ffffff", padding: "80px 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {/* Introdução */}
          <h2 style={sectionTitleStyle}>1. Introdução</h2>
          <p style={paragraphStyle}>
            A Markup Incorporações LTDA, inscrita no CNPJ sob o número [a
            definir], com sede na cidade de Maceió, Estado de Alagoas, está
            comprometida com a proteção da privacidade e dos dados pessoais de
            seus usuários, em conformidade com a Lei Geral de Proteção de Dados
            Pessoais (LGPD — Lei nº 13.709/2018) e demais legislações
            aplicáveis.
          </p>
          <p style={paragraphStyle}>
            Esta Política de Privacidade descreve como coletamos, utilizamos,
            armazenamos e compartilhamos as informações pessoais dos usuários que
            acessam nosso site e utilizam nossos serviços.
          </p>

          {/* Dados coletados */}
          <h2 style={sectionTitleStyle}>2. Dados Coletados</h2>
          <p style={paragraphStyle}>
            Podemos coletar os seguintes dados pessoais durante sua interação
            com nosso site:
          </p>

          <h3
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "16px",
              fontWeight: 600,
              color: "#1a1a1a",
              marginBottom: "8px",
              marginTop: "24px",
            }}
          >
            Formulários do site
          </h3>
          <ul style={listStyle}>
            <li>Nome completo</li>
            <li>Endereço de e-mail</li>
            <li>Número de telefone</li>
            <li>Mensagem enviada</li>
          </ul>

          <h3
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "16px",
              fontWeight: 600,
              color: "#1a1a1a",
              marginBottom: "8px",
              marginTop: "24px",
            }}
          >
            Newsletter
          </h3>
          <ul style={listStyle}>
            <li>Endereço de e-mail</li>
          </ul>

          <h3
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "16px",
              fontWeight: 600,
              color: "#1a1a1a",
              marginBottom: "8px",
              marginTop: "24px",
            }}
          >
            Cadastro na Área do Corretor
          </h3>
          <ul style={listStyle}>
            <li>Nome completo</li>
            <li>Endereço de e-mail</li>
            <li>Número de telefone</li>
            <li>CPF (usado como credencial de login)</li>
            <li>Número do CRECI (para identificação profissional)</li>
            <li>Registro de acessos aos materiais (data e material acessado)</li>
          </ul>
          <p style={paragraphStyle}>
            O CPF é utilizado exclusivamente para autenticação na Área do
            Corretor. Esses dados são armazenados de forma segura no Supabase
            e jamais são compartilhados com terceiros.
          </p>

          <h3
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "16px",
              fontWeight: 600,
              color: "#1a1a1a",
              marginBottom: "8px",
              marginTop: "24px",
            }}
          >
            Cookies e tecnologias de rastreamento
          </h3>
          <ul style={listStyle}>
            <li>Google Analytics</li>
            <li>Google Tag Manager</li>
            <li>Meta Pixel (Facebook)</li>
          </ul>

          <h3
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "16px",
              fontWeight: 600,
              color: "#1a1a1a",
              marginBottom: "8px",
              marginTop: "24px",
            }}
          >
            Dados de navegação
          </h3>
          <ul style={listStyle}>
            <li>Endereço IP</li>
            <li>Tipo de navegador e dispositivo</li>
            <li>Páginas visitadas e tempo de permanência</li>
          </ul>

          <h3
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "16px",
              fontWeight: 600,
              color: "#1a1a1a",
              marginBottom: "8px",
              marginTop: "24px",
            }}
          >
            Dados de campanhas publicitárias
          </h3>
          <ul style={listStyle}>
            <li>Parâmetros UTM (origem, mídia, campanha)</li>
            <li>Origem do tráfego (Google Ads, Meta Ads)</li>
          </ul>

          {/* Finalidade */}
          <h2 style={sectionTitleStyle}>3. Finalidade do Uso dos Dados</h2>
          <p style={paragraphStyle}>
            Os dados pessoais coletados são utilizados para as seguintes
            finalidades:
          </p>
          <ul style={listStyle}>
            <li>
              Contato comercial sobre empreendimentos imobiliários da Markup
              Incorporações
            </li>
            <li>
              Envio de newsletter e comunicações de marketing sobre novidades,
              lançamentos e oportunidades de investimento
            </li>
            <li>
              Remarketing e publicidade direcionada por meio do Google Ads e Meta
              Ads (Facebook e Instagram)
            </li>
            <li>
              Análise de performance de campanhas publicitárias e otimização de
              investimentos em mídia
            </li>
            <li>
              Melhoria contínua da experiência do usuário no site
            </li>
            <li>
              Autenticação e fornecimento de materiais de divulgação na Área do
              Corretor
            </li>
            <li>
              Registro de acessos aos materiais na Área do Corretor para fins
              de análise interna
            </li>
          </ul>

          {/* Compartilhamento */}
          <h2 style={sectionTitleStyle}>4. Compartilhamento de Dados</h2>
          <p style={paragraphStyle}>
            Seus dados pessoais podem ser compartilhados com os seguintes
            terceiros, estritamente para as finalidades descritas nesta política:
          </p>
          <ul style={listStyle}>
            <li>
              <strong>Google</strong> — Google Analytics 4 (análise de tráfego) e
              Google Ads (remarketing e conversão de campanhas)
            </li>
            <li>
              <strong>Meta</strong> — Facebook Pixel e Instagram Ads (remarketing
              e análise de conversões)
            </li>
            <li>
              <strong>Supabase</strong> — Armazenamento seguro de dados e
              informações do site
            </li>
            <li>
              <strong>Parceiros comerciais imobiliários</strong> — Quando
              necessário para o atendimento de sua solicitação comercial
            </li>
          </ul>
          <p style={paragraphStyle}>
            Não vendemos, alugamos ou comercializamos seus dados pessoais para
            terceiros não relacionados às finalidades acima descritas.
          </p>

          {/* Cookies */}
          <h2 style={sectionTitleStyle}>5. Cookies</h2>
          <p style={paragraphStyle}>
            Nosso site utiliza cookies para melhorar a experiência de navegação e
            para fins analíticos e de marketing. Os cookies utilizados são:
          </p>
          <ul style={listStyle}>
            <li>
              <strong>Cookies essenciais</strong> — Necessários para o
              funcionamento básico do site, como preferências de sessão e
              segurança
            </li>
            <li>
              <strong>Cookies de analytics (Google Analytics 4)</strong> —
              Utilizados para entender como os visitantes interagem com o site,
              coletar dados estatísticos e melhorar a experiência do usuário
            </li>
            <li>
              <strong>Cookies de marketing (Meta Pixel e Google Ads)</strong> —
              Utilizados para rastrear conversões de campanhas publicitárias,
              criar audiências de remarketing e exibir anúncios personalizados
              em plataformas de terceiros
            </li>
          </ul>
          <p style={paragraphStyle}>
            Você pode gerenciar suas preferências de cookies por meio das
            configurações do seu navegador. A desativação de determinados cookies
            pode afetar a funcionalidade do site.
          </p>

          {/* Direitos */}
          <h2 style={sectionTitleStyle}>6. Direitos do Titular</h2>
          <p style={paragraphStyle}>
            Em conformidade com a LGPD, você, como titular dos dados, possui os
            seguintes direitos:
          </p>
          <ul style={listStyle}>
            <li>
              <strong>Acesso</strong> — Solicitar informações sobre os dados
              pessoais que possuímos sobre você
            </li>
            <li>
              <strong>Correção</strong> — Solicitar a correção de dados
              incompletos, inexatos ou desatualizados
            </li>
            <li>
              <strong>Exclusão</strong> — Solicitar a eliminação dos seus dados
              pessoais tratados com base no seu consentimento
            </li>
            <li>
              <strong>Portabilidade</strong> — Solicitar a portabilidade dos seus
              dados a outro fornecedor de serviço
            </li>
            <li>
              <strong>Revogação de consentimento</strong> — Retirar seu
              consentimento a qualquer momento, sem comprometer a licitude do
              tratamento realizado anteriormente
            </li>
          </ul>
          <p style={paragraphStyle}>
            Para exercer qualquer um desses direitos, entre em contato conosco
            pelo e-mail indicado na seção de contato abaixo.
          </p>

          {/* DPO */}
          <h2 style={sectionTitleStyle}>
            7. Encarregado de Proteção de Dados (DPO)
          </h2>
          <p style={paragraphStyle}>
            Para questões relacionadas à privacidade e proteção de dados
            pessoais, entre em contato com nosso Encarregado de Proteção de
            Dados:
          </p>
          <p style={paragraphStyle}>
            <strong>E-mail:</strong>{" "}
            <a
              href="mailto:comercial@markupinc.com.br"
              style={{ color: "#1CB8E8", textDecoration: "none" }}
            >
              comercial@markupinc.com.br
            </a>
          </p>

          {/* Alterações */}
          <h2 style={sectionTitleStyle}>8. Alterações nesta Política</h2>
          <p style={paragraphStyle}>
            A Markup Incorporações reserva-se o direito de atualizar esta
            Política de Privacidade a qualquer momento, visando adequá-la a
            alterações legislativas, regulatórias ou em nossas práticas internas.
            Recomendamos que você consulte esta página periodicamente para se
            manter informado sobre eventuais mudanças.
          </p>
          <p style={paragraphStyle}>
            A continuidade do uso do site após a publicação de alterações nesta
            política constitui a aceitação das mesmas.
          </p>
        </div>
      </section>

      <Footer logoSrc={LOGO_SRC} />
      <WhatsAppButton />
    </>
  );
}
