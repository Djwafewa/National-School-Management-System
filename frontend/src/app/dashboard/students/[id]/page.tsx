import StudentDetail from './StudentDetail';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function Page() {
  return <StudentDetail />;
}
