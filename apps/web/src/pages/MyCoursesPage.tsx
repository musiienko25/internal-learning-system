import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchMyCourses } from '../api/courses';
import { useAuth } from '../auth/useAuth';

export function MyCoursesPage() {
  const { token } = useAuth();
  const query = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => fetchMyCourses(token!),
    enabled: Boolean(token),
  });

  if (query.isLoading) {
    return <p className="muted">Завантаження…</p>;
  }

  if (query.isError) {
    return (
      <p className="form-error">
        Не вдалося завантажити ваші курси. Спробуйте ще раз.
      </p>
    );
  }

  const items = query.data?.data ?? [];

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <h1 className="page-title">Мої курси</h1>
        <p>Ви ще не записані на жоден курс.</p>
        <Link to="/courses" className="btn btn--primary">
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Мої курси</h1>
      <ul className="my-list">
        {items.map((c) => (
          <li key={`${c.id}-${c.enrolledAt}`} className="my-list__item">
            <div className="my-list__head">
              <strong className="my-list__title">{c.title}</strong>
              {c.isMandatory ? (
                <span className="badge badge--mandatory">Обов’язковий</span>
              ) : null}
            </div>
            <dl className="my-list__meta">
              <div>
                <dt>Записано</dt>
                <dd>{new Date(c.enrolledAt).toLocaleString('uk-UA')}</dd>
              </div>
              <div>
                <dt>Прогрес</dt>
                <dd>{c.progress}%</dd>
              </div>
              <div>
                <dt>Завершено</dt>
                <dd>
                  {c.completedAt
                    ? new Date(c.completedAt).toLocaleString('uk-UA')
                    : '—'}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
