import { summarize } from './AnalyticsDashboard';

// Build a date N days before today in the YYYY-MM-DD form the API returns.
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('en-CA');
};

describe('summarize', () => {
  it('returns zeroes for an empty list', () => {
    const stats = summarize([]);

    expect(stats.today).toEqual({ amount: 0, count: 0 });
    expect(stats.thisWeek).toEqual({ amount: 0, count: 0 });
    expect(stats.categories).toEqual([]);
  });

  it('totals today\'s expenses only', () => {
    const stats = summarize([
      { amount: 10, category: 'Food & Dining', expenseDate: daysAgo(0) },
      { amount: 5, category: 'Travel', expenseDate: daysAgo(3) }
    ]);

    expect(stats.today).toEqual({ amount: 10, count: 1 });
  });

  it('includes the last 7 days in the weekly total', () => {
    const stats = summarize([
      { amount: 10, category: 'Food & Dining', expenseDate: daysAgo(0) },
      { amount: 5, category: 'Travel', expenseDate: daysAgo(3) },
      { amount: 99, category: 'Travel', expenseDate: daysAgo(30) }
    ]);

    expect(stats.thisWeek).toEqual({ amount: 15, count: 2 });
  });

  it('groups categories and sorts them by amount descending', () => {
    const stats = summarize([
      { amount: 10, category: 'Food & Dining', expenseDate: daysAgo(0) },
      { amount: 15, category: 'Food & Dining', expenseDate: daysAgo(1) },
      { amount: 40, category: 'Travel', expenseDate: daysAgo(2) }
    ]);

    expect(stats.categories).toEqual([
      { name: 'Travel', amount: 40 },
      { name: 'Food & Dining', amount: 25 }
    ]);
  });

  it('treats string amounts as numbers and missing categories as Other', () => {
    const stats = summarize([{ amount: '12.50', expenseDate: daysAgo(0) }]);

    expect(stats.today.amount).toBe(12.5);
    expect(stats.categories).toEqual([{ name: 'Other', amount: 12.5 }]);
  });
});
