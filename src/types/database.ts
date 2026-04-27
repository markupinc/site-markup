export type CampoTipo =
  | "texto"
  | "textarea"
  | "numero"
  | "selecao_unica"
  | "multipla_escolha"
  | "select";

export interface CampoFormulario {
  id: string;
  tipo: CampoTipo;
  label: string;
  obrigatorio: boolean;
  placeholder?: string;
  opcoes?: string[];
  ordem: number;
  // Lógica condicional: só mostra se outro campo tiver determinado valor
  condicao?: {
    campo_id: string;
    valor: string;
  };
}

export type RespostasFormulario = Record<string, string | string[]>;

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string;
          nome: string;
          email: string;
          role: "admin" | "editor";
          created_at: string;
        };
        Insert: {
          id: string;
          nome: string;
          email: string;
          role?: "admin" | "editor";
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          role?: "admin" | "editor";
          created_at?: string;
        };
      };
      empreendimentos: {
        Row: {
          id: string;
          nome: string;
          slug: string;
          descricao: string | null;
          descricao_curta: string | null;
          status: "lancamento" | "em_obras" | "entregue";
          endereco: string | null;
          cidade: string | null;
          estado: string | null;
          bairro: string | null;
          latitude: number | null;
          longitude: number | null;
          area_min: number | null;
          area_max: number | null;
          quartos_min: number | null;
          quartos_max: number | null;
          suites_min: number | null;
          suites_max: number | null;
          vagas_min: number | null;
          vagas_max: number | null;
          andares: number | null;
          unidades_por_andar: number | null;
          total_unidades: number | null;
          previsao_entrega: string | null;
          imagem_destaque_url: string | null;
          video_url: string | null;
          tour_virtual_url: string | null;
          meta_title: string | null;
          meta_description: string | null;
          og_image_url: string | null;
          destaque: boolean;
          ordem: number;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          slug: string;
          descricao?: string | null;
          descricao_curta?: string | null;
          status?: "lancamento" | "em_obras" | "entregue";
          endereco?: string | null;
          cidade?: string | null;
          estado?: string | null;
          bairro?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          area_min?: number | null;
          area_max?: number | null;
          quartos_min?: number | null;
          quartos_max?: number | null;
          suites_min?: number | null;
          suites_max?: number | null;
          vagas_min?: number | null;
          vagas_max?: number | null;
          andares?: number | null;
          unidades_por_andar?: number | null;
          total_unidades?: number | null;
          previsao_entrega?: string | null;
          imagem_destaque_url?: string | null;
          video_url?: string | null;
          tour_virtual_url?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          og_image_url?: string | null;
          destaque?: boolean;
          ordem?: number;
          ativo?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["empreendimentos"]["Insert"]>;
      };
      empreendimento_imagens: {
        Row: {
          id: string;
          empreendimento_id: string;
          url: string;
          alt_text: string | null;
          categoria: string | null;
          ordem: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          empreendimento_id: string;
          url: string;
          alt_text?: string | null;
          categoria?: string | null;
          ordem?: number;
        };
        Update: Partial<Database["public"]["Tables"]["empreendimento_imagens"]["Insert"]>;
      };
      empreendimento_plantas: {
        Row: {
          id: string;
          empreendimento_id: string;
          nome: string;
          url: string;
          area: number | null;
          quartos: number | null;
          suites: number | null;
          ordem: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          empreendimento_id: string;
          nome: string;
          url: string;
          area?: number | null;
          quartos?: number | null;
          suites?: number | null;
          ordem?: number;
        };
        Update: Partial<Database["public"]["Tables"]["empreendimento_plantas"]["Insert"]>;
      };
      empreendimento_diferenciais: {
        Row: {
          id: string;
          empreendimento_id: string;
          titulo: string;
          descricao: string | null;
          icone: string | null;
          ordem: number;
        };
        Insert: {
          id?: string;
          empreendimento_id: string;
          titulo: string;
          descricao?: string | null;
          icone?: string | null;
          ordem?: number;
        };
        Update: Partial<Database["public"]["Tables"]["empreendimento_diferenciais"]["Insert"]>;
      };
      blog_posts: {
        Row: {
          id: string;
          titulo: string;
          slug: string;
          conteudo: string;
          resumo: string | null;
          imagem_destaque_url: string | null;
          categoria: string | null;
          tags: string[] | null;
          meta_title: string | null;
          meta_description: string | null;
          og_image_url: string | null;
          publicado: boolean;
          data_publicacao: string | null;
          autor_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          slug: string;
          conteudo: string;
          resumo?: string | null;
          imagem_destaque_url?: string | null;
          categoria?: string | null;
          tags?: string[] | null;
          meta_title?: string | null;
          meta_description?: string | null;
          og_image_url?: string | null;
          publicado?: boolean;
          data_publicacao?: string | null;
          autor_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>;
      };
      blog_categorias: {
        Row: {
          id: string;
          nome: string;
          slug: string;
          descricao: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          slug: string;
          descricao?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["blog_categorias"]["Insert"]>;
      };
      leads: {
        Row: {
          id: string;
          nome: string;
          email: string | null;
          telefone: string;
          mensagem: string | null;
          empreendimento_id: string | null;
          origem: string | null;
          pagina_origem: string | null;
          referrer: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_content: string | null;
          utm_term: string | null;
          status: "novo" | "contatado" | "em_negociacao" | "convertido" | "perdido";
          notas: string | null;
          atendente: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          email?: string | null;
          telefone: string;
          mensagem?: string | null;
          empreendimento_id?: string | null;
          origem?: string | null;
          pagina_origem?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          status?: "novo" | "contatado" | "em_negociacao" | "convertido" | "perdido";
          notas?: string | null;
          atendente?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
      };
      midia: {
        Row: {
          id: string;
          fonte: string;
          titulo: string;
          url: string;
          data_publicacao: string | null;
          thumbnail_url: string | null;
          ativo: boolean;
          ordem: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          fonte: string;
          titulo: string;
          url: string;
          data_publicacao?: string | null;
          thumbnail_url?: string | null;
          ativo?: boolean;
          ordem?: number;
        };
        Update: Partial<Database["public"]["Tables"]["midia"]["Insert"]>;
      };
      newsletter: {
        Row: {
          id: string;
          email: string;
          ativo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          ativo?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["newsletter"]["Insert"]>;
      };
      configuracoes: {
        Row: {
          chave: string;
          valor: string | null;
          updated_at: string;
        };
        Insert: {
          chave: string;
          valor?: string | null;
        };
        Update: {
          chave?: string;
          valor?: string | null;
        };
      };
      qr_codes: {
        Row: {
          id: string;
          slug: string;
          destino_url: string;
          descricao: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          destino_url: string;
          descricao?: string | null;
          ativo?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["qr_codes"]["Insert"]>;
      };
      empreendimento_formularios: {
        Row: {
          id: string;
          empreendimento_id: string;
          ativo: boolean;
          campos: CampoFormulario[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          empreendimento_id: string;
          ativo?: boolean;
          campos?: CampoFormulario[];
        };
        Update: Partial<
          Database["public"]["Tables"]["empreendimento_formularios"]["Insert"]
        >;
      };
      formulario_respostas: {
        Row: {
          id: string;
          lead_id: string;
          empreendimento_id: string | null;
          respostas: Record<string, string | string[]>;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          empreendimento_id?: string | null;
          respostas: Record<string, string | string[]>;
        };
        Update: Partial<
          Database["public"]["Tables"]["formulario_respostas"]["Insert"]
        >;
      };
      webhooks: {
        Row: {
          id: string;
          nome: string;
          url: string;
          evento: string;
          ativo: boolean;
          ultimo_status: number | null;
          ultimo_disparo_em: string | null;
          ultimo_erro: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          url: string;
          evento?: string;
          ativo?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["webhooks"]["Insert"]> & {
          ultimo_status?: number | null;
          ultimo_disparo_em?: string | null;
          ultimo_erro?: string | null;
        };
      };
      qr_acessos: {
        Row: {
          id: string;
          qr_slug: string;
          user_agent: string | null;
          referer: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_content: string | null;
          utm_term: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          qr_slug: string;
          user_agent?: string | null;
          referer?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_term?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["qr_acessos"]["Insert"]>;
      };
      corretores: {
        Row: {
          id: string;
          nome: string;
          email: string;
          telefone: string;
          cpf: string;
          creci: string;
          ativo: boolean;
          aceite_termos: boolean;
          aceite_termos_em: string | null;
          created_at: string;
          last_login_at: string | null;
        };
        Insert: {
          id?: string;
          nome: string;
          email: string;
          telefone: string;
          cpf: string;
          creci: string;
          ativo?: boolean;
          aceite_termos?: boolean;
          aceite_termos_em?: string | null;
          last_login_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["corretores"]["Insert"]>;
      };
      empreendimento_materiais: {
        Row: {
          id: string;
          empreendimento_id: string;
          titulo: string;
          categoria: "folder" | "tabela" | "divulgacao" | "outros";
          drive_url: string;
          descricao: string | null;
          ordem: number;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          empreendimento_id: string;
          titulo: string;
          categoria?: "folder" | "tabela" | "divulgacao" | "outros";
          drive_url: string;
          descricao?: string | null;
          ordem?: number;
          ativo?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["empreendimento_materiais"]["Insert"]>;
      };
      material_acessos: {
        Row: {
          id: string;
          corretor_id: string;
          material_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          corretor_id: string;
          material_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["material_acessos"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      empreendimento_status: "lancamento" | "em_obras" | "entregue";
      lead_status: "novo" | "contatado" | "em_negociacao" | "convertido" | "perdido";
      material_categoria: "folder" | "tabela" | "divulgacao" | "outros";
    };
  };
};
