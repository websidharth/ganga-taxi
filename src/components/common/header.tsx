import { Image } from 'lucide-react';

type PageHeaderProps = {
  title?: string;
  description?: string;
};

export function PageHeader({
  title,
  description,
}: PageHeaderProps) {
  return (
    <div className="bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.22),transparent_42%),linear-gradient(120deg,#0f3d7a_0%,#2068c4_43%,#2b8bc7_100%)] px-8 py-[15px] text-white">
      <div className="flex items-start gap-3">
        <Image size={30} />
        <div className="f">
          <h1 className="m-0 text-xl font-extrabold ">
            {title}
          </h1>
          <p className="mt-[10px] text-[0.95rem] opacity-90">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
