import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | Markup Incorporações",
  description:
    "Termos de Uso do site da Markup Incorporações. Conheça as condições de uso e responsabilidades ao acessar nosso site.",
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

export default function TermosPage() {
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
          Termos de Uso
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
          {/* Aceitação */}
          <h2 style={sectionTitleStyle}>1. Aceitação dos Termos</h2>
          <p style={paragraphStyle}>
            Ao acessar e utilizar o site da Markup Incorporações, você declara
            que leu, compreendeu e concorda integralmente com os presentes Termos
            de Uso. Caso não concorde com qualquer disposição aqui prevista,
            solicitamos que não utilize o site.
          </p>
          <p style={paragraphStyle}>
            Estes termos aplicam-se a todos os visitantes, usuários e demais
            pessoas que acessem ou utilizem o site.
          </p>

          {/* Uso do site */}
          <h2 style={sectionTitleStyle}>2. Uso do Site</h2>
          <p style={paragraphStyle}>
            Este site tem caráter exclusivamente informativo sobre os
            empreendimentos imobiliários desenvolvidos pela Markup Incorporações.
            As informações aqui disponibilizadas não constituem oferta formal,
            proposta comercial vinculante ou compromisso de venda.
          </p>
          <p style={paragraphStyle}>
            O usuário compromete-se a utilizar o site de forma adequada, em
            conformidade com a legislação vigente, estes Termos de Uso e os bons
            costumes, abstendo-se de utilizá-lo para fins ilícitos ou que possam
            causar danos à Markup Incorporações ou a terceiros.
          </p>

          {/* Propriedade intelectual */}
          <h2 style={sectionTitleStyle}>3. Propriedade Intelectual</h2>
          <p style={paragraphStyle}>
            Todo o conteúdo presente neste site, incluindo, mas não se limitando
            a, textos, imagens, renders, fotografias, vídeos, logotipos, marcas,
            layouts, design gráfico e demais elementos visuais, é de propriedade
            exclusiva da Markup Incorporações ou de seus licenciadores, sendo
            protegido pela legislação brasileira de direitos autorais e
            propriedade intelectual.
          </p>
          <p style={paragraphStyle}>
            É vedada a reprodução, distribuição, modificação, exibição pública ou
            qualquer forma de utilização do conteúdo deste site sem autorização
            prévia e expressa da Markup Incorporações.
          </p>

          {/* Formulários e leads */}
          <h2 style={sectionTitleStyle}>4. Formulários e Dados de Contato</h2>
          <p style={paragraphStyle}>
            Os dados pessoais enviados por meio dos formulários disponíveis no
            site serão utilizados exclusivamente para fins de contato comercial
            relacionado aos empreendimentos da Markup Incorporações, em
            conformidade com a nossa{" "}
            <a
              href="/privacidade"
              style={{ color: "#1CB8E8", textDecoration: "none" }}
            >
              Política de Privacidade
            </a>
            .
          </p>
          <p style={paragraphStyle}>
            O usuário declara que as informações fornecidas nos formulários são
            verdadeiras, exatas e atualizadas, responsabilizando-se por
            eventuais imprecisões.
          </p>

          {/* Precisão das informações */}
          <h2 style={sectionTitleStyle}>5. Precisão das Informações</h2>
          <p style={paragraphStyle}>
            As imagens de empreendimentos apresentadas no site são ilustrativas,
            compostas por renders arquitetônicos e representações artísticas, e
            podem não refletir fielmente o produto final entregue.
          </p>
          <p style={paragraphStyle}>
            As plantas, especificações técnicas e áreas indicadas podem sofrer
            alterações sem aviso prévio, em decorrência de ajustes de projeto,
            exigências legais ou técnicas construtivas.
          </p>
          <p style={paragraphStyle}>
            Valores, condições de pagamento e disponibilidade de unidades estão
            sujeitos a confirmação direta com a equipe comercial da Markup
            Incorporações, não sendo garantidos pelas informações publicadas no
            site.
          </p>

          {/* Links externos */}
          <h2 style={sectionTitleStyle}>6. Links para Sites de Terceiros</h2>
          <p style={paragraphStyle}>
            Este site pode conter links para sites de terceiros, fornecidos
            exclusivamente para conveniência do usuário. A Markup Incorporações
            não se responsabiliza pelo conteúdo, políticas de privacidade ou
            práticas de sites de terceiros. O acesso a esses sites é de inteira
            responsabilidade do usuário.
          </p>

          {/* Limitação de responsabilidade */}
          <h2 style={sectionTitleStyle}>7. Limitação de Responsabilidade</h2>
          <p style={paragraphStyle}>
            A Markup Incorporações não garante a disponibilidade ininterrupta ou
            livre de erros do site. O site é fornecido &ldquo;como está&rdquo; e
            &ldquo;conforme disponível&rdquo;, sem garantias de qualquer
            natureza, expressas ou implícitas.
          </p>
          <p style={paragraphStyle}>
            A Markup Incorporações não será responsável por quaisquer danos
            diretos, indiretos, incidentais, consequenciais ou punitivos
            decorrentes do uso ou da impossibilidade de uso do site.
          </p>

          {/* Campanhas publicitárias */}
          <h2 style={sectionTitleStyle}>8. Campanhas Publicitárias</h2>
          <p style={paragraphStyle}>
            Ofertas, condições especiais e promoções divulgadas em campanhas
            publicitárias realizadas por meio do Google Ads, Meta Ads (Facebook e
            Instagram) ou quaisquer outros canais de mídia digital são válidas
            exclusivamente conforme o período especificado na respectiva
            campanha.
          </p>
          <p style={paragraphStyle}>
            Condições promocionais não se acumulam com outras ofertas e estão
            sujeitas a disponibilidade. A Markup Incorporações reserva-se o
            direito de encerrar ou modificar qualquer campanha a qualquer
            momento, sem aviso prévio.
          </p>

          {/* Legislação */}
          <h2 style={sectionTitleStyle}>
            9. Legislação Aplicável e Foro
          </h2>
          <p style={paragraphStyle}>
            Estes Termos de Uso são regidos e interpretados de acordo com as leis
            da República Federativa do Brasil. Fica eleito o foro da comarca de
            Maceió, Estado de Alagoas, como competente para dirimir quaisquer
            controvérsias ou litígios oriundos da utilização deste site, com
            renúncia expressa a qualquer outro, por mais privilegiado que seja.
          </p>

          {/* Contato */}
          <h2 style={sectionTitleStyle}>10. Contato</h2>
          <p style={paragraphStyle}>
            Em caso de dúvidas sobre estes Termos de Uso, entre em contato
            conosco:
          </p>
          <p style={paragraphStyle}>
            <strong>Markup Incorporações LTDA</strong>
            <br />
            Empresarial Ocean Tower - Tv. Dr. Antônio Gouveia, 61 - Pajuçara,
            Maceió - AL, 57030-170, Sala 307
            <br />
            <strong>E-mail:</strong>{" "}
            <a
              href="mailto:comercial@markupinc.com.br"
              style={{ color: "#1CB8E8", textDecoration: "none" }}
            >
              comercial@markupinc.com.br
            </a>
          </p>
        </div>
      </section>

      <Footer logoSrc={LOGO_SRC} />
      <WhatsAppButton />
    </>
  );
}
