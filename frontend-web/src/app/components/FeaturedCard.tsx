import ContentCard from "./ContentCard";
import imgFeatured from "../../imports/SectionMainContentGrid/933bbaf5f01d51082b96c823cb291ff8204f0fcf.png";

export default function FeaturedCard({ navigate }: { navigate?: (path: string) => void }) {
  return (
    <ContentCard
      id="featured"
      title="O Caminho de Ferro de Benguela: Análise de Impacto Fiscal"
      category="FONTE PRIMÁRIA • 1912"
      type="Documento Histórico"
      date="1912"
      description='"Um estudo exaustivo dos fluxos de capital e dinâmica laboral envolvidos na construção da ligação ferroviária entre o litoral e o interior do território."'
      image={imgFeatured}
      variant="featured"
      fileInfo="PDF • 4.2 MB"
      accessCategory="public"
      onClick={() => navigate?.('/documento/featured')}
    />
  );
}
