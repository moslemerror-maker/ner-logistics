interface Props {
  title: string;
}

export default function PlaceholderPage({ title }: Props) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
      <p className="text-slate-500">This section is under construction.</p>
    </div>
  );
}
