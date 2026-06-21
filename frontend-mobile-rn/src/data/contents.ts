export interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: "all" | "jindungo" | "micro" | "series" | "podcast" | "video";
  theme: "all" | "economia" | "historia" | "politica" | "desenvolvimento";
  author: string;
  authorImage: string;
  duration: string;
  image: string;
  views?: number;
  date: string;
  isTrending?: boolean;
  body?: string[];
  academicNote?: {
    title: string;
    description: string;
    sub?: string;
  };
  vocabulary?: {
    term: string;
    definition: string;
  }[];
  jindungoDebate?: {
    initialTitle: string;
    initialCategory: string;
  };
}

export const contentData: ContentItem[] = [
  {
    id: "jindungo_1",
    title: "Dívida Externa: Angola pode sair da dependência do FMI?",
    description: "Análise profunda sobre o endividamento externo e as relações com instituições financeiras internacionais",
    category: "jindungo",
    theme: "economia",
    author: "Dr. Carlos Neto",
    authorImage: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&q=80",
    duration: "18 min de leitura",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    views: 2847,
    date: "2026-04-15",
    isTrending: true,
    body: [
      "A dívida externa de Angola tem sido um dos temas mais debatidos e cruciais para a estabilidade macroeconómica do país. Nas últimas décadas, as negociações com o Fundo Monetário Internacional (FMI) e outros credores multilaterais moldaram de forma significativa a política fiscal e monetária angolana.",
      "Muitos analistas questionam se as condições impostas pelos programas de ajustamento estrutural do FMI realmente promovem o crescimento a longo prazo ou se perpetuam a austeridade, estrangulando o investimento em setores cruciais como a educação, saúde e infraestruturas.",
      "A transição para um modelo financeiro sustentável e soberano requer uma profunda reestruturação da dívida, além de um forte fomento à produção interna para reduzir a dependência de empréstimos internacionais."
    ],
    academicNote: {
      title: "Austeridade vs. Crescimento",
      description: "O debate clássico na economia sobre as políticas de austeridade recomendadas por instituições financeiras internacionais durante crises fiscais.",
      sub: "Alguns economistas defendem que reformas rigorosas são necessárias para restaurar a credibilidade do mercado, enquanto outros alertam para os perigos da retração económica induzida pela austeridade."
    },
    vocabulary: [
      {
        term: "Ajuste Estrutural",
        definition: "Conjunto de reformas económicas exigidas como condição para receber empréstimos do FMI ou Banco Mundial."
      },
      {
        term: "Dívida Soberana",
        definition: "O montante total de dinheiro que um governo nacional deve a credores externos ou internos."
      }
    ],
    jindungoDebate: {
      initialTitle: "O petróleo foi uma bênção ou uma maldição para Angola?",
      initialCategory: "Petróleo e Reforma"
    }
  },
  {
    id: "jindungo_2",
    title: "Privatizações: Progresso ou retrocesso económico?",
    description: "Debate sobre o processo de privatizações de empresas estatais em Angola",
    category: "jindungo",
    theme: "economia",
    author: "Prof. Ana Domingos",
    authorImage: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=100&q=80",
    duration: "22 min de leitura",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    views: 3156,
    date: "2026-04-12",
    isTrending: true,
    body: [
      "O programa de privatizações de empresas públicas (PROPRIV) em Angola tem como objetivo dinamizar o setor privado, atrair investimento estrangeiro e aliviar os cofres do Estado do fardo de gerir empresas cronicamente deficitárias.",
      "Contudo, o processo levanta críticas acesas sobre a potencial concentração de riqueza em poucas mãos e a transferência de ativos estratégicos nacionais para interesses privados sem o devido retorno social ou garantia de melhoria dos serviços.",
      "O sucesso das privatizações depende fortemente da transparência dos concursos e do fortalecimento das agências reguladoras para proteger os consumidores e garantir um ambiente de concorrência leal."
    ],
    academicNote: {
      title: "Monopólios Naturais e Regulação",
      description: "A importância de manter uma regulação forte ao privatizar empresas em setores estratégicos como energia, telecomunicações e transportes."
    },
    vocabulary: [
      {
        term: "PROPRIV",
        definition: "Programa de Privatizações do Governo de Angola, concebido para reestruturar o setor empresarial público."
      }
    ],
    jindungoDebate: {
      initialTitle: "Privatizações: Progresso ou retrocesso económico?",
      initialCategory: "Petróleo e Reforma"
    }
  },
  {
    id: "micro_1",
    title: "O que foi o Acordo de Bicesse?",
    description: "Contexto histórico e consequências do acordo de paz de 1991",
    category: "micro",
    theme: "historia",
    author: "Luís Ferreira",
    authorImage: "https://images.unsplash.com/photo-1623605931891-d5b95ee98459?w=100&q=80",
    duration: "3 min de leitura",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    views: 1923,
    date: "2026-04-18",
    body: [
      "O Acordo de Bicesse foi um tratado de paz assinado em 31 de maio de 1991, em Estoril, Portugal, entre o governo angolano (MPLA) e a UNITA.",
      "Este acordo pôs fim a 16 anos de guerra civil e estabeleceu as bases para as primeiras eleições multipartidárias em Angola.",
      "Apesar das expectativas, o acordo falhou quando a UNITA rejeitou os resultados eleitorais de 1992, levando à retoma do conflito armado."
    ],
    academicNote: {
      title: "Diplomacia e Transição de Paz",
      description: "O Acordo de Bicesse representa um caso clássico de processos de paz mediados internacionalmente na África Austral durante o final da Guerra Fria."
    },
    vocabulary: [
      {
        term: "Multipartidarismo",
        definition: "Sistema político no qual múltiplos partidos políticos têm a capacidade de obter o controlo dos cargos públicos."
      }
    ],
    jindungoDebate: {
      initialTitle: "O que foi o Acordo de Bicesse?",
      initialCategory: "História Monetária"
    }
  },
  {
    id: "micro_2",
    title: "Inflação no Kwanza: números actuais",
    description: "Análise da inflação e poder de compra da moeda angolana",
    category: "micro",
    theme: "economia",
    author: "Economia em Foco",
    authorImage: "https://images.unsplash.com/photo-1531384370597-8590413be50a?w=100&q=80",
    duration: "4 min de leitura",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
    views: 2134,
    date: "2026-04-17",
    body: [
      "A taxa de inflação em Angola tem exercido uma pressão constante sobre o poder de compra das famílias e a estabilidade empresarial. A desvalorização contínua do Kwanza face ao dólar e ao euro encarece as importações, das quais o país ainda é altamente dependente.",
      "O Banco Nacional de Angola (BNA) tem adotado políticas monetárias restritivas, ajustando as taxas de juro de referência para tentar conter a escalada de preços. No entanto, os choques de oferta e a dependência de bens de consumo importados limitam a eficácia destas medidas monetárias.",
      "Controlar a inflação exige não apenas políticas do banco central, mas também um aumento real na produção nacional e na autossuficiência alimentar."
    ],
    academicNote: {
      title: "Política Monetária e Transmissão Cambial",
      description: "Como as decisões de taxas de juros de um banco central afetam a taxa de câmbio e a inflação em uma economia aberta."
    },
    vocabulary: [
      {
        term: "Inflação",
        definition: "O aumento persistente e generalizado do nível de preços de bens e serviços, resultando na perda do poder de compra."
      }
    ],
    jindungoDebate: {
      initialTitle: "Inflação no Kwanza: números actuais",
      initialCategory: "História Monetária"
    }
  },
  {
    id: "podcast_1",
    title: "História Económica de Angola: Podcast Completo",
    description: "Série de 12 episódios sobre a evolução económica desde a independência",
    category: "podcast",
    theme: "historia",
    author: "Vozes da História",
    authorImage: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&q=80",
    duration: "8 episódios · 6h total",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80",
    views: 5234,
    date: "2026-04-10",
    isTrending: true
  },
  {
    id: "video_1",
    title: "A Era do Petróleo em Angola",
    description: "Documentário sobre a descoberta e exploração petrolífera",
    category: "video",
    theme: "economia",
    author: "História Visual",
    authorImage: "https://images.unsplash.com/photo-1542345812-d98b5cd6cf98?w=100&q=80",
    duration: "45 min",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80",
    views: 8932,
    date: "2026-04-08",
    isTrending: true
  },
  {
    id: "series_1",
    title: "Reformas Económicas dos Anos 90",
    description: "As transformações estruturais após o fim da economia planificada",
    category: "series",
    theme: "economia",
    author: "Prof. Manuel Santos",
    authorImage: "https://images.unsplash.com/photo-1619194617062-5a83b8580c10?w=100&q=80",
    duration: "5 artigos",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
    views: 1845,
    date: "2026-04-14"
  },
  {
    id: "micro_3",
    title: "Sonangol: Breve história da empresa estatal",
    description: "Papel da Sonangol na economia angolana",
    category: "micro",
    theme: "economia",
    author: "Economia em Foco",
    authorImage: "https://images.unsplash.com/photo-1595956381979-9b3e843e5d4e?w=100&q=80",
    duration: "5 min de leitura",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    views: 2567,
    date: "2026-04-16",
    body: [
      "Fundada em 1976, logo após a independência de Angola, a Sociedade Nacional de Combustíveis de Angola (Sonangol) foi criada para gerir a exploração e produção dos recursos de hidrocarbonetos do país.",
      "Como a principal concessionária e pilar financeiro do Estado, a Sonangol cresceu para tornar-se um enorme conglomerado com participações em bancos, companhias aéreas e imobiliárias, desempenhando um papel crucial no desenvolvimento de infraestruturas pós-guerra civil.",
      "Nos últimos anos, a empresa iniciou um processo de reestruturação focado em retornar ao seu core business de petróleo e gás, preparando-se para os desafios globais da transição energética."
    ],
    academicNote: {
      title: "Capitalismo de Estado",
      description: "O modelo económico em que o Estado realiza atividades comerciais e controla as principais empresas, atuando como o principal motor económico."
    },
    vocabulary: [
      {
        term: "Concessionária",
        definition: "Entidade regulada que detém o direito exclusivo concedido pelo Estado para explorar um determinado recurso natural ou serviço público."
      }
    ],
    jindungoDebate: {
      initialTitle: "Sonangol: Breve história da empresa estatal",
      initialCategory: "Petróleo e Reforma"
    }
  },
  {
    id: "jindungo_3",
    title: "Agricultura vs Petróleo: É possível diversificar a economia?",
    description: "Debate sobre as políticas de diversificação económica e o abandono do sector agrícola em Angola",
    category: "jindungo",
    theme: "desenvolvimento",
    author: "Dr. Carlos Neto",
    authorImage: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&q=80",
    duration: "18 min de leitura",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
    views: 1678,
    date: "2026-04-11",
    body: [
      "A dependência quase exclusiva do petróleo expõe Angola a uma extrema volatilidade económica devido às oscilações dos preços do crude no mercado internacional. A diversificação económica tornou-se a palavra de ordem das últimas administrações governamentais.",
      "A agricultura surge como o candidato mais natural para esta transição, dado o imenso potencial de terras férteis e recursos hídricos do país. No entanto, a falta de infraestruturas, crédito acessível e tecnologia agrícola moderna impede o setor de atingir escala de exportação.",
      "Equilibrar o investimento entre a indústria extrativa de petróleo (que gera divisas rápidas) e a produção agrícola sustentável de longo prazo é o maior desafio estratégico do desenvolvimento económico angolano."
    ],
    academicNote: {
      title: "A Doença Holandesa",
      description: "Fenómeno económico onde a descoberta e exportação massiva de recursos naturais (como o petróleo) aprecia a moeda nacional e prejudica a competitividade de outros setores, como a agricultura e a indústria."
    },
    vocabulary: [
      {
        term: "Diversificação Económica",
        definition: "Processo de alargar as fontes de rendimento de uma economia para além de um único recurso ou setor dominante."
      }
    ],
    jindungoDebate: {
      initialTitle: "Agricultura vs Petróleo: É possível diversificar a economia?",
      initialCategory: "Agronegócio"
    }
  },
  {
    id: "podcast_2",
    title: "Conversas sobre Economia Angolana",
    description: "Entrevistas com economistas e académicos sobre temas actuais",
    category: "podcast",
    theme: "economia",
    author: "Podcast EH",
    authorImage: "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?w=100&q=80",
    duration: "15 episódios · 10h",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80",
    views: 3421,
    date: "2026-04-09"
  },
  {
    id: "video_2",
    title: "Política Monetária do BNA: Como funciona?",
    description: "Explicação do papel do Banco Nacional de Angola",
    category: "video",
    theme: "economia",
    author: "Economia Visual",
    authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    duration: "28 min",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
    views: 2876,
    date: "2026-04-13"
  },
  {
    id: "jindungo_4",
    title: "Corrupção e Transparência: Análise do impacto económico",
    description: "Como a corrupção afecta o desenvolvimento económico de Angola",
    category: "jindungo",
    theme: "politica",
    author: "Prof. Ana Domingos",
    authorImage: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=100&q=80",
    duration: "20 min de leitura",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
    views: 4123,
    date: "2026-04-07",
    isTrending: true,
    body: [
      "A corrupção e a falta de transparência na gestão dos recursos públicos têm sido apontadas como alguns dos principais entraves ao desenvolvimento socioeconómico sustentável de Angola.",
      "O desvio de fundos e o suborno criam distorções no mercado de contratação pública, elevam os custos de fazer negócios e desencorajam o investimento direto estrangeiro legítimo.",
      "Para reverter este quadro, é imperativo o fortalecimento das instituições de justiça fiscal, auditorias externas transparentes e a promoção de uma cultura de accountability tanto no sector público como no privado."
    ],
    academicNote: {
      title: "Instituições e Crescimento",
      description: "A teoria económica de Douglas North defende que instituições fortes e transparentes são a base fundamental para o crescimento económico sustentável."
    },
    vocabulary: [
      {
        term: "Transparência",
        definition: "O livre acesso dos cidadãos às informações sobre a gestão das contas públicas."
      }
    ],
    jindungoDebate: {
      initialTitle: "China e Angola: parceria estratégica ou dependência?",
      initialCategory: "Desenvolvimento Sustentável"
    }
  },
  {
    id: "continue_1",
    title: "A Economia do Petróleo em Angola",
    description: "Série educativa sobre a exploração do ouro negro angolano",
    category: "micro",
    theme: "economia",
    author: "História Visual",
    authorImage: "https://images.unsplash.com/photo-1542345812-d98b5cd6cf98?w=100&q=80",
    duration: "10 min de leitura",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80",
    date: "2026-04-16",
    body: [
      "O petróleo é a espinha dorsal da economia angolana, representando mais de 90% das exportações totais e a maior fatia das receitas fiscais do Estado. A história do crude em Angola está intimamente ligada ao seu desenvolvimento político e infraestrutural nas últimas quatro décadas.",
      "A indústria offshore na bacia do Congo e do Cuanza atraiu gigantes petrolíferas globais, transformando Luanda em um dos maiores centros de logística de hidrocarbonetos de África.",
      "Apesar das imensas receitas arrecadadas, a volatilidade do mercado mundial de energia sublinha a urgência do país em reinvestir os lucros petrolíferos em outros setores para garantir a sustentabilidade económica futura."
    ],
    academicNote: {
      title: "Renda Petrolífera e Fiscabilidade",
      description: "A dependência das receitas petrolíferas cria um 'Estado Rentista', onde a arrecadação de impostos gerais é secundária em relação aos royalties dos recursos naturais."
    },
    vocabulary: [
      {
        term: "Offshore",
        definition: "Operações de exploração ou produção petrolífera realizadas no mar, longe da costa."
      }
    ],
    jindungoDebate: {
      initialTitle: "A Economia do Petróleo em Angola",
      initialCategory: "Petróleo e Reforma"
    }
  },
  {
    id: "recent_1",
    title: "Independência e Reconstrução Económica (1975–1985)",
    description: "As políticas económicas da primeira década pós-independência",
    category: "micro",
    theme: "historia",
    author: "Prof. Manuel Santos",
    authorImage: "https://images.unsplash.com/photo-1619194617062-5a83b8580c10?w=100&q=80",
    duration: "8 min de leitura",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=200&q=80",
    date: "2026-04-18",
    body: [
      "A década que se seguiu à proclamação da independência in 1975 foi marcada pela transição abrupta de uma economia de mercado colonial para um modelo socialista de economia planificada.",
      "A fuga em massa de técnicos qualificados portugueses e o eclodir da guerra civil paralisaram grande parte do parque industrial e agrícola de Angola. O Estado nacionalizou setores-chave para garantir o abastecimento e a sobrevivência do país.",
      "As políticas de tabelamento de preços e o controle de câmbios criaram distorções de mercado que levaram à escassez de produtos básicos, estabelecendo o cenário para as futuras reformas de mercado dos anos 90."
    ],
    academicNote: {
      title: "Economia Planificada Socialista",
      description: "O sistema económico onde as decisões sobre produção, investimento e preços são tomadas centralmente pelo governo, em oposição às forças de mercado."
    },
    vocabulary: [
      {
        term: "Nacionalização",
        definition: "O processo pelo qual o Estado assume a propriedade e a gestão de empresas privadas ou setores económicos."
      }
    ],
    jindungoDebate: {
      initialTitle: "China e Angola: parceria estratégica ou dependência?",
      initialCategory: "Economia Colonial"
    }
  },
  {
    id: "recent_2",
    title: "Agricultura Angolana: Do Colonialismo ao Abandono",
    description: "Análise sobre o declínio da agricultura e desafios para recuperação",
    category: "micro",
    theme: "economia",
    author: "Dr. Carlos Neto",
    authorImage: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&q=80",
    duration: "16 min de leitura",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&q=80",
    date: "2026-04-17",
    body: [
      "Antes da independência, Angola era autossuficiente na produção de quase todos os alimentos básicos e o quarto maior produtor mundial de café. O setor agrícola era dinâmico, mas baseado em explorações coloniais altamente desiguais.",
      "Com o início da guerra civil e o êxodo rural, vastas extensões de terra cultivável foram abandonadas ou minadas, provocando o colapso quase total da produção de café, sisal e algodão.",
      "O ressurgimento da agricultura familiar e comercial é vital não apenas para a diversificação económica, mas para combater a insegurança alimentar e gerar empregos em zonas rurais."
    ],
    academicNote: {
      title: "Reforma Agrária e Propriedade de Terra",
      description: "As complexidades legais e sociais de redistribuir terras e garantir títulos de propriedade seguros para pequenos agricultores."
    },
    vocabulary: [
      {
        term: "Agricultura Familiar",
        definition: "Modelo de produção agrícola gerido e operado principalmente por membros de uma família."
      }
    ],
    jindungoDebate: {
      initialTitle: "China e Angola: parceria estratégica ou dependência?",
      initialCategory: "Agronegócio"
    }
  }
];
