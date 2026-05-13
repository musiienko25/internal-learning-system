import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  enrollInCourse,
  fetchCourses,
  fetchMyCourses,
} from '../api/courses';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../lib/api';

export function CoursesPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: () => fetchCourses(token!),
    enabled: Boolean(token),
  });

  const mineQuery = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => fetchMyCourses(token!),
    enabled: Boolean(token),
  });

  const enrolledIds = useMemo(() => {
    const ids = new Set<string>();
    for (const c of mineQuery.data?.data ?? []) {
      ids.add(c.id);
    }
    return ids;
  }, [mineQuery.data]);

  const enrollMut = useMutation({
    mutationFn: (courseId: string) => enrollInCourse(token!, courseId),
    onSuccess: async () => {
      setEnrollError(null);
      await qc.invalidateQueries({ queryKey: ['my-courses'] });
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setEnrollError(err.message);
      } else {
        setEnrollError('Помилка мережі');
      }
    },
  });

  if (coursesQuery.isLoading) {
    return <p className="muted">Завантаження каталогу…</p>;
  }

  if (coursesQuery.isError) {
    return (
      <p className="form-error">
        Не вдалося завантажити курси. Перевірте, чи запущений API.
      </p>
    );
  }

  const courses = coursesQuery.data?.data ?? [];

  return (
    <div>
      <h1 className="page-title">Каталог курсів</h1>
      {enrollError ? (
        <p className="form-error banner" role="alert">
          {enrollError}
        </p>
      ) : null}
      <div className="course-grid">
        {courses.map((course) => {
          const enrolled = enrolledIds.has(course.id);
          const busy =
            enrollMut.isPending && enrollMut.variables === course.id;
          return (
            <article key={course.id} className="course-card">
              <div className="course-card__head">
                <h2>{course.title}</h2>
                {course.isMandatory ? (
                  <span className="badge badge--mandatory">Обов’язковий</span>
                ) : null}
              </div>
              <p className="course-card__desc">{course.description}</p>
              <dl className="course-card__meta">
                <div>
                  <dt>Категорія</dt>
                  <dd>{course.category}</dd>
                </div>
                <div>
                  <dt>Тривалість</dt>
                  <dd>{course.durationHours} год</dd>
                </div>
              </dl>
              <div className="course-card__actions">
                {enrolled ? (
                  <button type="button" className="btn" disabled>
                    Записаний
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn--primary"
                    disabled={busy}
                    onClick={() => enrollMut.mutate(course.id)}
                  >
                    {busy ? 'Запис…' : 'Записатись'}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
