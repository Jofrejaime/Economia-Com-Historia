import SystemHeader from '../components/SystemHeader';
import SystemFooter from '../components/SystemFooter';
import HomeMainResponsive from '../components/HomeMainResponsive';

export default function Home() {
  return (
    <div className="bg-[#f8f9ff] content-stretch flex flex-col gap-[2px] items-start relative size-full">
      <SystemHeader />
      <HomeMainResponsive />
      <SystemFooter />
    </div>
  );
}
