import SystemHeader from '../components/SystemHeader';
import SystemFooter from '../components/SystemFooter';
import ProfileResponsive from '../components/ProfileResponsive';

export default function Profile() {
  return (
    <div className="bg-[#f8f9ff] content-stretch flex flex-col gap-[2px] items-start relative size-full">
      <SystemHeader />
      <ProfileResponsive />
      <SystemFooter />
    </div>
  );
}
